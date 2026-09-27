/* =========================================================
   TEAM 16
   AI SMART PEST DETECTION & ALERT SYSTEM
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const EMAIL_SERVICE_ID = "service_x2d7sj";
const EMAIL_TEMPLATE_ID = "template_6efhw0d";
const EMAIL_PUBLIC_KEY = "wOORs4b9toARevid-";

const MODEL_URL = "./model/model.json";
const METADATA_URL = "./model/metadata.json";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

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


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  setupNavigation();
  setupLanguage();
  setupEmail();

  loadSavedEmail();

  updateDashboardStats();
  updatePestChart();
  updateTrendChart();

  initializeEmailJS();
  loadAIModel();

});


/* =========================================================
   NAVIGATION
   All sections stay on one page.
   Clicking menu scrolls to section.
========================================================= */

function setupNavigation() {

  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach(link => {

    link.addEventListener("click", event => {

      event.preventDefault();

      const targetId = link.getAttribute("href");

      const target = document.querySelector(targetId);

      if (target) {

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

    });

  });


  const sections = document.querySelectorAll(".section");

  const observer = new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          const id = entry.target.id;

          navLinks.forEach(link => {

            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${id}`
            );

          });

        }

      });

    },
    {
      rootMargin: "-25% 0px -60% 0px"
    }
  );


  sections.forEach(section => {
    observer.observe(section);
  });

}


/* =========================================================
   LANGUAGE
========================================================= */

function setupLanguage() {

  const selector = document.getElementById("languageSelector");

  if (!selector) {
    return;
  }

  selector.addEventListener("change", () => {

    const language = selector.value;

    if (language === "ta") {
      applyTamil();
    } else {
      applyEnglish();
    }

  });

}


function applyEnglish() {

  document.documentElement.lang = "en";

  const dashboardText =
    document.querySelector("#dashboard .hero p");

  if (dashboardText) {
    dashboardText.textContent =
      "Detect crop pests using AI image analysis and receive instant alerts.";
  }

}


function applyTamil() {

  document.documentElement.lang = "ta";

  const dashboardText =
    document.querySelector("#dashboard .hero p");

  if (dashboardText) {
    dashboardText.textContent =
      "AI image analysis மூலம் பயிர்களில் உள்ள பூச்சிகளை கண்டறிந்து உடனடி alert பெறலாம்.";
  }

}


/* =========================================================
   EMAILJS INITIALIZATION
========================================================= */

function initializeEmailJS() {

  const statusElement =
    document.getElementById("emailStatus");

  if (typeof emailjs === "undefined") {

    emailJSReady = false;

    showEmailStatus(
      "EmailJS library is not loaded. Check internet connection and reload the page.",
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
        `Email saved: ${savedEmail}`,
        "success"
      );

    }

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

  const saveButton =
    document.getElementById("saveEmail");

  const testButton =
    document.getElementById("testEmail");

  const emailInput =
    document.getElementById("alertEmail");


  if (saveButton) {

    saveButton.addEventListener("click", saveEmail);

  }


  if (testButton) {

    testButton.addEventListener("click", sendTestEmail);

  }


  if (emailInput) {

    emailInput.addEventListener("keydown", event => {

      if (event.key === "Enter") {
        saveEmail();
      }

    });

  }

}


/* =========================================================
   LOAD SAVED EMAIL
========================================================= */

function loadSavedEmail() {

  const input =
    document.getElementById("alertEmail");

  if (!input) {
    return;
  }

  if (savedEmail) {

    input.value = savedEmail;

    showEmailStatus(
      `Email saved: ${savedEmail}`,
      "success"
    );

  }

}


/* =========================================================
   SAVE EMAIL
========================================================= */

function saveEmail() {

  const input =
    document.getElementById("alertEmail");

  if (!input) {
    return;
  }

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
    `Email saved successfully: ${savedEmail}`,
    "success"
  );

}


/* =========================================================
   EMAIL VALIDATION
========================================================= */

function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


/* =========================================================
   SHOW EMAIL STATUS
========================================================= */

function showEmailStatus(message, type = "") {

  const status =
    document.getElementById("emailStatus");

  if (!status) {
    return;
  }

  status.textContent = message;

  status.className = "email-status";

  if (type) {
    status.classList.add(type);
  }

}


/* =========================================================
   TEST EMAIL
========================================================= */

async function sendTestEmail() {

  if (!savedEmail) {

    showEmailStatus(
      "Please save an email address first.",
      "error"
    );

    return;
  }


  if (!emailJSReady || typeof emailjs === "undefined") {

    showEmailStatus(
      "EmailJS is not ready. Check internet connection and reload the page.",
      "error"
    );

    return;
  }


  showEmailStatus(
    "Sending test email...",
    ""
  );


  try {

    const response = await emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      {
        to_email: savedEmail,
        pest_name: "Test Detection",
        confidence: "100%",
        status: "Test Email"
      }
    );


    if (response && response.status === 200) {

      showEmailStatus(
        `Test email sent successfully to ${savedEmail}.`,
        "success"
      );

    } else {

      showEmailStatus(
        `EmailJS returned an unexpected response: ${response?.status || "unknown"} ${response?.text || ""}`,
        "error"
      );

    }

  } catch (error) {

    showEmailStatus(
      "Test email failed: " + getErrorMessage(error),
      "error"
    );

  }

}


/* =========================================================
   LOAD AI MODEL
========================================================= */

async function loadAIModel() {

  const status =
    document.getElementById("modelStatus");


  try {

    if (status) {
      status.textContent = "Loading...";
    }


    model = await tmImage.load(
      MODEL_URL,
      METADATA_URL
    );


    maxPredictions =
      model.getTotalClasses();


    if (status) {
      status.textContent = "Ready";
    }


    setupImageUpload();
    setupCamera();

  } catch (error) {

    console.error(error);

    if (status) {
      status.textContent = "Error";
    }

    showResultError(
      "AI model could not be loaded. Please check the model folder."
    );

  }

}


/* =========================================================
   IMAGE UPLOAD
========================================================= */

function setupImageUpload() {

  const input =
    document.getElementById("imageUpload");

  if (!input) {
    return;
  }


  input.addEventListener("change", async event => {

    const file =
      event.target.files[0];

    if (!file) {
      return;
    }


    const image =
      new Image();


    image.onload = async () => {

      const preview =
        document.getElementById("previewImage");

      const placeholder =
        document.getElementById("previewPlaceholder");


      if (preview) {

        preview.src =
          URL.createObjectURL(file);

        preview.style.display =
          "block";

      }


      if (placeholder) {
        placeholder.style.display =
          "none";
      }


      await predictImage(image);

    };


    image.src =
      URL.createObjectURL(file);

  });

}


/* =========================================================
   CAMERA
========================================================= */

function setupCamera() {

  const startButton =
    document.getElementById("startCamera");

  const captureButton =
    document.getElementById("captureImage");

  const stopButton =
    document.getElementById("stopCamera");


  if (startButton) {

    startButton.addEventListener(
      "click",
      startCamera
    );

  }


  if (captureButton) {

    captureButton.addEventListener(
      "click",
      captureAndPredict
    );

  }


  if (stopButton) {

    stopButton.addEventListener(
      "click",
      stopCamera
    );

  }

}


/* =========================================================
   START CAMERA
========================================================= */

async function startCamera() {

  const video =
    document.getElementById("camera");

  const placeholder =
    document.getElementById("cameraPlaceholder");

  const startButton =
    document.getElementById("startCamera");

  const captureButton =
    document.getElementById("captureImage");

  const stopButton =
    document.getElementById("stopCamera");


  try {

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

      showResultError(
        "Camera is not supported in this browser."
      );

      return;
    }


    cameraStream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode
        },
        audio: false
      });


    video.srcObject =
      cameraStream;

    video.style.display =
      "block";


    if (placeholder) {
      placeholder.style.display =
        "none";
    }


    if (startButton) {
      startButton.disabled = true;
    }

    if (captureButton) {
      captureButton.disabled = false;
    }

    if (stopButton) {
      stopButton.disabled = false;
    }

  } catch (error) {

    showResultError(
      "Could not access camera: " +
      getErrorMessage(error)
    );

  }

}


/* =========================================================
   CAPTURE IMAGE FROM CAMERA
========================================================= */

async function captureAndPredict() {

  const video =
    document.getElementById("camera");


  if (!cameraStream) {

    showResultError(
      "Please start the camera first."
    );

    return;
  }


  if (!model) {

    showResultError(
      "AI model is still loading."
    );

    return;
  }


  const canvas =
    document.createElement("canvas");


  canvas.width =
    video.videoWidth || 640;

  canvas.height =
    video.videoHeight || 480;


  const context =
    canvas.getContext("2d");


  context.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );


  const image =
    new Image();


  image.onload = async () => {

    await predictImage(image);

  };


  image.src =
    canvas.toDataURL("image/jpeg");

}


/* =========================================================
   STOP CAMERA
========================================================= */

function stopCamera() {

  const video =
    document.getElementById("camera");

  const placeholder =
    document.getElementById("cameraPlaceholder");

  const startButton =
    document.getElementById("startCamera");

  const captureButton =
    document.getElementById("captureImage");

  const stopButton =
    document.getElementById("stopCamera");


  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(track => track.stop());

    cameraStream = null;

  }


  if (video) {

    video.srcObject = null;
    video.style.display = "none";

  }


  if (placeholder) {
    placeholder.style.display = "flex";
  }


  if (startButton) {
    startButton.disabled = false;
  }

  if (captureButton) {
    captureButton.disabled = true;
  }

  if (stopButton) {
    stopButton.disabled = true;
  }

}


/* =========================================================
   PREDICT IMAGE
========================================================= */

async function predictImage(image) {

  if (!model) {

    showResultError(
      "AI model is not ready yet."
    );

    return;
  }


  showResultLoading();


  try {

    const predictions =
      await model.predict(
        image,
        false
      );


    predictions.sort(
      (a, b) =>
        b.probability - a.probability
    );


    const result =
      predictions[0];


    const pestName =
      normalizeClassName(result.className);


    const confidence =
      Math.round(
        result.probability * 100
      );


    totalDetections++;


    if (pestCounts[pestName] !== undefined) {

      pestCounts[pestName]++;

    }


    const isHealthy =
      pestName === "Healthy Leaf";


    if (!isHealthy) {

      activeThreats++;

    }


    const historyRecord = {

      name: pestName,

      confidence: confidence,

      timestamp: new Date(),

      emailSent: false

    };


    detectionHistory.unshift(
      historyRecord
    );


    if (detectionHistory.length > 20) {

      detectionHistory =
        detectionHistory.slice(0, 20);

    }


    updateDashboardStats();
    updatePestChart();
    updateTrendChart();

    showPredictionResult(
      pestName,
      confidence,
      predictions
    );


    addDetectionAlert(
      pestName,
      confidence,
      historyRecord
    );


    if (!isHealthy) {

      await sendPestEmail(
        pestName,
        confidence,
        historyRecord
      );

    }

  } catch (error) {

    console.error(error);

    showResultError(
      "Prediction failed: " +
      getErrorMessage(error)
    );

  }

}


/* =========================================================
   NORMALIZE MODEL CLASS NAMES
========================================================= */

function normalizeClassName(name) {

  const value =
    String(name)
      .trim()
      .toLowerCase();


  if (value === "healthy leaf") {
    return "Healthy Leaf";
  }

  if (value === "aphid") {
    return "Aphid";
  }

  if (value === "caterpillar") {
    return "Caterpillar";
  }

  if (value === "whitefly") {
    return "Whitefly";
  }

  if (value === "thrips") {
    return "Thrips";
  }


  return name;

}


/* =========================================================
   SHOW RESULT
========================================================= */

function showPredictionResult(
  pestName,
  confidence,
  predictions
) {

  const resultContent =
    document.getElementById("resultContent");


  if (!resultContent) {
    return;
  }


  const isHealthy =
    pestName === "Healthy Leaf";


  let predictionRows = "";


  predictions.forEach(prediction => {

    const name =
      normalizeClassName(
        prediction.className
      );

    const percentage =
      Math.round(
        prediction.probability * 100
      );


    predictionRows += `
      <div class="prediction-row">
        <span>${escapeHTML(name)}</span>
        <strong>${percentage}%</strong>
      </div>
    `;

  });


  resultContent.innerHTML = `

    <div class="prediction-result">

      <div>

        <div class="prediction-name ${isHealthy ? "healthy" : "pest"}">
          ${escapeHTML(pestName)}
        </div>

        <div class="prediction-confidence">
          AI Confidence:
          <span class="confidence-value">
            ${confidence}%
          </span>
        </div>

        <div class="result-status">
          ${
            isHealthy
              ? "Healthy leaf detected."
              : "Pest detected. Email alert process started."
          }
        </div>

      </div>

      <div class="prediction-score">
        <strong>${confidence}%</strong>
      </div>

    </div>

    <div class="prediction-list">
      ${predictionRows}
    </div>

  `;

}


/* =========================================================
   RESULT LOADING
========================================================= */

function showResultLoading() {

  const resultContent =
    document.getElementById("resultContent");

  if (!resultContent) {
    return;
  }


  resultContent.innerHTML = `

    <div class="result-empty">

      <i class="fa-solid fa-spinner fa-spin"></i>

      <p>AI is analysing...</p>

      <span>Please wait.</span>

    </div>

  `;

}


/* =========================================================
   RESULT ERROR
========================================================= */

function showResultError(message) {

  const resultContent =
    document.getElementById("resultContent");

  if (!resultContent) {
    return;
  }


  resultContent.innerHTML = `

    <div class="result-empty">

      <i class="fa-solid fa-circle-exclamation"></i>

      <p>Error</p>

      <span>${escapeHTML(message)}</span>

    </div>

  `;

}


/* =========================================================
   SEND PEST EMAIL
========================================================= */

async function sendPestEmail(
  pestName,
  confidence,
  historyRecord
) {

  if (!savedEmail) {

    showEmailStatus(
      "Pest detected, but no email address is saved.",
      "error"
    );

    return;

  }


  if (!emailJSReady || typeof emailjs === "undefined") {

    showEmailStatus(
      "Pest detected, but EmailJS is not ready.",
      "error"
    );

    return;

  }


  showEmailStatus(
    `Pest detected. Sending alert to ${savedEmail}...`,
    ""
  );


  try {

    const response =
      await emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_ID,
        {
          to_email: savedEmail,
          pest_name: pestName,
          confidence: confidence + "%",
          status: "Pest Detected"
        }
      );


    /*
      IMPORTANT:
      Email Alerts count increases ONLY
      when EmailJS confirms success.
    */

    if (response && response.status === 200) {

      historyRecord.emailSent = true;

      emailAlerts++;

      updateDashboardStats();
      renderAlerts();

      showEmailStatus(
        `Pest alert sent successfully to ${savedEmail}.`,
        "success"
      );

    } else {

      showEmailStatus(
        `EmailJS failed: ${response?.status || "unknown"} ${response?.text || ""}`,
        "error"
      );

    }

  } catch (error) {

    console.error("EmailJS error:", error);

    showEmailStatus(
      "Pest alert email failed: " +
      getErrorMessage(error),
      "error"
    );

  }

}


/* =========================================================
   DASHBOARD STATS
========================================================= */

function updateDashboardStats() {

  const total =
    document.getElementById("totalDetections");

  const threats =
    document.getElementById("activeThreats");

  const emails =
    document.getElementById("emailAlerts");


  if (total) {
    total.textContent =
      totalDetections;
  }

  if (threats) {
    threats.textContent =
      activeThreats;
  }

  if (emails) {
    emails.textContent =
      emailAlerts;
  }

}


/* =========================================================
   PEST CHART
   Each pest gets its own bar.
========================================================= */

function updatePestChart() {

  const canvas =
    document.getElementById("pestChart");

  if (!canvas) {
    return;
  }


  const data = [
    pestCounts.Aphid,
    pestCounts.Caterpillar,
    pestCounts.Whitefly,
    pestCounts.Thrips,
    pestCounts["Healthy Leaf"]
  ];


  if (pestChart) {

    pestChart.data.datasets[0].data =
      data;

    pestChart.update();

    return;

  }


  pestChart =
    new Chart(
      canvas.getContext("2d"),
      {
        type: "bar",

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
              label: "Detections",

              data: data,

              backgroundColor: [
                "#ff6678",
                "#f6c85f",
                "#5ea7ff",
                "#a982ff",
                "#39d98a"
              ],

              borderRadius: 8,

              borderWidth: 0
            }
          ]

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
                color: "#91a99d"
              },

              grid: {
                display: false
              }
            },

            y: {

              beginAtZero: true,

              ticks: {
                color: "#91a99d",
                precision: 0
              },

              grid: {
                color: "rgba(100,140,120,0.12)"
              }

            }

          }

        }

      }
    );

}


/* =========================================================
   TREND CHART
========================================================= */

function updateTrendChart() {

  const canvas =
    document.getElementById("trendChart");

  if (!canvas) {
    return;
  }


  const recent =
    detectionHistory
      .slice(0, 10)
      .reverse();


  const labels =
    recent.map((item, index) => {

      return item.timestamp
        ? item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        : `#${index + 1}`;

    });


  const values =
    recent.map(
      item => item.confidence
    );


  if (trendChart) {

    trendChart.data.labels =
      labels;

    trendChart.data.datasets[0].data =
      values;

    trendChart.update();

    return;

  }


  trendChart =
    new Chart(
      canvas.getContext("2d"),
      {

        type: "line",

        data: {

          labels: labels,

          datasets: [
            {
              label: "Confidence",

              data: values,

              borderColor: "#59dc8d",

              backgroundColor:
                "rgba(89,220,141,0.10)",

              fill: true,

              tension: 0.35,

              pointRadius: 4,

              pointBackgroundColor:
                "#59dc8d"
            }
          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          scales: {

            x: {

              ticks: {
                color: "#91a99d"
              },

              grid: {
                display: false
              }

            },

            y: {

              min: 0,

              max: 100,

              ticks: {
                color: "#91a99d",
                callback: value => value + "%"
              },

              grid: {
                color: "rgba(100,140,120,0.12)"
              }

            }

          },

          plugins: {

            legend: {
              labels: {
                color: "#a5b9ae"
              }
            }

          }

        }

      }
    );

}


/* =========================================================
   ADD DETECTION ALERT
========================================================= */

function addDetectionAlert(
  pestName,
  confidence,
  historyRecord
) {

  renderAlerts();

}


/* =========================================================
   RENDER ALERTS
========================================================= */

function renderAlerts() {

  const alertsList =
    document.getElementById("alertsList");

  if (!alertsList) {
    return;
  }


  if (detectionHistory.length === 0) {

    alertsList.innerHTML = `

      <div class="empty-alerts">

        <i class="fa-solid fa-bell-slash"></i>

        <p>No alerts yet.</p>

        <span>Detected pests will appear here.</span>

      </div>

    `;

    return;

  }


  alertsList.innerHTML =
    detectionHistory
      .slice(0, 10)
      .map(item => {

        const isHealthy =
          item.name === "Healthy Leaf";


        const emailText =
          isHealthy
            ? "No pest alert required"
            : item.emailSent
              ? "Email alert sent"
              : "Email alert not sent";


        return `

          <div class="alert-item ${isHealthy ? "healthy" : ""}">

            <div class="alert-icon">

              <i class="fa-solid ${
                isHealthy
                  ? "fa-circle-check"
                  : "fa-bug"
              }"></i>

            </div>


            <div class="alert-main">

              <strong>
                ${escapeHTML(item.name)}
              </strong>

              <span>
                Confidence: ${item.confidence}%
                •
                ${emailText}
              </span>

            </div>


            <div class="alert-time">

              ${formatTime(item.timestamp)}

            </div>

          </div>

        `;

      })
      .join("");

}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(date) {

  if (!(date instanceof Date)) {
    return "";
  }


  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

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
    return error.text;
  }


  if (error.message) {
    return error.message;
  }


  try {

    return JSON.stringify(error);

  } catch {

    return "Unknown error";

  }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
