/* =====================================================
   AI SMART PEST DETECTION
   TEAM 16

   Single Page Dashboard
   English / Tamil
   ===================================================== */


/* ================= EMAILJS ================= */

const EMAILJS_SERVICE_ID = "service_x2d7sjh";
const EMAILJS_TEMPLATE_ID = "template_6efhw0d";
const EMAILJS_PUBLIC_KEY = "wOORs4b9toARevid-";


emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
});


/* ================= VARIABLES ================= */

let currentLanguage = "en";

let totalDetections = 0;
let activeThreats = 0;
let emailAlerts = 0;

let cameraStream = null;

let historyData = [];

let pestCounts = {
    Aphid: 0,
    Whitefly: 0,
    Caterpillar: 0,
    "Leaf Miner": 0,
    Thrips: 0
};


/* ================= TRANSLATIONS ================= */

const translations = {

    en: {

        aphid: "Aphid",
        whitefly: "Whitefly",
        caterpillar: "Caterpillar",
        leafMiner: "Leaf Miner",
        thrips: "Thrips",

        pestDetected: "Pest Detected",
        detectionComplete: "Detection Complete",

        emailSent: "Email Sent",
        emailFailed: "Email Failed",
        sending: "Sending...",

        detected: "Detected"

    },


    ta: {

        aphid: "அஃபிட்",
        whitefly: "வெள்ளை ஈ",
        caterpillar: "கம்பளிப்பூச்சி",
        leafMiner: "இலை சுரங்கப் பூச்சி",
        thrips: "த்ரிப்ஸ்",

        pestDetected: "பூச்சி கண்டறியப்பட்டது",
        detectionComplete: "கண்டறிதல் முடிந்தது",

        emailSent: "மின்னஞ்சல் அனுப்பப்பட்டது",
        emailFailed: "மின்னஞ்சல் அனுப்ப முடியவில்லை",
        sending: "அனுப்பப்படுகிறது...",

        detected: "கண்டறியப்பட்டது"

    }

};


/* ================= LANGUAGE ================= */

function changeLanguage(language) {

    currentLanguage = language;

    document.documentElement.lang =
        language === "ta"
            ? "ta"
            : "en";


    const elements =
        document.querySelectorAll(
            "[data-en][data-ta]"
        );


    elements.forEach(element => {

        if (language === "ta") {

            element.textContent =
                element.getAttribute("data-ta");

        } else {

            element.textContent =
                element.getAttribute("data-en");

        }

    });


    updateDynamicText();

    renderHistory();

    updateAlertsLanguage();

}


/* ================= DYNAMIC TEXT ================= */

function updateDynamicText() {

    const pestName =
        document.getElementById("pestName");


    if (!pestName.dataset.pest) {
        return;
    }


    pestName.textContent =
        getPestDisplayName(
            pestName.dataset.pest
        );

}


/* ================= PEST NAME ================= */

function getPestDisplayName(pest) {

    if (currentLanguage === "ta") {

        if (pest === "Aphid")
            return translations.ta.aphid;

        if (pest === "Whitefly")
            return translations.ta.whitefly;

        if (pest === "Caterpillar")
            return translations.ta.caterpillar;

        if (pest === "Leaf Miner")
            return translations.ta.leafMiner;

        if (pest === "Thrips")
            return translations.ta.thrips;
    }


    return pest;
}


/* ================= LANGUAGE SELECTOR ================= */

document
    .getElementById("languageSelect")
    .addEventListener(
        "change",
        function () {

            changeLanguage(
                this.value
            );

        }
    );


/* ================= SINGLE PAGE NAVIGATION ================= */

const navItems =
    document.querySelectorAll(".nav-item");


navItems.forEach(item => {

    item.addEventListener(
        "click",
        function () {

            const target =
                this.getAttribute(
                    "data-target"
                );

            scrollToSection(target);

        }
    );

});


function scrollToSection(sectionId) {

    const section =
        document.getElementById(
            sectionId
        );


    if (!section) {
        return;
    }


    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    navItems.forEach(item => {

        item.classList.remove("active");

        if (
            item.getAttribute(
                "data-target"
            ) === sectionId
        ) {

            item.classList.add("active");

        }

    });

}


/* ================= UPDATE ACTIVE MENU WHILE SCROLLING ================= */

const pageSections =
    document.querySelectorAll(
        ".page-section"
    );


window.addEventListener(
    "scroll",
    function () {

        let currentSection = "dashboard";


        pageSections.forEach(section => {

            const top =
                section.getBoundingClientRect().top;


            if (top <= 150) {

                currentSection =
                    section.id;

            }

        });


        navItems.forEach(item => {

            item.classList.remove("active");


            if (
                item.getAttribute(
                    "data-target"
                ) === currentSection
            ) {

                item.classList.add("active");

            }

        });

    }
);


/* ================= IMAGE UPLOAD ================= */

const imageInput =
    document.getElementById(
        "imageInput"
    );


imageInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                const preview =
                    document.getElementById(
                        "previewImage"
                    );


                preview.src =
                    event.target.result;


                preview.style.display =
                    "block";


                runDemoDetection();

            };


        reader.readAsDataURL(file);

    }
);


/* ================= DEMO AI DETECTION ================= */

function runDemoDetection() {

    /*
       IMPORTANT:
       This is demo AI detection.
       A real trained AI model can be connected later.
    */


    const pests = [

        "Aphid",
        "Whitefly",
        "Caterpillar",
        "Leaf Miner",
        "Thrips"

    ];


    const detected =
        pests[0];


    const confidence =
        94;


    totalDetections++;

    activeThreats++;


    pestCounts[detected]++;


    updateStatistics();


    showDetectionResult(
        detected,
        confidence
    );


    addHistory(
        detected,
        confidence
    );


    addAlert(
        detected,
        confidence
    );


    updateCharts();


    sendPestEmail(
        detected,
        confidence
    );

}


/* ================= RESULT ================= */

function showDetectionResult(
    pest,
    confidence
) {

    const pestName =
        document.getElementById(
            "pestName"
        );


    pestName.dataset.pest =
        pest;


    pestName.textContent =
        getPestDisplayName(
            pest
        );


    document.getElementById(
        "confidence"
    ).textContent =
        confidence + "%";


    const status =
        document.getElementById(
            "detectionStatus"
        );


    status.innerHTML =
        currentLanguage === "ta"
            ? translations.ta.pestDetected
            : translations.en.pestDetected;

}


/* ================= STATISTICS ================= */

function updateStatistics() {

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


/* ================= EMAIL ================= */

async function sendPestEmail(
    pest,
    confidence
) {

    const emailStatus =
        document.getElementById(
            "emailStatus"
        );


    emailStatus.textContent =
        currentLanguage === "ta"
            ? translations.ta.sending
            : translations.en.sending;


    try {

        await emailjs.send(

            EMAILJS_SERVICE_ID,

            EMAILJS_TEMPLATE_ID,

            {

                pest_name:
                    getPestDisplayName(
                        pest
                    ),

                confidence:
                    confidence + "%",

                status:
                    currentLanguage === "ta"
                        ? "பூச்சி கண்டறியப்பட்டது"
                        : "Pest Detected"

            }

        );


        emailAlerts++;


        updateStatistics();


        emailStatus.textContent =
            currentLanguage === "ta"
                ? translations.ta.emailSent
                : translations.en.emailSent;


    } catch (error) {

        console.error(
            "EmailJS Error:",
            error
        );


        emailStatus.textContent =
            currentLanguage === "ta"
                ? translations.ta.emailFailed
                : translations.en.emailFailed;

    }

}


/* ================= HISTORY ================= */

function addHistory(
    pest,
    confidence
) {

    const now =
        new Date();


    historyData.unshift({

        date:
            now.toLocaleString(),

        pest:
            pest,

        confidence:
            confidence

    });


    renderHistory();

}


function renderHistory() {

    const table =
        document.getElementById(
            "historyTable"
        );


    if (historyData.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-table">

                    ${
                        currentLanguage === "ta"
                            ? "கண்டறிதல் வரலாறு இல்லை"
                            : "No detection history"
                    }

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML = "";


    historyData.forEach(item => {

        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

            <td>
                ${item.date}
            </td>

            <td>
                ${getPestDisplayName(item.pest)}
            </td>

            <td>
                ${item.confidence}%
            </td>

            <td>

                <span class="status-badge">

                    ${
                        currentLanguage === "ta"
                            ? translations.ta.detected
                            : translations.en.detected
                    }

                </span>

            </td>

        `;


        table.appendChild(row);

    });

}


/* ================= ALERTS ================= */

function addAlert(
    pest,
    confidence
) {

    const alertsList =
        document.getElementById(
            "alertsList"
        );


    const empty =
        alertsList.querySelector(
            ".empty-state"
        );


    if (empty) {
        empty.remove();
    }


    const alert =
        document.createElement(
            "div"
        );


    alert.className =
        "alert-item";


    alert.dataset.pest =
        pest;


    alert.dataset.confidence =
        confidence;


    alert.innerHTML = `

        <strong>

            🚨
            ${getPestDisplayName(pest)}

        </strong>

        <small>

            ${
                currentLanguage === "ta"
                    ? "நம்பகத்தன்மை"
                    : "Confidence"
            }

            :

            ${confidence}%

        </small>

    `;


    alertsList.prepend(
        alert
    );

}


/* ================= UPDATE ALERT LANGUAGE ================= */

function updateAlertsLanguage() {

    const alerts =
        document.querySelectorAll(
            ".alert-item"
        );


    alerts.forEach(alert => {

        const pest =
            alert.dataset.pest;


        const confidence =
            alert.dataset.confidence;


        alert.innerHTML = `

            <strong>

                🚨
                ${getPestDisplayName(pest)}

            </strong>

            <small>

                ${
                    currentLanguage === "ta"
                        ? "நம்பகத்தன்மை"
                        : "Confidence"
                }

                :

                ${confidence}%

            </small>

        `;

    });

}


/* ================= CAMERA ================= */

const openCameraBtn =
    document.getElementById(
        "openCameraBtn"
    );


const captureBtn =
    document.getElementById(
        "captureBtn"
    );


const camera =
    document.getElementById(
        "camera"
    );


const canvas =
    document.getElementById(
        "canvas"
    );


openCameraBtn.addEventListener(
    "click",
    async function () {

        try {

            cameraStream =
                await navigator.mediaDevices
                    .getUserMedia({
                        video: true
                    });


            camera.srcObject =
                cameraStream;


            camera.style.display =
                "block";


            captureBtn.disabled =
                false;


        } catch (error) {

            console.error(
                "Camera Error:",
                error
            );


            alert(

                currentLanguage === "ta"

                    ? "கேமராவை திறக்க முடியவில்லை."

                    : "Unable to open camera."

            );

        }

    }
);


/* ================= CAPTURE ================= */

captureBtn.addEventListener(
    "click",
    function () {

        if (!cameraStream) {
            return;
        }


        canvas.width =
            camera.videoWidth;


        canvas.height =
            camera.videoHeight;


        const context =
            canvas.getContext(
                "2d"
            );


        context.drawImage(

            camera,

            0,
            0,

            canvas.width,
            canvas.height

        );


        const image =
            canvas.toDataURL(
                "image/png"
            );


        const preview =
            document.getElementById(
                "previewImage"
            );


        preview.src =
            image;


        preview.style.display =
            "block";


        runDemoDetection();

    }
);


/* ================= CHARTS ================= */

let pestChart;
let trendChart;


function createCharts() {

    const pestCanvas =
        document.getElementById(
            "pestChart"
        );


    const trendCanvas =
        document.getElementById(
            "trendChart"
        );


    pestChart =
        new Chart(

            pestCanvas,

            {

                type: "bar",

                data: {

                    labels: [

                        "Aphid",
                        "Whitefly",
                        "Caterpillar",
                        "Leaf Miner",
                        "Thrips"

                    ],

                    datasets: [

                        {

                            label:
                                "Detections",

                            data: [
                                0,
                                0,
                                0,
                                0,
                                0
                            ]

                        }

                    ]

                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }

        );


    trendChart =
        new Chart(

            trendCanvas,

            {

                type: "line",

                data: {

                    labels: [

                        "Day 1",
                        "Day 2",
                        "Day 3",
                        "Day 4",
                        "Day 5",
                        "Today"

                    ],

                    datasets: [

                        {

                            label:
                                "Detections",

                            data: [
                                2,
                                3,
                                1,
                                4,
                                2,
                                0
                            ],

                            tension: 0.3

                        }

                    ]

                },

                options: {
                    responsive: true
                }

            }

        );

}


/* ================= UPDATE CHARTS ================= */

function updateCharts() {

    if (!pestChart) {
        return;
    }


    pestChart.data.datasets[0].data = [

        pestCounts.Aphid,

        pestCounts.Whitefly,

        pestCounts.Caterpillar,

        pestCounts["Leaf Miner"],

        pestCounts.Thrips

    ];


    pestChart.update();


    trendChart.data.datasets[0].data[5] =
        totalDetections;


    trendChart.update();

}


/* ================= SENSOR DEMO ================= */

function updateSensors() {

    const distance =
        Math.floor(
            Math.random() * 20
        ) + 15;


    document.getElementById(
        "distanceValue"
    ).textContent =
        distance + " cm";


    const temperature =
        Math.floor(
            Math.random() * 5
        ) + 27;


    document.getElementById(
        "temperatureValue"
    ).textContent =
        temperature + "°C";


    const humidity =
        Math.floor(
            Math.random() * 15
        ) + 60;


    document.getElementById(
        "humidityValue"
    ).textContent =
        humidity + "%";

}


/* ================= START ================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        changeLanguage("en");

        createCharts();

        updateStatistics();

        setInterval(
            updateSensors,
            3000
        );

        setInterval(
            updateCharts,
            1000
        );

    }
);