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

let currentLanguage =
  localStorage.getItem("dashboardLanguage") || "en";


/* =========================
   TRANSLATIONS
========================= */

const translations = {

  en: {

    brandSub: "Smart Farming",

    dashboard: "Dashboard",
    aiDetection: "AI Detection",
    alerts: "Alerts",
    analytics: "Analytics",
    sensors: "Sensors",
    history: "History",

    project: "PROJECT",

    topbarSmall: "AI AGRICULTURE MONITORING",
    title: "Smart Pest Detection Dashboard",
    systemOnline: "System Online",

    heroLabel: "AI POWERED AGRICULTURE",
    heroTitle: "AI Smart Pest Detection<br>& Alert System",
    heroDescription:
      "Detect crop pests instantly using AI image classification and receive email alerts for faster action.",
    startDetection: "Start Detection",

    team16: "Team 16:",

    totalDetections: "Total Detections",
    activeThreats: "Active Threats",
    emailAlerts: "Email Alerts",
    aiModel: "AI Model",
    loading: "Loading...",
    ready: "Ready",
    error: "Error",

    aiVision: "AI VISION",
    aiPestDetection: "AI Pest Detection",
    cameraUploadDescription:
      "Use your camera or upload a crop image for AI classification.",

    cameraDetection: "Camera Detection",
    cameraDescription: "Use your phone or laptop camera.",
    cameraPreview: "Camera preview",
    startCamera: "Start Camera",
    capture: "Capture",
    stop: "Stop",

    imageUpload: "Image Upload",
    imageUploadDescription:
      "Upload a clear crop or leaf image.",
    chooseImage: "Choose an image",
    imageTypes: "JPG, JPEG or PNG",

    aiResult: "AI RESULT",
    waitingImage: "Waiting for image...",
    confidence: "Confidence",

    classPredictionScores: "Class Prediction Scores",
    classPredictionDescription:
      "Confidence score for every trained class.",
    detectImageScores:
      "Detect an image to view class scores.",

    notifications: "NOTIFICATIONS",
    emailAlertsTitle: "Email Alerts",
    emailAlertsDescription:
      "Save an email address to receive pest detection alerts.",

    alertEmailConfiguration: "Alert Email Configuration",
    alertEmailDescription:
      "Enter the email address where pest alerts should be sent.",
    emailPlaceholder: "Enter email address",
    saveEmail: "Save Email",
    testEmail: "Test Email",
    noEmailSaved: "No email saved yet.",

    recentAlerts: "Recent Alerts",
    recentAlertsDescription:
      "Latest pest detection notifications.",
    alert: "Alert",
    alertsPlural: "Alerts",
    noAlerts: "No alerts yet.",
    detectedPestsAppear:
      "Detected pests will appear here.",

    dataInsights: "DATA INSIGHTS",
    analyticsTitle: "Analytics",
    analyticsDescription:
      "View individual pest detection counts and detection trends.",

    pestDetectionCounts: "Pest Detection Counts",
    pestDetectionCountsDescription:
      "Each pest class shown separately.",
    detectionTrend: "Detection Trend",
    detectionTrendDescription:
      "Recent AI detection activity.",
    detections: "Detections",

    hardware: "HARDWARE",
    sensorMonitoring: "Sensor Monitoring",
    sensorDescription:
      "Hardware sensor values will appear after ESP32 connection.",
    hardwareNotConnected: "Hardware Not Connected",

    temperature: "Temperature",
    waitingDHT11: "Waiting for DHT11",
    humidity: "Humidity",
    cropStatus: "Crop Status",
    pending: "Pending",
    aiImageBased: "AI image based",
    esp32: "ESP32",
    offline: "Offline",
    hardwareSetupPending: "Hardware setup pending",

    records: "RECORDS",
    detectionHistory: "Detection History",
    historyDescription:
      "All AI detections are recorded independently of email status.",
    clearHistory: "Clear History",
    noHistory: "No detection history yet.",
    runDetection:
      "Run an AI detection to create a record.",

    healthy: "Healthy",
    emailSent: "Email Sent",
    emailPendingFailed: "Email Pending/Failed",
    confidenceText: "confidence",
    unknownTime: "Unknown time",

    footerProject:
      "AI Smart Pest Detection & Alert System",
    footerText:
      "Smart Agriculture • AI • ESP32",

    cameraCouldNotStart:
      "Camera could not start: ",
    modelStillLoading:
      "AI model is still loading. Please wait a moment and try again.",
    predictionFailed:
      "Prediction failed: ",

    emailLibraryError:
      "EmailJS library is not loaded. Check your internet connection and reload.",
    emailInitializationFailed:
      "EmailJS initialization failed: ",
    emailSaved:
      "Email saved: ",
    pleaseEnterEmail:
      "Please enter an email address.",
    validEmail:
      "Please enter a valid email address.",
    emailSavedSuccessfully:
      "Email saved successfully: ",
    savedEmail:
      "Saved email: ",
    enterSaveEmail:
      "Enter and save an email address first.",
    emailNotReady:
      "EmailJS is not ready. Please reload the page.",
    sendingTestEmail:
      "Sending test email...",
    testEmailSuccess:
      "Test email sent successfully to ",
    unexpectedEmailResponse:
      "EmailJS returned an unexpected response.",
    testEmailFailed:
      "Test email failed. Service ID: ",
    pestSendingEmail:
      "Pest detected. Sending email alert...",
    pestAlertSuccess:
      "Pest alert sent successfully to ",
    pestEmailFailed:
      "Pest detected, but email failed. ",
    pestEmailNotReady:
      "Pest detected, but EmailJS is not ready.",
    noEmailAddress:
      "No email address saved.",
    emailSentSuccessfully:
      "Email sent successfully",
    emailAlertFailed:
      "Email alert failed: unexpected EmailJS response.",

    clearHistoryConfirm:
      "Clear all detection history?",

    healthyNoEmail:
      "No email required for healthy leaf.",
    emailPending:
      "Email pending",
    emailPendingShort:
      "Email pending",

    languageEnglish: "English",
    languageTamil: "Tamil"
  },


  ta: {

    brandSub: "சிறந்த விவசாயம்",

    dashboard: "முகப்பு",
    aiDetection: "AI கண்டறிதல்",
    alerts: "எச்சரிக்கைகள்",
    analytics: "பகுப்பாய்வு",
    sensors: "சென்சார்கள்",
    history: "வரலாறு",

    project: "திட்டம்",

    topbarSmall: "AI விவசாய கண்காணிப்பு",
    title: "ஸ்மார்ட் பூச்சி கண்டறிதல் டாஷ்போர்டு",
    systemOnline: "சிஸ்டம் இயங்குகிறது",

    heroLabel: "AI தொழில்நுட்ப விவசாயம்",
    heroTitle: "AI ஸ்மார்ட் பூச்சி கண்டறிதல்<br>மற்றும் எச்சரிக்கை அமைப்பு",
    heroDescription:
      "AI பட பகுப்பாய்வு மூலம் பயிர் பூச்சிகளை கண்டறிந்து, விரைவான நடவடிக்கைக்காக மின்னஞ்சல் எச்சரிக்கைகளைப் பெறலாம்.",
    startDetection: "கண்டறிதலை தொடங்கு",

    team16: "குழு 16:",

    totalDetections: "மொத்த கண்டறிதல்கள்",
    activeThreats: "செயலில் உள்ள அச்சுறுத்தல்கள்",
    emailAlerts: "மின்னஞ்சல் எச்சரிக்கைகள்",
    aiModel: "AI மாடல்",
    loading: "ஏற்றப்படுகிறது...",
    ready: "தயார்",
    error: "பிழை",

    aiVision: "AI பார்வை",
    aiPestDetection: "AI பூச்சி கண்டறிதல்",
    cameraUploadDescription:
      "கேமராவைப் பயன்படுத்தவும் அல்லது பயிர் படத்தை பதிவேற்றி AI மூலம் கண்டறியவும்.",

    cameraDetection: "கேமரா கண்டறிதல்",
    cameraDescription: "உங்கள் மொபைல் அல்லது லேப்டாப் கேமராவைப் பயன்படுத்தவும்.",
    cameraPreview: "கேமரா முன்னோட்டம்",
    startCamera: "கேமராவை தொடங்கு",
    capture: "படம் எடு",
    stop: "நிறுத்து",

    imageUpload: "படம் பதிவேற்றம்",
    imageUploadDescription:
      "தெளிவான பயிர் அல்லது இலை படத்தை பதிவேற்றவும்.",
    chooseImage: "படத்தை தேர்வு செய்க",
    imageTypes: "JPG, JPEG அல்லது PNG",

    aiResult: "AI முடிவு",
    waitingImage: "படத்திற்காக காத்திருக்கிறது...",
    confidence: "நம்பகத்தன்மை",

    classPredictionScores: "வகை கணிப்பு மதிப்பெண்கள்",
    classPredictionDescription:
      "பயிற்சி பெற்ற ஒவ்வொரு வகைக்கும் நம்பகத்தன்மை மதிப்பெண்.",
    detectImageScores:
      "வகை மதிப்பெண்களை பார்க்க ஒரு படத்தை கண்டறியவும்.",

    notifications: "அறிவிப்புகள்",
    emailAlertsTitle: "மின்னஞ்சல் எச்சரிக்கைகள்",
    emailAlertsDescription:
      "பூச்சி கண்டறிதல் எச்சரிக்கைகளைப் பெற மின்னஞ்சல் முகவரியை சேமிக்கவும்.",

    alertEmailConfiguration: "எச்சரிக்கை மின்னஞ்சல் அமைப்பு",
    alertEmailDescription:
      "பூச்சி எச்சரிக்கைகள் அனுப்ப வேண்டிய மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
    emailPlaceholder: "மின்னஞ்சல் முகவரியை உள்ளிடவும்",
    saveEmail: "மின்னஞ்சலை சேமி",
    testEmail: "சோதனை மின்னஞ்சல்",
    noEmailSaved: "மின்னஞ்சல் இன்னும் சேமிக்கப்படவில்லை.",

    recentAlerts: "சமீபத்திய எச்சரிக்கைகள்",
    recentAlertsDescription:
      "சமீபத்திய பூச்சி கண்டறிதல் அறிவிப்புகள்.",
    alert: "எச்சரிக்கை",
    alertsPlural: "எச்சரிக்கைகள்",
    noAlerts: "எச்சரிக்கைகள் எதுவும் இல்லை.",
    detectedPestsAppear:
      "கண்டறியப்பட்ட பூச்சிகள் இங்கே தோன்றும்.",

    dataInsights: "தரவு பகுப்பாய்வு",
    analyticsTitle: "பகுப்பாய்வு",
    analyticsDescription:
      "பூச்சி கண்டறிதல் எண்ணிக்கைகள் மற்றும் கண்டறிதல் போக்குகளைப் பார்க்கவும்.",

    pestDetectionCounts: "பூச்சி கண்டறிதல் எண்ணிக்கைகள்",
    pestDetectionCountsDescription:
      "ஒவ்வொரு பூச்சி வகையும் தனித்தனியாக காட்டப்படும்.",
    detectionTrend: "கண்டறிதல் போக்கு",
    detectionTrendDescription:
      "சமீபத்திய AI கண்டறிதல் செயல்பாடு.",
    detections: "கண்டறிதல்கள்",

    hardware: "வன்பொருள்",
    sensorMonitoring: "சென்சார் கண்காணிப்பு",
    sensorDescription:
      "ESP32 இணைக்கப்பட்ட பிறகு வன்பொருள் சென்சார் மதிப்புகள் தோன்றும்.",
    hardwareNotConnected: "வன்பொருள் இணைக்கப்படவில்லை",

    temperature: "வெப்பநிலை",
    waitingDHT11: "DHT11 க்காக காத்திருக்கிறது",
    humidity: "ஈரப்பதம்",
    cropStatus: "பயிர் நிலை",
    pending: "நிலுவையில்",
    aiImageBased: "AI படத்தை அடிப்படையாகக் கொண்டது",
    esp32: "ESP32",
    offline: "ஆஃப்லைன்",
    hardwareSetupPending: "வன்பொருள் அமைப்பு நிலுவையில் உள்ளது",

    records: "பதிவுகள்",
    detectionHistory: "கண்டறிதல் வரலாறு",
    historyDescription:
      "மின்னஞ்சல் நிலையைப் பொருட்படுத்தாமல் அனைத்து AI கண்டறிதல்களும் பதிவு செய்யப்படும்.",
    clearHistory: "வரலாற்றை அழி",
    noHistory: "கண்டறிதல் வரலாறு இன்னும் இல்லை.",
    runDetection:
      "பதிவை உருவாக்க AI கண்டறிதலை இயக்கவும்.",

    healthy: "ஆரோக்கியமானது",
    emailSent: "மின்னஞ்சல் அனுப்பப்பட்டது",
    emailPendingFailed: "மின்னஞ்சல் நிலுவையில் / தோல்வி",
    confidenceText: "நம்பகத்தன்மை",
    unknownTime: "நேரம் தெரியவில்லை",

    footerProject:
      "AI ஸ்மார்ட் பூச்சி கண்டறிதல் மற்றும் எச்சரிக்கை அமைப்பு",
    footerText:
      "ஸ்மார்ட் விவசாயம் • AI • ESP32",

    cameraCouldNotStart:
      "கேமராவை தொடங்க முடியவில்லை: ",
    modelStillLoading:
      "AI மாடல் இன்னும் ஏற்றப்படுகிறது. சிறிது நேரம் காத்திருந்து மீண்டும் முயற்சிக்கவும்.",
    predictionFailed:
      "கணிப்பு தோல்வியடைந்தது: ",

    emailLibraryError:
      "EmailJS library ஏற்றப்படவில்லை. இணைய இணைப்பை சரிபார்த்து பக்கத்தை மீண்டும் ஏற்றவும்.",
    emailInitializationFailed:
      "EmailJS தொடங்குவதில் பிழை: ",
    emailSaved:
      "மின்னஞ்சல் சேமிக்கப்பட்டது: ",
    pleaseEnterEmail:
      "மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
    validEmail:
      "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
    emailSavedSuccessfully:
      "மின்னஞ்சல் வெற்றிகரமாக சேமிக்கப்பட்டது: ",
    savedEmail:
      "சேமிக்கப்பட்ட மின்னஞ்சல்: ",
    enterSaveEmail:
      "முதலில் மின்னஞ்சல் முகவரியை உள்ளிட்டு சேமிக்கவும்.",
    emailNotReady:
      "EmailJS தயாராக இல்லை. பக்கத்தை மீண்டும் ஏற்றவும்.",
    sendingTestEmail:
      "சோதனை மின்னஞ்சல் அனுப்பப்படுகிறது...",
    testEmailSuccess:
      "சோதனை மின்னஞ்சல் வெற்றிகரமாக அனுப்பப்பட்டது: ",
    unexpectedEmailResponse:
      "EmailJS எதிர்பாராத பதிலை வழங்கியது.",
    testEmailFailed:
      "சோதனை மின்னஞ்சல் தோல்வியடைந்தது. Service ID: ",
    pestSendingEmail:
      "பூச்சி கண்டறியப்பட்டது. மின்னஞ்சல் எச்சரிக்கை அனுப்பப்படுகிறது...",
    pestAlertSuccess:
      "பூச்சி எச்சரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது: ",
    pestEmailFailed:
      "பூச்சி கண்டறியப்பட்டது, ஆனால் மின்னஞ்சல் அனுப்பப்படவில்லை. ",
    pestEmailNotReady:
      "பூச்சி கண்டறியப்பட்டது, ஆனால் EmailJS தயாராக இல்லை.",
    noEmailAddress:
      "மின்னஞ்சல் முகவரி சேமிக்கப்படவில்லை.",
    emailSentSuccessfully:
      "மின்னஞ்சல் வெற்றிகரமாக அனுப்பப்பட்டது",
    emailAlertFailed:
      "மின்னஞ்சல் எச்சரிக்கை தோல்வியடைந்தது.",

    clearHistoryConfirm:
      "அனைத்து கண்டறிதல் வரலாற்றையும் அழிக்க வேண்டுமா?",

    healthyNoEmail:
      "ஆரோக்கியமான இலைக்கு மின்னஞ்சல் தேவையில்லை.",
    emailPending:
      "மின்னஞ்சல் நிலுவையில் உள்ளது",
    emailPendingShort:
      "மின்னஞ்சல் நிலுவையில்",

    languageEnglish: "ஆங்கிலம்",
    languageTamil: "தமிழ்"
  }

};


function t(key) {

  return (
    translations[currentLanguage]?.[key] ||
    translations.en[key] ||
    key
  );

}


/* =========================
   APPLY LANGUAGE
========================= */

function setupLanguage() {

  const selector =
    document.getElementById("languageSelector");

  if (!selector) return;

  selector.value = currentLanguage;

  applyLanguage();

  selector.addEventListener("change", () => {

    currentLanguage = selector.value;

    localStorage.setItem(
      "dashboardLanguage",
      currentLanguage
    );

    applyLanguage();

    renderHistory();
    renderAlerts();
    updatePestChart();
    updateTrendChart();

    if (savedEmail) {

      showEmailStatus(
        t("savedEmail") + savedEmail,
        "success"
      );

    } else {

      showEmailStatus(
        t("noEmailSaved"),
        ""
      );

    }

  });

}


function applyLanguage() {

  const selector =
    document.getElementById("languageSelector");

  if (selector) {

    selector.options[0].text =
      t("languageEnglish");

    selector.options[1].text =
      t("languageTamil");

  }


  const textMap = {

    ".brand span": "brandSub",

    ".nav-link:nth-child(1) span": "dashboard",
    ".nav-link:nth-child(2) span": "aiDetection",
    ".nav-link:nth-child(3) span": "alerts",
    ".nav-link:nth-child(4) span": "analytics",
    ".nav-link:nth-child(5) span": "sensors",
    ".nav-link:nth-child(6) span": "history",

    ".team-badge span": "project",

    ".topbar-small": "topbarSmall",
    ".topbar h1": "title",

    ".status-pill": "systemOnline",

    ".hero-label": "heroLabel",
    ".hero-card h2": "heroTitle",
    "#heroDescription": "heroDescription",
    ".hero-button": "startDetection",

    ".stats-grid .stat-card:nth-child(1) span": "totalDetections",
    ".stats-grid .stat-card:nth-child(2) span": "activeThreats",
    ".stats-grid .stat-card:nth-child(3) span": "emailAlerts",
    ".stats-grid .stat-card:nth-child(4) span": "aiModel",

    "#detection .section-kicker": "aiVision",
    "#detection .section-heading h2": "aiPestDetection",
    "#detection .section-heading > div > p:last-child": "cameraUploadDescription",

    "#detection .panel:nth-child(1) .panel-header h3": "cameraDetection",
    "#detection .panel:nth-child(1) .panel-header p": "cameraDescription",
    "#cameraPlaceholder span": "cameraPreview",
    "#startCamera": "startCamera",
    "#captureImage": "capture",
    "#stopCamera": "stop",

    "#detection .panel:nth-child(2) .panel-header h3": "imageUpload",
    "#detection .panel:nth-child(2) .panel-header p": "imageUploadDescription",
    ".upload-box strong": "chooseImage",
    ".upload-box span": "imageTypes",

    ".prediction-main span": "aiResult",
    ".confidence-box span": "confidence",

    ".prediction-scores-panel .panel-header h3": "classPredictionScores",
    ".prediction-scores-panel .panel-header p": "classPredictionDescription",

    "#alerts .section-kicker": "notifications",
    "#alerts .section-heading h2": "emailAlertsTitle",
    "#alerts .section-heading > div > p:last-child": "emailAlertsDescription",

    ".email-content h3": "alertEmailConfiguration",
    ".email-content > p": "alertEmailDescription",

    "#saveEmail": "saveEmail",
    "#testEmail": "testEmail",

    "#alerts .alert-panel .panel-header h3": "recentAlerts",
    "#alerts .alert-panel .panel-header p": "recentAlertsDescription",

    "#analytics .section-kicker": "dataInsights",
    "#analytics .section-heading h2": "analyticsTitle",
    "#analytics .section-heading > div > p:last-child": "analyticsDescription",

    ".charts-grid .panel:nth-child(1) .panel-header h3": "pestDetectionCounts",
    ".charts-grid .panel:nth-child(1) .panel-header p": "pestDetectionCountsDescription",

    ".charts-grid .panel:nth-child(2) .panel-header h3": "detectionTrend",
    ".charts-grid .panel:nth-child(2) .panel-header p": "detectionTrendDescription",

    "#sensors .section-kicker": "hardware",
    "#sensors .section-heading h2": "sensorMonitoring",
    "#sensors .section-heading > div > p:last-child": "sensorDescription",

    ".sensor-card:nth-child(1) span": "temperature",
    ".sensor-card:nth-child(1) small": "waitingDHT11",

    ".sensor-card:nth-child(2) span": "humidity",
    ".sensor-card:nth-child(2) small": "waitingDHT11",

    ".sensor-card:nth-child(3) span": "cropStatus",
    ".sensor-card:nth-child(3) strong": "pending",
    ".sensor-card:nth-child(3) small": "aiImageBased",

    ".sensor-card:nth-child(4) span": "esp32",
    ".sensor-card:nth-child(4) strong": "offline",
    ".sensor-card:nth-child(4) small": "hardwareSetupPending",

    "#history .section-kicker": "records",
    "#history .section-heading h2": "detectionHistory",
    "#history .section-heading > div > p:last-child": "historyDescription",
    "#clearHistory": "clearHistory",

    "footer div span": "footerProject",
    "footer > span": "footerText"

  };


  Object.entries(textMap).forEach(
    ([selector, key]) => {

      const elements =
        document.querySelectorAll(selector);

      elements.forEach(element => {

        if (key === "heroTitle") {

          element.innerHTML = t(key);

        } else {

          element.textContent = t(key);

        }

      });

    }
  );


  const emailInput =
    document.getElementById("alertEmail");

  if (emailInput) {

    emailInput.placeholder =
      t("emailPlaceholder");

  }


  const modelStatus =
    document.getElementById("modelStatus");

  if (modelStatus) {

    if (modelStatus.textContent === "Loading..." ||
        modelStatus.textContent === "ஏற்றப்படுகிறது..." ||
        modelStatus.textContent === "Loading") {

      modelStatus.textContent =
        t("loading");

    }

  }


  const predictionName =
    document.getElementById("predictionName");

  if (
    predictionName &&
    (
      predictionName.textContent === "Waiting for image..." ||
      predictionName.textContent === "படத்திற்காக காத்திருக்கிறது..."
    )
  ) {

    predictionName.textContent =
      t("waitingImage");

  }

}


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

  const links =
    document.querySelectorAll(".nav-link");

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
   EMAILJS
========================= */

function initializeEmailJS() {

  if (typeof emailjs === "undefined") {

    emailJSReady = false;

    showEmailStatus(
      t("emailLibraryError"),
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
        t("emailSaved") + savedEmail,
        "success"
      );

    }

  } catch (error) {

    emailJSReady = false;

    showEmailStatus(
      t("emailInitializationFailed") +
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
        t("pleaseEnterEmail"),
        "error"
      );

      return;

    }

    if (!isValidEmail(email)) {

      showEmailStatus(
        t("validEmail"),
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
      t("emailSavedSuccessfully") +
      savedEmail,
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
      t("savedEmail") + savedEmail,
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
        t("enterSaveEmail"),
        "error"
      );

      return;

    }

  }


  if (!emailJSReady) {

    showEmailStatus(
      t("emailNotReady"),
      "error"
    );

    return;

  }


  showEmailStatus(
    t("sendingTestEmail"),
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
        t("testEmailSuccess") +
        savedEmail,
        "success"
      );

    } else {

      showEmailStatus(
        t("unexpectedEmailResponse"),
        "error"
      );

    }

  })
  .catch(error => {

    showEmailStatus(
      t("testEmailFailed") +
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
      t("noEmailAddress");

    saveHistory();

    renderHistory();
    renderAlerts();

    return;

  }


  if (!emailJSReady) {

    historyRecord.emailSent = false;
    historyRecord.emailMessage =
      t("emailNotReady");

    saveHistory();

    renderHistory();
    renderAlerts();

    showEmailStatus(
      t("pestEmailNotReady"),
      "error"
    );

    return;

  }


  showEmailStatus(
    t("pestSendingEmail"),
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
        t("emailSentSuccessfully");

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
        t("pestAlertSuccess") +
        savedEmail,
        "success"
      );

    } else {

      historyRecord.emailSent = false;
      historyRecord.emailMessage =
        t("unexpectedEmailResponse");

      saveHistory();

      renderHistory();
      renderAlerts();

      showEmailStatus(
        t("emailAlertFailed"),
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
      t("pestEmailFailed") +
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

    status.textContent =
      t("ready");

    status.style.color = "#5ddd9b";

  } catch (error) {

    console.error(
      "Model loading error:",
      error
    );

    status.textContent =
      t("error");

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
      t("cameraCouldNotStart") +
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
      t("modelStillLoading")
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
          ? t("healthyNoEmail")
          : t("emailPending")

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
      t("predictionFailed") +
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
   DISPLAY CLASS NAME
========================= */

function displayClassName(name) {

  const names = {

    "Aphid":
      currentLanguage === "ta"
        ? "அஃபிட்"
        : "Aphid",

    "Caterpillar":
      currentLanguage === "ta"
        ? "கம்பளிப்பூச்சி"
        : "Caterpillar",

    "Whitefly":
      currentLanguage === "ta"
        ? "வெள்ளை ஈ"
        : "Whitefly",

    "Thrips":
      currentLanguage === "ta"
        ? "த்ரிப்ஸ்"
        : "Thrips",

    "Healthy Leaf":
      currentLanguage === "ta"
        ? "ஆரோக்கியமான இலை"
        : "Healthy Leaf"

  };

  return names[name] || name;

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
    displayClassName(pestName);

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
        ${escapeHTML(
          displayClassName(item.name)
        )}
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
          t("clearHistoryConfirm")
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
        <p>${t("noHistory")}</p>
        <span>${t("runDetection")}</span>
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
                  ${escapeHTML(
                    displayClassName(record.name)
                  )}
                </strong>

                <small>
                  ${formatDate(record.timestamp)}
                </small>

              </div>

            </div>


            <div class="history-right">

              <span>
                ${record.confidence}%
                ${t("confidenceText")}
              </span>

              ${
                healthy
                  ? `<span class="email-sent">
                      ${t("healthy")}
                    </span>`
                  : record.emailSent
                    ? `<span class="email-sent">
                        <i class="fa-solid fa-check"></i>
                        ${t("emailSent")}
                      </span>`
                    : `<span class="email-failed">
                        <i class="fa-solid fa-xmark"></i>
                        ${t("emailPendingFailed")}
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
    " " +
    (
      pestAlerts.length === 1
        ? t("alert")
        : t("alertsPlural")
    );


  if (pestAlerts.length === 0) {

    container.innerHTML = `
      <div class="empty-alerts">
        <i class="fa-solid fa-bell-slash"></i>
        <p>${t("noAlerts")}</p>
        <span>${t("detectedPestsAppear")}</span>
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
                  ${escapeHTML(
                    displayClassName(record.name)
                  )}
                </strong>

                <small>
                  ${formatDate(record.timestamp)}
                </small>

              </div>

            </div>


            <div class="alert-right">

              <span>
                ${record.confidence}%
                ${t("confidenceText")}
              </span>

              ${
                record.emailSent
                  ? `<span class="email-sent">
                      <i class="fa-solid fa-envelope-circle-check"></i>
                      ${t("emailSent")}
                    </span>`
                  : `<span class="email-failed">
                      <i class="fa-solid fa-envelope"></i>
                      ${escapeHTML(
                        currentLanguage === "ta"
                          ? (
                              record.emailMessage ===
                              "Email pending"
                                ? t("emailPendingShort")
                                : record.emailMessage
                            )
                          : (
                              record.emailMessage ||
                              t("emailPendingShort")
                            )
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

          displayClassName("Aphid"),

          displayClassName("Caterpillar"),

          displayClassName("Whitefly"),

          displayClassName("Thrips"),

          displayClassName("Healthy Leaf")

        ],

        datasets: [{

          label: t("detections"),

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

          label: t("detections"),

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

    return t("unknownTime");

  }


  return date.toLocaleString(
    currentLanguage === "ta"
      ? "ta-IN"
      : "en-IN",
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

/* =========================================================
   ESP32 HARDWARE CONNECTION
   ========================================================= */

const ESP32_API_URL = "http://172.30.103.178/api/data";

let esp32Connected = false;
let esp32Data = null;


/* =========================
   ESP32 DATA FETCH
========================= */

async function fetchESP32Data() {

  try {

    const response = await fetch(
      ESP32_API_URL,
      {
        method: "GET",
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error("ESP32 API error");
    }

    const data = await response.json();

    esp32Connected = true;
    esp32Data = data;

    updateESP32Dashboard(data);

  } catch (error) {

    console.log(
      "ESP32 connection:",
      error.message
    );

    esp32Connected = false;

    updateESP32Offline();

  }

}


/* =========================
   UPDATE ESP32 DASHBOARD
========================= */

function updateESP32Dashboard(data) {

  const sensorCards =
    document.querySelectorAll(
      "#sensors .sensor-card"
    );

  if (!sensorCards.length) return;


  /* -------------------------
     ESP32 STATUS
  ------------------------- */

  const esp32Value =
    sensorCards[3].querySelector("strong");

  const esp32Small =
    sensorCards[3].querySelector("small");

  if (esp32Value) {

    esp32Value.textContent =
      "Online";

  }

  if (esp32Small) {

    esp32Small.textContent =
      data.ip
        ? "IP: " + data.ip
        : "Connected";

  }


  /* -------------------------
     CROP / PEST STATUS
  ------------------------- */

  const cropValue =
    sensorCards[2].querySelector("strong");

  const cropSmall =
    sensorCards[2].querySelector("small");

  if (cropValue) {

    cropValue.textContent =
      data.pestDetected
        ? "PEST DETECTED"
        : "NO PEST";

  }

  if (cropSmall) {

    cropSmall.textContent =
      data.pestDetected
        ? "ESP32 sensor alert"
        : "Field clear";

  }


  /* -------------------------
     HARDWARE STATUS
  ------------------------- */

  const hardwareStatus =
    document.querySelector(
      ".hardware-status"
    );

  if (hardwareStatus) {

    hardwareStatus.innerHTML =
      data.pestDetected

        ? `
          <i class="fa-solid fa-triangle-exclamation"></i>
          Pest Detected
        `

        : `
          <i class="fa-solid fa-plug-circle-check"></i>
          Hardware Connected
        `;

  }


  /* -------------------------
     ADD SENSOR DETAILS
  ------------------------- */

  let esp32Details =
    document.getElementById(
      "esp32SensorDetails"
    );


  if (!esp32Details) {

    esp32Details =
      document.createElement("div");

    esp32Details.id =
      "esp32SensorDetails";

    esp32Details.className =
      "panel";

    const sensorsSection =
      document.getElementById(
        "sensors"
      );

    if (sensorsSection) {

      sensorsSection.appendChild(
        esp32Details
      );

    }

  }


  esp32Details.innerHTML = `

    <div class="panel-header">

      <div>

        <h3>
          <i class="fa-solid fa-microchip"></i>
          ESP32 Live Sensor Data
        </h3>

        <p>
          Real-time hardware status
        </p>

      </div>

    </div>


    <div style="
      display:grid;
      grid-template-columns:
      repeat(auto-fit,minmax(150px,1fr));
      gap:15px;
      margin-top:15px;
    ">


      <div class="sensor-card">

        <div class="sensor-card-icon">
          <i class="fa-solid fa-eye"></i>
        </div>

        <div>

          <span>IR Sensor</span>

          <strong>
            ${
              data.irDetected
                ? "DETECTED"
                : "CLEAR"
            }
          </strong>

          <small>
            ${
              data.irDetected
                ? "Object detected"
                : "No object"
            }
          </small>

        </div>

      </div>


      <div class="sensor-card">

        <div class="sensor-card-icon">
          <i class="fa-solid fa-ruler"></i>
        </div>

        <div>

          <span>Ultrasonic</span>

          <strong>
            ${
              data.ultrasonicDetected
                ? "DETECTED"
                : "CLEAR"
            }
          </strong>

          <small>
            ${
              data.distance_cm >= 0
                ? Number(data.distance_cm).toFixed(1) +
                  " cm"
                : "No Echo"
            }
          </small>

        </div>

      </div>


      <div class="sensor-card">

        <div class="sensor-card-icon">
          <i class="fa-solid fa-lightbulb"></i>
        </div>

        <div>

          <span>LED Status</span>

          <strong>
            ${
              data.redLED
                ? "RED ON"
                : "GREEN ON"
            }
          </strong>

          <small>
            Red: ${
              data.redLED
                ? "ON"
                : "OFF"
            }
            |
            Green: ${
              data.greenLED
                ? "ON"
                : "OFF"
            }
          </small>

        </div>

      </div>


      <div class="sensor-card">

        <div class="sensor-card-icon">
          <i class="fa-solid fa-volume-high"></i>
        </div>

        <div>

          <span>Buzzer</span>

          <strong>
            ${
              data.buzzer
                ? "ON"
                : "OFF"
            }
          </strong>

          <small>
            ${
              data.buzzer
                ? "Alert active"
                : "Alert inactive"
            }
          </small>

        </div>

      </div>


      <div class="sensor-card">

        <div class="sensor-card-icon">
          <i class="fa-solid fa-bug"></i>
        </div>

        <div>

          <span>Pest Status</span>

          <strong>
            ${
              data.pestDetected
                ? "PEST DETECTED"
                : "NO PEST"
            }
          </strong>

          <small>
            IR + Ultrasonic
          </small>

        </div>

      </div>


      <div class="sensor-card">

        <div class="sensor-card-icon">
          <i class="fa-solid fa-wifi"></i>
        </div>

        <div>

          <span>ESP32 IP</span>

          <strong style="font-size:14px;">
            ${data.ip || "--"}
          </strong>

          <small>
            Connected
          </small>

        </div>

      </div>

    </div>

  `;

}


/* =========================
   ESP32 OFFLINE
========================= */

function updateESP32Offline() {

  const sensorCards =
    document.querySelectorAll(
      "#sensors .sensor-card"
    );

  if (sensorCards.length >= 4) {

    const esp32Value =
      sensorCards[3].querySelector("strong");

    const esp32Small =
      sensorCards[3].querySelector("small");

    if (esp32Value) {

      esp32Value.textContent =
        "Offline";

    }

    if (esp32Small) {

      esp32Small.textContent =
        "Waiting for ESP32";

    }

  }


  const hardwareStatus =
    document.querySelector(
      ".hardware-status"
    );

  if (hardwareStatus) {

    hardwareStatus.innerHTML = `
      <i class="fa-solid fa-plug"></i>
      Hardware Not Connected
    `;

  }

}


/* =========================
   START ESP32 MONITORING
========================= */

function startESP32Monitoring() {

  fetchESP32Data();

  setInterval(
    fetchESP32Data,
    2000
  );

}


/* =========================
   START AFTER PAGE LOAD
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    startESP32Monitoring();

  }
);
