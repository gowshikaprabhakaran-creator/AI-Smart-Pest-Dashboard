/* =========================================================
   AI SMART PEST DETECTION & ALERT SYSTEM
   Team 16
   ========================================================= */

/* =========================
   EMAILJS CONFIGURATION
   ========================= */

const EMAIL_SERVICE_ID = "service_x2d7sjh";
const EMAIL_TEMPLATE_ID = "template_6efhw0d";
const EMAIL_PUBLIC_KEY = "wOORs4b9toARevid-";

/* =========================
   MODEL CONFIGURATION
   ========================= */

const MODEL_URL = "./model/model.json";
const METADATA_URL = "./model/metadata.json";

/* =========================
   GLOBAL VARIABLES
   ========================= */

let model = null;
let maxPredictions = 0;

let cameraStream = null;
let currentFacingMode = "environment";

let detectionHistory = [];
let pestAlerts = 0;
let emailAlerts = 0;

let pestChart = null;
let confidenceChart = null;

let currentLanguage = "en";

/* =========================
   DOM READY
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard loaded.");

    initializeEmailJS();
    setupEmail();
    setupNavigation();
    setupCamera();
    setupUpload();
    setupLanguage();
    setupCharts();
    loadHistory();
    updateDashboard();

    loadModel();
});

/* =========================================================
   EMAILJS
   ========================================================= */

function initializeEmailJS() {
    try {
        if (typeof emailjs !== "undefined") {
            emailjs.init({
                publicKey: EMAIL_PUBLIC_KEY
            });

            console.log("EmailJS initialized successfully.");
        } else {
            console.error("EmailJS library not loaded.");
        }
    } catch (error) {
        console.error("EmailJS initialization error:", error);
    }
}

/* =========================
   DEMO EMAIL SETUP
   ========================= */

function setupEmail() {
    const emailInput = document.getElementById("alertEmail");
    const saveButton = document.getElementById("saveEmail");

    if (!emailInput || !saveButton) {
        console.log("Demo email elements not found.");
        return;
    }

    const savedEmail = localStorage.getItem("demoAlertEmail");

    if (savedEmail) {
        emailInput.value = savedEmail;
        updateEmailStatus(savedEmail);
    }

    saveButton.addEventListener("click", saveEmail);
}

/* =========================
   SAVE EMAIL
   ========================= */

function saveEmail() {
    const emailInput = document.getElementById("alertEmail");

    if (!emailInput) {
        return;
    }

    const email = emailInput.value.trim();

    if (!email) {
        alert("Please enter an email address.");
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        alert("Please enter a valid email address.");
        return;
    }

    localStorage.setItem("demoAlertEmail", email);

    updateEmailStatus(email);

    alert("Demo alert email saved successfully!");
}

/* =========================
   UPDATE EMAIL STATUS
   ========================= */

function updateEmailStatus(email) {
    const status = document.getElementById("emailStatus");

    if (!status) {
        return;
    }

    status.textContent = "Saved email: " + email;
}

/* =========================
   EMAIL MESSAGE
   ========================= */

function showEmailMessage(message) {
    const status = document.getElementById("emailStatus");

    if (status) {
        status.textContent = message;
    }

    console.log(message);
}

/* =========================
   SEND EMAIL ALERT
   ========================= */

async function sendEmailAlert(result) {

    console.log("Preparing pest email alert...");

    const savedEmail = localStorage.getItem("demoAlertEmail");

    /* No email entered */
    if (!savedEmail) {

        showEmailMessage(
            "⚠️ Please save a demo email first."
        );

        alert(
            "Pest detected!\n\n" +
            "Please enter the email address for the demo alert and press Save Email."
        );

        return;
    }

    /* Check EmailJS */
    if (typeof emailjs === "undefined") {

        showEmailMessage(
            "❌ EmailJS library is not loaded."
        );

        return;
    }

    try {

        const templateParams = {

            to_email: savedEmail,

            pest_name: result.name,

            confidence: result.confidence + "%",

            status: "Pest Detected"
        };

        console.log("Email parameters:", templateParams);

        const response = await emailjs.send(
            EMAIL_SERVICE_ID,
            EMAIL_TEMPLATE_ID,
            templateParams
        );

        console.log("EmailJS response:", response);

        if (response && response.status === 200) {

            emailAlerts++;

            updateDashboard();

            showEmailMessage(
                "📧 Email alert sent to " + savedEmail
            );

            console.log(
                "Email alert sent successfully."
            );

        } else {

            showEmailMessage(
                "⚠️ Email was not sent."
            );
        }

    } catch (error) {

        console.error(
            "EmailJS error:",
            error
        );

        const errorMessage =
            error?.text ||
            error?.message ||
            "Unknown EmailJS error";

        showEmailMessage(
            "❌ Email error: " + errorMessage
        );

        alert(
            "Email could not be sent.\n\n" +
            "EmailJS says:\n" +
            errorMessage
        );
    }
}

/* =========================================================
   LOAD AI MODEL
   ========================================================= */

async function loadModel() {

    try {

        console.log("Loading AI model...");

        if (
            typeof tmImage === "undefined"
        ) {

            console.error(
                "Teachable Machine library not loaded."
            );

            return;
        }

        model = await tmImage.load(
            MODEL_URL + "?v=20260927",
            METADATA_URL + "?v=20260927"
        );

        maxPredictions =
            model.getTotalClasses();

        console.log(
            "AI model loaded successfully."
        );

        console.log(
            "Number of classes:",
            maxPredictions
        );

    } catch (error) {

        console.error(
            "Model loading error:",
            error
        );

        alert(
            "AI model could not be loaded.\n\n" +
            "Please check the model folder."
        );
    }
}

/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

function setupUpload() {

    const uploadInput =
        document.getElementById("imageUpload");

    if (!uploadInput) {
        return;
    }

    uploadInput.addEventListener(
        "change",
        async function(event) {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }

            const image =
                document.createElement("img");

            image.onload = async function() {

                displayImage(image);

                await predictImage(image);
            };

            image.src =
                URL.createObjectURL(file);
        }
    );
}

/* =========================
   DISPLAY UPLOADED IMAGE
   ========================= */

function displayImage(image) {

    const preview =
        document.getElementById("imagePreview");

    if (!preview) {
        return;
    }

    preview.src = image.src;

    preview.style.display = "block";
}

/* =========================================================
   AI PREDICTION
   ========================================================= */

async function predictImage(image) {

    if (!model) {

        alert(
            "AI model is still loading. Please try again."
        );

        return;
    }

    try {

        console.log(
            "Running AI prediction..."
        );

        const predictions =
            await model.predict(image);

        let highestPrediction =
            predictions[0];

        for (
            let i = 1;
            i < predictions.length;
            i++
        ) {

            if (
                predictions[i].probability >
                highestPrediction.probability
            ) {

                highestPrediction =
                    predictions[i];
            }
        }

        const result = {

            name:
                highestPrediction.className,

            confidence:
                (
                    highestPrediction.probability *
                    100
                ).toFixed(1)
        };

        console.log(
            "Prediction result:",
            result
        );

        displayPrediction(
            result,
            predictions
        );

        saveDetection(result);

        if (
            !isHealthyLeaf(result.name)
        ) {

            pestAlerts++;

            updateDashboard();

            await sendEmailAlert(result);

        } else {

            showEmailMessage(
                "🌿 Healthy leaf detected."
            );
        }

    } catch (error) {

        console.error(
            "Prediction error:",
            error
        );

        alert(
            "AI detection failed."
        );
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
        document.getElementById("captureDetect");

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

/* =========================
   START CAMERA
   ========================= */

async function startCamera() {

    try {

        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(track =>
                    track.stop()
                );
        }

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode:
                        currentFacingMode
                },
                audio: false
            });

        const video =
            document.getElementById("camera");

        if (!video) {
            return;
        }

        video.srcObject =
            cameraStream;

        await video.play();

        console.log(
            "Camera started."
        );

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        alert(
            "Camera could not be started.\n\n" +
            "Please allow camera permission."
        );
    }
}

/* =========================
   SWITCH CAMERA
   ========================= */

async function switchCamera() {

    currentFacingMode =
        currentFacingMode === "environment"
            ? "user"
            : "environment";

    await startCamera();
}

/* =========================
   CAPTURE CAMERA IMAGE
   ========================= */

async function captureAndDetect() {

    const video =
        document.getElementById("camera");

    if (!video || !cameraStream) {

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

    const image =
        document.createElement("img");

    image.src =
        canvas.toDataURL("image/jpeg");

    image.onload = async function() {

        await predictImage(image);
    };
}

/* =========================================================
   DISPLAY PREDICTION
   ========================================================= */

function displayPrediction(
    result,
    predictions
) {

    const resultName =
        document.getElementById("resultName");

    const resultConfidence =
        document.getElementById("resultConfidence");

    const resultStatus =
        document.getElementById("resultStatus");

    if (resultName) {

        resultName.textContent =
            result.name;
    }

    if (resultConfidence) {

        resultConfidence.textContent =
            result.confidence + "%";
    }

    if (resultStatus) {

        if (isHealthyLeaf(result.name)) {

            resultStatus.textContent =
                "🌿 Healthy Leaf";

        } else {

            resultStatus.textContent =
                "⚠️ Pest Detected";
        }
    }

    /* Prediction bars */

    predictions.forEach(
        prediction => {

            const percentage =
                (
                    prediction.probability *
                    100
                ).toFixed(1);

            const className =
                prediction.className
                    .replace(/\s+/g, "")
                    .toLowerCase();

            const bar =
                document.getElementById(
                    "bar-" + className
                );

            if (bar) {

                bar.style.width =
                    percentage + "%";
            }

            const value =
                document.getElementById(
                    "value-" + className
                );

            if (value) {

                value.textContent =
                    percentage + "%";
            }
        }
    );
}

/* =========================================================
   HEALTH CHECK
   ========================================================= */

function isHealthyLeaf(name) {

    return name
        .toLowerCase()
        .includes("healthy");
}

/* =========================================================
   DETECTION HISTORY
   ========================================================= */

function saveDetection(result) {

    const detection = {

        name: result.name,

        confidence:
            result.confidence,

        time:
            new Date().toLocaleString()
    };

    detectionHistory.unshift(
        detection
    );

    if (
        detectionHistory.length > 20
    ) {

        detectionHistory.pop();
    }

    localStorage.setItem(
        "detectionHistory",
        JSON.stringify(
            detectionHistory
        )
    );

    updateHistoryDisplay();

    updateCharts();
}

/* =========================
   LOAD HISTORY
   ========================= */

function loadHistory() {

    const saved =
        localStorage.getItem(
            "detectionHistory"
        );

    if (saved) {

        try {

            detectionHistory =
                JSON.parse(saved);

        } catch (error) {

            detectionHistory = [];
        }
    }

    updateHistoryDisplay();
}

/* =========================
   HISTORY DISPLAY
   ========================= */

function updateHistoryDisplay() {

    const historyContainer =
        document.getElementById(
            "historyList"
        );

    if (!historyContainer) {
        return;
    }

    historyContainer.innerHTML = "";

    if (
        detectionHistory.length === 0
    ) {

        historyContainer.innerHTML =
            "<p>No detections yet.</p>";

        return;
    }

    detectionHistory.forEach(
        detection => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "history-item";

            item.innerHTML = `
                <strong>${escapeHTML(detection.name)}</strong>
                <span>${escapeHTML(detection.confidence)}%</span>
                <small>${escapeHTML(detection.time)}</small>
            `;

            historyContainer.appendChild(
                item
            );
        }
    );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const totalDetections =
        document.getElementById(
            "totalDetections"
        );

    const pestCount =
        document.getElementById(
            "pestAlerts"
        );

    const emailCount =
        document.getElementById(
            "emailAlerts"
        );

    if (totalDetections) {

        totalDetections.textContent =
            detectionHistory.length;
    }

    if (pestCount) {

        pestCount.textContent =
            pestAlerts;
    }

    if (emailCount) {

        emailCount.textContent =
            emailAlerts;
    }

    updateCharts();
}

/* =========================================================
   CHARTS
   ========================================================= */

function setupCharts() {

    updateCharts();
}

/* =========================
   UPDATE CHARTS
   ========================= */

function updateCharts() {

    if (
        typeof Chart === "undefined"
    ) {

        return;
    }

    const pestCanvas =
        document.getElementById(
            "pestChart"
        );

    if (!pestCanvas) {
        return;
    }

    const counts = {

        Aphid: 0,

        Caterpillar: 0,

        Whitefly: 0,

        Thrips: 0,

        "Healthy leaf": 0
    };

    detectionHistory.forEach(
        detection => {

            if (
                counts[
                    detection.name
                ] !== undefined
            ) {

                counts[
                    detection.name
                ]++;
            }
        }
    );

    if (pestChart) {

        pestChart.destroy();
    }

    pestChart =
        new Chart(
            pestCanvas,
            {
                type: "bar",

                data: {

                    labels:
                        Object.keys(counts),

                    datasets: [
                        {
                            label:
                                "Detections",

                            data:
                                Object.values(counts)
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false
                }
            }
        );
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const navLinks =
        document.querySelectorAll(
            "[data-section]"
        );

    navLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const sectionId =
                        link.getAttribute(
                            "data-section"
                        );

                    showSection(
                        sectionId
                    );
                }
            );
        }
    );
}

/* =========================
   SHOW SECTION
   ========================= */

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(
            ".section"
        );

    sections.forEach(
        section => {

            section.style.display =
                "none";
        }
    );

    const target =
        document.getElementById(
            sectionId
        );

    if (target) {

        target.style.display =
            "block";
    }

    const links =
        document.querySelectorAll(
            "[data-section]"
        );

    links.forEach(
        link => {

            link.classList.remove(
                "active"
            );

            if (
                link.getAttribute(
                    "data-section"
                ) === sectionId
            ) {

                link.classList.add(
                    "active"
                );
            }
        }
    );
}

/* =========================================================
   LANGUAGE
   ========================================================= */

function setupLanguage() {

    const languageSelect =
        document.getElementById(
            "languageSelect"
        );

    if (!languageSelect) {
        return;
    }

    languageSelect.value =
        currentLanguage;

    languageSelect.addEventListener(
        "change",
        event => {

            currentLanguage =
                event.target.value;

            updateLanguage();
        }
    );
}

/* =========================
   LANGUAGE UPDATE
   ========================= */

function updateLanguage() {

    console.log(
        "Language changed to:",
        currentLanguage
    );

    /*
       Keep your existing English/Tamil
       text-switching logic here if your
       HTML already uses language attributes.
    */
}

/* =========================================================
   SENSOR DISPLAY
   ========================================================= */

function updateSensorValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (element) {

        element.textContent =
            value;
    }
}

/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   PAGE EXIT - STOP CAMERA
   ========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(track =>
                    track.stop()
                );
        }
    }
);
