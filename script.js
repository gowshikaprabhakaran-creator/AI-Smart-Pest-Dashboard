/* =========================================================
   AI SMART PEST DETECTION & ALERT SYSTEM
   TEAM 16
   ========================================================= */


/* ================= EMAILJS ================= */

const EMAIL_SERVICE_ID = "service_x2d7sjh";
const EMAIL_TEMPLATE_ID = "template_6efhw0d";
const EMAIL_PUBLIC_KEY = "wOORs4b9toARevid-";


/* ================= AI MODEL ================= */

const MODEL_URL = "./model/model.json";
const METADATA_URL = "./model/metadata.json";


/* ================= GLOBAL VARIABLES ================= */

let model = null;
let maxPredictions = 0;

let cameraStream = null;
let currentFacingMode = "environment";

let detectionHistory = [];

let pestAlerts = 0;
let emailAlerts = 0;

let pestChart = null;
let trendChart = null;


/* ================= PAGE LOAD ================= */

document.addEventListener("DOMContentLoaded", async () => {

    console.log("Smart Pest Dashboard loaded.");

    initializeEmailJS();

    setupNavigation();

    setupCamera();

    setupUpload();

    setupEmail();

    setupLanguage();

    loadHistory();

    updateDashboard();

    loadModel();

});


/* =========================================================
   EMAILJS INITIALIZATION
   ========================================================= */

function initializeEmailJS() {

    try {

        if (typeof emailjs === "undefined") {

            console.error("EmailJS library not loaded.");

            return;
        }

        emailjs.init({
            publicKey: EMAIL_PUBLIC_KEY
        });

        console.log("EmailJS initialized.");

    } catch (error) {

        console.error(
            "EmailJS initialization error:",
            error
        );

    }

}


/* =========================================================
   EMAIL SETUP
   ========================================================= */

function setupEmail() {

    const emailInput =
        document.getElementById("alertEmail");

    const saveButton =
        document.getElementById("saveEmail");

    if (!emailInput || !saveButton) {
        return;
    }

    const savedEmail =
        localStorage.getItem("demoAlertEmail");

    if (savedEmail) {

        emailInput.value = savedEmail;

        updateEmailStatus(
            "Saved email: " + savedEmail
        );

    }

    saveButton.addEventListener(
        "click",
        saveEmail
    );

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

        updateEmailStatus(
            "⚠️ Please enter an email address."
        );

        return;
    }

    if (
        !email.includes("@") ||
        !email.includes(".")
    ) {

        updateEmailStatus(
            "⚠️ Please enter a valid email address."
        );

        return;
    }

    localStorage.setItem(
        "demoAlertEmail",
        email
    );

    updateEmailStatus(
        "✅ Email saved: " + email
    );

}


/* =========================================================
   EMAIL STATUS
   ========================================================= */

function updateEmailStatus(message) {

    const status =
        document.getElementById("emailStatus");

    if (status) {
        status.textContent = message;
    }

}


/* =========================================================
   SEND EMAIL ALERT
   ========================================================= */

async function sendEmailAlert(result) {

    const savedEmail =
        localStorage.getItem("demoAlertEmail");

    if (!savedEmail) {

        updateEmailStatus(
            "⚠️ Save an email address first."
        );

        return;
    }

    if (typeof emailjs === "undefined") {

        updateEmailStatus(
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

        console.log(
            "Sending EmailJS alert:",
            templateParams
        );

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

        if (response.status === 200) {

            emailAlerts++;

            updateDashboard();

            updateEmailStatus(
                "📧 Alert sent to " + savedEmail
            );

        }

    } catch (error) {

        console.error(
            "EmailJS error:",
            error
        );

        const message =
            error?.text ||
            error?.message ||
            "Unknown EmailJS error";

        updateEmailStatus(
            "❌ Email error: " + message
        );

    }

}


/* =========================================================
   LOAD MODEL
   ========================================================= */

async function loadModel() {

    const status =
        document.getElementById("modelStatus");

    try {

        if (typeof tmImage === "undefined") {

            if (status) {
                status.textContent =
                    "❌ AI library not loaded";
            }

            return;
        }

        model =
            await tmImage.load(
                MODEL_URL + "?v=20260927",
                METADATA_URL + "?v=20260927"
            );

        maxPredictions =
            model.getTotalClasses();

        console.log(
            "AI model loaded.",
            maxPredictions,
            "classes"
        );

        if (status) {

            status.textContent =
                "✅ AI Model Ready";

        }

    } catch (error) {

        console.error(
            "Model loading error:",
            error
        );

        if (status) {

            status.textContent =
                "❌ Model Loading Failed";

        }

    }

}


/* =========================================================
   UPLOAD IMAGE
   ========================================================= */

function setupUpload() {

    const input =
        document.getElementById("imageInput");

    if (!input) {
        return;
    }

    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }

            const preview =
                document.getElementById(
                    "previewImage"
                );

            if (!preview) {
                return;
            }

            const imageURL =
                URL.createObjectURL(file);

            preview.src =
                imageURL;

            preview.onload =
                async () => {

                    await predictImage(
                        preview
                    );

                };

        }
    );

}


/* =========================================================
   PREDICT IMAGE
   ========================================================= */

async function predictImage(image) {

    if (!model) {

        alert(
            "AI model is still loading. Please wait."
        );

        return;
    }

    try {

        const predictions =
            await model.predict(image);

        let bestPrediction =
            predictions[0];

        predictions.forEach(
            prediction => {

                if (
                    prediction.probability >
                    bestPrediction.probability
                ) {

                    bestPrediction =
                        prediction;

                }

            }
        );

        const result = {

            name:
                bestPrediction.className,

            confidence:
                (
                    bestPrediction.probability *
                    100
                ).toFixed(1)

        };

        displayPrediction(
            result,
            predictions
        );

        saveDetection(result);

        if (
            !isHealthyLeaf(result.name)
        ) {

            pestAlerts++;

            createPestAlert(result);

            updateDashboard();

            await sendEmailAlert(result);

        }

    } catch (error) {

        console.error(
            "Prediction error:",
            error
        );

    }

}


/* =========================================================
   DISPLAY RESULT
   ========================================================= */

function displayPrediction(
    result,
    predictions
) {

    const pestName =
        document.getElementById("pestName");

    const confidence =
        document.getElementById("confidence");

    const status =
        document.getElementById("detectionStatus");


    if (pestName) {

        pestName.textContent =
            result.name;

    }


    if (confidence) {

        confidence.textContent =
            result.confidence + "%";

    }


    if (status) {

        if (
            isHealthyLeaf(result.name)
        ) {

            status.textContent =
                "🌿 Healthy Leaf";

        } else {

            status.textContent =
                "⚠️ Pest Detected";

        }

    }


    console.log(
        "All AI prediction scores:",
        predictions
    );

}


/* =========================================================
   HEALTHY LEAF CHECK
   ========================================================= */

function isHealthyLeaf(name) {

    return name
        .toLowerCase()
        .includes("healthy");

}


/* =========================================================
   CAMERA
   ========================================================= */

function setupCamera() {

    const startButton =
        document.getElementById(
            "startCamera"
        );

    const switchButton =
        document.getElementById(
            "switchCamera"
        );

    const captureButton =
        document.getElementById(
            "captureImage"
        );


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


/* =========================================================
   START CAMERA
   ========================================================= */

async function startCamera() {

    try {

        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(
                    track =>
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


    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        alert(
            "Camera permission is required."
        );

    }

}


/* =========================================================
   SWITCH CAMERA
   ========================================================= */

async function switchCamera() {

    currentFacingMode =
        currentFacingMode ===
        "environment"
            ? "user"
            : "environment";

    await startCamera();

}


/* =========================================================
   CAPTURE CAMERA IMAGE
   ========================================================= */

async function captureAndDetect() {

    const video =
        document.getElementById("camera");

    if (
        !video ||
        !cameraStream
    ) {

        alert(
            "Start the camera first."
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


    image.onload =
        async () => {

            const preview =
                document.getElementById(
                    "previewImage"
                );

            if (preview) {

                preview.src =
                    image.src;

            }

            await predictImage(image);

        };

}


/* =========================================================
   SAVE DETECTION HISTORY
   ========================================================= */

function saveDetection(result) {

    const now =
        new Date();


    const detection = {

        name:
            result.name,

        confidence:
            result.confidence,

        date:
            now.toLocaleDateString(),

        time:
            now.toLocaleTimeString(),

        timestamp:
            now.getTime()

    };


    detectionHistory.unshift(
        detection
    );


    if (
        detectionHistory.length > 50
    ) {

        detectionHistory =
            detectionHistory.slice(0, 50);

    }


    localStorage.setItem(
        "detectionHistory",
        JSON.stringify(
            detectionHistory
        )
    );


    updateHistoryDisplay();

    updateDashboard();

}


/* =========================================================
   LOAD HISTORY
   ========================================================= */

function loadHistory() {

    const saved =
        localStorage.getItem(
            "detectionHistory"
        );


    if (saved) {

        try {

            detectionHistory =
                JSON.parse(saved);

        } catch {

            detectionHistory = [];

        }

    }


    updateHistoryDisplay();

}


/* =========================================================
   HISTORY DISPLAY
   ========================================================= */

function updateHistoryDisplay() {

    const body =
        document.getElementById(
            "historyBody"
        );


    if (!body) {
        return;
    }


    body.innerHTML = "";


    if (
        detectionHistory.length === 0
    ) {

        body.innerHTML = `
            <tr>
                <td colspan="4">
                    No detections yet.
                </td>
            </tr>
        `;

        return;
    }


    detectionHistory.forEach(
        item => {

            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>${item.date}</td>
                <td>${item.time}</td>
                <td>${item.name}</td>
                <td>${item.confidence}%</td>
            `;


            body.appendChild(row);

        }
    );

}


/* =========================================================
   DASHBOARD COUNTERS
   ========================================================= */

function updateDashboard() {

    const total =
        document.getElementById(
            "totalDetections"
        );

    const threats =
        document.getElementById(
            "activeThreats"
        );

    const emails =
        document.getElementById(
            "emailAlerts"
        );


    if (total) {

        total.textContent =
            detectionHistory.length;

    }


    if (threats) {

        threats.textContent =
            pestAlerts;

    }


    if (emails) {

        emails.textContent =
            emailAlerts;

    }


    updateCharts();

}


/* =========================================================
   PEST ALERT
   ========================================================= */

function createPestAlert(result) {

    const container =
        document.getElementById(
            "alertContainer"
        );


    if (!container) {
        return;
    }


    const empty =
        container.querySelector(
            ".empty-state"
        );


    if (empty) {
        empty.remove();
    }


    const alertBox =
        document.createElement("div");


    alertBox.className =
        "alert-item";


    alertBox.innerHTML = `
        <strong>⚠️ Pest Detected</strong>
        <p>${result.name}</p>
        <span>Confidence: ${result.confidence}%</span>
        <small>${new Date().toLocaleString()}</small>
    `;


    container.prepend(
        alertBox
    );

}


/* =========================================================
   CHARTS
   ========================================================= */

function updateCharts() {

    if (
        typeof Chart === "undefined"
    ) {
        return;
    }


    updatePestChart();

    updateTrendChart();

}


/* =========================================================
   PEST CHART
   ========================================================= */

function updatePestChart() {

    const canvas =
        document.getElementById(
            "pestChart"
        );


    if (!canvas) {
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
        item => {

            if (
                counts[item.name] !== undefined
            ) {

                counts[item.name]++;

            }

        }
    );


    if (pestChart) {
        pestChart.destroy();
    }


    pestChart =
        new Chart(
            canvas,
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

                    maintainAspectRatio: false

                }

            }
        );

}


/* =========================================================
   TREND CHART
   ========================================================= */

function updateTrendChart() {

    const canvas =
        document.getElementById(
            "trendChart"
        );


    if (!canvas) {
        return;
    }


    const data =
        detectionHistory
            .slice()
            .reverse();


    if (trendChart) {
        trendChart.destroy();
    }


    trendChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels:
                        data.map(
                            item =>
                                item.time
                        ),

                    datasets: [

                        {

                            label:
                                "Confidence %",

                            data:
                                data.map(
                                    item =>
                                        Number(
                                            item.confidence
                                        )
                                ),

                            tension: 0.3

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false

                }

            }
        );

}


/* =========================================================
   IMPORTANT:
   ONE PAGE NAVIGATION
   ========================================================= */

function setupNavigation() {

    const navLinks =
        document.querySelectorAll(
            ".nav-link"
        );


    navLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    const targetId =
                        link.getAttribute(
                            "data-target"
                        );


                    const target =
                        document.getElementById(
                            targetId
                        );


                    if (target) {

                        target.scrollIntoView({

                            behavior:
                                "smooth",

                            block:
                                "start"

                        });

                    }


                    navLinks.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    link.classList.add(
                        "active"
                    );

                }
            );

        }
    );

}


/* =========================================================
   LANGUAGE SELECTOR
   ========================================================= */

function setupLanguage() {

    const selector =
        document.getElementById(
            "languageSelector"
        );


    if (!selector) {
        return;
    }


    selector.addEventListener(
        "change",
        event => {

            const language =
                event.target.value;


            if (language === "ta") {

                console.log(
                    "Tamil selected."
                );

            } else {

                console.log(
                    "English selected."
                );

            }

        }
    );

}


/* =========================================================
   STOP CAMERA
   ========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(
                    track =>
                        track.stop()
                );

        }

    }
);
