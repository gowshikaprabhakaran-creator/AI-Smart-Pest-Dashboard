/* =========================================================
   AI SMART PEST DETECTION
   TEAM 16
   ========================================================= */


/* ================= CONFIGURATION ================= */

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

let detectionHistory =
  JSON.parse(localStorage.getItem("detectionHistory") || "[]");

let savedEmail =
  localStorage.getItem("alertEmail") || "";

let pestChart = null;
let trendChart = null;

let emailJSReady = false;


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  setupNavigation();
  setupLanguage();

  setupCamera();
  setupUpload();

  setupEmail();

  loadSavedEmail();
  initializeEmailJS();

  loadModel();

  renderDashboard();
  renderHistory();
  renderAlerts();
  renderCharts();

});


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

  const buttons = document.querySelectorAll("[data-target]");

  buttons.forEach(button => {

    button.addEventListener("click", () => {

      const targetId = button.dataset.target;

      const target = document.getElementById(targetId);

      if (!target) return;

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    });

  });


  const sections = document.querySelectorAll(".page-section");

  const observer = new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        const id = entry.target.id;

        document.querySelectorAll(".nav-item").forEach(item => {

          item.classList.toggle(
            "active",
            item.dataset.target === id
          );

        });

      });

    },
    {
      threshold: 0.2
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

  const selector =
    document.getElementById("languageSelector");

  if (!selector) return;

  selector.addEventListener("change", () => {

    const language = selector.value;

    if (language === "ta") {

      alert(
        "தமிழ் மொழி விருப்பம் தேர்வு செய்யப்பட்டுள்ளது. Dashboard labels இப்போது English-ல் உள்ளன."
      );

    }

  });

}


/* =========================================================
   EMAILJS
   ========================================================= */

async function initializeEmailJS() {

  try {

    if (typeof window.emailjs === "undefined") {

      await loadEmailJSScript();

    }

    if (
      typeof window.emailjs !== "undefined" &&
      typeof window.emailjs.init === "function"
    ) {

      window.emailjs.init({
        publicKey: EMAIL_PUBLIC_KEY
      });

      emailJSReady = true;

      setEmailSystemStatus(
        "Email system ready"
      );

    }

  } catch (error) {

    console.error("EmailJS initialization error:", error);

    emailJSReady = false;

    setEmailSystemStatus(
      "Email system unavailable"
    );

  }

}


function loadEmailJSScript() {

  return new Promise((resolve, reject) => {

    if (typeof window.emailjs !== "undefined") {
      resolve();
      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";

    script.onload = () => resolve();

    script.onerror = () =>
      reject(
        new Error("EmailJS library could not be loaded.")
      );

    document.head.appendChild(script);

  });

}


function setEmailSystemStatus(message) {

  const element =
    document.getElementById("quickEmailStatus");

  if (element) {
    element.textContent = message;
  }

}


/* =========================================================
   MODEL LOADING
   ========================================================= */

async function loadModel() {

  const status =
    document.getElementById("modelStatus");

  const quickStatus =
    document.getElementById("quickModelStatus");

  try {

    if (status) {
      status.textContent = "Loading AI Model...";
    }

    if (quickStatus) {
      quickStatus.textContent = "Loading...";
    }


    const modelURL =
      MODEL_URL + "?v=20260927";

    const metadataURL =
      METADATA_URL + "?v=20260927";


    model =
      await tmImage.load(
        modelURL,
        metadataURL
      );


    maxPredictions =
      model.getTotalClasses();


    if (status) {

      status.textContent =
        "AI Model Ready";

    }

    if (quickStatus) {

      quickStatus.textContent =
        "Ready • 5 classes";

    }

    console.log(
      "AI Model loaded successfully."
    );


  } catch (error) {

    console.error(
      "Model loading failed:",
      error
    );

    if (status) {

      status.textContent =
        "AI Model Error";

    }

    if (quickStatus) {

      quickStatus.textContent =
        "Model failed to load";

    }

  }

}


/* =========================================================
   CAMERA
   ========================================================= */

function setupCamera() {

  const startButton =
    document.getElementById("startCamera");

  const switchButton =
    document.getElementById("switchCamera");

  const captureButton =
    document.getElementById("captureImage");


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

  const video =
    document.getElementById("camera");

  const placeholder =
    document.getElementById("cameraPlaceholder");


  try {

    stopCamera();


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

  } catch (error) {

    console.error(
      "Camera error:",
      error
    );

    alert(
      "Camera access could not be started. Please allow camera permission."
    );

  }

}


function stopCamera() {

  if (!cameraStream) return;

  cameraStream
    .getTracks()
    .forEach(track => track.stop());

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

  const video =
    document.getElementById("camera");

  if (
    !video ||
    video.style.display === "none" ||
    !video.srcObject
  ) {

    alert(
      "Please start the camera first."
    );

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


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

function setupUpload() {

  const input =
    document.getElementById("imageInput");

  if (!input) return;


  input.addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];

      if (!file) return;


      const reader =
        new FileReader();


      reader.onload =
        event => {

          const image =
            document.getElementById(
              "previewImage"
            );

          const text =
            document.getElementById(
              "previewText"
            );


          image.src =
            event.target.result;

          image.style.display =
            "block";


          if (text) {

            text.style.display =
              "none";

          }


          image.onload =
            async () => {

              await predictImage(image);

            };

        };


      reader.readAsDataURL(file);

    }
  );

}


/* =========================================================
   AI PREDICTION
   ========================================================= */

async function predictImage(imageElement) {

  if (!model) {

    alert(
      "AI model is still loading. Please wait a moment."
    );

    return;

  }


  try {

    const predictions =
      await model.predict(
        imageElement
      );


    predictions.sort(
      (a, b) =>
        b.probability -
        a.probability
    );


    const topPrediction =
      predictions[0];


    const name =
      topPrediction.className;

    const confidence =
      Math.round(
        topPrediction.probability * 100
      );


    displayResult(
      name,
      confidence,
      predictions
    );


    saveDetection(
      name,
      confidence
    );


  } catch (error) {

    console.error(
      "Prediction error:",
      error
    );

    alert(
      "Prediction failed. Please try another image."
    );

  }

}


/* =========================================================
   DISPLAY RESULT
   ========================================================= */

function displayResult(
  name,
  confidence,
  predictions
) {

  const pestName =
    document.getElementById(
      "pestName"
    );

  const confidenceElement =
    document.getElementById(
      "confidence"
    );

  const status =
    document.getElementById(
      "detectionStatus"
    );

  const fill =
    document.getElementById(
      "confidenceFill"
    );


  pestName.textContent =
    name;

  confidenceElement.textContent =
    confidence + "%";

  fill.style.width =
    confidence + "%";


  const healthy =
    name.toLowerCase()
      .includes("healthy");


  if (healthy) {

    status.textContent =
      "Healthy Leaf Detected";

    status.className =
      "result-status safe";

  } else {

    status.textContent =
      "Pest Detected";

    status.className =
      "result-status danger";

  }


  renderPredictionScores(
    predictions
  );

}


/* =========================================================
   PREDICTION SCORES
   ========================================================= */

function renderPredictionScores(
  predictions
) {

  const container =
    document.getElementById(
      "predictionList"
    );


  if (!container) return;


  container.innerHTML = "";


  predictions.forEach(
    prediction => {

      const percentage =
        Math.round(
          prediction.probability * 100
        );


      const row =
        document.createElement("div");

      row.className =
        "prediction-row";


      row.innerHTML = `
        <span>${escapeHTML(
          prediction.className
        )}</span>

        <div class="prediction-bar">
          <div style="width:${percentage}%"></div>
        </div>

        <strong>${percentage}%</strong>
      `;


      container.appendChild(row);

    }
  );

}


/* =========================================================
   SAVE DETECTION
   ========================================================= */

function saveDetection(
  name,
  confidence
) {

  const isPest =
    !name.toLowerCase()
      .includes("healthy");


  const record = {

    id: Date.now(),

    time:
      new Date().toLocaleString(),

    name,

    confidence,

    isPest,

    emailSent: false

  };


  detectionHistory.unshift(
    record
  );


  if (
    detectionHistory.length > 100
  ) {

    detectionHistory =
      detectionHistory.slice(0, 100);

  }


  saveHistory();


  renderDashboard();
  renderHistory();
  renderAlerts();
  renderCharts();


  if (isPest) {

    createAlert(
      record
    );


    sendEmailAlert(
      record
    );

  }

}


/* =========================================================
   EMAIL SETUP
   ========================================================= */

function setupEmail() {

  const button =
    document.getElementById(
      "saveEmail"
    );


  if (!button) return;


  button.addEventListener(
    "click",
    () => {

      const input =
        document.getElementById(
          "alertEmail"
        );

      const email =
        input.value.trim();


      if (!email) {

        showEmailStatus(
          "Please enter an email address.",
          true
        );

        return;

      }


      if (!isValidEmail(email)) {

        showEmailStatus(
          "Please enter a valid email address.",
          true
        );

        return;

      }


      savedEmail =
        email;


      localStorage.setItem(
        "alertEmail",
        savedEmail
      );


      showEmailStatus(
        "Email address saved successfully.",
        false
      );

    }
  );

}


function loadSavedEmail() {

  const input =
    document.getElementById(
      "alertEmail"
    );


  if (
    input &&
    savedEmail
  ) {

    input.value =
      savedEmail;

    showEmailStatus(
      "Saved email loaded.",
      false
    );

  }

}


function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);

}


function showEmailStatus(
  message,
  error
) {

  const element =
    document.getElementById(
      "emailStatus"
    );


  if (!element) return;


  element.textContent =
    message;

  element.style.color =
    error
      ? "#d34c42"
      : "#2d9653";

}


/* =========================================================
   SEND EMAIL
   ========================================================= */

async function sendEmailAlert(
  record
) {

  if (!savedEmail) {

    console.log(
      "No saved email. Email not sent."
    );

    return;

  }


  try {

    if (!emailJSReady) {

      await initializeEmailJS();

    }


    if (
      !emailJSReady ||
      typeof window.emailjs === "undefined"
    ) {

      throw new Error(
        "EmailJS is not available."
      );

    }


    showEmailStatus(
      "Sending pest alert...",
      false
    );


    const response =
      await window.emailjs.send(

        EMAIL_SERVICE_ID,

        EMAIL_TEMPLATE_ID,

        {

          to_email:
            savedEmail,

          pest_name:
            record.name,

          confidence:
            record.confidence + "%",

          status:
            "Pest Detected"

        }

      );


    console.log(
      "EmailJS response:",
      response
    );


    if (
      response &&
      response.status === 200
    ) {

      /*
       IMPORTANT:
       Email Alerts count increases
       ONLY after successful email send.
      */

      record.emailSent =
        true;


      saveHistory();


      showEmailStatus(
        "Pest alert email sent successfully.",
        false
      );


      renderDashboard();
      renderHistory();
      renderAlerts();

    }


  } catch (error) {

    console.error(
      "Email sending failed:",
      error
    );


    record.emailSent =
      false;


    saveHistory();


    showEmailStatus(
      "Email could not be sent. Check EmailJS settings.",
      true
    );


    renderDashboard();
    renderHistory();

  }

}


/* =========================================================
   ALERTS
   ========================================================= */

function createAlert(
  record
) {

  renderAlerts();

}


function renderAlerts() {

  const container =
    document.getElementById(
      "alertContainer"
    );


  if (!container) return;


  const pestRecords =
    detectionHistory.filter(
      item => item.isPest
    );


  if (pestRecords.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <span>🔔</span>
        <h3>No alerts yet</h3>
        <p>
          Pest detection alerts will appear here.
        </p>
      </div>
    `;

    return;

  }


  container.innerHTML =
    pestRecords
      .slice(0, 20)
      .map(
        record => `

          <div class="alert-item">

            <div>

              <h3>
                ⚠️ ${escapeHTML(record.name)}
                detected
              </h3>

              <p>
                Confidence:
                ${record.confidence}%
                • Email:
                ${
                  record.emailSent
                    ? "Sent successfully"
                    : "Not sent"
                }
              </p>

            </div>

            <span class="alert-time">
              ${escapeHTML(record.time)}
            </span>

          </div>

        `
      )
      .join("");

}


/* =========================================================
   DASHBOARD COUNTS
   ========================================================= */

function renderDashboard() {

  const total =
    detectionHistory.length;


  const threats =
    detectionHistory.filter(
      record => record.isPest
    ).length;


  const emails =
    detectionHistory.filter(
      record => record.emailSent
    ).length;


  const totalElement =
    document.getElementById(
      "totalDetections"
    );

  const threatElement =
    document.getElementById(
      "activeThreats"
    );

  const emailElement =
    document.getElementById(
      "emailAlerts"
    );


  if (totalElement) {

    totalElement.textContent =
      total;

  }


  if (threatElement) {

    threatElement.textContent =
      threats;

  }


  if (emailElement) {

    emailElement.textContent =
      emails;

  }

}


/* =========================================================
   HISTORY
   ========================================================= */

function renderHistory() {

  const body =
    document.getElementById(
      "historyBody"
    );


  if (!body) return;


  if (detectionHistory.length === 0) {

    body.innerHTML = `
      <tr>
        <td colspan="5" class="empty-table">
          No detection history yet.
        </td>
      </tr>
    `;

    return;

  }


  body.innerHTML =
    detectionHistory
      .slice(0, 50)
      .map(
        record => {

          const healthy =
            !record.isPest;


          return `
            <tr>

              <td>
                ${escapeHTML(record.time)}
              </td>

              <td>
                <strong>
                  ${escapeHTML(record.name)}
                </strong>
              </td>

              <td>
                ${record.confidence}%
              </td>

              <td>

                <span class="status-pill ${
                  healthy
                    ? "healthy"
                    : "pest"
                }">

                  ${
                    healthy
                      ? "Healthy"
                      : "Pest"
                  }

                </span>

              </td>

              <td>

                <span class="${
                  record.emailSent
                    ? "email-sent"
                    : "email-not-sent"
                }">

                  ${
                    record.emailSent
                      ? "✓ Sent"
                      : "— Not sent"
                  }

                </span>

              </td>

            </tr>
          `;

        }
      )
      .join("");

}


/* =========================================================
   SAVE HISTORY
   ========================================================= */

function saveHistory() {

  localStorage.setItem(
    "detectionHistory",
    JSON.stringify(
      detectionHistory
    )
  );

}


/* =========================================================
   CHARTS
   ========================================================= */

function renderCharts() {

  renderPestChart();
  renderTrendChart();

}


function renderPestChart() {

  const canvas =
    document.getElementById(
      "pestChart"
    );


  if (!canvas) return;


  const classes = [
    "Aphid",
    "Caterpillar",
    "Whitefly",
    "Thrips",
    "Healthy Leaf"
  ];


  const counts =
    classes.map(
      className =>
        detectionHistory.filter(
          record =>
            record.name.toLowerCase() ===
            className.toLowerCase()
        ).length
    );


  if (pestChart) {

    pestChart.destroy();

  }


  pestChart =
    new Chart(
      canvas,
      {

        type: "doughnut",

        data: {

          labels: classes,

          datasets: [
            {
              data: counts,

              backgroundColor: [
                "#ef6a61",
                "#e6a94b",
                "#6cbf75",
                "#6b9fe8",
                "#8d9a92"
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
              position: "bottom"
            }

          }

        }

      }
    );

}


function renderTrendChart() {

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
      (_, index) =>
        "Detection " + (index + 1)
    );


  const data =
    recent.map(
      record =>
        record.confidence
    );


  if (trendChart) {

    trendChart.destroy();

  }


  trendChart =
    new Chart(
      canvas,
      {

        type: "line",

        data: {

          labels,

          datasets: [

            {

              label:
                "Confidence %",

              data,

              tension: 0.35,

              fill: false,

              borderWidth: 3,

              pointRadius: 4

            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          scales: {

            y: {

              min: 0,

              max: 100

            }

          }

        }

      }

    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
