// ============================================================
// AI SMART PEST DETECTION & ALERT SYSTEM
// TEAM 16
// AUTOMATIC AI DETECTION
// ============================================================


// ============================================================
// CONFIGURATION
// ============================================================

const MODEL_URL = "./model/";

const MODEL_VERSION = "20260927-5";


// ============================================================
// EMAILJS
// ============================================================

const EMAIL_SERVICE_ID =
    "service_x2d7sj";

const EMAIL_TEMPLATE_ID =
    "template_6efhw0d";

const EMAIL_PUBLIC_KEY =
    "wOORs4b9toARevid-";


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let model = null;

let modelLoaded = false;

let uploadedImage = null;

let cameraStream = null;

let currentCamera = "environment";

let totalDetections = 0;

let activeThreats = 0;

let emailAlerts = 0;

let detectionHistory = [];

let pestChart = null;

let trendChart = null;

let isDetecting = false;


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "AI Smart Pest Detection - Team 16"
        );


        setupImageUpload();

        setupCamera();

        setupLanguage();

        setupNavigation();

        setupEmail();

        updateSensorDisplay();

        initializeEmailJS();

        await loadAIModel();

        updateDashboard();

        updateHistory();

        updateAlerts();

        updateCharts();

    }
);


// ============================================================
// EMAILJS INITIALIZATION
// ============================================================

function initializeEmailJS() {

    try {

        emailjs.init({

            publicKey:
                EMAIL_PUBLIC_KEY

        });


        console.log(
            "EmailJS initialized."
        );


    } catch (error) {

        console.error(
            "EmailJS initialization error:",
            error
        );

    }

}


// ============================================================
// EMAIL SETUP
// ============================================================

function setupEmail() {

    const saveButton =
        document.getElementById(
            "saveEmail"
        );


    const emailInput =
        document.getElementById(
            "alertEmail"
        );


    const savedEmail =
        localStorage.getItem(
            "demoAlertEmail"
        );


    if (
        savedEmail &&
        emailInput
    ) {

        emailInput.value =
            savedEmail;

    }


    if (savedEmail) {

        showSavedEmailMessage(
            "✅ Demo email saved: " +
            savedEmail
        );

    }


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveEmail
        );

    }

}


// ============================================================
// SAVE EMAIL
// ============================================================

function saveEmail() {

    const emailInput =
        document.getElementById(
            "alertEmail"
        );


    if (!emailInput) return;


    const email =
        emailInput.value.trim();


    if (!email) {

        showSavedEmailMessage(
            "⚠️ Please enter an email address."
        );

        return;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(email)
    ) {

        showSavedEmailMessage(
            "⚠️ Please enter a valid email address."
        );

        return;

    }


    localStorage.setItem(
        "demoAlertEmail",
        email
    );


    showSavedEmailMessage(
        "✅ Email saved successfully: " +
        email
    );


    console.log(
        "Demo alert email saved:",
        email
    );

}


// ============================================================
// SAVED EMAIL MESSAGE
// ============================================================

function showSavedEmailMessage(message) {

    const status =
        document.getElementById(
            "emailStatus"
        );


    if (!status) return;


    status.textContent =
        message;


    status.style.color =
        "#166534";

}


// ============================================================
// LOAD AI MODEL
// ============================================================

async function loadAIModel() {

    const status =
        document.getElementById(
            "modelStatus"
        );


    try {

        if (status) {

            status.textContent =
                "Loading AI Model...";

            status.className =
                "model-status";

        }


        const modelFile =
            MODEL_URL +
            "model.json?v=" +
            MODEL_VERSION;


        const metadataFile =
            MODEL_URL +
            "metadata.json?v=" +
            MODEL_VERSION;


        console.log(
            "Loading model:",
            modelFile
        );


        model =
            await tmImage.load(
                modelFile,
                metadataFile
            );


        modelLoaded = true;


        console.log(
            "AI model loaded successfully."
        );


        console.log(
            "AI classes:",
            model.getClassLabels()
        );


        if (status) {

            status.textContent =
                "AI Model Ready";

            status.className =
                "model-status model-ready";

        }


    } catch (error) {

        console.error(
            "AI model loading error:",
            error
        );


        modelLoaded = false;


        if (status) {

            status.textContent =
                "AI Model Error";

            status.className =
                "model-status model-error";

        }


        alert(
            "AI model could not be loaded.\n\n" +
            "Please check the model folder."
        );

    }

}


// ============================================================
// IMAGE UPLOAD
// ============================================================

function setupImageUpload() {

    const input =
        document.getElementById(
            "imageInput"
        );


    if (!input) return;


    input.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];


            if (!file) return;


            const reader =
                new FileReader();


            reader.onload =
                function (e) {

                    uploadedImage =
                        new Image();


                    uploadedImage.onload =
                        async function () {

                            const preview =
                                document.getElementById(
                                    "previewImage"
                                );


                            if (preview) {

                                preview.src =
                                    e.target.result;

                                preview.style.display =
                                    "block";

                            }


                            console.log(
                                "Image uploaded."
                            );


                            await detectPest();

                        };


                    uploadedImage.onerror =
                        function () {

                            alert(
                                "Could not load this image."
                            );

                        };


                    uploadedImage.src =
                        e.target.result;

                };


            reader.readAsDataURL(file);

        }
    );

}


// ============================================================
// CAMERA SETUP
// ============================================================

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
            captureImage
        );

    }

}


// ============================================================
// START CAMERA
// ============================================================

async function startCamera() {

    const video =
        document.getElementById(
            "camera"
        );


    if (!video) return;


    stopCamera();


    try {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            alert(
                "Camera is not supported by this browser."
            );

            return;

        }


        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: {

                        ideal:
                            currentCamera

                    }

                },

                audio: false

            });


        video.srcObject =
            cameraStream;


        await video.play();


        console.log(
            "Camera started:",
            currentCamera
        );


    } catch (error) {

        console.error(
            "Camera error:",
            error
        );


        alert(
            "Camera could not be opened.\n\n" +
            "Please allow camera permission."
        );

    }

}


// ============================================================
// SWITCH CAMERA
// ============================================================

async function switchCamera() {

    if (
        currentCamera ===
        "environment"
    ) {

        currentCamera =
            "user";

    } else {

        currentCamera =
            "environment";

    }


    await startCamera();

}


// ============================================================
// STOP CAMERA
// ============================================================

function stopCamera() {

    if (!cameraStream) return;


    cameraStream
        .getTracks()
        .forEach(
            function (track) {

                track.stop();

            }
        );


    cameraStream = null;

}


// ============================================================
// CAPTURE IMAGE
// ============================================================

async function captureImage() {

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


    if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {

        alert(
            "Camera is not ready yet."
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


    const imageData =
        canvas.toDataURL(
            "image/jpeg"
        );


    uploadedImage =
        new Image();


    uploadedImage.onload =
        async function () {

            const preview =
                document.getElementById(
                    "previewImage"
                );


            if (preview) {

                preview.src =
                    imageData;

                preview.style.display =
                    "block";

            }


            console.log(
                "Image captured."
            );


            await detectPest();

        };


    uploadedImage.src =
        imageData;

}


// ============================================================
// AI DETECTION
// ============================================================

async function detectPest() {

    if (isDetecting) {

        console.log(
            "Detection already running."
        );

        return;

    }


    if (!uploadedImage) {

        alert(
            "Please upload or capture an image first."
        );

        return;

    }


    if (
        !modelLoaded ||
        !model
    ) {

        alert(
            "AI model is not ready yet."
        );

        return;

    }


    isDetecting = true;


    showLoading();


    try {

        console.log(
            "Starting automatic AI detection..."
        );


        const predictions =
            await model.predict(
                uploadedImage,
                false
            );


        console.log(
            "========== AI PREDICTIONS =========="
        );


        predictions.forEach(
            function (prediction) {

                console.log(

                    prediction.className +
                    " : " +
                    (
                        prediction.probability *
                        100
                    ).toFixed(2) +
                    "%"

                );

            }
        );


        console.log(
            "===================================="
        );


        let bestPrediction =
            predictions[0];


        for (
            let i = 1;
            i < predictions.length;
            i++
        ) {

            if (
                predictions[i].probability >
                bestPrediction.probability
            ) {

                bestPrediction =
                    predictions[i];

            }

        }


        const result = {

            name:
                bestPrediction.className,

            confidence:
                (
                    bestPrediction.probability *
                    100
                ).toFixed(1),

            probability:
                bestPrediction.probability

        };


        console.log(
            "FINAL RESULT:",
            result.name,
            result.confidence + "%"
        );


        displayResult(result);


        saveDetection(result);


        const isHealthy =
            result.name
                .trim()
                .toLowerCase()
            ===
            "healthy leaf";


        if (!isHealthy) {

            await sendEmailAlert(result);

        }


        updateDashboard();

        updateCharts();


    } catch (error) {

        console.error(
            "Detection error:",
            error
        );


        const status =
            document.getElementById(
                "detectionStatus"
            );


        if (status) {

            status.textContent =
                "Detection Failed";

            status.className =
                "detection-status status-danger";

        }


        alert(
            "AI detection failed.\n\n" +
            error.message
        );

    } finally {

        isDetecting = false;

    }

}


// ============================================================
// LOADING
// ============================================================

function showLoading() {

    const pestName =
        document.getElementById(
            "pestName"
        );


    const confidence =
        document.getElementById(
            "confidence"
        );


    const status =
        document.getElementById(
            "detectionStatus"
        );


    if (pestName) {

        pestName.textContent =
            "Analyzing...";

    }


    if (confidence) {

        confidence.textContent =
            "--";

    }


    if (status) {

        status.textContent =
            "AI Processing...";

        status.className =
            "detection-status";

    }

}


// ============================================================
// DISPLAY RESULT
// ============================================================

function displayResult(result) {

    const pestName =
        document.getElementById(
            "pestName"
        );


    const confidence =
        document.getElementById(
            "confidence"
        );


    const status =
        document.getElementById(
            "detectionStatus"
        );


    if (pestName) {

        pestName.textContent =
            result.name;

    }


    if (confidence) {

        confidence.textContent =
            result.confidence +
            "%";

    }


    if (status) {

        const isHealthy =
            result.name
                .trim()
                .toLowerCase()
            ===
            "healthy leaf";


        if (isHealthy) {

            status.textContent =
                "Healthy Leaf";

            status.className =
                "detection-status status-safe";

        } else {

            status.textContent =
                "Pest Detected";

            status.className =
                "detection-status status-danger";

        }

    }

}


// ============================================================
// SAVE DETECTION
// ============================================================

function saveDetection(result) {

    const now =
        new Date();


    const item = {

        pest:
            result.name,

        confidence:
            result.confidence +
            "%",

        date:
            now.toLocaleDateString(),

        time:
            now.toLocaleTimeString()

    };


    detectionHistory.unshift(
        item
    );


    if (
        detectionHistory.length >
        20
    ) {

        detectionHistory.pop();

    }


    totalDetections++;


    if (
        result.name
            .trim()
            .toLowerCase()
        !==
        "healthy leaf"
    ) {

        activeThreats++;

    }


    updateHistory();

    updateAlerts();

}


// ============================================================
// EMAIL ALERT
// ============================================================

async function sendEmailAlert(result) {

    console.log(
        "Sending pest email alert..."
    );


    const savedEmail =
        localStorage.getItem(
            "demoAlertEmail"
        );


    if (!savedEmail) {

        showEmailMessage(
            "⚠️ Please save a demo email first."
        );


        alert(
            "Pest detected!\n\n" +
            "Please enter and save the Demo Alert Email first."
        );


        return;

    }


    console.log(
        "Sending email to:",
        savedEmail
    );


    try {

        const templateParams = {

            /*
             * IMPORTANT:
             * EmailJS template To Email must be:
             *
             * {{to_email}}
             */

            to_email:
                savedEmail,

            pest_name:
                result.name,

            confidence:
                result.confidence +
                "%",

            status:
                "Pest Detected"

        };


        console.log(
            "EmailJS template parameters:",
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


            console.log(
                "Email alert sent successfully."
            );


            showEmailMessage(
                "📧 Alert email sent to " +
                savedEmail
            );


        } else {

            showEmailMessage(
                "⚠️ EmailJS returned an unexpected response."
            );

        }


    } catch (error) {

        console.error(
            "EMAILJS ERROR:",
            error
        );


        const errorMessage =
            error?.text ||
            error?.message ||
            "Unknown EmailJS error";


        console.error(
            "EmailJS status:",
            error?.status
        );


        showEmailMessage(
            "❌ Email failed: " +
            errorMessage
        );


        alert(
            "Email could not be sent.\n\n" +
            "EmailJS error:\n" +
            errorMessage
        );

    }

}


// ============================================================
// EMAIL MESSAGE
// ============================================================

function showEmailMessage(message) {

    const status =
        document.getElementById(
            "detectionStatus"
        );


    if (!status) return;


    status.textContent =
        message;


    status.className =
        "detection-status";


    setTimeout(
        function () {

            const pestName =
                document.getElementById(
                    "pestName"
                );


            if (!pestName) return;


            const currentResult =
                pestName.textContent;


            if (
                currentResult
                    .trim()
                    .toLowerCase()
                ===
                "healthy leaf"
            ) {

                status.textContent =
                    "Healthy Leaf";

                status.className =
                    "detection-status status-safe";

            } else {

                status.textContent =
                    "Pest Detected";

                status.className =
                    "detection-status status-danger";

            }

        },
        6000
    );

}


// ============================================================
// DASHBOARD
// ============================================================

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


// ============================================================
// HISTORY
// ============================================================

function updateHistory() {

    const body =
        document.getElementById(
            "historyBody"
        );


    if (!body) return;


    body.innerHTML = "";


    detectionHistory.forEach(
        function (item) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${item.date}
                </td>

                <td>
                    ${item.time}
                </td>

                <td>
                    ${item.pest}
                </td>

                <td>
                    ${item.confidence}
                </td>

            `;


            body.appendChild(
                row
            );

        }
    );

}


// ============================================================
// ALERTS
// ============================================================

function updateAlerts() {

    const container =
        document.getElementById(
            "alertContainer"
        );


    if (!container) return;


    const pestAlerts =
        detectionHistory.filter(
            function (item) {

                return (

                    item.pest
                        .trim()
                        .toLowerCase()
                    !==
                    "healthy leaf"

                );

            }
        );


    if (
        pestAlerts.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">
                No pest alerts yet.
            </div>

        `;

        return;

    }


    container.innerHTML = "";


    pestAlerts
        .slice(0, 5)
        .forEach(
            function (item) {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "alert-card";


                div.innerHTML = `

                    <strong>
                        ⚠️ ${item.pest}
                    </strong>

                    <span>
                        Confidence:
                        ${item.confidence}
                    </span>

                    <small>
                        ${item.date}
                        ${item.time}
                    </small>

                `;


                container.appendChild(
                    div
                );

            }
        );

}


// ============================================================
// CHARTS
// ============================================================

function updateCharts() {

    const pestCanvas =
        document.getElementById(
            "pestChart"
        );


    const trendCanvas =
        document.getElementById(
            "trendChart"
        );


    if (
        !pestCanvas ||
        !trendCanvas ||
        typeof Chart === "undefined"
    ) {

        return;

    }


    const counts = {};


    detectionHistory.forEach(
        function (item) {

            if (

                item.pest
                    .trim()
                    .toLowerCase()
                !==
                "healthy leaf"

            ) {

                if (
                    !counts[item.pest]
                ) {

                    counts[item.pest] =
                        0;

                }


                counts[item.pest]++;

            }

        }
    );


    const labels =
        Object.keys(counts);


    const values =
        Object.values(counts);


    if (pestChart) {

        pestChart.destroy();

    }


    pestChart =
        new Chart(
            pestCanvas,
            {

                type:
                    "bar",

                data: {

                    labels:
                        labels,

                    datasets: [{

                        label:
                            "Pest Detections",

                        data:
                            values

                    }]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );


    const trendLabels =
        detectionHistory
            .slice()
            .reverse()
            .map(
                function (item) {

                    return item.time;

                }
            );


    const trendValues =
        detectionHistory
            .slice()
            .reverse()
            .map(
                function (
                    item,
                    index
                ) {

                    return index + 1;

                }
            );


    if (trendChart) {

        trendChart.destroy();

    }


    trendChart =
        new Chart(
            trendCanvas,
            {

                type:
                    "line",

                data: {

                    labels:
                        trendLabels,

                    datasets: [{

                        label:
                            "Detection Trend",

                        data:
                            trendValues,

                        tension:
                            0.3

                    }]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );

}


// ============================================================
// SENSOR DISPLAY
// ============================================================

function updateSensorDisplay() {

    const temperature =
        document.getElementById(
            "temperature"
        );


    const humidity =
        document.getElementById(
            "humidity"
        );


    const distance =
        document.getElementById(
            "distance"
        );


    const irStatus =
        document.getElementById(
            "irStatus"
        );


    if (temperature) {

        temperature.textContent =
            "-- °C";

    }


    if (humidity) {

        humidity.textContent =
            "-- %";

    }


    if (distance) {

        distance.textContent =
            "-- cm";

    }


    if (irStatus) {

        irStatus.textContent =
            "Waiting";

    }

}


// ============================================================
// LANGUAGE
// ============================================================

const translations = {

    en: {

        dashboard:
            "Dashboard",

        aiDetection:
            "AI Detection",

        analytics:
            "Analytics",

        sensors:
            "Sensors",

        alerts:
            "Alerts",

        history:
            "History"

    },


    ta: {

        dashboard:
            "டாஷ்போர்டு",

        aiDetection:
            "AI கண்டறிதல்",

        analytics:
            "பகுப்பாய்வு",

        sensors:
            "சென்சார்கள்",

        alerts:
            "எச்சரிக்கைகள்",

        history:
            "வரலாறு"

    }

};


// ============================================================
// LANGUAGE SETUP
// ============================================================

function setupLanguage() {

    const selector =
        document.getElementById(
            "languageSelector"
        );


    if (!selector) return;


    selector.addEventListener(
        "change",
        function () {

            changeLanguage(
                selector.value
            );

        }
    );

}


function changeLanguage(language) {

    const elements =
        document.querySelectorAll(
            "[data-i18n]"
        );


    elements.forEach(
        function (element) {

            const key =
                element.getAttribute(
                    "data-i18n"
                );


            if (
                translations[language] &&
                translations[language][key]
            ) {

                element.textContent =
                    translations[language][key];

            }

        }
    );

}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    const links =
        document.querySelectorAll(
            ".nav-link"
        );


    links.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    const target =
                        link.getAttribute(
                            "data-target"
                        );


                    const section =
                        document.getElementById(
                            target
                        );


                    if (section) {

                        section.scrollIntoView({

                            behavior:
                                "smooth"

                        });

                    }

                }
            );

        }
    );

}


// ============================================================
// CAMERA CLEANUP
// ============================================================

window.addEventListener(
    "beforeunload",
    function () {

        stopCamera();

    }
);
