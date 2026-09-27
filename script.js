/* =========================================================
   TEAM 16 - AI SMART PEST DETECTION
   ========================================================= */


/* =========================
   CONFIGURATION
========================= */

const EMAIL_SERVICE_ID = "service_1js9nlz";
const EMAIL_TEMPLATE_ID = "template_9gcw7py";
const EMAIL_PUBLIC_KEY = "qw4mZGHePXrD9RUOk";

const MODEL_URL = "./model/model.json";
const METADATA_URL = "./model/metadata.json";


/* =========================
   GLOBAL VARIABLES
========================= */

let model = null;
let maxPredictions = 0;

let cameraStream = null;
let currentFacingMode = "environment";

let totalDetections =
  Number(localStorage.getItem("totalDetections")) || 0;

let emailAlerts =
  Number(localStorage.getItem("emailAlerts")) || 0;

let activeThreats =
  Number(localStorage.getItem("activeThreats")) || 0;

let savedEmail =
  localStorage.getItem("agriAlertEmail") || "";

let detectionHistory =
  JSON.parse(localStorage.getItem("detectionHistory") || "[]");

let pestCounts =
  JSON.parse(
    localStorage.getItem("pestCounts") ||
    JSON.stringify({
      Aphid: 0,
      Caterpillar: 0,
      Whitefly: 0,
      Thrips: 0,
      "Healthy Leaf": 0
    })
  );

let pestChart = null;
let trendChart = null;

let emailJSReady = false;


/* =========================
   DOM READY
========================= */

document.addEventListener("DOMContentLoaded", () => {

  setupNavigation();
  setupLanguage();
  setupEmail();
  setupCamera();
  setupUpload();
  setupHistory();

  loadSavedEmail();

  updateDashboardStats();
  renderHistory();
  renderAlerts();

  updatePestChart();
  updateTrendChart();

  initializeEmailJS();
  loadAIModel();

});


/* =========================
   NAVIGATION
========================= */

function setupNavigation() {

  const links = document.querySelectorAll(".nav-link");

  links.forEach(link => {

    link.addEventListener("click", event => {

      event.preventDefault();

      const targetId =
        link.getAttribute("href");

      const target =
        document.querySelector(targetId);

      if (target) {

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

    });

  });


  const sections =
    document.querySelectorAll("section[id]");

  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          links.forEach(link => {

            link.classList.toggle(
              "active",
              link.getAttribute("href") ===
              "#" + entry.target.id
            );

          });

        });

      },
      {
        threshold: 0.2
      }
    );

  sections.forEach(section =>
    observer.observe(section)
  );

}


/* =========================
   LANGUAGE
========================= */

function setupLanguage() {

  const selector =
    document.getElementById("languageSelector");

  if (!selector) return;

  selector.addEventListener("change", () => {

    if (selector.value === "ta") {

      document.getElementById("heroDescription").textContent =
        "AI பட பகுப்பாய்வு மூலம் பயிர் பூச்சிகளை கண்டறிந்து, விரைவான நடவடிக்கைக்காக Email Alert பெறலாம்.";

    } else {

      document.getElementById("heroDescription").textContent =
        "Detect crop pests instantly using AI image classification and receive email alerts for faster action.";

    }

  });

}


/* =========================
   EMAILJS
========================= */

function initializeEmailJS() {

  if (typeof emailjs === "undefined") {

    emailJSReady = false;

    showEmailStatus(
      "EmailJS library is not loaded. Check your internet connection and reload.",
      "error"
    );

    return;

  }

  try {

    emailjs.init({
      publicKey: EMAIL_PUBLIC_KEY
    });

    emailJSReady = true;

    if (savedEmail) {

      showEmailStatus(
        "Email saved: " + savedEmail,
        "success"
      );

    }

  } catch (error) {

    emailJSReady = false;

    showEmailStatus(
      "EmailJS initialization failed: " +
      getErrorMessage(error),
      "error"
    );

  }

}


/* =========================
   EMAIL SETUP
========================= */

function setupEmail() {

  const saveButton =
    document.getElementById("saveEmail");

  const testButton =
    document.getElementById("testEmail");

  const input =
    document.getElementById("alertEmail");


  saveButton.addEventListener("click", () => {

    const email =
      input.value.trim();

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
      savedEmail
    );

    showEmailStatus(
      "Email saved successfully: " + savedEmail,
      "success"
    );

  });


  testButton.addEventListener(
    "click",
    sendTestEmail
  );

}


function loadSavedEmail() {

  const input =
    document.getElementById("alertEmail");

  if (savedEmail) {

    input.value = savedEmail;

    showEmailStatus(
      "Saved email: " + savedEmail,
      "success"
    );

  }

}


function sendTestEmail() {

  if (!savedEmail) {

    const input =
      document.getElementById("alertEmail");

    const email =
      input.value.trim();

    if (!email) {

      showEmailStatus(
        "Enter and save an email address first.",
        "error"
      );

      return;

    }

  }


  if (!emailJSReady) {

    showEmailStatus(
      "EmailJS is not ready. Please reload the page.",
      "error"
    );

    return;

  }


  showEmailStatus(
    "Sending test email...",
    ""
  );


  emailjs.send(
    EMAIL_SERVICE_ID,
    EMAIL_TEMPLATE_ID,
    {
      to_email: savedEmail,
      pest_name: "Test Detection",
      confidence: "100%",
      status: "Test Email"
    }
  )
  .then(response => {

    if (response && response.status === 200) {

      showEmailStatus(
        "Test email sent successfully to " +
        savedEmail,
        "success"
      );

    } else {

      showEmailStatus(
        "EmailJS returned an unexpected response.",
        "error"
      );

    }

  })
  .catch(error => {

    showEmailStatus(
      "Test email failed. Service ID: " +
      EMAIL_SERVICE_ID +
      " | Template ID: " +
      EMAIL_TEMPLATE_ID +
      " | Error: " +
      getErrorMessage(error),
      "error"
    );

  });

}


function sendPestEmail(
  pestName,
  confidence,
  historyRecord
) {

  if (!savedEmail) {

    historyRecord.emailSent = false;
    historyRecord.emailMessage =
      "No email address saved.";

    saveHistory();

    renderHistory();
    renderAlerts();

    return;

  }


  if (!emailJSReady) {

    historyRecord.emailSent = false;
    historyRecord.emailMessage =
      "EmailJS is not ready.";

    saveHistory();

    renderHistory();
    renderAlerts();

    showEmailStatus(
      "Pest detected, but EmailJS is not ready.",
      "error"
    );

    return;

  }


  showEmailStatus(
    "Pest detected. Sending email alert...",
    ""
  );


  emailjs.send(
    EMAIL_SERVICE_ID,
    EMAIL_TEMPLATE_ID,
    {
      to_email: savedEmail,
      pest_name: pestName,
      confidence: confidence + "%",
      status: "Pest Detected"
    }
  )
  .then(response => {

    if (response && response.status === 200) {

      historyRecord.emailSent = true;
      historyRecord.emailMessage =
        "Email sent successfully";

      emailAlerts++;

      localStorage.setItem(
        "emailAlerts",
        emailAlerts
      );

      saveHistory();

      updateDashboardStats();
      renderHistory();
      renderAlerts();

      showEmailStatus(
        "Pest alert sent successfully to " +
        savedEmail,
        "success"
      );

    } else {

      historyRecord.emailSent = false;
      historyRecord.emailMessage =
        "EmailJS returned an unexpected response.";

      saveHistory();

      renderHistory();
      renderAlerts();

      showEmailStatus(
        "Email alert failed: unexpected EmailJS response.",
        "error"
      );

    }

  })
  .catch(error => {

    historyRecord.emailSent = false;
    historyRecord.emailMessage =
      getErrorMessage(error);

    saveHistory();

    renderHistory();
    renderAlerts();

    showEmailStatus(
      "Pest detected, but email failed. " +
      getErrorMessage(error),
      "error"
    );

  });

}


/* =========================
   EMAIL HELPERS
========================= */

function showEmailStatus(message, type) {

  const status =
    document.getElementById("emailStatus");

  if (!status) return;

  status.textContent = message;

  status.className =
    "email-status" +
    (type ? " " + type : "");

}


function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


function getErrorMessage(error) {

  if (!error) {
    return "Unknown EmailJS error.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error.text) {
    return error.text;
  }

  if (error.message) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown EmailJS error.";
  }

}


/* =========================
   AI MODEL
========================= */

async function loadAIModel() {

  const status =
    document.getElementById("modelStatus");

  try {

    if (typeof tmImage === "undefined") {

      throw new Error(
        "Teachable Machine library is not loaded."
      );

    }

    model =
      await tmImage.load(
        MODEL_URL,
        METADATA_URL
      );

    maxPredictions =
      model.getTotalClasses();

    status.textContent = "Ready";

    status.style.color = "#5ddd9b";

  } catch (error) {

    console.error(
      "Model loading error:",
      error
    );

    status.textContent = "Error";

    status.style.color = "#ff7f87";

  }

}


/* =========================
   CAMERA
========================= */

function setupCamera() {

  const start =
    document.getElementById("startCamera");

  const capture =
    document.getElementById("captureImage");

  const stop =
    document.getElementById("stopCamera");


  start.addEventListener(
    "click",
    startCamera
  );

  capture.addEventListener(
    "click",
    captureCameraImage
  );

  stop.addEventListener(
    "click",
    stopCamera
  );

}


async function startCamera() {

  const video =
    document.getElementById("camera");

  const placeholder =
    document.getElementById("cameraPlaceholder");

  const start =
    document.getElementById("startCamera");

  const capture =
    document.getElementById("captureImage");

  const stop =
    document.getElementById("stopCamera");


  try {

    if (cameraStream) {
      stopCamera();
    }

    cameraStream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode
        },
        audio: false
      });

    video.srcObject = cameraStream;

    video.style.display = "block";
    placeholder.style.display = "none";

    start.disabled = true;
    capture.disabled = false;
    stop.disabled = false;

  } catch (error) {

    showEmailStatus(
      "Camera could not start: " +
      error.message,
      "error"
    );

  }

}


function stopCamera() {

  const video =
    document.getElementById("camera");

  const placeholder =
    document.getElementById("cameraPlaceholder");

  const start =
    document.getElementById("startCamera");

  const capture =
    document.getElementById("captureImage");

  const stop =
    document.getElementById("stopCamera");


  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(track => track.stop());

    cameraStream = null;

  }

  video.srcObject = null;

  video.style.display = "none";
  placeholder.style.display = "grid";

  start.disabled = false;
  capture.disabled = true;
  stop.disabled = true;

}


async function captureCameraImage() {

  const video =
    document.getElementById("camera");

  if (!video.videoWidth) {

    return;

  }


  const canvas =
    document.createElement("canvas");

  canvas.width =
    video.videoWidth;

  canvas.height =
    video.videoHeight;

  const context =
    canvas.getContext("2d");

  context.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );


  await predictImage(canvas);

}


/* =========================
   UPLOAD
========================= */

function setupUpload() {

  const input =
    document.getElementById("imageUpload");

  input.addEventListener(
    "change",
    handleImageUpload
  );

}


function handleImageUpload(event) {

  const file =
    event.target.files[0];

  if (!file) return;


  if (!file.type.startsWith("image/")) {

    return;

  }


  const reader =
    new FileReader();


  reader.onload = async event => {

    const img =
      document.getElementById("uploadedImage");

    img.src =
      event.target.result;

    document.querySelector(
      ".uploaded-preview"
    ).style.display = "block";


    img.onload = async () => {

      await predictImage(img);

    };

  };


  reader.readAsDataURL(file);

}


/* =========================
   AI PREDICTION
========================= */

async function predictImage(imageElement) {

  if (!model) {

    alert(
      "AI model is still loading. Please wait a moment and try again."
    );

    return;

  }


  try {

    const predictions =
      await model.predict(imageElement);


    const predictionData =
      predictions.map(prediction => ({
        name: normalizeClassName(
          prediction.className
        ),
        probability:
          prediction.probability
      }));


    predictionData.sort(
      (a, b) =>
        b.probability - a.probability
    );


    const best =
      predictionData[0];


    const pestName =
      best.name;

    const confidence =
      Number(
        (best.probability * 100).toFixed(1)
      );


    totalDetections++;

    localStorage.setItem(
      "totalDetections",
      totalDetections
    );


    if (
      pestName !== "Healthy Leaf"
    ) {

      activeThreats++;

      localStorage.setItem(
        "activeThreats",
        activeThreats
      );

    }


    if (
      pestCounts[pestName] !== undefined
    ) {

      pestCounts[pestName]++;

    }


    localStorage.setItem(
      "pestCounts",
      JSON.stringify(pestCounts)
    );


    const historyRecord = {

      id: Date.now(),

      name: pestName,

      confidence: confidence,

      timestamp:
        new Date().toISOString(),

      emailSent: false,

      emailMessage:
        pestName === "Healthy Leaf"
          ? "No email required for healthy leaf."
          : "Email pending"

    };


    detectionHistory.unshift(
      historyRecord
    );


    if (detectionHistory.length > 50) {

      detectionHistory =
        detectionHistory.slice(0, 50);

    }


    saveHistory();


    updateDashboardStats();

    updatePestChart();

    updateTrendChart();

    renderHistory();

    renderAlerts();

    showPredictionResult(
      pestName,
      confidence,
      predictionData
    );


    /*
      IMPORTANT:
      History is already saved above.
      Email sending happens AFTER history creation.
      So email failure cannot hide the history.
    */

    if (
      pestName !== "Healthy Leaf"
    ) {

      sendPestEmail(
        pestName,
        confidence,
        historyRecord
      );

    }


  } catch (error) {

    console.error(
      "Prediction error:",
      error
    );

    alert(
      "Prediction failed: " +
      error.message
    );

  }

}


/* =========================
   CLASS NAME NORMALIZATION
========================= */

function normalizeClassName(name) {

  const clean =
    String(name)
      .trim()
      .toLowerCase();


  if (clean === "healthy leaf") {
    return "Healthy Leaf";
  }

  if (clean === "aphid") {
    return "Aphid";
  }

  if (clean === "caterpillar") {
    return "Caterpillar";
  }

  if (clean === "whitefly") {
    return "Whitefly";
  }

  if (clean === "thrips") {
    return "Thrips";
  }


  return name;

}


/* =========================
   SHOW PREDICTION
========================= */

function showPredictionResult(
  pestName,
  confidence,
  predictionData
) {

  const card =
    document.getElementById(
      "predictionResult"
    );

  const name =
    document.getElementById(
      "predictionName"
    );

  const confidenceText =
    document.getElementById(
      "predictionConfidence"
    );


  card.classList.remove("hidden");

  name.textContent =
    pestName;

  confidenceText.textContent =
    confidence + "%";


  renderPredictionScores(
    predictionData
  );

}


function renderPredictionScores(
  predictionData
) {

  const container =
    document.getElementById(
      "predictionScores"
    );


  container.innerHTML = "";


  predictionData.forEach(item => {

    const percentage =
      Number(
        (item.probability * 100).toFixed(1)
      );


    const row =
      document.createElement("div");

    row.className =
      "score-row";


    row.innerHTML = `
      <div class="score-name">
        ${escapeHTML(item.name)}
      </div>

      <div class="score-bar">
        <div
          class="score-fill"
          style="width:${percentage}%">
        </div>
      </div>

      <div class="score-value">
        ${percentage}%
      </div>
    `;


    container.appendChild(row);

  });

}


/* =========================
   HISTORY
========================= */

function saveHistory() {

  localStorage.setItem(
    "detectionHistory",
    JSON.stringify(detectionHistory)
  );

}


function setupHistory() {

  const clearButton =
    document.getElementById(
      "clearHistory"
    );


  clearButton.addEventListener(
    "click",
    () => {

      if (
        detectionHistory.length === 0
      ) {

        return;

      }


      const confirmed =
        confirm(
          "Clear all detection history?"
        );


      if (!confirmed) return;


      detectionHistory = [];

      localStorage.removeItem(
        "detectionHistory"
      );

      renderHistory();
      renderAlerts();

    }
  );

}


function renderHistory() {

  const container =
    document.getElementById(
      "historyList"
    );


  if (!container) return;


  if (
    detectionHistory.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-history">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <p>No detection history yet.</p>
        <span>Run an AI detection to create a record.</span>
      </div>
    `;

    return;

  }


  container.innerHTML =
    detectionHistory
      .slice(0, 15)
      .map(record => {

        const healthy =
          record.name === "Healthy Leaf";


        return `
          <div class="history-item">

            <div class="history-left">

              <div class="history-icon ${
                healthy ? "healthy" : ""
              }">

                <i class="fa-solid ${
                  healthy
                    ? "fa-leaf"
                    : "fa-triangle-exclamation"
                }"></i>

              </div>

              <div>

                <strong>
                  ${escapeHTML(record.name)}
                </strong>

                <small>
                  ${formatDate(record.timestamp)}
                </small>

              </div>

            </div>


            <div class="history-right">

              <span>
                ${record.confidence}%
                confidence
              </span>

              ${
                healthy
                  ? `<span class="email-sent">
                      Healthy
                    </span>`
                  : record.emailSent
                    ? `<span class="email-sent">
                        <i class="fa-solid fa-check"></i>
                        Email Sent
                      </span>`
                    : `<span class="email-failed">
                        <i class="fa-solid fa-xmark"></i>
                        Email Pending/Failed
                      </span>`
              }

            </div>

          </div>
        `;

      })
      .join("");

}


function renderAlerts() {

  const container =
    document.getElementById(
      "alertsList"
    );

  const badge =
    document.getElementById(
      "alertCountBadge"
    );


  if (!container) return;


  const pestAlerts =
    detectionHistory.filter(
      item =>
        item.name !== "Healthy Leaf"
    );


  badge.textContent =
    pestAlerts.length +
    (pestAlerts.length === 1
      ? " Alert"
      : " Alerts");


  if (pestAlerts.length === 0) {

    container.innerHTML = `
      <div class="empty-alerts">
        <i class="fa-solid fa-bell-slash"></i>
        <p>No alerts yet.</p>
        <span>Detected pests will appear here.</span>
      </div>
    `;

    return;

  }


  container.innerHTML =
    pestAlerts
      .slice(0, 10)
      .map(record => {

        return `
          <div class="alert-item">

            <div class="alert-left">

              <div class="alert-icon">
                <i class="fa-solid fa-bug"></i>
              </div>

              <div>

                <strong>
                  ${escapeHTML(record.name)}
                </strong>

                <small>
                  ${formatDate(record.timestamp)}
                </small>

              </div>

            </div>


            <div class="alert-right">

              <span>
                ${record.confidence}% confidence
              </span>

              ${
                record.emailSent
                  ? `<span class="email-sent">
                      <i class="fa-solid fa-envelope-circle-check"></i>
                      Email Sent
                    </span>`
                  : `<span class="email-failed">
                      <i class="fa-solid fa-envelope"></i>
                      ${escapeHTML(
                        record.emailMessage ||
                        "Email pending"
                      )}
                    </span>`
              }

            </div>

          </div>
        `;

      })
      .join("");

}


/* =========================
   DASHBOARD STATS
========================= */

function updateDashboardStats() {

  document.getElementById(
    "totalDetections"
  ).textContent =
    totalDetections;


  document.getElementById(
    "activeThreats"
  ).textContent =
    activeThreats;


  document.getElementById(
    "emailAlerts"
  ).textContent =
    emailAlerts;

}


/* =========================
   PEST CHART
========================= */

function updatePestChart() {

  const canvas =
    document.getElementById(
      "pestChart"
    );


  if (!canvas) return;


  const data = [

    pestCounts.Aphid,

    pestCounts.Caterpillar,

    pestCounts.Whitefly,

    pestCounts.Thrips,

    pestCounts["Healthy Leaf"]

  ];


  if (pestChart) {

    pestChart.destroy();

  }


  pestChart =
    new Chart(canvas, {

      type: "bar",

      data: {

        labels: [
          "Aphid",
          "Caterpillar",
          "Whitefly",
          "Thrips",
          "Healthy Leaf"
        ],

        datasets: [{

          label: "Detections",

          data: data,

          borderRadius: 7,

          borderWidth: 0

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

          x: {

            ticks: {
              color: "#789789",
              font: {
                size: 10
              }
            },

            grid: {
              display: false
            }

          },

          y: {

            beginAtZero: true,

            ticks: {
              color: "#789789",
              precision: 0
            },

            grid: {
              color: "#18372a"
            }

          }

        }

      }

    });

}


/* =========================
   TREND CHART
========================= */

function updateTrendChart() {

  const canvas =
    document.getElementById(
      "trendChart"
    );


  if (!canvas) return;


  const recent =
    detectionHistory
      .slice(0, 10)
      .reverse();


  const labels =
    recent.map(
      record =>
        new Date(
          record.timestamp
        ).toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        )
    );


  const values =
    recent.map(
      () => 1
    );


  if (trendChart) {

    trendChart.destroy();

  }


  trendChart =
    new Chart(canvas, {

      type: "line",

      data: {

        labels: labels,

        datasets: [{

          label: "Detections",

          data: values,

          tension: 0.35,

          fill: false,

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

          x: {

            ticks: {
              color: "#789789"
            },

            grid: {
              display: false
            }

          },

          y: {

            beginAtZero: true,

            ticks: {
              color: "#789789",
              precision: 0
            },

            grid: {
              color: "#18372a"
            }

          }

        }

      }

    });

}


/* =========================
   DATE FORMAT
========================= */

function formatDate(value) {

  const date =
    new Date(value);


  if (Number.isNaN(
    date.getTime()
  )) {

    return "Unknown time";

  }


  return date.toLocaleString(
    [],
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}


/* =========================
   SECURITY HELPER
========================= */

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
