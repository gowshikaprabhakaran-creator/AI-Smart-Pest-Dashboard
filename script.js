"use strict";

/* =========================
SMART CROPGUARD CONFIG
========================= */
const CROP_MODEL_URL = "https://teachablemachine.withgoogle.com/models/ylA8kPisv/";
const PEST_MODEL_URL = "https://teachablemachine.withgoogle.com/models/AzqCXwXNl/";

const EMAIL_SERVICE_ID = "service_1js9nlz";
const EMAIL_TEMPLATE_ID = "template_9gcw7py";
const EMAIL_PUBLIC_KEY = "qw4mZGHePXrD9RUOk";

const ESP32_API_URL = "http://192.168.4.1/api/data";
const MIN_CONFIDENCE = 0.55;
const MIN_CONFIDENCE_GAP = 0.08;
const SENSOR_REFRESH_MS = 5000;

const CROP_CLASSES = [
"Paddy_Healthy", "Paddy_Affected",
"Chilli_Healthy", "Chilli_Affected",
"Cotton_Healthy", "Cotton_Affected",
"Tomato_Healthy", "Tomato_Affected",
"Brinjal_Healthy", "Brinjal_Affected"
];

const PEST_CLASSES = [
"Caterpillar", "Aphid", "Thrips",
"Whitefly", "Other_Pest", "No_Pest"
];

const CROP_NAMES = {
Paddy: { en: "Paddy", ta: "நெல்" },
Chilli: { en: "Chilli", ta: "மிளகாய்" },
Cotton: { en: "Cotton", ta: "பருத்தி" },
Tomato: { en: "Tomato", ta: "தக்காளி" },
Brinjal: { en: "Brinjal", ta: "கத்தரிக்காய்" }
};

const PEST_NAMES = {
Caterpillar: { en: "Caterpillar", ta: "புழு" },
Aphid: { en: "Aphid", ta: "அசுவினி" },
Thrips: { en: "Thrips", ta: "திரிப்ஸ் பூச்சி" },
Whitefly: { en: "Whitefly", ta: "வெள்ளை ஈ" },
Other_Pest: { en: "Other Pest", ta: "மற்ற பூச்சி" },
No_Pest: { en: "No Pest Detected", ta: "பூச்சி கண்டறியப்படவில்லை" }
};

const I18N = {
en: {
menu:"MAIN MENU", dashboard:"🏠 Dashboard", detection:"🔬 AI Detection",
alerts:"🔔 Smart Alerts", analytics:"📊 Analytics", sensors:"📡 Sensors",
history:"📋 History", grow:"Grow smarter.", protect:"Protect crops with AI-powered insights.",
heroTag:"SMART AGRICULTURE PLATFORM", heroTitle:"Healthy Crops.<br><span>Smarter Farming.</span>",
heroText:"Detect crop diseases and pests with AI. Monitor your field and get timely alerts.",
start:"Start Detection →", overview:"OVERVIEW", overviewTitle:"Field at a glance",
totalScans:"Total Scans", allScans:"All completed inspections",
pestFindings:"Pest Findings", detectedThreats:"Detected pest threats",
cropScans:"Crop Scans", cropInspections:"Crop health inspections",
sensorStatus:"Sensor Status", aiLab:"AI LABORATORY", detectionTitle:"Crop & Pest Detection",
detectionSubtitle:"Upload a photo or use your camera for analysis.",
inputImage:"📷 Image Input", uploadTitle:"Upload a crop or pest image",
uploadText:"Choose an image from your device.", chooseImage:"Choose Image",
fileNote:"JPG, PNG, WEBP supported", previewPlaceholder:"Your selected image will appear here.",
openCamera:"📹 Open Camera", capture:"📸 Capture", closeCamera:"Close Camera",
cropDetection:"Detect Crop Health", pestDetection:"Detect Pest",
modelNote:"Select the appropriate detector for the image you upload.",
results:"🔍 Detection Results", waitingTitle:"Waiting for an image",
waitingText:"Upload an image and select a detection mode.",
confidence:"Model confidence", sendAlert:"🔔 Send Pest Alert",
notificationCenter:"NOTIFICATION CENTER", alertTitle:"Smart Alerts",
emailTitle:"Email Notifications", emailText:"Send a test message to verify your EmailJS configuration.",
recipientEmail:"Recipient email address", testEmail:"Send Test Email",
sendLatest:"Send Latest Pest Alert", insights:"INSIGHTS", analyticsTitle:"Detection Analytics",
pestChartTitle:"Pest Detection Distribution", trendChartTitle:"Recent Detection Activity",
iotMonitoring:"IOT MONITORING", sensorTitle:"ESP32 Smart Sensors",
sensorSubtitle:"Connect your ESP32 to monitor field conditions.", refresh:"↻ Refresh",
irSensor:"IR Sensor", ultrasonic:"Ultrasonic Sensor", pestSensor:"Pest Sensor",
ledTitle:"LED Alert Indicators", ledText:"LED states are read from the ESP32 response.",
yellowLed:"Yellow LED", redLed:"Red LED", records:"RECORDS",
historyTitle:"Detection History", clearHistory:"Clear History",
time:"Date / Time", mode:"Mode", finding:"Finding", status:"Status",
noHistory:"No detections yet.",
footerText:"AI-Based Multi-Crop Pest Detection and Smart Alert System",
offline:"Offline", online:"Online", waiting:"Waiting for data",
enabled:"ON", disabled:"OFF", cropMode:"Crop Health", pestMode:"Pest Detection",
healthy:"Healthy", affected:"Affected", pestFound:"Pest detected",
noPest:"No pest detected", uncertain:"Uncertain result",
lowConfidence:"The model is not confident enough. Please use a clearer image and try again.",
ambiguous:"The top predictions are too close. The result may be incorrect.",
uploadSuccess:"Image selected successfully. Choose a detection mode.",
uploadError:"Please choose a valid image file.", cameraError:"Camera could not be opened.",
cameraPermission:"Allow camera access and use HTTPS or localhost.",
captured:"Camera image captured successfully.",
modelLoading:"Loading AI model…", modelReady:"AI model ready.",
modelError:"Could not load the AI model. Check your internet connection.",
noImage:"Please upload or capture an image first.",
cropHealthyText:"The model classified this crop as healthy.",
cropAffectedText:"The model classified this crop as affected. Please inspect the plant.",
pestAlertText:"The model detected a possible pest. Verify the result visually.",
noPestText:"The model did not detect a pest in this image.",
emailMissing:"Enter a valid recipient email address.",
emailSent:"Email sent successfully.", emailFailed:"Email could not be sent. Check your EmailJS settings.",
emailConfig:"EmailJS could not initialize. Check the public key and internet connection.",
noAlert:"No verified pest alert is available to send.",
historyCleared:"Detection history cleared.", sensorError:"Cannot reach ESP32. Connect to its Wi-Fi and retry.",
sensorLoaded:"Sensor data updated.", unknown:"Unknown",
scanComplete:"Analysis complete.", cropModel:"CROP ANALYSIS", pestModel:"PEST ANALYSIS",
caution:"This is an AI prediction, not a confirmed diagnosis.",
confirm:"Please verify the result before taking action.",
clearConfirm:"Clear all saved detection history?"
},
ta: {
menu:"முக்கிய மெனு", dashboard:"🏠 முகப்பு", detection:"🔬 AI கண்டறிதல்",
alerts:"🔔 எச்சரிக்கைகள்", analytics:"📊 பகுப்பாய்வு", sensors:"📡 சென்சார்கள்",
history:"📋 வரலாறு", grow:"சிறந்த விவசாயம்.", protect:"AI உதவியுடன் பயிர்களைப் பாதுகாக்கவும்.",
heroTag:"ஸ்மார்ட் விவசாயத் தளம்", heroTitle:"ஆரோக்கியமான பயிர்கள்.<br><span>சிறந்த விவசாயம்.</span>",
heroText:"AI மூலம் பயிர் நோய்களையும் பூச்சிகளையும் கண்டறிந்து சரியான நேரத்தில் எச்சரிக்கை பெறுங்கள்.",
start:"கண்டறிதலைத் தொடங்கு →", overview:"மேலோட்டம்", overviewTitle:"வயலின் நிலை",
totalScans:"மொத்த ஆய்வுகள்", allScans:"முடிக்கப்பட்ட அனைத்து ஆய்வுகளும்",
pestFindings:"பூச்சிக் கண்டறிதல்கள்", detectedThreats:"கண்டறியப்பட்ட பூச்சிகள்",
cropScans:"பயிர் ஆய்வுகள்", cropInspections:"பயிர் ஆரோக்கிய ஆய்வுகள்",
sensorStatus:"சென்சார் நிலை", aiLab:"AI ஆய்வகம்", detectionTitle:"பயிர் மற்றும் பூச்சி கண்டறிதல்",
detectionSubtitle:"படத்தைப் பதிவேற்றவும் அல்லது கேமராவைப் பயன்படுத்தவும்.",
inputImage:"📷 பட உள்ளீடு", uploadTitle:"பயிர் அல்லது பூச்சிப் படத்தைப் பதிவேற்றவும்",
uploadText:"உங்கள் சாதனத்திலிருந்து படத்தைத் தேர்ந்தெடுக்கவும்.",
chooseImage:"படத்தைத் தேர்ந்தெடு", fileNote:"JPG, PNG, WEBP ஆதரிக்கப்படும்",
previewPlaceholder:"தேர்ந்தெடுத்த படம் இங்கே தோன்றும்.",
openCamera:"📹 கேமராவைத் திற", capture:"📸 படம் எடு", closeCamera:"கேமராவை மூடு",
cropDetection:"பயிர் ஆரோக்கியத்தைக் கண்டறி", pestDetection:"பூச்சியைக் கண்டறி",
modelNote:"படத்திற்கு ஏற்ற கண்டறிதல் முறையைத் தேர்ந்தெடுக்கவும்.",
results:"🔍 கண்டறிதல் முடிவுகள்", waitingTitle:"படத்திற்காகக் காத்திருக்கிறது",
waitingText:"படத்தைப் பதிவேற்றி கண்டறிதல் முறையைத் தேர்ந்தெடுக்கவும்.",
confidence:"AI நம்பகத்தன்மை", sendAlert:"🔔 பூச்சி எச்சரிக்கையை அனுப்பு",
notificationCenter:"அறிவிப்பு மையம்", alertTitle:"ஸ்மார்ட் எச்சரிக்கைகள்",
emailTitle:"மின்னஞ்சல் அறிவிப்புகள்", emailText:"EmailJS அமைப்பைச் சோதிக்க மின்னஞ்சல் அனுப்பவும்.",
recipientEmail:"பெறுநரின் மின்னஞ்சல்", testEmail:"சோதனை மின்னஞ்சல் அனுப்பு",
sendLatest:"சமீபத்திய பூச்சி எச்சரிக்கையை அனுப்பு", insights:"தகவல்கள்",
analyticsTitle:"கண்டறிதல் பகுப்பாய்வு", pestChartTitle:"பூச்சிக் கண்டறிதல் பகிர்வு",
trendChartTitle:"சமீபத்திய கண்டறிதல் செயல்பாடு", iotMonitoring:"IoT கண்காணிப்பு",
sensorTitle:"ESP32 ஸ்மார்ட் சென்சார்கள்",
sensorSubtitle:"வயல் நிலையை கண்காணிக்க ESP32-ஐ இணைக்கவும்.",
refresh:"↻ புதுப்பி", irSensor:"IR சென்சார்", ultrasonic:"அல்ட்ராசோனிக் சென்சார்",
pestSensor:"பூச்சி சென்சார்", ledTitle:"LED எச்சரிக்கை விளக்குகள்",
ledText:"ESP32 பதிலிலிருந்து LED நிலைகள் பெறப்படுகின்றன.",
yellowLed:"மஞ்சள் LED", redLed:"சிவப்பு LED", records:"பதிவுகள்",
historyTitle:"கண்டறிதல் வரலாறு", clearHistory:"வரலாற்றை அழி",
time:"தேதி / நேரம்", mode:"முறை", finding:"கண்டறிதல்", status:"நிலை",
noHistory:"இன்னும் பதிவுகள் இல்லை.",
footerText:"AI அடிப்படையிலான பல பயிர் பூச்சிக் கண்டறிதல் மற்றும் ஸ்மார்ட் எச்சரிக்கை அமைப்பு",
offline:"இணைக்கப்படவில்லை", online:"இணைக்கப்பட்டுள்ளது", waiting:"தரவு காத்திருக்கிறது",
enabled:"இயக்கம்", disabled:"நிறுத்தம்", cropMode:"பயிர் ஆரோக்கியம்",
pestMode:"பூச்சி கண்டறிதல்", healthy:"ஆரோக்கியமானது", affected:"பாதிக்கப்பட்டது",
pestFound:"பூச்சி கண்டறியப்பட்டது", noPest:"பூச்சி கண்டறியப்படவில்லை",
uncertain:"உறுதியற்ற முடிவு",
lowConfidence:"AI நம்பகத்தன்மை குறைவாக உள்ளது. தெளிவான படத்தைப் பயன்படுத்தவும்.",
ambiguous:"முன்னணி முடிவுகளின் மதிப்புகள் நெருக்கமாக உள்ளன. முடிவு தவறாக இருக்கலாம்.",
uploadSuccess:"படம் வெற்றிகரமாகத் தேர்ந்தெடுக்கப்பட்டது. கண்டறிதல் முறையைத் தேர்ந்தெடுக்கவும்.",
uploadError:"சரியான படக் கோப்பைத் தேர்ந்தெடுக்கவும்.",
cameraError:"கேமராவைத் திறக்க முடியவில்லை.",
cameraPermission:"கேமரா அனுமதி வழங்கவும். HTTPS அல்லது localhost பயன்படுத்தவும்.",
captured:"கேமரா படம் வெற்றிகரமாக எடுக்கப்பட்டது.",
modelLoading:"AI மாடல் ஏற்றப்படுகிறது…", modelReady:"AI மாடல் தயார்.",
modelError:"AI மாடலை ஏற்ற முடியவில்லை. இணைய இணைப்பைச் சரிபார்க்கவும்.",
noImage:"முதலில் படத்தைப் பதிவேற்றவும் அல்லது எடுக்கவும்.",
cropHealthyText:"இந்தப் பயிர் ஆரோக்கியமானது என AI கணித்துள்ளது.",
cropAffectedText:"இந்தப் பயிர் பாதிக்கப்பட்டிருக்கலாம் என AI கணித்துள்ளது. செடியைச் சரிபார்க்கவும்.",
pestAlertText:"பூச்சி இருக்கலாம் என AI கணித்துள்ளது. முடிவை நேரடியாகச் சரிபார்க்கவும்.",
noPestText:"இந்தப் படத்தில் பூச்சி கண்டறியப்படவில்லை என AI கணித்துள்ளது.",
emailMissing:"சரியான பெறுநர் மின்னஞ்சலை உள்ளிடவும்.",
emailSent:"மின்னஞ்சல் வெற்றிகரமாக அனுப்பப்பட்டது.",
emailFailed:"மின்னஞ்சல் அனுப்ப முடியவில்லை. EmailJS அமைப்பைச் சரிபார்க்கவும்.",
emailConfig:"EmailJS தொடங்கவில்லை. Public key மற்றும் இணைய இணைப்பைச் சரிபார்க்கவும்.",
noAlert:"அனுப்புவதற்கு உறுதிப்படுத்தப்பட்ட பூச்சி எச்சரிக்கை இல்லை.",
historyCleared:"கண்டறிதல் வரலாறு அழிக்கப்பட்டது.",
sensorError:"ESP32-ஐ அணுக முடியவில்லை. அதன் Wi-Fi-யுடன் இணைக்கவும்.",
sensorLoaded:"சென்சார் தரவு புதுப்பிக்கப்பட்டது.", unknown:"தெரியவில்லை",
scanComplete:"ஆய்வு முடிந்தது.", cropModel:"பயிர் ஆய்வு", pestModel:"பூச்சி ஆய்வு",
caution:"இது AI கணிப்பு மட்டுமே; உறுதிப்படுத்தப்பட்ட நோயறிதல் அல்ல.",
confirm:"நடவடிக்கை எடுப்பதற்கு முன் முடிவைச் சரிபார்க்கவும்.",
clearConfirm:"சேமித்துள்ள அனைத்து கண்டறிதல் பதிவுகளையும் அழிக்கவா?"
}
};

let currentLanguage = "en";
let currentImage = null;
let cropModel = null;
let pestModel = null;
let currentResult = null;
let cameraStream = null;
let emailReady = false;
let sensorTimer = null;
let isPredicting = false;
let historyRecords = loadHistory();

/* =========================
HELPERS
========================= */
function $(id) {
return document.getElementById(id);
}

function t(key) {
return (I18N[currentLanguage] && I18N[currentLanguage][key]) ||
I18N.en[key] || key;
}

function translatedName(map, name) {
return map[name] ? map[name][currentLanguage] || map[name].en : name;
}

function showNotice(id, message, type = "success") {
const el = $(id);
if (!el) return;
el.textContent = message;
el.className = "notice show" + (type === "error" ? " error" : type === "warning" ? " warning" : "");
}

function clearNotice(id) {
const el = $(id);
if (el) {
el.textContent = "";
el.className = "notice";
}
}

function setText(id, value) {
const el = $(id);
if (el) el.textContent = value;
}

function setHidden(id, hidden) {
const el = $(id);
if (el) el.hidden = hidden;
}

function safeNumber(value) {
const n = Number(value);
return Number.isFinite(n) ? n : null;
}

function parseBoolean(value) {
if (typeof value === "boolean") return value;
if (typeof value === "number") return value !== 0;
if (typeof value === "string") {
const v = value.trim().toLowerCase();
if (["1", "true", "on", "yes", "detected", "active"].includes(v)) return true;
if (["0", "false", "off", "no", "inactive", "clear"].includes(v)) return false;
}
return null;
}

function formatPercent(value) {
return (value * 100).toFixed(1) + "%";
}

function formatDate(value) {
const date = new Date(value);
return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function setButtonLoading(button, loading, label) {
if (!button) return;
button.disabled = loading;
if (label) button.textContent = label;
}

/* =========================
LANGUAGE
========================= */
function applyLanguage() {
document.documentElement.lang = currentLanguage === "ta" ? "ta" : "en";

document.querySelectorAll("[data-i18n]").forEach(el => {
const key = el.dataset.i18n;
if (I18N[currentLanguage][key]) {
el.innerHTML = I18N[currentLanguage][key];
}
});

const languageSelector = $("languageSelector");
if (languageSelector) languageSelector.value = currentLanguage;

if (currentResult) renderPrediction(currentResult, false);
renderHistory();
renderStats();
renderChartLegend();
}

function setupLanguage() {
const selector = $("languageSelector");
if (!selector) return;
selector.value = currentLanguage;
selector.addEventListener("change", () => {
currentLanguage = selector.value === "ta" ? "ta" : "en";
applyLanguage();
});
}

/* =========================
NAVIGATION
========================= */
function setupNavigation() {
const links = Array.from(document.querySelectorAll(".nav-link"));

function activate(hash) {
links.forEach(link => {
link.classList.toggle("active", link.getAttribute("href") === hash);
});
}

links.forEach(link => {
link.addEventListener("click", () => activate(link.getAttribute("href")));
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
link.addEventListener("click", () => {
const hash = link.getAttribute("href");
if (links.some(nav => nav.getAttribute("href") === hash)) activate(hash);
});
});

const sections = Array.from(document.querySelectorAll(".page-section"));
if ("IntersectionObserver" in window) {
const observer = new IntersectionObserver(entries => {
const visible = entries
.filter(entry => entry.isIntersecting)
.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
if (visible) activate("#" + visible.target.id);
}, { rootMargin: "-20% 0px -65% 0px", threshold: [0, .2, .5] });
sections.forEach(section => observer.observe(section));
}
}

/* =========================
MODEL LOADING
========================= */
async function loadModels() {
showNotice("modelStatus", t("modelLoading"), "warning");

if (!window.tmImage) {
showNotice("modelStatus", t("modelError"), "error");
return;
}

try {
const results = await Promise.allSettled([
window.tmImage.load(CROP_MODEL_URL + "model.json", CROP_MODEL_URL + "metadata.json"),
window.tmImage.load(PEST_MODEL_URL + "model.json", PEST_MODEL_URL + "metadata.json")
]);

if (results[0].status === "fulfilled") cropModel = results[0].value;
if (results[1].status === "fulfilled") pestModel = results[1].value;

const ready = [];
if (cropModel) ready.push("Crop");
if (pestModel) ready.push("Pest");

if (ready.length) {
  showNotice("modelStatus", t("modelReady") + " " + ready.join(" + "), "success");
} else {
  showNotice("modelStatus", t("modelError"), "error");
}

} catch (error) {
console.error("Model loading error:", error);
showNotice("modelStatus", t("modelError"), "error");
}
}

/* =========================
IMAGE UPLOAD AND PREVIEW
========================= */
function setCurrentImage(source, messageKey = "uploadSuccess") {
currentImage = source;
const image = $("uploadedImage");
if (image) {
image.src = source;
image.style.display = "block";
image.hidden = false;
}
setHidden("previewPlaceholder", true);
setHidden("resultEmpty", false);
setHidden("predictionResult", true);
currentResult = null;
setHidden("sendAlert", true);
showNotice("uploadStatus", t(messageKey), "success");
clearNotice("modelStatus");
}

function handleImageFile(file) {
if (!file || !file.type || !file.type.startsWith("image/")) {
showNotice("uploadStatus", t("uploadError"), "error");
return;
}

const reader = new FileReader();

reader.onload = () => {
setCurrentImage(reader.result, "uploadSuccess");
};

reader.onerror = () => {
showNotice("uploadStatus", t("uploadError"), "error");
};

reader.readAsDataURL(file);
}

function setupUpload() {
const input = $("imageUpload");
const zone = $("dropZone");

if (input) {
input.addEventListener("change", event => {
const file = event.target.files && event.target.files[0];
if (file) handleImageFile(file);
input.value = "";
});
}

if (zone) {
zone.addEventListener("dragover", event => {
event.preventDefault();
zone.classList.add("drag-over");
});
zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
zone.addEventListener("drop", event => {
event.preventDefault();
zone.classList.remove("drag-over");
const file = event.dataTransfer && event.dataTransfer.files[0];
if (file) handleImageFile(file);
});
}
}

/* =========================
CAMERA
========================= */
async function startCamera() {
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
showNotice("uploadStatus", t("cameraPermission"), "error");
return;
}

try {
cameraStream = await navigator.mediaDevices.getUserMedia({
video: { facingMode: { ideal: "environment" } },
audio: false
});

const video = $("camera");
video.srcObject = cameraStream;
video.style.display = "block";
video.hidden = false;
await video.play();

$("captureImage").disabled = false;
$("stopCamera").disabled = false;
$("startCamera").disabled = true;
showNotice("uploadStatus", t("cameraPermission"), "warning");

} catch (error) {
console.error("Camera error:", error);
showNotice("uploadStatus", t("cameraError") + " " + t("cameraPermission"), "error");
}
}

function captureCameraImage() {
const video = $("camera");
const canvas = $("cameraCanvas");

if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
showNotice("uploadStatus", t("cameraError"), "error");
return;
}

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
const context = canvas.getContext("2d");
context.drawImage(video, 0, 0, canvas.width, canvas.height);
setCurrentImage(canvas.toDataURL("image/jpeg", 0.92), "captured");
stopCamera();
}

function stopCamera() {
if (cameraStream) {
cameraStream.getTracks().forEach(track => track.stop());
cameraStream = null;
}

const video = $("camera");
if (video) {
video.pause();
video.srcObject = null;
video.style.display = "none";
}

if ($("captureImage")) $("captureImage").disabled = true;
if ($("stopCamera")) $("stopCamera").disabled = true;
if ($("startCamera")) $("startCamera").disabled = false;
}

/* =========================
PREDICTION
========================= */
function normalisePrediction(prediction) {
const entries = prediction.map(item => ({
className: String(item.className || item.class || "Unknown"),
probability: Math.max(0, Math.min(1, Number(item.probability) || 0))
}));

entries.sort((a, b) => b.probability - a.probability);
return entries;
}

function parseCropClass(className) {
const match = String(className).match(/^(Paddy|Chilli|Cotton|Tomato|Brinjal)_(Healthy|Affected)$/i);
if (!match) return null;

const cropKey = Object.keys(CROP_NAMES).find(key => key.toLowerCase() === match[1].toLowerCase());
return {
crop: cropKey,
state: match[2].toLowerCase() === "healthy" ? "healthy" : "affected"
};
}

function evaluatePrediction(predictions, mode) {
const sorted = normalisePrediction(predictions);
if (!sorted.length) throw new Error("The model returned no predictions.");

const top = sorted[0];
const second = sorted[1] || { probability: 0 };
const gap = top.probability - second.probability;
const lowConfidence = top.probability < MIN_CONFIDENCE;
const ambiguous = sorted.length > 1 && gap < MIN_CONFIDENCE_GAP;

let parsed = null;
if (mode === "crop") parsed = parseCropClass(top.className);

const uncertain = lowConfidence || ambiguous ||
(mode === "crop" && !parsed) ||
(mode === "pest" && !PEST_CLASSES.includes(top.className));

return {
mode,
predictions: sorted,
top,
confidence: top.probability,
gap,
uncertain,
reason: lowConfidence ? "lowConfidence" : ambiguous ? "ambiguous" : "lowConfidence",
crop: parsed ? parsed.crop : null,
cropState: parsed ? parsed.state : null,
pest: mode === "pest" && PEST_CLASSES.includes(top.className) ? top.className : null,
pestFound: mode === "pest" && top.className !== "No_Pest",
alertEligible: mode === "pest" && !uncertain && top.className !== "No_Pest" &&
top.probability >= MIN_CONFIDENCE && gap >= MIN_CONFIDENCE_GAP,
timestamp: new Date().toISOString()
};
}

async function runPrediction(mode) {
if (isPredicting) return;

if (!currentImage) {
showNotice("modelStatus", t("noImage"), "error");
return;
}

const model = mode === "crop" ? cropModel : pestModel;
if (!model) {
showNotice("modelStatus", t("modelError"), "error");
await loadModels();
return;
}

isPredicting = true;
const cropButton = $("runCropDetection");
const pestButton = $("runPestDetection");
cropButton.disabled = true;
pestButton.disabled = true;
showNotice("modelStatus", t("modelLoading"), "warning");

try {
const image = $("uploadedImage");
const predictions = await model.predict(image);
const result = evaluatePrediction(predictions, mode);
currentResult = result;

addHistory(result);
renderPrediction(result, true);
renderStats();
drawCharts();
showNotice("modelStatus", t("scanComplete"), "success");

} catch (error) {
console.error("Prediction error:", error);
showNotice("modelStatus", t("modelError"), "error");
} finally {
isPredicting = false;
cropButton.disabled = false;
pestButton.disabled = false;
}
}

function renderPrediction(result, count) {
setHidden("resultEmpty", true);
setHidden("predictionResult", false);

const isCrop = result.mode === "crop";
const modeLabel = isCrop ? t("cropModel") : t("pestModel");
setText("resultType", modeLabel);
setText("predictionConfidence", formatPercent(result.confidence));

const bar = $("confidenceBar");
if (bar) {
bar.style.width = (result.confidence * 100) + "%";
bar.style.background = result.uncertain
? "linear-gradient(90deg,#e4a33a,#f2ce71)"
: result.mode === "pest" && result.pestFound
? "linear-gradient(90deg,#ed8b31,#e14c4c)"
: "linear-gradient(90deg,#2a9b5b,#8acb64)";
}

let title = result.top.className;
let detail = t("caution");
let icon = "🔬";

if (isCrop) {
const cropName = translatedName(CROP_NAMES, result.crop || "Unknown");
title = cropName + " — " + (result.cropState === "healthy" ? t("healthy") : result.cropState === "affected" ? t("affected") : t("uncertain"));
icon = result.cropState === "healthy" ? "🌿" : "🍂";

if (result.uncertain) detail = t(result.reason);
else detail = result.cropState === "healthy" ? t("cropHealthyText") : t("cropAffectedText");

} else {
title = translatedName(PEST_NAMES, result.pest || result.top.className);
icon = result.pest === "No_Pest" ? "🌱" : "🐛";
if (result.uncertain) detail = t(result.reason);
else detail = result.pest === "No_Pest" ? t("noPestText") : t("pestAlertText");
}

setText("predictionName", title);
setText("predictionDetails", detail + " " + t("confirm"));
setText("resultIcon", icon);

const scores = $("predictionScores");
scores.replaceChildren();

result.predictions.slice(0, 5).forEach(item => {
const row = document.createElement("div");
row.className = "score-row";

const label = document.createElement("span");
const parsedCrop = parseCropClass(item.className);
if (parsedCrop) {
  label.textContent = translatedName(CROP_NAMES, parsedCrop.crop) + " / " +
    (parsedCrop.state === "healthy" ? t("healthy") : t("affected"));
} else if (PEST_NAMES[item.className]) {
  label.textContent = translatedName(PEST_NAMES, item.className);
} else {
  label.textContent = item.className;
}

const track = document.createElement("div");
track.className = "score-track";
const fill = document.createElement("div");
fill.className = "score-fill";
fill.style.width = (item.probability * 100) + "%";
track.appendChild(fill);

const value = document.createElement("span");
value.className = "score-value";
value.textContent = formatPercent(item.probability);

row.append(label, track, value);
scores.appendChild(row);

});

const uncertainty = $("uncertaintyNotice");
if (result.uncertain) {
uncertainty.textContent = t(result.reason);
uncertainty.className = "notice show warning";
uncertainty.hidden = false;
} else {
uncertainty.hidden = true;
uncertainty.className = "notice";
}

// Never automatically send an email for a low-confidence or ambiguous prediction.
setHidden("sendAlert", !result.alertEligible);

if (count) renderHistory();
}

/* =========================
HISTORY AND COUNTERS
========================= */
function loadHistory() {
try {
const saved = JSON.parse(localStorage.getItem("smartCropGuardHistory") || "[]");
return Array.isArray(saved) ? saved.slice(0, 100) : [];
} catch {
return [];
}
}

function saveHistory() {
try {
localStorage.setItem("smartCropGuardHistory", JSON.stringify(historyRecords.slice(0, 100)));
} catch (error) {
console.warn("History could not be saved:", error);
}
}

function addHistory(result) {
const record = {
id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
timestamp: result.timestamp,
mode: result.mode,
finding: result.top.className,
confidence: result.confidence,
uncertain: result.uncertain,
alertEligible: result.alertEligible,
pestFound: result.mode === "pest" && result.pestFound
};

historyRecords.unshift(record);
historyRecords = historyRecords.slice(0, 100);
saveHistory();
}

function renderHistory() {
const body = $("historyBody");
if (!body) return;
body.replaceChildren();

if (!historyRecords.length) {
const row = document.createElement("tr");
const cell = document.createElement("td");
cell.colSpan = 5;
cell.className = "empty-table";
cell.textContent = t("noHistory");
row.appendChild(cell);
body.appendChild(row);
return;
}

historyRecords.forEach(record => {
const row = document.createElement("tr");
const time = document.createElement("td");
time.textContent = formatDate(record.timestamp);

const mode = document.createElement("td");
mode.textContent = record.mode === "crop" ? t("cropMode") : t("pestMode");

const finding = document.createElement("td");
const parsedCrop = parseCropClass(record.finding);
if (parsedCrop) {
  finding.textContent = translatedName(CROP_NAMES, parsedCrop.crop) + " / " +
    (parsedCrop.state === "healthy" ? t("healthy") : t("affected"));
} else {
  finding.textContent = translatedName(PEST_NAMES, record.finding);
}

const confidence = document.createElement("td");
confidence.textContent = formatPercent(record.confidence);

const status = document.createElement("td");
const pill = document.createElement("span");
pill.className = "status-pill" + (record.uncertain ? " warning" : record.pestFound ? " danger" : "");
pill.textContent = record.uncertain ? t("uncertain") :
  record.pestFound ? t("pestFound") : t("scanComplete");
status.appendChild(pill);

row.append(time, mode, finding, confidence, status);
body.appendChild(row);

});
}

function renderStats() {
setText("totalScans", historyRecords.length);
setText("cropScans", historyRecords.filter(r => r.mode === "crop").length);
setText("pestFindings", historyRecords.filter(r => r.mode === "pest" && r.pestFound && !r.uncertain).length);

const date = $("currentDate");
if (date) date.textContent = new Date().toLocaleDateString(
currentLanguage === "ta" ? "ta-IN" : "en-IN",
{ day: "numeric", month: "short", year: "numeric" }
);
}

/* =========================
CHARTS — NO EXTRA LIBRARY
========================= */
const CHART_COLORS = ["#2e9d60", "#ed8b31", "#4285db", "#8061d8", "#d94e4e", "#8abf57"];

function drawCharts() {
drawPestChart();
drawTrendChart();
renderChartLegend();
}

function drawPestChart() {
const canvas = $("pestChart");
if (!canvas) return;

const ctx = canvas.getContext("2d");
const width = Math.max(280, canvas.clientWidth || 300);
const height = 240;
const ratio = window.devicePixelRatio || 1;
canvas.width = width * ratio;
canvas.height = height * ratio;
canvas.style.height = height + "px";
ctx.scale(ratio, ratio);
ctx.clearRect(0, 0, width, height);

const names = PEST_CLASSES.filter(name => name !== "No_Pest");
const values = names.map(name => historyRecords.filter(r => r.mode === "pest" && r.finding === name && !r.uncertain).length);
const max = Math.max(1, ...values);
const left = 12;
const right = width - 40;
const barHeight = 19;
const gap = 16;

names.forEach((name, i) => {
const y = 16 + i * (barHeight + gap);
const label = translatedName(PEST_NAMES, name);
ctx.fillStyle = "#66766c";
ctx.font = "11px Inter, sans-serif";
ctx.textAlign = "left";
ctx.fillText(label, left, y + 10, 95);

const start = Math.min(115, width * .37);
const available = Math.max(45, right - start);
ctx.fillStyle = "#edf2ee";
ctx.fillRect(start, y, available, barHeight);
ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
ctx.fillRect(start, y, available * values[i] / max, barHeight);
ctx.fillStyle = "#263b2e";
ctx.textAlign = "right";
ctx.fillText(String(values[i]), width - 12, y + 13);

});
}

function drawTrendChart() {
const canvas = $("trendChart");
if (!canvas) return;

const ctx = canvas.getContext("2d");
const width = Math.max(280, canvas.clientWidth || 300);
const height = 240;
const ratio = window.devicePixelRatio || 1;
canvas.width = width * ratio;
canvas.height = height * ratio;
canvas.style.height = height + "px";
ctx.scale(ratio, ratio);
ctx.clearRect(0, 0, width, height);

const recent = historyRecords.slice(0, 7).reverse();
const values = recent.map(r => Math.round(r.confidence * 100));
const pad = { left: 34, right: 15, top: 18, bottom: 38 };
const chartW = width - pad.left - pad.right;
const chartH = height - pad.top - pad.bottom;

ctx.strokeStyle = "#e5ece7";
ctx.fillStyle = "#829087";
ctx.font = "10px Inter, sans-serif";
ctx.textAlign = "right";

[0, 25, 50, 75, 100].forEach(value => {
const y = pad.top + chartH * (1 - value / 100);
ctx.beginPath();
ctx.moveTo(pad.left, y);
ctx.lineTo(width - pad.right, y);
ctx.stroke();
ctx.fillText(value + "%", pad.left - 6, y + 3);
});

if (!values.length) {
ctx.fillStyle = "#829087";
ctx.textAlign = "center";
ctx.fillText(t("noHistory"), width / 2, height / 2);
return;
}

const xAt = i => values.length === 1
? pad.left + chartW / 2
: pad.left + (i / (values.length - 1)) * chartW;
const yAt = value => pad.top + chartH * (1 - value / 100);

ctx.strokeStyle = "#2e9d60";
ctx.lineWidth = 3;
ctx.beginPath();
values.forEach((value, i) => {
if (i === 0) ctx.moveTo(xAt(i), yAt(value));
else ctx.lineTo(xAt(i), yAt(value));
});
ctx.stroke();

values.forEach((value, i) => {
ctx.beginPath();
ctx.fillStyle = "#2e9d60";
ctx.arc(xAt(i), yAt(value), 4, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = "#53645a";
ctx.font = "9px Inter, sans-serif";
ctx.textAlign = "center";
ctx.fillText((i + 1).toString(), xAt(i), height - 15);
});
}

function renderChartLegend() {
const legend = $("pestLegend");
if (!legend) return;
legend.replaceChildren();

PEST_CLASSES.filter(name => name !== "No_Pest").forEach((name, i) => {
const item = document.createElement("span");
item.className = "legend-item";
const dot = document.createElement("i");
dot.className = "legend-dot";
dot.style.background = CHART_COLORS[i % CHART_COLORS.length];
const label = document.createElement("span");
label.textContent = translatedName(PEST_NAMES, name);
item.append(dot, label);
legend.appendChild(item);
});
}

/* =========================
EMAILJS
========================= */
function setupEmail() {
if (!window.emailjs) {
showNotice("emailStatus", t("emailConfig"), "error");
return;
}

try {
window.emailjs.init({ publicKey: EMAIL_PUBLIC_KEY });
emailReady = true;
} catch (error) {
console.error("EmailJS init error:", error);
showNotice("emailStatus", t("emailConfig"), "error");
}
}

function getRecipientEmail() {
const email = ($("alertEmail").value || "").trim();
return /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(email) ? email : null;
}

async function sendEmail(templateParams) {
if (!emailReady) {
showNotice("emailStatus", t("emailConfig"), "error");
return false;
}

try {
await window.emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, templateParams);
showNotice("emailStatus", t("emailSent"), "success");
return true;
} catch (error) {
console.error("EmailJS send error:", error);
showNotice("emailStatus", t("emailFailed"), "error");
return false;
}
}

async function sendTestEmail() {
const recipient = getRecipientEmail();
if (!recipient) {
showNotice("emailStatus", t("emailMissing"), "error");
return;
}

const button = $("testEmail");
button.disabled = true;
try {
await sendEmail({
to_email: recipient,
recipient_email: recipient,
subject: "SmartCropGuard Test Email",
alert_type: "Test Notification",
pest_name: "Test message",
crop_name: "SmartCropGuard",
confidence: "N/A",
message: "This is a test email from SmartCropGuard. Email notification settings are being tested.",
timestamp: new Date().toLocaleString()
});
} finally {
button.disabled = false;
}
}

async function sendPestAlert(result = currentResult) {
if (!result || result.mode !== "pest" || !result.alertEligible) {
showNotice("emailStatus", t("noAlert"), "warning");
return;
}

const recipient = getRecipientEmail();
if (!recipient) {
showNotice("emailStatus", t("emailMissing"), "error");
return;
}

const pestName = translatedName(PEST_NAMES, result.pest);
await sendEmail({
to_email: recipient,
recipient_email: recipient,
subject: "SmartCropGuard Pest Alert: " + result.pest,
alert_type: "Pest Detection Alert",
pest_name: pestName,
crop_name: "Not identified",
confidence: formatPercent(result.confidence),
message: "AI detected a possible pest: " + result.pest + ". Confidence: " + formatPercent(result.confidence) + ". Please inspect the field before taking action.",
timestamp: new Date().toLocaleString()
});
}

/* =========================
ESP32 SENSOR MONITORING
========================= */
function firstValue(data, keys) {
for (const key of keys) {
if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== null && data[key] !== "") {
return data[key];
}
}
return null;
}

function displaySensorValue(value) {
return value === null || value === undefined ? "—" : String(value);
}

function updateLed(elementId, statusId, state) {
const led = $(elementId);
const label = $(statusId);
if (!led || !label) return;

led.classList.remove("on");
if (state === true) {
led.classList.add("on");
label.textContent = t("enabled");
} else if (state === false) {
label.textContent = t("disabled");
} else {
label.textContent = "—";
}
}

async function refreshSensors() {
try {
const response = await fetch(ESP32_API_URL, { cache: "no-store" });
if (!response.ok) throw new Error("HTTP " + response.status);

const data = await response.json();

const ir = firstValue(data, ["ir", "irValue", "ir_sensor", "IR", "irDetected"]);
const ultrasonic = firstValue(data, ["ultrasonic", "ultrasonicValue", "distance", "distance_cm", "ultrasonic_distance"]);
const pest = firstValue(data, ["pest", "pestValue", "pest_sensor", "pestDetected", "pest_count"]);
const yellow = parseBoolean(firstValue(data, ["yellowLed", "yellow_led", "yellowLED", "yellow", "ledYellow"]));
const red = parseBoolean(firstValue(data, ["redLed", "red_led", "redLED", "red", "ledRed"]));

setText("sensorStatus", t("online"));
setText("sensorStatusText", new Date().toLocaleTimeString());
setText("irValue", displaySensorValue(ir));
setText("ultrasonicValue", ultrasonic === null ? "—" : String(ultrasonic) + (typeof ultrasonic === "number" ? " cm" : ""));
setText("pestSensorValue", displaySensorValue(pest));
setText("irDescription", t("sensorLoaded"));
setText("ultrasonicDescription", t("sensorLoaded"));
setText("pestSensorDescription", t("sensorLoaded"));

updateLed("yellowLed", "yellowLedStatus", yellow);
updateLed("redLed", "redLedStatus", red);
showNotice("sensorMessage", t("sensorLoaded"), "success");

} catch (error) {
console.warn("ESP32 sensor error:", error);
setText("sensorStatus", t("offline"));
setText("sensorStatusText", t("sensorError"));
showNotice("sensorMessage", t("sensorError"), "error");
}
}

/* =========================
EVENTS AND STARTUP
========================= */
function setupEvents() {
$("startCamera").addEventListener("click", startCamera);
$("captureImage").addEventListener("click", captureCameraImage);
$("stopCamera").addEventListener("click", stopCamera);

$("runCropDetection").addEventListener("click", () => runPrediction("crop"));
$("runPestDetection").addEventListener("click", () => runPrediction("pest"));

$("sendAlert").addEventListener("click", () => sendPestAlert(currentResult));
$("testEmail").addEventListener("click", sendTestEmail);
$("sendLatestAlert").addEventListener("click", () => {
const latest = historyRecords.find(record => record.mode === "pest" && record.alertEligible);
if (!latest) {
showNotice("emailStatus", t("noAlert"), "warning");
return;
}
const result = currentResult &&
currentResult.timestamp === latest.timestamp &&
currentResult.alertEligible ? currentResult : null;
if (!result) {
showNotice("emailStatus", t("noAlert"), "warning");
return;
}
sendPestAlert(result);
});

$("refreshSensors").addEventListener("click", refreshSensors);

$("clearHistory").addEventListener("click", () => {
if (!window.confirm(t("clearConfirm"))) return;
historyRecords = [];
saveHistory();
renderHistory();
renderStats();
drawCharts();
showNotice("modelStatus", t("historyCleared"), "success");
});

window.addEventListener("resize", () => {
drawCharts();
});

window.addEventListener("beforeunload", () => {
stopCamera();
if (sensorTimer) clearInterval(sensorTimer);
});
}

function init() {
setupLanguage();
setupNavigation();
setupUpload();
setupEmail();
setupEvents();
applyLanguage();
renderHistory();
renderStats();
drawCharts();
loadModels();
refreshSensors();
sensorTimer = setInterval(refreshSensors, SENSOR_REFRESH_MS);
}

document.addEventListener("DOMContentLoaded", init);
