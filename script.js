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
let trendChart = null;

let currentLanguage = "en";


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Dashboard loaded.");

    initializeEmailJS();

    setupEmail();

    setupNavigation();

    setupCamera();

    setupUpload();

    setupLanguage();

    loadHistory();

    updateDashboard();

    setupCharts();

    loadModel();

});


/* =========================================================
   EMAILJS
   ========================================================= */

function initializeEmailJS() {

    try {

        if (typeof emailjs === "undefined") {

            console.error(
                "EmailJS library not loaded."
            );

            showEmailMessage(
                "❌ EmailJS library not loaded."
            );

            return;
        }

        emailjs.init({
            publicKey: EMAIL_PUBLIC_KEY
        });

        console.log(
            "EmailJS initialized successfully."
        );

    } catch (error) {

        console.error(
            "EmailJS initialization error:",
            error
        );

    }
}


/* =========================================================
   DEMO EMAIL SETUP
   ========================================================= */

function setupEmail() {

    const emailInput =
        document.getElementById("alertEmail");

    const saveButton =
        document.getElementById("saveEmail");


    if (!emailInput || !saveButton) {

        console.log(
            "Demo email elements not found."
        );

        return;
    }


    const savedEmail =
        localStorage.getItem(
            "demoAlertEmail"
        );


    if (savedEmail) {

        emailInput.value =
            savedEmail;

        updateEmailStatus(
            savedEmail
        );
    }


    saveButton.addEventListener(
        "click",
        saveEmail
    );

}


/* =========================================================
   SAVE DEMO EMAIL
   ========================================================= */

function saveEmail() {

    const emailInput =
        document.getElementById(
            "alertEmail"
        );


    if (!emailInput) {
        return;
    }


    const email =
        emailInput.value.trim();


    if (!email) {

        alert(
            "Please enter an email address."
        );

        return;
    }


    if (
        !email.includes("@") ||
        !email.includes(".")
    ) {

        alert(
            "Please enter a valid email address."
        );

        return;
    }


    localStorage.setItem(
        "demoAlertEmail",
        email
    );


    updateEmailStatus(
        email
    );


    alert(
        "Demo alert email saved successfully!"
    );

}


/* =========================================================
   EMAIL STATUS
   ========================================================= */

function updateEmailStatus(email) {

    const status =
        document.getElementById(
            "emailStatus"
        );


    if (!status) {
        return;
    }


    status.textContent =
        "Saved email: " + email;

}


/* =========================================================
   EMAIL MESSAGE
   ========================================================= */

function showEmailMessage(message) {

    const status =
        document.getElementById(
            "emailStatus"
        );


    if (status) {

        status.textContent =
            message;
    }


    console.log(message);

}


/* =========================================================
   SEND EMAIL ALERT
   ========================================================= */

async function sendEmailAlert(result) {

    console.log(
        "Preparing pest email alert..."
    );


    const savedEmail =
        localStorage.getItem(
            "demoAlertEmail"
        );


    /* -------------------------
       CHECK SAVED EMAIL
       ------------------------- */

    if (!savedEmail) {

        showEmailMessage(
            "⚠️ Please save a demo email first."
        );


        alert(
            "Pest detected!\n\n" +
            "Please enter the email address " +
            "for the demo alert and press Save Email."
        );


        return;
    }


    /* -------------------------
       CHECK EMAILJS
       ------------------------- */

    if (
        typeof emailjs === "undefined"
    ) {

        showEmailMessage(
            "❌ EmailJS library is not loaded."
        );


        console.error(
            "EmailJS is undefined."
        );


        return;
    }


    try {

        const templateParams = {

            to_email:
                savedEmail,

            pest_name:
                result.name,

            confidence:
                result.confidence + "%",

            status:
                "Pest Detected"

        };


        console.log(
            "Sending email with:",
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


        if (
            response &&
            response.status === 200
        ) {

            emailAlerts++;

            updateDashboard();


            showEmailMessage(
                "📧 Email alert sent to " +
                savedEmail
            );


            console.log(
                "Email alert sent successfully."
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
            "❌ Email error: " +
            errorMessage
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

    const status =
        document.getElementById(
            "modelStatus"
        );


    try {

        console.log(
            "Loading AI model..."
        );


        if (
            typeof tmImage === "undefined"
        ) {

            console.error(
                "Teachable Machine library not loaded."
            );


            if (status) {

                status.textContent =
                    "❌ AI Model Library Not Loaded";
            }


            return;
        }


        model =
            await tmImage.load(
                MODEL_URL +
                "?v=20260927-7",

                METADATA_URL +
                "?v=20260927-7"
            );


        maxPredictions =
            model.getTotalClasses();


        console.log(
            "AI model loaded successfully."
        );


        console.log(
            "Classes:",
            maxPredictions
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
                "❌ AI Model Loading Failed";
        }


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

    const input =
        document.getElementById(
            "imageInput"
        );


    if (!input) {

        console.log(
            "imageInput not found."
        );

        return;
    }


    input.addEventListener(
        "change",
        async function(event) {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            const image =
                document.getElementById(
                    "previewImage"
                );


            if (!image) {
                return;
            }


            const imageURL =
                URL.createObjectURL(
                    file
                );


            image.src =
                imageURL;


            image.onload =
                async function() {

                    await predictImage(
                        image
                    );

                };

        }
    );

}


/* =========================================================
   AI PREDICTION
   ========================================================= */

async function predictImage(image) {

    if (!model) {

        alert(
            "AI model is still loading. Please wait."
        );

        return;
    }


    try {

        console.log(
            "Running AI prediction..."
        );


        const predictions =
            await model.predict(
                image
            );


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
            "Prediction:",
            result
        );


        displayPrediction(
            result,
            predictions
        );


        saveDetection(
            result
        );


        if (
            !isHealthyLeaf(
                result.name
            )
        ) {

            pestAlerts++;


            updateDashboard();


            createPestAlert(
                result
            );


            await sendEmailAlert(
                result
            );

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
   DISPLAY PREDICTION
   ========================================================= */

function displayPrediction(
    result,
    predictions
) {

    const pestName =
        document.getElementById(
            "pestName"
        );


    const confidence =
        document.getElementById(
            "confidence"
        );


    const detectionStatus =
        document.getElementById(
            "detectionStatus"
        );


    if (pestName) {

        pestName.textContent =
            result.name;
    }


    if (confidence) {

        confidence.textContent =
            result.confidence + "%";
    }


    if (detectionStatus) {

        if (
            isHealthyLeaf(
                result.name
            )
        ) {

            detectionStatus.textContent =
                "🌿 Healthy Leaf";

        } else {

            detectionStatus.textContent =
                "⚠️ Pest Detected";
        }

    }


    /* Update prediction bars
       if they exist */

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
   HEALTHY CHECK
   ========================================================= */

function isHealthyLeaf(name) {

    return name
        .toLowerCase()
        .includes("healthy");

}


/* =========================================================
   CAMERA SETUP
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
            document.getElementById(
                "camera"
            );


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
        document.getElementById(
            "camera"
        );


    if (
        !video ||
        !cameraStream
    ) {

        alert(
            "Please start the camera first."
        );

        return;
    }


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        video.videoWidth;


    canvas.height =
        video.videoHeight;


    const context =
        canvas.getContext(
            "2d"
        );


    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    const image =
        document.createElement(
            "img"
        );


    image.src =
        canvas.toDataURL(
            "image/jpeg"
        );


    image.onload =
        async function() {

            await predictImage(
                image
            );

        };

}


/* =========================================================
   SAVE DETECTION
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
                JSON.parse(
                    saved
                );

        } catch (error) {

            console.error(
                "History loading error:",
                error
            );

            detectionHistory =
                [];

        }

    }


    updateHistoryDisplay();

}


/* =========================================================
   HISTORY DISPLAY
   ========================================================= */

function updateHistoryDisplay() {

    const historyBody =
        document.getElementById(
            "historyBody"
        );


    if (!historyBody) {
        return;
    }


    historyBody.innerHTML =
        "";


    if (
        detectionHistory.length === 0
    ) {

        historyBody.innerHTML = `
            <tr>
                <td colspan="4">
                    No detections yet.
                </td>
            </tr>
        `;

        return;
    }


    detectionHistory.forEach(
        detection => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `
                <td>${escapeHTML(detection.date || "")}</td>
                <td>${escapeHTML(detection.time || "")}</td>
                <td>${escapeHTML(detection.name || "")}</td>
                <td>${escapeHTML(detection.confidence || "")}%</td>
            `;


            historyBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   DASHBOARD UPDATE
   ========================================================= */

function updateDashboard() {

    const totalDetections =
        document.getElementById(
            "totalDetections"
        );


    const activeThreats =
        document.getElementById(
            "activeThreats"
        );


    const emailCount =
        document.getElementById(
            "emailAlerts"
        );


    if (totalDetections) {

        totalDetections.textContent =
            detectionHistory.length;

    }


    if (activeThreats) {

        activeThreats.textContent =
            pestAlerts;

    }


    if (emailCount) {

        emailCount.textContent =
            emailAlerts;

    }


    updateCharts();

}


/* =========================================================
   CREATE PEST ALERT
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
        document.createElement(
            "div"
        );


    alertBox.className =
        "alert-item";


    alertBox.innerHTML = `
        <strong>⚠️ Pest Detected</strong>
        <p>${escapeHTML(result.name)}</p>
        <span>Confidence: ${escapeHTML(result.confidence)}%</span>
        <small>${new Date().toLocaleString()}</small>
    `;


    container.prepend(
        alertBox
    );

}


/* =========================================================
   CHART SETUP
   ========================================================= */

function setupCharts() {

    updateCharts();

}


/* =========================================================
   UPDATE CHARTS
   ========================================================= */

function updateCharts() {

    if (
        typeof Chart === "undefined"
    ) {

        console.log(
            "Chart.js not loaded."
        );

        return;
    }


    updatePestChart();

    updateTrendChart();

}


/* =========================================================
   PEST BAR CHART
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
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        Object.keys(
                            counts
                        ),

                    datasets: [
                        {

                            label:
                                "Detections",

                            data:
                                Object.values(
                                    counts
                                )

                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                true

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
        document.getElementById(
            "trendChart"
        );


    if (!canvas) {
        return;
    }


    const recent =
        detectionHistory
            .slice()
            .reverse();


    const labels =
        recent.map(
            detection =>
                detection.time || ""
        );


    const values =
        recent.map(
            detection =>
                Number(
                    detection.confidence
                ) || 0
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

                    labels:
                        labels,

                    datasets: [
                        {

                            label:
                                "Confidence %",

                            data:
                                values,

                            tension:
                                0.3

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
            ".nav-link"
        );


    const sections =
        document.querySelectorAll(
            ".content-section, .dashboard-section"
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


                    sections.forEach(
                        section => {

                            section.style.display =
                                "none";

                        }
                    );


                    const target =
                        document.getElementById(
                            targetId
                        );


                    if (target) {

                        target.style.display =
                            "block";

                    }


                    navLinks.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    link.classList.add(
                        "active"
                    );


                    history.replaceState(
                        null,
                        "",
                        "#" + targetId
                    );

                }
            );

        }
    );


    /* Open dashboard initially */

    sections.forEach(
        section => {

            section.style.display =
                "none";

        }
    );


    const dashboard =
        document.getElementById(
            "dashboard"
        );


    if (dashboard) {

        dashboard.style.display =
            "block";

    }


    if (navLinks.length > 0) {

        navLinks[0].classList.add(
            "active"
        );

    }

}


/* =========================================================
   LANGUAGE
   ========================================================= */

function setupLanguage() {

    const selector =
        document.getElementById(
            "languageSelector"
        );


    if (!selector) {
        return;
    }


    selector.value =
        currentLanguage;


    selector.addEventListener(
        "change",
        event => {

            currentLanguage =
                event.target.value;


            updateLanguage();

        }
    );

}


/* =========================================================
   LANGUAGE UPDATE
   ========================================================= */

function updateLanguage() {

    console.log(
        "Language changed to:",
        currentLanguage
    );


    /*
       Your existing HTML contains
       data-i18n attributes.

       This keeps the selector working
       without changing your current design.
    */

}


/* =========================================================
   SENSOR UPDATE HELPER
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

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   STOP CAMERA WHEN LEAVING PAGE
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
