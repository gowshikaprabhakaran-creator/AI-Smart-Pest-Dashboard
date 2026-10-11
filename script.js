/* =========================================================
   AI-BASED MULTI-CROP PEST DETECTION
   ========================================================= */

/* =========================
   CONFIGURATION
========================= */

const EMAIL_SERVICE_ID = "service_1js9nlz";
const EMAIL_TEMPLATE_ID = "template_9gcw7py";
const EMAIL_PUBLIC_KEY = "qw4mZGHePXrD9RUOk";

// Teachable Machine models
const CROP_MODEL_URL =
  "https://teachablemachine.withgoogle.com/models/ylA8kPisv/";

const PEST_MODEL_URL =
  "https://teachablemachine.withgoogle.com/models/AzqCXwXNl/";

// ESP32 live API
const ESP32_API_URL = "http://192.168.4.1/api/data";


/* =========================
   GLOBAL VARIABLES
========================= */

let cropModel = null;
let pestModel = null;

let cropModelClasses = 0;
let pestModelClasses = 0;

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

let pestCounts = JSON.parse(
  localStorage.getItem("pestCounts") ||
  JSON.stringify({
    Aphid: 0,
    Caterpillar: 0,
    Thrips: 0,
    Whitefly: 0,
    Other_Pest: 0,
    No_Pest: 0
  })
);

let pestChart = null;
let trendChart = null;

let emailJSReady = false;

let currentLanguage =
  localStorage.getItem("dashboardLanguage") || "en";

let esp32Connected = false;
let esp32Data = null;
let esp32Timer = null;


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
      "Use two AI models to identify crop type and health status, then classify visible pests and send alerts.",
    startDetection: "Start Detection",
    team16: "PROJECT TEAM:",
    totalDetections: "Total Detections",
    activeThreats: "Active Threats",
    emailAlerts: "Email Alerts",
    aiModel: "AI Models",
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
    imageUploadDescription: "Upload a clear crop or leaf image.",
    chooseImage: "Choose an image",
    imageTypes: "JPG, JPEG or PNG",
    aiResult: "AI RESULT",
    waitingImage: "Waiting for image...",
    confidence: "Confidence",
    classPredictionScores: "Class Prediction Scores",
    classPredictionDescription:
      "Confidence scores from both crop-health and pest models.",
    detectImageScores: "Detect an image to view class scores.",
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
    recentAlertsDescription: "Latest pest detection notifications.",
    alert: "Alert",
    alertsPlural: "Alerts",
    noAlerts: "No alerts yet.",
    detectedPestsAppear: "Detected pests will appear here.",
    dataInsights: "DATA INSIGHTS",
    analyticsTitle: "Analytics",
    analyticsDescription:
      "View individual pest detection counts and detection trends.",
    pestDetectionCounts: "Pest Detection Counts",
    pestDetectionCountsDescription:
      "Each pest class shown separately.",
    detectionTrend: "Detection Trend",
    detectionTrendDescription: "Recent AI detection activity.",
    detections: "Detections",
    hardware: "HARDWARE",
    sensorMonitoring: "Sensor Monitoring",
    sensorDescription: "Live ESP32 hardware values.",
    hardwareNotConnected: "Hardware Not Connected",
    temperature: "Temperature",
    waitingDHT11: "Not Used",
    humidity: "Humidity",
    cropStatus: "Crop Status",
    pending: "Pending",
    aiImageBased: "AI image based",
    esp32: "ESP32",
    offline: "Offline",
    hardwareSetupPending: "Waiting for hardware",
    records: "RECORDS",
    detectionHistory: "Detection History",
    historyDescription:
      "All AI detections are recorded independently of email status.",
    clearHistory: "Clear History",
    noHistory: "No detection history yet.",
    runDetection: "Run an AI detection to create a record.",
    healthy: "Healthy",
    emailSent: "Email Sent",
    emailPendingFailed: "Email Pending/Failed",
    confidenceText: "confidence",
    unknownTime: "Unknown time",
    footerProject: "AI Smart Pest Detection & Alert System",
    footerText: "Smart Agriculture • AI • ESP32",
    cameraCouldNotStart: "Camera could not start: ",
    modelStillLoading:
      "AI models are still loading. Please wait and try again.",
    predictionFailed: "Prediction failed: ",
    emailLibraryError:
      "EmailJS library is not loaded. Check your internet connection and reload.",
    emailInitializationFailed: "EmailJS initialization failed: ",
    emailSaved: "Email saved: ",
    pleaseEnterEmail: "Please enter an email address.",
    validEmail: "Please enter a valid email address.",
    emailSavedSuccessfully: "Email saved successfully: ",
    savedEmail: "Saved email: ",
    enterSaveEmail: "Enter and save an email address first.",
    emailNotReady: "EmailJS is not ready. Please reload the page.",
    sendingTestEmail: "Sending test email...",
    testEmailSuccess: "Test email sent successfully to ",
    unexpectedEmailResponse:
      "EmailJS returned an unexpected response.",
    testEmailFailed: "Test email failed. Service ID: ",
    pestSendingEmail: "Pest detected. Sending email alert...",
    pestAlertSuccess: "Pest alert sent successfully to ",
    pestEmailFailed: "Pest detected, but email failed. ",
    pestEmailNotReady: "Pest detected, but EmailJS is not ready.",
    noEmailAddress: "No email address saved.",
    emailSentSuccessfully: "Email sent successfully",
    emailAlertFailed: "Email alert failed.",
    clearHistoryConfirm: "Clear all detection history?",
    healthyNoEmail: "No email required for healthy leaf.",
    emailPending: "Email pending",
    emailPendingShort: "Email pending",
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
    heroTitle:
      "AI ஸ்மார்ட் பூச்சி கண்டறிதல்<br>மற்றும் எச்சரிக்கை அமைப்பு",
    heroDescription:
      "இரண்டு AI மாடல்கள் மூலம் பயிர் வகை, இலை நிலை மற்றும் பூச்சிகளை கண்டறிந்து மின்னஞ்சல் எச்சரிக்கை பெறலாம்.",
    startDetection: "கண்டறிதலை தொடங்கு",
    team16: "திட்டக் குழு:",
    totalDetections: "மொத்த கண்டறிதல்கள்",
    activeThreats: "செயலில் உள்ள அச்சுறுத்தல்கள்",
    emailAlerts: "மின்னஞ்சல் எச்சரிக்கைகள்",
    aiModel: "AI மாடல்கள்",
    loading: "ஏற்றப்படுகிறது...",
    ready: "தயார்",
    error: "பிழை",
    aiVision: "AI பார்வை",
    aiPestDetection: "AI பூச்சி கண்டறிதல்",
    cameraUploadDescription:
      "கேமராவைப் பயன்படுத்தவும் அல்லது பயிர் படத்தை பதிவேற்றவும்.",
    cameraDetection: "கேமரா கண்டறிதல்",
    cameraDescription:
      "உங்கள் மொபைல் அல்லது லேப்டாப் கேமராவைப் பயன்படுத்தவும்.",
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
      "பயிர் மற்றும் பூச்சி மாடல்களின் நம்பகத்தன்மை மதிப்பெண்கள்.",
    detectImageScores:
      "மதிப்பெண்களை பார்க்க ஒரு படத்தை கண்டறியவும்.",
    notifications: "அறிவிப்புகள்",
    emailAlertsTitle: "மின்னஞ்சல் எச்சரிக்கைகள்",
    emailAlertsDescription:
      "பூச்சி எச்சரிக்கைகளைப் பெற மின்னஞ்சலை சேமிக்கவும்.",
    alertEmailConfiguration: "எச்சரிக்கை மின்னஞ்சல் அமைப்பு",
    alertEmailDescription:
      "பூச்சி எச்சரிக்கைகள் அனுப்ப வேண்டிய மின்னஞ்சலை உள்ளிடவும்.",
    emailPlaceholder: "மின்னஞ்சல் முகவரியை உள்ளிடவும்",
    saveEmail: "மின்னஞ்சலை சேமி",
    testEmail: "சோதனை மின்னஞ்சல்",
    noEmailSaved: "மின்னஞ்சல் இன்னும் சேமிக்கப்படவில்லை.",
    recentAlerts: "சமீபத்திய எச்சரிக்கைகள்",
    recentAlertsDescription: "சமீபத்திய பூச்சி கண்டறிதல் அறிவிப்புகள்.",
    alert: "எச்சரிக்கை",
    alertsPlural: "எச்சரிக்கைகள்",
    noAlerts: "எச்சரிக்கைகள் எதுவும் இல்லை.",
    detectedPestsAppear: "கண்டறியப்பட்ட பூச்சிகள் இங்கே தோன்றும்.",
    dataInsights: "தரவு பகுப்பாய்வு",
    analyticsTitle: "பகுப்பாய்வு",
    analyticsDescription:
      "பூச்சி எண்ணிக்கைகள் மற்றும் கண்டறிதல் போக்குகளைப் பார்க்கவும்.",
    pestDetectionCounts: "பூச்சி கண்டறிதல் எண்ணிக்கைகள்",
    pestDetectionCountsDescription:
      "ஒவ்வொரு பூச்சி வகையும் தனித்தனியாக காட்டப்படும்.",
    detectionTrend: "கண்டறிதல் போக்கு",
    detectionTrendDescription: "சமீபத்திய AI கண்டறிதல் செயல்பாடு.",
    detections: "கண்டறிதல்கள்",
    hardware: "வன்பொருள்",
    sensorMonitoring: "சென்சார் கண்காணிப்பு",
    sensorDescription: "ESP32-ல் இருந்து நேரடி வன்பொருள் மதிப்புகள்.",
    hardwareNotConnected: "வன்பொருள் இணைக்கப்படவில்லை",
    temperature: "வெப்பநிலை",
    waitingDHT11: "பயன்படுத்தப்படவில்லை",
    humidity: "ஈரப்பதம்",
    cropStatus: "பயிர் நிலை",
    pending: "நிலுவையில்",
    aiImageBased: "AI படத்தை அடிப்படையாகக் கொண்டது",
    esp32: "ESP32",
    offline: "ஆஃப்லைன்",
    hardwareSetupPending: "வன்பொருளுக்காக காத்திருக்கிறது",
    records: "பதிவுகள்",
    detectionHistory: "கண்டறிதல் வரலாறு",
    historyDescription:
      "அனைத்து AI கண்டறிதல்களும் பதிவு செய்யப்படும்.",
    clearHistory: "வரலாற்றை அழி",
    noHistory: "கண்டறிதல் வரலாறு இன்னும் இல்லை.",
    runDetection: "பதிவை உருவாக்க AI கண்டறிதலை இயக்கவும்.",
    healthy: "ஆரோக்கியமானது",
    emailSent: "மின்னஞ்சல் அனுப்பப்பட்டது",
    emailPendingFailed: "மின்னஞ்சல் நிலுவையில் / தோல்வி",
    confidenceText: "நம்பகத்தன்மை",
    unknownTime: "நேரம் தெரியவில்லை",
    footerProject:
      "AI ஸ்மார்ட் பூச்சி கண்டறிதல் மற்றும் எச்சரிக்கை அமைப்பு",
    footerText: "ஸ்மார்ட் விவசாயம் • AI • ESP32",
    cameraCouldNotStart: "கேமராவை தொடங்க முடியவில்லை: ",
    modelStillLoading:
      "AI மாடல்கள் இன்னும் ஏற்றப்படுகின்றன. சிறிது நேரம் கழித்து முயற்சிக்கவும்.",
    predictionFailed: "கணிப்பு தோல்வியடைந்தது: ",
    emailLibraryError:
      "EmailJS library ஏற்றப்படவில்லை. இணைய இணைப்பை சரிபார்க்கவும்.",
    emailInitializationFailed: "EmailJS தொடங்குவதில் பிழை: ",
    emailSaved: "மின்னஞ்சல் சேமிக்கப்பட்டது: ",
    pleaseEnterEmail: "மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
    validEmail: "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
    emailSavedSuccessfully: "மின்னஞ்சல் வெற்றிகரமாக சேமிக்கப்பட்டது: ",
    savedEmail: "சேமிக்கப்பட்ட மின்னஞ்சல்: ",
    enterSaveEmail: "முதலில் மின்னஞ்சலை உள்ளிட்டு சேமிக்கவும்.",
    emailNotReady: "EmailJS தயாராக இல்லை. பக்கத்தை மீண்டும் ஏற்றவும்.",
    sendingTestEmail: "சோதனை மின்னஞ்சல் அனுப்பப்படுகிறது...",
    testEmailSuccess: "சோதனை மின்னஞ்சல் வெற்றிகரமாக அனுப்பப்பட்டது: ",
    unexpectedEmailResponse: "EmailJS எதிர்பாராத பதிலை வழங்கியது.",
    testEmailFailed: "சோதனை மின்னஞ்சல் தோல்வியடைந்தது. Service ID: ",
    pestSendingEmail:
      "பூச்சி கண்டறியப்பட்டது. மின்னஞ்சல் எச்சரிக்கை அனுப்பப்படுகிறது...",
    pestAlertSuccess: "பூச்சி எச்சரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது: ",
    pestEmailFailed: "பூச்சி கண்டறியப்பட்டது, ஆனால் மின்னஞ்சல் தோல்வியடைந்தது. ",
    pestEmailNotReady: "பூச்சி கண்டறியப்பட்டது, ஆனால் EmailJS தயாராக இல்லை.",
    noEmailAddress: "மின்னஞ்சல் முகவரி சேமிக்கப்படவில்லை.",
    emailSentSuccessfully: "மின்னஞ்சல் வெற்றிகரமாக அனுப்பப்பட்டது",
    emailAlertFailed: "மின்னஞ்சல் எச்சரிக்கை தோல்வியடைந்தது.",
    clearHistoryConfirm: "அனைத்து கண்டறிதல் வரலாற்றையும் அழிக்க வேண்டுமா?",
    healthyNoEmail: "ஆரோக்கியமான இலைக்கு மின்னஞ்சல் தேவையில்லை.",
    emailPending: "மின்னஞ்சல் நிலுவையில் உள்ளது",
    emailPendingShort: "மின்னஞ்சல் நிலுவையில்",
    languageEnglish: "ஆங்கிலம்",
    languageTamil: "தமிழ்"
  }
};


/* =========================
   TRANSLATION HELPER
========================= */

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
  const selector = document.getElementById("languageSelector");

  if (!selector) return;

  selector.value = currentLanguage;
  applyLanguage();

  selector.addEventListener("change", () => {
    currentLanguage = selector.value;

    localStorage.setItem("dashboardLanguage", currentLanguage);

    applyLanguage();
    renderHistory();
    renderAlerts();
    updatePestChart();
    updateTrendChart();
    updateESP32Dashboard(esp32Data);
  });
}

function applyLanguage() {
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    const translated = t(key);

    if (element.tagName === "INPUT" && element.placeholder !== undefined) {
      element.placeholder = translated;
    } else {
      element.innerHTML = translated;
    }
  });

  const emailInput = document.getElementById("alertEmail");
  if (emailInput) {
    emailInput.placeholder = t("emailPlaceholder");
  }

  const predictionName = document.getElementById("predictionName");

  if (
    predictionName &&
    (
      predictionName.textContent === "Waiting for image..." ||
      predictionName.textContent === "படத்திற்காக காத்திருக்கிறது..."
    )
  ) {
    predictionName.textContent = t("waitingImage");
  }
}
/* =========================================================
   PART 2 — NAVIGATION, EMAILJS & CAMERA
   Continue after Part 1
========================================================= */


/* =========================
   DOM HELPER
========================= */

function $(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = value;
}

function setStatus(id, message, className = "") {
  const element = $(id);
  if (!element) return;

  element.textContent = message;

  if (className) {
    element.className = className;
  }
}


/* =========================
   DASHBOARD NAVIGATION
========================= */

function setupNavigation() {
  document.querySelectorAll("[data-section]").forEach(button => {
    button.addEventListener("click", () => {
      const sectionId = button.dataset.section;

      document.querySelectorAll(".dashboard-section").forEach(section => {
        section.classList.remove("active");
      });

      const target = $(sectionId);

      if (target) {
        target.classList.add("active");
      }

      document.querySelectorAll("[data-section]").forEach(navButton => {
        navButton.classList.toggle("active", navButton === button);
      });
    });
  });

  const startDetectionButton = $("startDetection");

  if (startDetectionButton) {
    startDetectionButton.addEventListener("click", () => {
      const detectionSection = $("detectionSection");

      if (detectionSection) {
        detectionSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  }
}


/* =========================
   EMAILJS INITIALIZATION
========================= */

function initializeEmailJS() {
  if (
    typeof emailjs === "undefined" ||
    typeof emailjs.init !== "function"
  ) {
    emailJSReady = false;

    setStatus(
      "emailStatus",
      t("emailLibraryError"),
      "status-error"
    );

    return;
  }

  try {
    emailjs.init({
      publicKey: EMAIL_PUBLIC_KEY
    });

    emailJSReady = true;

    if (savedEmail) {
      setText("emailStatus", t("savedEmail") + savedEmail);
    } else {
      setText("emailStatus", t("noEmailSaved"));
    }
  } catch (error) {
    emailJSReady = false;

    setStatus(
      "emailStatus",
      t("emailInitializationFailed") + error.message,
      "status-error"
    );
  }
}


/* =========================
   SAVE ALERT EMAIL
========================= */

function setupEmailConfiguration() {
  const saveButton = $("saveEmail");
  const testButton = $("testEmail");
  const emailInput = $("alertEmail");

  if (emailInput && savedEmail) {
    emailInput.value = savedEmail;
  }

  if (saveButton) {
    saveButton.addEventListener("click", saveAlertEmail);
  }

  if (testButton) {
    testButton.addEventListener("click", sendTestEmail);
  }
}

function saveAlertEmail() {
  const emailInput = $("alertEmail");

  if (!emailInput) return;

  const email = emailInput.value.trim();

  if (!email) {
    setStatus(
      "emailStatus",
      t("pleaseEnterEmail"),
      "status-error"
    );
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    setStatus(
      "emailStatus",
      t("validEmail"),
      "status-error"
    );
    return;
  }

  savedEmail = email;

  localStorage.setItem("agriAlertEmail", savedEmail);

  setStatus(
    "emailStatus",
    t("emailSavedSuccessfully") + savedEmail,
    "status-success"
  );
}


/* =========================
   EMAILJS SEND HELPER
========================= */

async function sendEmail(templateParams) {
  if (!emailJSReady || typeof emailjs === "undefined") {
    throw new Error(t("emailNotReady"));
  }

  return emailjs.send(
    EMAIL_SERVICE_ID,
    EMAIL_TEMPLATE_ID,
    templateParams
  );
}


/* =========================
   TEST EMAIL
========================= */

async function sendTestEmail() {
  if (!savedEmail) {
    setStatus(
      "emailStatus",
      t("enterSaveEmail"),
      "status-error"
    );
    return;
  }

  if (!emailJSReady) {
    setStatus(
      "emailStatus",
      t("emailNotReady"),
      "status-error"
    );
    return;
  }

  setStatus(
    "emailStatus",
    t("sendingTestEmail"),
    "status-pending"
  );

  try {
    const response = await sendEmail({
      to_email: savedEmail,
      email: savedEmail,
      subject: "AI Smart Pest Detection — Test Alert",
      message:
        "This is a test email from the AI-Based Multi-Crop Pest Detection and Smart Alert System.",
      crop_name: "System Test",
      crop_status: "Test",
      pest_name: "No_Pest",
      confidence: "100%"
    });

    if (response && response.status === 200) {
      setStatus(
        "emailStatus",
        t("testEmailSuccess") + savedEmail,
        "status-success"
      );
    } else {
      setStatus(
        "emailStatus",
        t("unexpectedEmailResponse"),
        "status-error"
      );
    }
  } catch (error) {
    setStatus(
      "emailStatus",
      t("testEmailFailed") + error.message,
      "status-error"
    );
  }
}


/* =========================
   CAMERA SETUP
========================= */

function setupCameraControls() {
  const startButton = $("startCamera");
  const captureButton = $("captureImage");
  const stopButton = $("stopCamera");
  const uploadInput = $("imageUpload");

  if (startButton) {
    startButton.addEventListener("click", startCamera);
  }

  if (captureButton) {
    captureButton.addEventListener("click", captureCameraImage);
  }

  if (stopButton) {
    stopButton.addEventListener("click", stopCamera);
  }

  if (uploadInput) {
    uploadInput.addEventListener("change", handleImageUpload);
  }

  updateCameraButtons(false);
}


/* =========================
   START CAMERA
========================= */

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus(
      "predictionDetails",
      "Camera access is unavailable. Use HTTPS or upload an image.",
      "status-error"
    );
    return;
  }

  stopCamera();

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentFacingMode
      },
      audio: false
    });

    const video = $("camera");

    if (!video) {
      stopCamera();
      return;
    }

    video.srcObject = cameraStream;
    video.hidden = false;

    await video.play();

    const placeholder = $("cameraPlaceholder");

    if (placeholder) {
      placeholder.hidden = true;
    }

    updateCameraButtons(true);

    setText("predictionDetails", "Camera ready. Capture an image to detect.");

  } catch (error) {
    stopCamera();

    setStatus(
      "predictionDetails",
      t("cameraCouldNotStart") + error.message,
      "status-error"
    );
  }
}


/* =========================
   CAMERA BUTTON STATES
========================= */

function updateCameraButtons(cameraRunning) {
  const captureButton = $("captureImage");
  const stopButton = $("stopCamera");

  if (captureButton) {
    captureButton.disabled = !cameraRunning;
  }

  if (stopButton) {
    stopButton.disabled = !cameraRunning;
  }
}


/* =========================
   CAPTURE CAMERA IMAGE
========================= */

async function captureCameraImage() {
  const video = $("camera");

  if (
    !video ||
    !video.srcObject ||
    video.videoWidth === 0 ||
    video.videoHeight === 0
  ) {
    setStatus(
      "predictionDetails",
      "Camera is not ready. Start the camera first.",
      "status-error"
    );
    return;
  }

  const canvas = document.createElement("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    setStatus(
      "predictionDetails",
      "Unable to capture the camera image.",
      "status-error"
    );
    return;
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const image = new Image();

  image.onload = async () => {
    await runPrediction(image);
  };

  image.onerror = () => {
    setStatus(
      "predictionDetails",
      "Unable to process the captured image.",
      "status-error"
    );
  };

  image.src = canvas.toDataURL("image/jpeg", 0.92);
}


/* =========================
   STOP CAMERA
========================= */

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }

  const video = $("camera");

  if (video) {
    video.pause();
    video.srcObject = null;
    video.hidden = true;
  }

  const placeholder = $("cameraPlaceholder");

  if (placeholder) {
    placeholder.hidden = false;
  }

  updateCameraButtons(false);
}


/* =========================
   HANDLE IMAGE UPLOAD
========================= */

function handleImageUpload(event) {
  const file = event.target.files && event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setStatus(
      "predictionDetails",
      "Please select a valid image file.",
      "status-error"
    );
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();

    image.onload = async () => {
      const uploadedImage = $("uploadedImage");

      if (uploadedImage) {
        uploadedImage.src = image.src;
        uploadedImage.hidden = false;
      }

      await runPrediction(image);
    };

    image.onerror = () => {
      setStatus(
        "predictionDetails",
        "Unable to load the selected image.",
        "status-error"
      );
    };

    image.src = reader.result;
  };

  reader.onerror = () => {
    setStatus(
      "predictionDetails",
      "Unable to read the selected file.",
      "status-error"
    );
  };

  reader.readAsDataURL(file);
}
/* =========================================================
   PART 3 — LOAD AI MODELS & DETECT CROP / PEST
   Continue after Part 2
========================================================= */


/* =========================
   LOAD BOTH AI MODELS
========================= */

async function loadAIModels() {
  setText("modelStatus", "Loading both AI models...");

  try {
    if (typeof tmImage === "undefined") {
      throw new Error(
        "Teachable Machine library not loaded. Check the script tag in index.html."
      );
    }

    const cropBase = CROP_MODEL_URL.replace(/\/?$/, "/");
    const pestBase = PEST_MODEL_URL.replace(/\/?$/, "/");

    // Load crop type and health model
    cropModel = await tmImage.load(
      cropBase + "model.json",
      cropBase + "metadata.json"
    );

    // Load pest classification model
    pestModel = await tmImage.load(
      pestBase + "model.json",
      pestBase + "metadata.json"
    );

    cropModelClasses = cropModel.getTotalClasses();
    pestModelClasses = pestModel.getTotalClasses();

    setText("modelStatus", "2 AI Models Ready");
    setText("apiStatus", "AI Ready");

    console.log("Crop model classes:", cropModelClasses);
    console.log("Pest model classes:", pestModelClasses);

    return true;

  } catch (error) {
    cropModel = null;
    pestModel = null;

    setText("modelStatus", "Model Loading Failed");
    setText("apiStatus", "AI Error");

    console.error("AI model loading error:", error);

    setStatus(
      "predictionDetails",
      "Unable to load AI models: " + error.message,
      "status-error"
    );

    return false;
  }
}


/* =========================
   NORMALIZE CLASS NAMES
========================= */

function normalizeClassName(name) {
  return String(name || "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}


/* =========================
   IDENTIFY CROP & HEALTH
========================= */

function parseCropPrediction(prediction) {
  const rawName = prediction.className || "";
  const normalized = normalizeClassName(rawName);

  const crops = [
    "paddy",
    "chilli",
    "cotton",
    "tomato",
    "brinjal"
  ];

  const crop = crops.find(name =>
    normalized.includes(name)
  );

  let status = "Unknown";

  if (normalized.includes("healthy")) {
    status = "Healthy";
  } else if (
    normalized.includes("affected") ||
    normalized.includes("diseased") ||
    normalized.includes("unhealthy")
  ) {
    status = "Affected";
  }

  return {
    crop: crop
      ? crop.charAt(0).toUpperCase() + crop.slice(1)
      : "Unknown",

    status: status,

    className: rawName,

    confidence: Number(prediction.probability) || 0
  };
}


/* =========================
   IDENTIFY PEST
========================= */

function parsePestPrediction(prediction) {
  const rawName = prediction.className || "";
  const normalized = normalizeClassName(rawName);

  const pestClasses = [
    "caterpillar",
    "aphid",
    "thrips",
    "whitefly",
    "other_pest",
    "no_pest"
  ];

  const pest = pestClasses.find(name =>
    normalized === name ||
    normalized.includes(name)
  );

  const pestLabels = {
    caterpillar: "Caterpillar",
    aphid: "Aphid",
    thrips: "Thrips",
    whitefly: "Whitefly",
    other_pest: "Other_Pest",
    no_pest: "No_Pest"
  };

  return {
    pest: pest ? pestLabels[pest] : rawName || "Unknown",
    className: rawName,
    confidence: Number(prediction.probability) || 0
  };
}


/* =========================
   RUN BOTH PREDICTIONS
========================= */

async function runPrediction(image) {
  if (!cropModel || !pestModel) {
    setStatus(
      "predictionDetails",
      t("modelStillLoading"),
      "status-error"
    );
    return;
  }

  setText("predictionName", "Analyzing image...");
  setText("predictionDetails", "Running crop and pest AI models...");
  setText("predictionConfidence", "--");

  try {
    // Model 1: Crop type and health
    const cropPredictions = await cropModel.predict(image);

    // Model 2: Pest classification
    const pestPredictions = await pestModel.predict(image);

    const bestCrop = cropPredictions.reduce((best, item) =>
      item.probability > best.probability ? item : best
    );

    const bestPest = pestPredictions.reduce((best, item) =>
      item.probability > best.probability ? item : best
    );

    const cropResult = parseCropPrediction(bestCrop);
    const pestResult = parsePestPrediction(bestPest);

    const result = {
      crop: cropResult.crop,
      cropStatus: cropResult.status,
      cropClass: cropResult.className,
      cropConfidence: cropResult.confidence,

      pest: pestResult.pest,
      pestClass: pestResult.className,
      pestConfidence: pestResult.confidence,

      timestamp: new Date().toISOString()
    };

    // Display result and update dashboard
    displayPredictionResult(result);

    // Save the detection to history and update analytics
    saveDetectionRecord(result);

    // Send email only when a pest is detected
    if (result.pest !== "No_Pest" && result.pest !== "Unknown") {
      await handlePestAlert(result);
    }

    console.log("AI prediction result:", result);

  } catch (error) {
    console.error("Prediction error:", error);

    setStatus(
      "predictionDetails",
      t("predictionFailed") + error.message,
      "status-error"
    );
  }
}


/* =========================
   DISPLAY PREDICTION RESULT
========================= */

function displayPredictionResult(result) {
  const cropStatusText =
    result.cropStatus === "Healthy"
      ? t("healthy")
      : result.cropStatus === "Affected"
        ? "Affected"
        : "Unknown";

  const pestText =
    result.pest === "No_Pest"
      ? "No Pest"
      : result.pest.replace(/_/g, " ");

  setText(
    "predictionName",
    `${result.crop} — ${cropStatusText}`
  );

  setText(
    "predictionDetails",
    `Pest: ${pestText}`
  );

  setText(
    "predictionConfidence",
    `${(result.pestConfidence * 100).toFixed(1)}%`
  );

  // Update crop health information if the element exists
  setText("cropStatusValue", cropStatusText);
  setText("cropNameValue", result.crop);
  setText("pestNameValue", pestText);

  // Display confidence scores from both models
  renderPredictionScores(result);

  // Show the current result in the dashboard
  const resultPanel = $("predictionResult");

  if (resultPanel) {
    resultPanel.hidden = false;
  }
}


/* =========================
   RENDER CONFIDENCE SCORES
========================= */

function renderPredictionScores(result) {
  const container = $("predictionScores");

  if (!container) return;

  container.replaceChildren();

  const scores = [
    {
      label: "Crop: " + result.crop,
      value: result.cropConfidence
    },
    {
      label: "Crop Health: " + result.cropStatus,
      value: result.cropConfidence
    },
    {
      label: "Pest: " + result.pest.replace(/_/g, " "),
      value: result.pestConfidence
    }
  ];

  scores.forEach(score => {
    const wrapper = document.createElement("div");
    wrapper.className = "prediction-score";

    const label = document.createElement("div");
    label.className = "prediction-score-label";
    label.textContent = score.label;

    const track = document.createElement("div");
    track.className = "prediction-score-track";

    const bar = document.createElement("div");
    bar.className = "prediction-score-bar";

    const percent = Math.max(
      0,
      Math.min(100, score.value * 100)
    );

    bar.style.width = `${percent}%`;

    const value = document.createElement("span");
    value.className = "prediction-score-value";
    value.textContent = `${percent.toFixed(1)}%`;

    track.appendChild(bar);

    wrapper.appendChild(label);
    wrapper.appendChild(track);
    wrapper.appendChild(value);

    container.appendChild(wrapper);
  });
}
