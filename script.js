/* =========================================================
   TEAM 16
   AI SMART PEST DETECTION & ALERT SYSTEM
   ========================================================= */


/* ================= CONFIG ================= */

const EMAIL_SERVICE_ID = "service_x2d7sj";
const EMAIL_TEMPLATE_ID = "template_6efhw0d";
const EMAIL_PUBLIC_KEY = "wOORs4b9toARevid-";

const MODEL_URL = "./model/model.json";
const METADATA_URL = "./model/metadata.json";


/* ================= GLOBAL VARIABLES ================= */

let model = null;
let maxPredictions = 0;

let cameraStream = null;
let currentFacingMode = "environment";

let totalDetections = 0;
let activeThreats = 0;
let emailAlerts = 0;

let savedEmail = localStorage.getItem("agriAlertEmail") || "";

let detectionHistory = [];

let pestCounts = {
  Aphid: 0,
  Caterpillar: 0,
  Whitefly: 0,
  Thrips: 0,
  "Healthy Leaf": 0
};

let pestChart = null;
let trendChart = null;

let emailJSReady = false;


/* ================= DOM HELPER ================= */

function $(id) {
  return document.getElementById(id);
}


/* ================= PAGE START ================= */

document.addEventListener("DOMContentLoaded", async () => {

  setupNavigation();
  setupLanguage();
  setupEmail();

  loadSavedEmail();

  updateDashboardStats();

  updateCharts();

  await initializeEmailJS();

  await loadAIModel();

});


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach(link => {

    link.addEventListener("click", event => {

      event.preventDefault();

      const targetId = link.getAttribute("href");

      const target = document.querySelector(targetId);

      if (!target) return;

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    });

  });


  const sections = document.querySelectorAll("section[id]");

  const observer = new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        const id = entry.target.id;

        navLinks.forEach(link => {

          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${id}`
          );

        });

      });

    },
    {
      rootMargin: "-20% 0px -65% 0px"
    }
  );

  sections.forEach(section => observer.observe(section));

}


/* =========================================================
   LANGUAGE
   ========================================================= */

function setupLanguage() {

  const selector = $("languageSelector");

  if (!selector) return;

  selector.addEventListener("change", () => {

    const language = selector.value;

    if (language === "ta") {

      document.documentElement.lang = "ta";

      document.querySelector(".header-title p").textContent =
        "செயற்கை நுண்ணறிவைப் பயன்படுத்தி பயிர் பூச்சிகளைக் கண்டறிந்து எச்சரிக்கைகளைப் பெறுங்கள்.";

      document.querySelector(".section-heading h2").textContent =
        "AI பூச்சி கண்டறிதல்";

    } else {

      document.documentElement.lang = "en";

      document.querySelector(".header-title p").textContent =
        "AI-powered crop protection using image detection and smart monitoring.";

    }

  });

}


/* =========================================================
   EMAILJS INITIALIZATION
   ========================================================= */

async function initializeEmailJS() {

  const statusBox = $("emailStatus");

  try {

    if (typeof emailjs === "undefined") {

      emailJSReady = false;

      showEmailStatus(
        "EmailJS library is not loaded. Please check internet connection and reload the page.",
        "error"
      );

      return;
    }


    emailjs.init({
      publicKey: EMAIL_PUBLIC_KEY
    });


    emailJSReady = true;

    showEmailStatus(
      savedEmail
        ? `Email saved: ${savedEmail}. Alerts are ready.`
        : "EmailJS ready. Enter an email address to receive alerts.",
      savedEmail ? "success" : ""
    );

  } catch (error) {

    emailJSReady = false;

    showEmailStatus(
      "EmailJS initialization failed: " + getErrorMessage(error),
      "error"
    );

  }

}


/* =========================================================
   EMAIL SETUP
   ========================================================= */

function setupEmail() {

  const saveButton = $("saveEmail");
  const emailInput = $("alertEmail");

  if (!saveButton || !emailInput) return;


  saveButton.addEventListener("click", saveAlertEmail);


  emailInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
      saveAlertEmail();
    }

  });

}


function saveAlertEmail() {

  const emailInput = $("alertEmail");

  if (!emailInput) return;

  const email = emailInput.value.trim();


  if (!email) {

    showEmailStatus(
      "Please enter an email address.",
      "error"
    );

    return;
  }


  if (!isValidEmail(email)) {

    showEmailStatus(
      "Please enter a valid email address.",
      "error"
    );

    return;
  }


  savedEmail = email;

  localStorage.setItem(
    "agriAlertEmail",
    email
  );


  showEmailStatus(
    `Email saved successfully: ${email}`,
    "success"
  );

}


function loadSavedEmail() {

  const emailInput = $("alertEmail");

  if (!emailInput) return;

  if (savedEmail) {

    emailInput.value = savedEmail;

  }

}


function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


function showEmailStatus(message, type = "") {

  const box = $("emailStatus");

  if (!box) return;

  box.textContent = message;

  box.className = "email-status";

  if (type) {
    box.classList.add(type);
  }

}


/* =========================================================
   LOAD AI MODEL
   ========================================================= */

async function loadAIModel() {

  const status = $("modelStatus");
  const pill = $("modelStatusPill");

  try {

    if (status) {
      status.textContent = "Loading";
    }

    if (pill) {
      pill.textContent = "Loading Model";
    }


    model = await tmImage.load(
      MODEL_URL,
      METADATA_URL
    );


    maxPredictions = model.getTotalClasses();


    if (status) {
      status.textContent = "Ready";
    }

    if (pill) {
      pill.textContent = "AI Model Ready";
    }


    console.log(
      "AI model loaded successfully."
    );


    setupImageUpload();
    setupCamera();

  } catch (error) {

    console.error(
      "Model loading error:",
      error
    );


    if (status) {
      status.textContent = "Error";
    }

    if (pill) {
      pill.textContent = "Model Error";
    }


    showDetectionStatus(
      "AI model could not be loaded. Check the model folder.",
      "danger"
    );

  }

}


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

function setupImageUpload() {

  const input = $("imageInput");

  if (!input) return;

  input.addEventListener(
    "change",
    handleImageUpload
  );

}


function handleImageUpload(event) {

  const file = event.target.files[0];

  if (!file) return;


  if (!file.type.startsWith("image/")) {

    showDetectionStatus(
      "Please select a valid image.",
      "danger"
    );

    return;
  }


  const reader = new FileReader();


  reader.onload = async function(e) {

    const img = new Image();

    img.onload = async function() {

      displayPreview(e.target.result);

      await predictImage(img);

    };

    img.src = e.target.result;

  };


  reader.readAsDataURL(file);

}


/* =========================================================
   PREVIEW
   ========================================================= */

function displayPreview(src) {

  const preview = $("previewImage");
  const placeholder = $("previewPlaceholder");

  if (!preview) return;

  preview.src = src;
  preview.style.display = "block";

  if (placeholder) {
    placeholder.style.display = "none";
  }

}


/* =========================================================
   CAMERA
   ========================================================= */

function setupCamera() {

  const startButton = $("startCamera");
  const switchButton = $("switchCamera");
  const captureButton = $("captureImage");


  if (startButton) {

    startButton.addEventListener(
      "click",
      startCamera
    );

  }


  if (switchButton) {

    switchButton.addEventListener(
      "click",
      switchCamera
    );

  }


  if (captureButton) {

    captureButton.addEventListener(
      "click",
      captureAndDetect
    );

  }

}


async function startCamera() {

  try {

    stopCamera();


    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentFacingMode
      },
      audio: false
    });


    const video = $("camera");

    video.srcObject = cameraStream;

    video.style.display = "block";


    const placeholder = $("cameraPlaceholder");

    if (placeholder) {
      placeholder.style.display = "none";
    }


    const overlay = document.querySelector(
      ".camera-overlay"
    );

    if (overlay) {
      overlay.style.display = "block";
    }


    showDetectionStatus(
      "Camera ready. Press Detect to analyse the image.",
      "neutral"
    );


  } catch (error) {

    console.error(
      "Camera error:",
      error
    );


    showDetectionStatus(
      "Camera access failed. Please allow camera permission.",
      "danger"
    );

  }

}


function stopCamera() {

  if (!cameraStream) return;

  cameraStream.getTracks().forEach(
    track => track.stop()
  );

  cameraStream = null;

}


async function switchCamera() {

  currentFacingMode =
    currentFacingMode === "environment"
      ? "user"
      : "environment";


  if (cameraStream) {
    await startCamera();
  }

}


async function captureAndDetect() {

  const video = $("camera");

  if (!video || !cameraStream) {

    showDetectionStatus(
      "Start the camera first.",
      "danger"
    );

    return;
  }


  if (!model) {

    showDetectionStatus(
      "AI model is still loading.",
      "danger"
    );

    return;
  }


  try {

    showDetectionStatus(
      "Analysing image...",
      "neutral"
    );


    const canvas =
      document.createElement("canvas");


    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;


    const context =
      canvas.getContext("2d");


    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );


    const imageData =
      canvas.toDataURL("image/jpeg", 0.9);


    displayPreview(imageData);


    await predictImage(canvas);


  } catch (error) {

    console.error(
      "Camera detection error:",
      error
    );


    showDetectionStatus(
      "Camera detection failed.",
      "danger"
    );

  }

}


/* =========================================================
   AI PREDICTION
   ========================================================= */

async function predictImage(imageElement) {

  if (!model) {

    showDetectionStatus(
      "AI model is not ready.",
      "danger"
    );

    return;

  }


  try {

    showDetectionStatus(
      "AI is analysing the image...",
      "neutral"
    );


    const predictions =
      await model.predict(
        imageElement,
        false
      );


    if (!predictions || predictions.length === 0) {

      throw new Error(
        "No prediction was returned."
      );

    }


    predictions.sort(
      (a, b) =>
        b.probability - a.probability
    );


    const topPrediction =
      predictions[0];


    const resultName =
      normalizeClassName(
        topPrediction.className
      );


    const confidence =
      Math.round(
        topPrediction.probability * 100
      );


    totalDetections++;


    if (pestCounts[resultName] !== undefined) {

      pestCounts[resultName]++;

    }


    updatePredictionUI(
      resultName,
      confidence
    );


    const isHealthy =
      resultName.toLowerCase().includes("healthy");


    if (!isHealthy) {

      activeThreats++;

    }


    updateDashboardStats();


    const historyRecord = {

      time: new Date(),

      name: resultName,

      confidence: confidence,

      isPest: !isHealthy,

      emailSent: false

    };


    detectionHistory.unshift(
      historyRecord
    );


    updateHistoryTable();

    updateCharts();


    if (isHealthy) {

      showDetectionStatus(
        "Healthy leaf detected. No pest alert required.",
        "safe"
      );

      addHealthyAlert(
        resultName,
        confidence
      );

    } else {

      showDetectionStatus(
        `${resultName} detected. Sending email alert...`,
        "danger"
      );


      addPestAlert(
        resultName,
        confidence
      );


      await sendPestEmail(
        resultName,
        confidence,
        historyRecord
      );

    }


  } catch (error) {

    console.error(
      "Prediction error:",
      error
    );


    showDetectionStatus(
      "Prediction failed: " +
      getErrorMessage(error),
      "danger"
    );

  }

}


/* =========================================================
   CLASS NAME
   ========================================================= */

function normalizeClassName(name) {

  const value =
    String(name || "").trim();


  if (
    value.toLowerCase() ===
    "healthy leaf"
  ) {
    return "Healthy Leaf";
  }


  return value;

}


/* =========================================================
   UPDATE RESULT UI
   ========================================================= */

function updatePredictionUI(
  name,
  confidence
) {

  const pestName = $("pestName");
  const confidenceText = $("confidence");
  const confidenceFill = $("confidenceFill");
  const symbol = $("resultSymbol");


  if (pestName) {
    pestName.textContent = name;
  }


  if (confidenceText) {
    confidenceText.textContent =
      confidence + "%";
  }


  if (confidenceFill) {

    confidenceFill.style.width =
      confidence + "%";

  }


  if (symbol) {

    const healthy =
      name.toLowerCase().includes(
        "healthy"
      );


    symbol.innerHTML = healthy
      ? '<i class="fa-solid fa-leaf"></i>'
      : '<i class="fa-solid fa-bug"></i>';

  }

}


/* =========================================================
   DETECTION STATUS
   ========================================================= */

function showDetectionStatus(
  message,
  type = "neutral"
) {

  const box =
    $("detectionStatus");


  if (!box) return;


  box.textContent = message;

  box.className =
    "detection-status " + type;

}


/* =========================================================
   EMAIL SEND
   ========================================================= */

async function sendPestEmail(
  pestName,
  confidence,
  historyRecord
) {

  if (!savedEmail) {

    showEmailStatus(
      "Pest detected, but no alert email has been saved.",
      "error"
    );

    return false;

  }


  if (!emailJSReady || typeof emailjs === "undefined") {

    showEmailStatus(
      "Email could not be sent: EmailJS is not ready.",
      "error"
    );

    showDetectionStatus(
      "Pest detected, but EmailJS is not ready.",
      "danger"
    );

    return false;

  }


  try {

    showEmailStatus(
      `Sending ${pestName} alert to ${savedEmail}...`,
      ""
    );


    /*
      IMPORTANT:
      These parameter names MUST match the variables
      inside your EmailJS template.

      To Email      -> {{to_email}}
      Pest Detected -> {{pest_name}}
      Confidence    -> {{confidence}}
      Status        -> {{status}}
    */

    const templateParams = {

      to_email: savedEmail,

      pest_name: pestName,

      confidence: confidence + "%",

      status: "Pest Detected"

    };


    const response =
      await emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_ID,
        templateParams
      );


    console.log(
      "EmailJS response:",
      response
    );


    if (
      response &&
      Number(response.status) === 200
    ) {

      historyRecord.emailSent = true;


      /*
        IMPORTANT:
        Email Alerts increases ONLY
        after EmailJS returns success.
      */

      emailAlerts++;


      updateDashboardStats();

      updateHistoryTable();


      showEmailStatus(
        `✓ Email sent successfully to ${savedEmail}`,
        "success"
      );


      showDetectionStatus(
        `${pestName} detected. Email alert sent successfully.`,
        "danger"
      );


      return true;

    }


    throw new Error(
      response?.text ||
      "EmailJS returned an unsuccessful response."
    );


  } catch (error) {

    historyRecord.emailSent = false;


    console.error(
      "EMAILJS SEND ERROR:",
      error
    );


    const message =
      getErrorMessage(error);


    showEmailStatus(
      "✕ Email failed: " + message,
      "error"
    );


    showDetectionStatus(
      "Pest detected, but email could not be sent.",
      "danger"
    );


    updateHistoryTable();


    return false;

  }

}


/* =========================================================
   ERROR MESSAGE
   ========================================================= */

function getErrorMessage(error) {

  if (!error) {
    return "Unknown error";
  }


  if (typeof error === "string") {
    return error;
  }


  if (error.text) {
    return `${error.text}`;
  }


  if (error.message) {
    return `${error.message}`;
  }


  try {

    return JSON.stringify(error);

  } catch {

    return "Unknown EmailJS error";

  }

}


/* =========================================================
   DASHBOARD STATS
   ========================================================= */

function updateDashboardStats() {

  if ($("totalDetections")) {

    $("totalDetections").textContent =
      totalDetections;

  }


  if ($("activeThreats")) {

    $("activeThreats").textContent =
      activeThreats;

  }


  if ($("emailAlerts")) {

    $("emailAlerts").textContent =
      emailAlerts;

  }

}


/* =========================================================
   ALERTS
   ========================================================= */

function addPestAlert(
  pestName,
  confidence
) {

  const container =
    $("alertContainer");


  if (!container) return;


  const empty =
    container.querySelector(".empty-alert");


  if (empty) {
    empty.remove();
  }


  const item =
    document.createElement("div");


  item.className =
    "alert-item";


  item.innerHTML = `

    <div class="alert-item-icon">
      <i class="fa-solid fa-bug"></i>
    </div>

    <div>
      <h4>${escapeHtml(pestName)} detected</h4>

      <p>
        AI confidence: ${confidence}% •
        ${new Date().toLocaleTimeString()}
      </p>
    </div>

  `;


  container.prepend(item);

}


function addHealthyAlert(
  name,
  confidence
) {

  const container =
    $("alertContainer");


  if (!container) return;


  const empty =
    container.querySelector(".empty-alert");


  if (empty) {
    empty.remove();
  }


  const item =
    document.createElement("div");


  item.className =
    "alert-item";

  item.style.borderColor =
    "rgba(57,217,138,0.15)";

  item.style.background =
    "rgba(57,217,138,0.035)";


  item.innerHTML = `

    <div
      class="alert-item-icon"
      style="
        color:#39d98a;
        background:rgba(57,217,138,0.1);
      "
    >
      <i class="fa-solid fa-leaf"></i>
    </div>

    <div>
      <h4>Healthy leaf detected</h4>

      <p>
        Confidence: ${confidence}% •
        No pest alert required
      </p>
    </div>

  `;


  container.prepend(item);

}


/* =========================================================
   HISTORY
   ========================================================= */

function updateHistoryTable() {

  const body =
    $("historyBody");


  if (!body) return;


  body.innerHTML = "";


  if (detectionHistory.length === 0) {

    body.innerHTML = `
      <tr class="empty-history">
        <td colspan="5">
          No detection history yet.
        </td>
      </tr>
    `;

    return;

  }


  detectionHistory
    .slice(0, 20)
    .forEach(record => {

      const row =
        document.createElement("tr");


      const time =
        record.time.toLocaleTimeString();


      const pestClass =
        record.isPest
          ? "pest"
          : "healthy";


      const status =
        record.isPest
          ? "Pest Detected"
          : "Healthy";


      const emailText =
        record.emailSent
          ? "✓ Sent"
          : record.isPest
            ? "Not sent"
            : "—";


      const emailClass =
        record.emailSent
          ? "email-sent"
          : "email-not-sent";


      row.innerHTML = `

        <td>${time}</td>

        <td>
          ${escapeHtml(record.name)}
        </td>

        <td>
          ${record.confidence}%
        </td>

        <td>
          <span class="table-badge ${pestClass}">
            ${status}
          </span>
        </td>

        <td class="${emailClass}">
          ${emailText}
        </td>

      `;


      body.appendChild(row);

    });

}


/* =========================================================
   CHARTS
   ========================================================= */

function updateCharts() {

  updatePestChart();

  updateTrendChart();

}


function updatePestChart() {

  const canvas =
    $("pestChart");


  if (!canvas) return;


  if (pestChart) {
    pestChart.destroy();
  }


  pestChart =
    new Chart(
      canvas.getContext("2d"),
      {

        type: "doughnut",

        data: {

          labels: [
            "Aphid",
            "Caterpillar",
            "Whitefly",
            "Thrips",
            "Healthy Leaf"
          ],

          datasets: [
            {

              data: [
                pestCounts.Aphid,
                pestCounts.Caterpillar,
                pestCounts.Whitefly,
                pestCounts.Thrips,
                pestCounts["Healthy Leaf"]
              ],

              borderWidth: 0

            }
          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {

              position: "bottom",

              labels: {

                color: "#a7b6ad",

                font: {
                  size: 9
                },

                padding: 14

              }

            }

          }

        }

      }
    );

}


function updateTrendChart() {

  const canvas =
    $("trendChart");


  if (!canvas) return;


  if (trendChart) {
    trendChart.destroy();
  }


  const recent =
    detectionHistory
      .slice(0, 7)
      .reverse();


  const labels =
    recent.length
      ? recent.map(
          record =>
            record.time.toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit"
              }
            )
        )
      : ["No data"];


  const data =
    recent.length
      ? recent.map(
          record => record.confidence
        )
      : [0];


  trendChart =
    new Chart(
      canvas.getContext("2d"),
      {

        type: "line",

        data: {

          labels: labels,

          datasets: [
            {

              label: "Confidence %",

              data: data,

              borderWidth: 2,

              tension: 0.35,

              fill: false,

              pointRadius: 3,

              pointHoverRadius: 5

            }
          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          scales: {

            x: {

              ticks: {
                color: "#718078",
                font: {
                  size: 8
                }
              },

              grid: {
                color: "rgba(255,255,255,0.04)"
              }

            },

            y: {

              min: 0,

              max: 100,

              ticks: {
                color: "#718078",
                font: {
                  size: 8
                }
              },

              grid: {
                color: "rgba(255,255,255,0.04)"
              }

            }

          },

          plugins: {

            legend: {
              display: false
            }

          }

        }

      }
    );

}


/* =========================================================
   SECURITY
   ========================================================= */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   PAGE EXIT
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    stopCamera();

  }
);
