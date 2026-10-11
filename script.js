/* =====================================================
   AGRIGUARD AI
   AI-Based Multi-Crop Pest Detection and Smart Alerts
   ===================================================== */

/* ---------------- CONFIGURATION ---------------- */

const CROP_MODEL_URL =
  "https://teachablemachine.withgoogle.com/models/ylA8kPisv/";

const PEST_MODEL_URL =
  "https://teachablemachine.withgoogle.com/models/AzqCXwXNl/";

const ESP32_API_URL =
  "http://192.168.4.1/api/data";

const EMAIL_SERVICE_ID = "service_1js9nlz";
const EMAIL_TEMPLATE_ID = "template_9gcw7py";
const EMAIL_PUBLIC_KEY = "qw4mZGHePXrD9RUOk";

const MAX_HISTORY = 50;

/* ---------------- GLOBAL STATE ---------------- */

let cropModel = null;
let pestModel = null;

let cameraStream = null;
let currentLanguage = "en";

let totalDetections =
  Number(localStorage.getItem("totalDetections")) || 0;

let activeThreats =
  Number(localStorage.getItem("activeThreats")) || 0;

let emailAlerts =
  Number(localStorage.getItem("emailAlerts")) || 0;

let detectionHistory = loadJSON("detectionHistory", []);
let pestCounts = loadJSON("pestCounts", {
  Aphid: 0,
  Caterpillar: 0,
  Thrips: 0,
  Whitefly: 0,
  Other_Pest: 0,
  No_Pest: 0
});

let savedAlertEmail =
  localStorage.getItem("alertEmail") || "";

let pestChart = null;
let trendChart = null;

let lastESP32Data = null;


/* ---------------- UTILITIES ---------------- */

function loadJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function byId(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const element = byId(id);
  if (element) element.textContent = value;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function saveHistory() {
  localStorage.setItem(
    "detectionHistory",
    JSON.stringify(detectionHistory)
  );
}

function savePestCounts() {
  localStorage.setItem(
    "pestCounts",
    JSON.stringify(pestCounts)
  );
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString(
    currentLanguage === "ta" ? "ta-IN" : "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  );
}

function setStatus(id, message, state = "") {
  const element = byId(id);
  if (!element) return;

  element.textContent = message;
  element.classList.remove("success", "error");

  if (state) {
    element.classList.add(state);
  }
}


/* ---------------- MODEL CLASS HELPERS ---------------- */

function normalizeClassName(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, "_");
}

function parseCropClass(className) {
  const clean = normalizeClassName(className);

  const match = clean.match(
    /^(Paddy|Chilli|Cotton|Tomato|Brinjal)_(Healthy|Affected)$/i
  );

  if (!match) {
    return {
      crop: clean.replace(/_/g, " ") || "Unknown crop",
      status: "Unknown"
    };
  }

  const cropNames = {
    paddy: "Paddy",
    chilli: "Chilli",
    cotton: "Cotton",
    tomato: "Tomato",
    brinjal: "Brinjal"
  };

  return {
    crop: cropNames[match[1].toLowerCase()],
    status:
      match[2].toLowerCase() === "healthy"
        ? "Healthy"
        : "Affected"
  };
}

function normalizePestClass(name) {
  const clean = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const names = {
    aphid: "Aphid",
    caterpillar: "Caterpillar",
    thrips: "Thrips",
    whitefly: "Whitefly",
    other_pest: "Other_Pest",
    no_pest: "No_Pest",
    healthy_leaf: "No_Pest"
  };

  return names[clean] || "Unknown";
}

function displayPestName(name) {
  if (currentLanguage === "ta") {
    const tamilNames = {
      Aphid: "அஃபிட்",
      Caterpillar: "கம்பளிப்பூச்சி",
      Thrips: "த்ரிப்ஸ்",
      Whitefly: "வெள்ளை ஈ",
      Other_Pest: "மற்ற பூச்சி",
      No_Pest: "பூச்சி இல்லை",
      Unknown: "தெரியாத பூச்சி"
    };

    return tamilNames[name] || name;
  }

  return String(name || "Unknown").replace(/_/g, " ");
}


/* ---------------- INITIALIZATION ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupLanguage();
  setupCamera();
  setupUpload();
  setupEmail();
  setupHistory();

  updateDashboardStats();
  renderHistory();
  renderAlerts();
  updateCharts();

  initializeEmailJS();
  loadAIModels();

  startESP32Monitoring();
});


/* ---------------- NAVIGATION ---------------- */

function setupNavigation() {
  const links = document.querySelectorAll(".nav-link");

  links.forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");

      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        links.forEach(link => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") ===
              `#${entry.target.id}`
          );
        });
      });
    }, {
      threshold: 0.2
    });

    document.querySelectorAll("section[id]").forEach(section => {
      observer.observe(section);
    });
  }
}


/* ---------------- LANGUAGE ---------------- */

function setupLanguage() {
  const selector = byId("languageSelector");
  if (!selector) return;

  selector.addEventListener("change", () => {
    currentLanguage = selector.value === "ta" ? "ta" : "en";

    setStatus(
      "uploadStatus",
      currentLanguage === "ta"
        ? "படத்தைத் தேர்ந்தெடுத்து கண்டறிதலைத் தொடங்கவும்."
        : "Choose an image to start detection."
    );
  });
}


/* ---------------- LOAD AI MODELS ---------------- */

async function loadAIModels() {
  setText("modelStatus", "Loading...");

  try {
    if (!window.tmImage) {
      throw new Error("Teachable Machine library did not load.");
    }

    const [loadedCropModel, loadedPestModel] = await Promise.all([
      tmImage.load(
        CROP_MODEL_URL + "model.json",
        CROP_MODEL_URL + "metadata.json"
      ),
      tmImage.load(
        PEST_MODEL_URL + "model.json",
        PEST_MODEL_URL + "metadata.json"
      )
    ]);

    cropModel = loadedCropModel;
    pestModel = loadedPestModel;

    setText("modelStatus", "Ready");
  } catch (error) {
    console.error("AI model loading failed:", error);
    setText("modelStatus", "Unavailable");

    setStatus(
      "uploadStatus",
      "AI models could not load. Check internet access and model URLs.",
      "error"
    );
  }
}


/* ---------------- CAMERA ---------------- */

function setupCamera() {
  const startButton = byId("startCamera");
  const captureButton = byId("captureImage");
  const stopButton = byId("stopCamera");

  if (startButton) {
    startButton.addEventListener("click", startCamera);
  }

  if (captureButton) {
    captureButton.addEventListener("click", captureCameraImage);
  }

  if (stopButton) {
    stopButton.addEventListener("click", stopCamera);
  }
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    alert("Camera access is not supported in this browser.");
    return;
  }

  try {
    stopCamera();

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" }
      },
      audio: false
    });

    const video = byId("camera");
    if (!video) return;

    video.srcObject = cameraStream;
    video.classList.add("is-active");
    video.hidden = false;

    const placeholder = byId("cameraPlaceholder");
    if (placeholder) placeholder.classList.add("hidden");

    await video.play();

    if (byId("captureImage")) {
      byId("captureImage").disabled = false;
    }

    if (byId("stopCamera")) {
      byId("stopCamera").disabled = false;
    }

    if (byId("startCamera")) {
      byId("startCamera").disabled = true;
    }
  } catch (error) {
    console.error("Camera error:", error);
    alert("Unable to open camera. Allow camera permission and try again.");
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }

  const video = byId("camera");

  if (video) {
    video.pause();
    video.srcObject = null;
    video.classList.remove("is-active");
  }

  const placeholder = byId("cameraPlaceholder");
  if (placeholder) placeholder.classList.remove("hidden");

  if (byId("captureImage")) {
    byId("captureImage").disabled = true;
  }

  if (byId("stopCamera")) {
    byId("stopCamera").disabled = true;
  }

  if (byId("startCamera")) {
    byId("startCamera").disabled = false;
  }
}

async function captureCameraImage() {
  const video = byId("camera");

  if (!video || !cameraStream || !video.videoWidth) {
    alert("Start the camera first.");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const image = new Image();

  image.onload = async () => {
    displayUploadedImage(image.src);
    await predictImage(image);
  };

  image.src = canvas.toDataURL("image/jpeg", 0.92);
}


/* ---------------- IMAGE UPLOAD AND PREVIEW ---------------- */

function setupUpload() {
  const input = byId("imageUpload");
  if (input) {
    input.addEventListener("change", handleImageUpload);
  }
}

function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setStatus("uploadStatus", "Please select an image file.", "error");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onerror = () => {
    setStatus("uploadStatus", "Unable to read the image.", "error");
  };

  reader.onload = async () => {
    const image = new Image();

    image.onload = async () => {
      displayUploadedImage(reader.result);
      await predictImage(image);
    };

    image.onerror = () => {
      setStatus("uploadStatus", "The selected image could not be opened.", "error");
    };

    image.src = reader.result;
  };

  reader.readAsDataURL(file);
}

function displayUploadedImage(source) {
  const image = byId("uploadedImage");
  const preview = document.querySelector(".uploaded-preview");

  if (image) {
    image.src = source;
    image.hidden = false;
    image.style.display = "block";
  }

  if (preview) {
    preview.style.display = "block";
  }
}


/* ---------------- RUN AI PREDICTION ---------------- */

async function predictImage(imageElement) {
  if (!cropModel || !pestModel) {
    setStatus(
      "uploadStatus",
      "AI models are still loading. Please try again shortly.",
      "error"
    );
    return;
  }

  setStatus("uploadStatus", "Analyzing image...");

  try {
    const [cropRaw, pestRaw] = await Promise.all([
      cropModel.predict(imageElement),
      pestModel.predict(imageElement)
    ]);

    const cropPredictions = cropRaw
      .map(item => ({
        name: normalizeClassName(item.className),
        probability: Number(item.probability) || 0
      }))
      .sort((a, b) => b.probability - a.probability);

    const pestPredictions = pestRaw
      .map(item => ({
        name: normalizePestClass(item.className),
        probability: Number(item.probability) || 0
      }))
      .sort((a, b) => b.probability - a.probability);

    const cropBest = cropPredictions[0];
    const pestBest = pestPredictions[0];

    if (!cropBest || !pestBest) {
      throw new Error("No prediction results were returned.");
    }

    const crop = parseCropClass(cropBest.name);
    const cropConfidence = cropBest.probability * 100;
    const pestConfidence = pestBest.probability * 100;

    const pestSecondConfidence =
      (pestPredictions[1]?.probability || 0) * 100;

    /*
      Crop model output is used for the primary result:
      crop name + health status + crop confidence.

      Pest model output is recorded separately. It is not appended
      to the crop result, preventing unrelated crop/pest labels
      from appearing together in the main result.
    */

    const cropUncertain = cropConfidence < 55;

    const pestUncertain =
      pestConfidence < 55 ||
      pestConfidence - pestSecondConfidence < 8;

    const confirmedPest =
      pestBest.name !== "No_Pest" &&
      pestBest.name !== "Unknown" &&
      !pestUncertain;

    const cropStatus = cropUncertain
      ? "Uncertain"
      : crop.status;

    const result = {
      id: Date.now(),
      cropName: crop.crop,
      cropStatus,
      cropClass: cropBest.name,
      cropConfidence: Number(cropConfidence.toFixed(1)),
      pestName: pestBest.name,
      pestConfidence: Number(pestConfidence.toFixed(1)),
      pestUncertain,
      isThreat: confirmedPest,
      timestamp: new Date().toISOString(),
      emailSent: false
    };

    totalDetections++;

    localStorage.setItem("totalDetections", totalDetections);

    if (confirmedPest) {
      activeThreats++;
      localStorage.setItem("activeThreats", activeThreats);
    }

    if (pestCounts[pestBest.name] === undefined) {
      pestCounts[pestBest.name] = 0;
    }

    pestCounts[pestBest.name]++;

    savePestCounts();

    detectionHistory.unshift(result);

    if (detectionHistory.length > MAX_HISTORY) {
      detectionHistory = detectionHistory.slice(0, MAX_HISTORY);
    }

    saveHistory();

    showPredictionResult(result);
    renderHistory();
    renderAlerts();
    updateDashboardStats();
    updateCharts();

    setStatus(
      "uploadStatus",
      "Image analyzed successfully.",
      "success"
    );

    if (confirmedPest) {
      sendPestAlert(result);
    }
  } catch (error) {
    console.error("Prediction failed:", error);

    setStatus(
      "uploadStatus",
      "Prediction failed. Check the model URL and try another image.",
      "error"
    );
  }
}


/* ---------------- DISPLAY CROP RESULT ---------------- */

function showPredictionResult(result) {
  const card = byId("predictionResult");

  if (!card) return;

  card.classList.remove("hidden");
  card.hidden = false;
  card.style.display = "flex";

  /*
    Main output contains only:
    crop name + health status.
    Confidence is shown separately.
  */

  setText(
    "predictionName",
    `${result.cropName} — ${result.cropStatus}`
  );

  setText(
    "predictionConfidence",
    `${result.cropConfidence.toFixed(1)}%`
  );

  setText(
    "predictionDetails",
    result.cropConfidence < 55
      ? "Low confidence. Try a clearer image for a more reliable result."
      : "Crop health classification result."
  );

  renderPredictionScores(result);
}


/* ---------------- DISPLAY SCORES ---------------- */

function renderPredictionScores(result) {
  const container = byId("predictionScores");
  if (!container) return;

  /*
    Show crop scores only in the crop prediction score area.
    Pest labels are not mixed with crop class labels.
  */

  const cropClasses = [
    "Paddy_Healthy",
    "Paddy_Affected",
    "Chilli_Healthy",
    "Chilli_Affected",
    "Cotton_Healthy",
    "Cotton_Affected",
    "Tomato_Healthy",
    "Tomato_Affected",
    "Brinjal_Healthy",
    "Brinjal_Affected"
  ];

  container.innerHTML = "";

  const percentage = Math.max(
    0,
    Math.min(100, Number(result.cropConfidence) || 0)
  );

  const row = document.createElement("div");
  row.className = "prediction-score";

  row.innerHTML = `
    <div class="score-label">
      <span>${escapeHTML(result.cropName)} — ${escapeHTML(result.cropStatus)}</span>
      <strong>${percentage.toFixed(1)}%</strong>
    </div>
    <div class="score-bar">
      <span style="width:${percentage}%"></span>
    </div>
  `;

  container.appendChild(row);

  /*
    The actual full class probabilities are shown when the model
    returns them. They are stored on the current prediction only
    if available; this simple result view does not invent scores.
  */
}


/* ---------------- EMAILJS INITIALIZATION ---------------- */

function initializeEmailJS() {
  if (!window.emailjs) {
    console.warn("EmailJS library is not available.");
    return;
  }

  try {
    emailjs.init({
      publicKey: EMAIL_PUBLIC_KEY
    });
  } catch (error) {
    console.error("EmailJS initialization failed:", error);
  }
}


/* ---------------- EMAIL CONFIGURATION ---------------- */

function setupEmail() {
  const emailInput = byId("alertEmail");
  const saveButton = byId("saveEmail");
  const testButton = byId("testEmail");

  if (emailInput && savedAlertEmail) {
    emailInput.value = savedAlertEmail;
  }

  if (saveButton) {
    saveButton.addEventListener("click", saveAlertEmail);
  }

  if (testButton) {
    testButton.addEventListener("click", sendTestEmail);
  }
}

function saveAlertEmail() {
  const input = byId("alertEmail");
  const email = input?.value.trim() || "";

  if (!isValidEmail(email)) {
    setStatus("emailStatus", "Enter a valid email address.", "error");
    return;
  }

  savedAlertEmail = email;

  localStorage.setItem("alertEmail", email);

  setStatus("emailStatus", "Alert email saved successfully.", "success");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendTestEmail() {
  const input = byId("alertEmail");
  const email = input?.value.trim() || savedAlertEmail;

  if (!isValidEmail(email)) {
    setStatus("emailStatus", "Enter a valid email address first.", "error");
    return;
  }

  savedAlertEmail = email;
  localStorage.setItem("alertEmail", email);

  await sendEmail({
    to_email: email,
    subject: "AgriGuard AI Test Alert",
    message: "This is a test email from the AgriGuard AI dashboard."
  });
}

async function sendPestAlert(result) {
  if (!savedAlertEmail) {
    setStatus(
      "emailStatus",
      "Pest detected, but no alert email has been saved.",
      "error"
    );
    return;
  }

  const pestName = displayPestName(result.pestName);

  const success = await sendEmail({
    to_email: savedAlertEmail,
    subject: "AgriGuard AI Pest Alert",
    message:
      `Crop: ${result.cropName}\n` +
      `Crop health: ${result.cropStatus}\n` +
      `Detected pest: ${pestName}\n` +
      `Pest confidence: ${result.pestConfidence}%\n` +
      `Time: ${formatDate(result.timestamp)}`
  });

  if (success) {
    emailAlerts++;
    localStorage.setItem("emailAlerts", emailAlerts);

    result.emailSent = true;
    saveHistory();

    updateDashboardStats();
    renderHistory();
    renderAlerts();
  }
}

async function sendEmail(parameters) {
  if (!window.emailjs) {
    setStatus(
      "emailStatus",
      "Email service is unavailable. Check the EmailJS library.",
      "error"
    );
    return false;
  }

  try {
    setStatus("emailStatus", "Sending email...");

    await emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      parameters
    );

    setStatus("emailStatus", "Email sent successfully.", "success");
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);

    setStatus(
      "emailStatus",
      "Email failed. Check your EmailJS service and template settings.",
      "error"
    );

    return false;
  }
}


/* ---------------- DASHBOARD COUNTS ---------------- */

function updateDashboardStats() {
  setText("totalDetections", totalDetections);
  setText("activeThreats", activeThreats);
  setText("emailAlerts", emailAlerts);
}


/* ---------------- ALERTS LIST ---------------- */

function renderAlerts() {
  const container = byId("alertsList");
  if (!container) return;

  const alerts = detectionHistory.filter(item => item.isThreat);

  setText("alertCountBadge", `${alerts.length} Alerts`);

  if (!alerts.length) {
    container.innerHTML = `
      <div class="empty-alerts">
        <i class="fa-solid fa-bell-slash"></i>
        <p>No alerts yet.</p>
        <span>Detected pests will appear here.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = alerts.slice(0, 15).map(item => `
    <div class="alert-item">
      <div class="alert-item-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>

      <div class="alert-item-content">
        <strong>${escapeHTML(displayPestName(item.pestName))}</strong>
        <p>
          ${escapeHTML(item.cropName)} — ${escapeHTML(item.cropStatus)}
        </p>
        <small>${escapeHTML(formatDate(item.timestamp))}</small>
      </div>
    </div>
  `).join("");
}


/* ---------------- HISTORY ---------------- */

function setupHistory() {
  const clearButton = byId("clearHistory");
  if (!clearButton) return;

  clearButton.addEventListener("click", () => {
    if (!detectionHistory.length) return;

    if (!confirm("Clear all detection history?")) return;

    detectionHistory = [];

    localStorage.removeItem("detectionHistory");

    renderHistory();
    renderAlerts();
    updateCharts();
  });
}

function renderHistory() {
  const container = byId("historyList");
  if (!container) return;

  if (!detectionHistory.length) {
    container.innerHTML = `
      <div class="empty-history">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <p>No detection history yet.</p>
        <span>Run an AI detection to create a record.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = detectionHistory.slice(0, 20).map(item => `
    <div class="history-item">
      <div class="history-item-icon">
        <i class="fa-solid fa-seedling"></i>
      </div>

      <div class="history-item-content">
        <strong>
          ${escapeHTML(item.cropName)} — ${escapeHTML(item.cropStatus)}
        </strong>
        <p>${escapeHTML(formatDate(item.timestamp))}</p>
      </div>

      <div class="history-item-confidence">
        ${Number(item.cropConfidence || 0).toFixed(1)}%
      </div>
    </div>
  `).join("");
}


/* ---------------- CHARTS ---------------- */

function updateCharts() {
  updatePestChart();
  updateTrendChart();
}

function updatePestChart() {
  const canvas = byId("pestChart");

  if (!canvas || !window.Chart) return;

  const labels = [
    "Aphid",
    "Caterpillar",
    "Thrips",
    "Whitefly",
    "Other Pest",
    "No Pest"
  ];

  const keys = [
    "Aphid",
    "Caterpillar",
    "Thrips",
    "Whitefly",
    "Other_Pest",
    "No_Pest"
  ];

  if (pestChart) {
    pestChart.destroy();
  }

  pestChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Detections",
        data: keys.map(key => Number(pestCounts[key]) || 0),
        backgroundColor: [
          "#e76f51",
          "#e9a23b",
          "#8e6ad8",
          "#4b9fe1",
          "#8aa08e",
          "#48a868"
        ],
        borderRadius: 7,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

function updateTrendChart() {
  const canvas = byId("trendChart");

  if (!canvas || !window.Chart) return;

  if (trendChart) {
    trendChart.destroy();
  }

  const recent = detectionHistory.slice(0, 7).reverse();

  trendChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: recent.map(item => {
        const date = new Date(item.timestamp);

        return Number.isNaN(date.getTime())
          ? ""
          : date.toLocaleDateString();
      }),
      datasets: [{
        label: "Crop detections",
        data: recent.map((_, index) => index + 1),
        borderColor: "#39965a",
        backgroundColor: "rgba(57, 150, 90, 0.12)",
        fill: true,
        tension: 0.3,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}


/* ---------------- ESP32 MONITORING ---------------- */

function startESP32Monitoring() {
  fetchESP32Data();

  window.setInterval(fetchESP32Data, 5000);
}

async function fetchESP32Data() {
  try {
    const response = await fetch(ESP32_API_URL, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    lastESP32Data = data;

    updateESP32Dashboard(data);
  } catch (error) {
    updateESP32Offline();
  }
}

function isTruthySensorValue(value) {
  if (typeof value === "boolean") return value;

  if (typeof value === "number") return value !== 0;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    return [
      "1",
      "true",
      "yes",
      "on",
      "detected",
      "active"
    ].includes(normalized);
  }

  return false;
}

function firstDefined(object, keys) {
  for (const key of keys) {
    if (object && object[key] !== undefined && object[key] !== null) {
      return object[key];
    }
  }

  return undefined;
}

function updateESP32Dashboard(data) {
  setText("esp32Status", "Online");
  setText("apiStatus", "Online");

  const hardwareStatus = byId("hardwareStatus");

  if (hardwareStatus) {
    hardwareStatus.innerHTML =
      '<i class="fa-solid fa-circle-check"></i> Hardware Connected';
  }

  setText("esp32IP", "Live ESP32 data");

  const irValue = firstDefined(data, [
    "ir",
    "irSensor",
    "ir_sensor",
    "irValue",
    "IR"
  ]);

  const distance = firstDefined(data, [
    "distance",
    "ultrasonic",
    "ultrasonicDistance",
    "distance_cm"
  ]);

  const pest = firstDefined(data, [
    "pest",
    "pestDetected",
    "pest_detected",
    "pestStatus"
  ]);

  const yellowLED = firstDefined(data, [
    "yellowLED",
    "yellow_led",
    "yellowLed"
  ]);

  const redLED = firstDefined(data, [
    "redLED",
    "red_led",
    "redLed"
  ]);

  const buzzer = firstDefined(data, [
    "buzzer",
    "buzzerStatus",
    "buzzer_on"
  ]);

  if (irValue !== undefined) {
    setText("irSensorValue", String(irValue));
    setText(
      "irSensorStatus",
      isTruthySensorValue(irValue) ? "Object detected" : "No object detected"
    );
  }

  if (distance !== undefined) {
    const number = Number(distance);

    setText(
      "distanceValue",
      Number.isFinite(number) ? `${number} cm` : String(distance)
    );

    setText("ultrasonicStatus", "Sensor connected");
  }

  if (pest !== undefined) {
    const pestDetected = isTruthySensorValue(pest);

    setText(
      "pestSensorValue",
      pestDetected ? "Detected" : "Not detected"
    );

    setText("pestSensorStatus", "Sensor connected");
  }

  if (yellowLED !== undefined) {
    setText(
      "yellowLEDValue",
      isTruthySensorValue(yellowLED) ? "ON" : "OFF"
    );
  }

  if (redLED !== undefined) {
    setText(
      "redLEDValue",
      isTruthySensorValue(redLED) ? "ON" : "OFF"
    );
  }

  if (buzzer !== undefined) {
    setText(
      "buzzerValue",
      isTruthySensorValue(buzzer) ? "ON" : "OFF"
    );
  }
}

function updateESP32Offline() {
  setText("esp32Status", "Offline");
  setText("apiStatus", "Offline");
  setText("esp32IP", "Connection unavailable");

  const hardwareStatus = byId("hardwareStatus");

  if (hardwareStatus) {
    hardwareStatus.innerHTML =
      '<i class="fa-solid fa-plug"></i> Hardware Not Connected';
  }
}
