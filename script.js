```javascript
"use strict";

// Crop names
const crops = ["Paddy", "Chilli", "Cotton", "Tomato", "Brinjal"];

const cropTamil = {
    Paddy: "நெல்",
    Chilli: "மிளகாய்",
    Cotton: "பருத்தி",
    Tomato: "தக்காளி",
    Brinjal: "கத்தரிக்காய்"
};

const pestTamil = {
    Aphid: "அஃபிட் பூச்சி",
    Caterpillar: "கம்பளிப்பூச்சி",
    Whitefly: "வெள்ளை ஈ",
    Thrips: "த்ரிப்ஸ்",
    Other_Pest: "மற்ற பூச்சி"
};

const resultTamil = {
    Healthy: "ஆரோக்கியமானது",
    Pest: "பூச்சி கண்டறியப்பட்டது"
};

const pestTypes = [
    "Aphid",
    "Caterpillar",
    "Whitefly",
    "Thrips",
    "Other_Pest"
];

function loadJSON(key, fallback) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
        console.warn("Could not read saved data:", key, error);
        return fallback;
    }
}

function makeCounts(names) {
    const counts = {};
    names.forEach(name => counts[name] = 0);
    return counts;
}

let cropCounts = {
    ...makeCounts(crops),
    ...loadJSON("agriguardCropCounts", {})
};

let pestCounts = {
    ...makeCounts(pestTypes),
    ...loadJSON("agriguardPestCounts", {})
};

let historyRecords = loadJSON("agriguardHistory", []);

if (!Array.isArray(historyRecords)) {
    historyRecords = [];
}

let totalDetections = Number(
    localStorage.getItem("agriguardTotalDetections") || 0
);

let totalAlerts = Number(
    localStorage.getItem("agriguardTotalAlerts") || 0
);

let currentLanguage = localStorage.getItem("agriguardLanguage") || "en";

let cropChartInstance = null;
let pestChartInstance = null;

function saveData() {
    localStorage.setItem("agriguardCropCounts", JSON.stringify(cropCounts));
    localStorage.setItem("agriguardPestCounts", JSON.stringify(pestCounts));
    localStorage.setItem("agriguardHistory", JSON.stringify(historyRecords));
    localStorage.setItem("agriguardTotalDetections", String(totalDetections));
    localStorage.setItem("agriguardTotalAlerts", String(totalAlerts));
}

function cropLabel(crop) {
    return currentLanguage === "ta" ? (cropTamil[crop] || crop) : crop;
}

function pestLabel(pest) {
    return currentLanguage === "ta" ? (pestTamil[pest] || pest) : pest;
}

function resultLabel(result) {
    return currentLanguage === "ta"
        ? (resultTamil[result] || result)
        : result;
}

// Translate all elements with data-en and data-ta attributes
function applyLanguage() {
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-en][data-ta]").forEach(element => {
        element.textContent = element.getAttribute(
            currentLanguage === "ta" ? "data-ta" : "data-en"
        );
    });

    renderDashboard();
}

function renderDashboard() {
    document.getElementById("totalDetections").textContent = totalDetections;
    document.getElementById("totalAlerts").textContent = totalAlerts;
    document.getElementById("totalCrops").textContent = crops.length;

    renderHistory();
    renderCharts();
}

function renderHistory() {
    const tbody = document.getElementById("historyTable");
    tbody.replaceChildren();

    if (historyRecords.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = currentLanguage === "ta"
            ? "இன்னும் பதிவுகள் இல்லை."
            : "No detections yet.";

        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    historyRecords.slice(0, 50).forEach(record => {
        const row = document.createElement("tr");

        const values = [
            record.time,
            cropLabel(record.crop),
            resultLabel(record.result),
            record.result === "Pest"
                ? pestLabel(record.pest)
                : (currentLanguage === "ta" ? "இல்லை" : "None")
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

function renderCharts() {
    if (typeof Chart === "undefined") {
        document.getElementById("statusMessage").textContent =
            currentLanguage === "ta"
                ? "வரைபட நூலகத்தை ஏற்ற முடியவில்லை. இணைய இணைப்பைச் சரிபார்க்கவும்."
                : "Chart library could not load. Check your internet connection.";
        return;
    }

    const cropCanvas = document.getElementById("cropChart");
    const pestCanvas = document.getElementById("pestChart");

    if (cropChartInstance) {
        cropChartInstance.destroy();
    }

    if (pestChartInstance) {
        pestChartInstance.destroy();
    }

    cropChartInstance = new Chart(cropCanvas, {
        type: "bar",
        data: {
            labels: crops.map(cropLabel),
            datasets: [{
                label: currentLanguage === "ta"
                    ? "கண்டறிதல் எண்ணிக்கை"
                    : "Detection Count",
                data: crops.map(crop => cropCounts[crop] || 0),
                backgroundColor: [
                    "#43a047",
                    "#fb8c00",
                    "#1e88e5",
                    "#e53935",
                    "#8e24aa"
                ],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            },
            plugins: {
                legend: { display: true }
            }
        }
    });

    pestChartInstance = new Chart(pestCanvas, {
        type: "bar",
        data: {
            labels: pestTypes.map(pestLabel),
            datasets: [{
                label: currentLanguage === "ta"
                    ? "பூச்சி எண்ணிக்கை"
                    : "Pest Count",
                data: pestTypes.map(pest => pestCounts[pest] || 0),
                backgroundColor: [
                    "#e53935",
                    "#fb8c00",
                    "#8e24aa",
                    "#00897b",
                    "#546e7a"
                ],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

// This demo form manually records entries.
// It does not perform AI image recognition.
document.getElementById("detectionForm").addEventListener("submit", event => {
    event.preventDefault();

    const crop = document.getElementById("cropSelect").value;
    const result = document.getElementById("conditionSelect").value;
    const pest = document.getElementById("pestSelect").value;

    if (!crops.includes(crop)) {
        return;
    }

    cropCounts[crop] = (cropCounts[crop] || 0) + 1;
    totalDetections++;

    if (result === "Pest") {
        pestCounts[pest] = (pestCounts[pest] || 0) + 1;
        totalAlerts++;
    }

    historyRecords.unshift({
        time: new Date().toLocaleString(),
        crop,
        result,
        pest: result === "Pest" ? pest : "None"
    });

    historyRecords = historyRecords.slice(0, 100);

    saveData();
    renderDashboard();

    document.getElementById("statusMessage").textContent =
        currentLanguage === "ta"
            ? "கண்டறிதல் வெற்றிகரமாகச் சேமிக்கப்பட்டது."
            : "Detection saved successfully.";
});

document.getElementById("languageSelector").addEventListener("change", event => {
    currentLanguage = event.target.value;
    localStorage.setItem("agriguardLanguage", currentLanguage);
    applyLanguage();
});

document.getElementById("clearHistory").addEventListener("click", () => {
    const confirmed = window.confirm(
        currentLanguage === "ta"
            ? "கண்டறிதல் வரலாற்றை அழிக்க வேண்டுமா?"
            : "Clear all detection history?"
    );

    if (!confirmed) {
        return;
    }

    historyRecords = [];
    cropCounts = makeCounts(crops);
    pestCounts = makeCounts(pestTypes);
    totalDetections = 0;
    totalAlerts = 0;

    saveData();
    renderDashboard();

    document.getElementById("statusMessage").textContent =
        currentLanguage === "ta"
            ? "வரலாறு அழிக்கப்பட்டது."
            : "History cleared.";
});

// Start dashboard
document.getElementById("languageSelector").value = currentLanguage;
applyLanguage();
```
