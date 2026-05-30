const STORAGE_KEY = "intern-time-records";
const SESSION_KEY = "intern-time-session";
const STUDENTS_KEY = "intern-time-students";

const state = {
  role: "student",
  user: null,
  activeView: "studentView",
  isCheckingIn: false,
  selectedPhoto: null,
  selectedPhotoName: "",
  selectedProfilePhoto: "",
  selectedProfilePhotoName: "",
  currentDateKey: null,
  historyVisibleCount: 5,
  editingStudentId: null,
};

const DAY_ROLLOVER_CHECK_MS = 60 * 1000;
const HISTORY_PAGE_SIZE = 5;

const demoStudents = [
  { id: "65010001", name: "ภัทรพล ใจดี", major: "เทคโนโลยีสารสนเทศ" },
  { id: "65010002", name: "ณัฐชา แก้วใส", major: "คอมพิวเตอร์ธุรกิจ" },
  { id: "65010003", name: "กานต์ธีรา วงศ์สวัสดิ์", major: "วิทยาการคอมพิวเตอร์" },
];

const elements = {
  loginScreen: document.querySelector("#loginScreen"),
  dashboard: document.querySelector("#dashboard"),
  loginForm: document.querySelector("#loginForm"),
  roleOptions: document.querySelectorAll(".role-option"),
  userId: document.querySelector("#userId"),
  password: document.querySelector("#password"),
  welcomeTitle: document.querySelector("#welcomeTitle"),
  topbarAvatarInitial: document.querySelector("#topbarAvatarInitial"),
  topbarAvatarImg: document.querySelector("#topbarAvatarImg"),
  logoutBtn: document.querySelector("#logoutBtn"),
  refreshBtn: document.querySelector("#refreshBtn"),
  mobileMenuToggle: document.querySelector("#mobileMenuToggle"),
  mobileMenuBackdrop: document.querySelector("#mobileMenuBackdrop"),
  mobileMenuClose: document.querySelector("#mobileMenuClose"),
  mobileLogoutBtn: document.querySelector("#mobileLogoutBtn"),
  mobileRefreshBtn: document.querySelector("#mobileRefreshBtn"),
  mobileBottomDock: document.querySelector("#mobileBottomDock"),
  navItems: document.querySelectorAll(".nav-item"),
  views: document.querySelectorAll(".view"),
  adminOnly: document.querySelectorAll(".admin-only"),
  studentOnly: document.querySelectorAll(".student-only"),
  currentDate: document.querySelector("#currentDate"),
  todayStatus: document.querySelector("#todayStatus"),
  todayMeta: document.querySelector("#todayMeta"),
  statusPill: document.querySelector("#statusPill"),
  cameraInput: document.querySelector("#cameraInput"),
  photoPickerBtn: document.querySelector("#photoPickerBtn"),
  photoInput: document.querySelector("#photoInput"),
  photoEmpty: document.querySelector("#photoEmpty"),
  photoPreview: document.querySelector("#photoPreview"),
  photoLabel: document.querySelector("#photoLabel"),
  locationText: document.querySelector("#locationText"),
  internRuleTitle: document.querySelector("#internRuleTitle"),
  internRuleText: document.querySelector("#internRuleText"),
  checkInBtn: document.querySelector("#checkInBtn"),
  checkOutBtn: document.querySelector("#checkOutBtn"),
  summaryDate: document.querySelector("#summaryDate"),
  summaryIn: document.querySelector("#summaryIn"),
  summaryOut: document.querySelector("#summaryOut"),
  summaryStatus: document.querySelector("#summaryStatus"),
  historyList: document.querySelector("#historyList"),
  adminTable: document.querySelector("#adminTable"),
  adminSearch: document.querySelector("#adminSearch"),
  adminDateFilter: document.querySelector("#adminDateFilter"),
  adminStatusFilter: document.querySelector("#adminStatusFilter"),
  adminClearDateFilter: document.querySelector("#adminClearDateFilter"),
  statCheckedIn: document.querySelector("#statCheckedIn"),
  statActive: document.querySelector("#statActive"),
  statTotal: document.querySelector("#statTotal"),
  adminDashboardDate: document.querySelector("#adminDashboardDate"),
  adminDashStudents: document.querySelector("#adminDashStudents"),
  adminDashCheckedIn: document.querySelector("#adminDashCheckedIn"),
  adminDashActive: document.querySelector("#adminDashActive"),
  adminDashDone: document.querySelector("#adminDashDone"),
  adminDashMissing: document.querySelector("#adminDashMissing"),
  adminDashLatestList: document.querySelector("#adminDashLatestList"),
  adminDashMissingList: document.querySelector("#adminDashMissingList"),
  accountFormTitle: document.querySelector("#accountFormTitle"),
  accountForm: document.querySelector("#accountForm"),
  accountStudentId: document.querySelector("#accountStudentId"),
  accountStudentName: document.querySelector("#accountStudentName"),
  accountStudentMajor: document.querySelector("#accountStudentMajor"),
  accountStudentPassword: document.querySelector("#accountStudentPassword"),
  accountWorkplace: document.querySelector("#accountWorkplace"),
  accountStartTime: document.querySelector("#accountStartTime"),
  accountEndTime: document.querySelector("#accountEndTime"),
  accountMapsLink: document.querySelector("#accountMapsLink"),
  accountRadius: document.querySelector("#accountRadius"),
  accountSubmitBtn: document.querySelector("#accountSubmitBtn"),
  accountCancelEditBtn: document.querySelector("#accountCancelEditBtn"),
  studentAccountList: document.querySelector("#studentAccountList"),
  studentProfileForm: document.querySelector("#studentProfileForm"),
  profilePhotoInput: document.querySelector("#profilePhotoInput"),
  profilePhotoBtn: document.querySelector("#profilePhotoBtn"),
  profilePhotoName: document.querySelector("#profilePhotoName"),
  profileAvatarInitial: document.querySelector("#profileAvatarInitial"),
  profileAvatarImg: document.querySelector("#profileAvatarImg"),
  profileStudentId: document.querySelector("#profileStudentId"),
  profileStudentName: document.querySelector("#profileStudentName"),
  profileStudentMajor: document.querySelector("#profileStudentMajor"),
  profileCurrentPassword: document.querySelector("#profileCurrentPassword"),
  profileNewPassword: document.querySelector("#profileNewPassword"),
  profileConfirmPassword: document.querySelector("#profileConfirmPassword"),
  exportBtn: document.querySelector("#exportBtn"),
  toast: document.querySelector("#toast"),
  modal: document.querySelector("#appModal"),
  modalIcon: document.querySelector("#modalIcon"),
  modalTitle: document.querySelector("#modalTitle"),
  modalMessage: document.querySelector("#modalMessage"),
  modalActions: document.querySelector("#modalActions"),
  modalCancelBtn: document.querySelector("#modalCancelBtn"),
  modalConfirmBtn: document.querySelector("#modalConfirmBtn"),
};

const formatDate = new Intl.DateTimeFormat("th-TH", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatTime = new Intl.DateTimeFormat("th-TH", {
  hour: "2-digit",
  minute: "2-digit",
});

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return localDateKey();
}

function prettyDate(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return formatDate.format(new Date(year, month - 1, day));
  }
  return formatDate.format(new Date(value));
}

function prettyTime(value) {
  return value ? formatTime.format(new Date(value)) : "-";
}

function getRecords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const records = JSON.parse(raw);
    return migrateRecords(records);
  }

  const seed = [
    {
      id: crypto.randomUUID(),
      studentId: "65010002",
      studentName: "ณัฐชา แก้วใส",
      date: todayKey(),
      checkIn: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      checkOut: "",
      status: "กำลังฝึกงาน",
      location: { lat: 14.978, lng: 102.098 },
      photo: "",
    },
    {
      id: crypto.randomUUID(),
      studentId: "65010003",
      studentName: "กานต์ธีรา วงศ์สวัสดิ์",
      date: localDateKey(new Date(Date.now() - 86400000)),
      checkIn: new Date(Date.now() - 86400000 - 1000 * 60 * 260).toISOString(),
      checkOut: new Date(Date.now() - 86400000 + 1000 * 60 * 160).toISOString(),
      status: "เสร็จสิ้น",
      location: { lat: 14.982, lng: 102.105 },
      photo: "",
    },
  ];
  saveRecords(seed);
  return seed;
}

function saveRecords(records) {
  const compactRecords = records.map(compactRecord);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compactRecords));
  } catch (error) {
    if (error?.name !== "QuotaExceededError") {
      throw error;
    }

    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compactRecords));
  }
}

function compactRecord(record) {
  const hasPhoto = Boolean(record.photo || record.photoName || record.hasPhoto);
  return {
    ...record,
    photo: "",
    photoName: record.photoName || "",
    hasPhoto,
  };
}

function migrateRecords(records) {
  let changed = false;
  const compactRecords = records.map((record) => {
    if (typeof record.photo === "string" && record.photo.startsWith("data:image")) {
      changed = true;
    }
    return compactRecord(record);
  });

  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compactRecords));
  }

  return compactRecords;
}

function baseStudents() {
  return demoStudents.map((student) => ({
    ...student,
    password: "student123",
  }));
}

function normalizeStudent(student) {
  const workplace = student.workplace || {};
  const lat = Number(workplace.lat);
  const lng = Number(workplace.lng);
  const radius = Number(workplace.radius);
  return {
    id: String(student.id || "").trim(),
    name: String(student.name || "").trim(),
    major: String(student.major || "").trim() || "ไม่ระบุสาขา",
    password: String(student.password || "student123"),
    profilePhoto: String(student.profilePhoto || ""),
    workplace: {
      name: String(workplace.name || "").trim(),
      mapLink: String(workplace.mapLink || "").trim(),
      startTime: String(workplace.startTime || ""),
      endTime: String(workplace.endTime || ""),
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      radius: Number.isFinite(radius) && radius > 0 ? radius : 200,
    },
  };
}

function getStudents() {
  const raw = localStorage.getItem(STUDENTS_KEY);
  if (!raw) {
    const seed = baseStudents();
    saveStudents(seed);
    return seed;
  }

  const storedStudents = JSON.parse(raw).map(normalizeStudent).filter((student) => student.id && student.name);
  const merged = [...storedStudents];
  baseStudents().forEach((student) => {
    if (!merged.some((item) => item.id === student.id)) {
      merged.push(student);
    }
  });
  return merged;
}

function saveStudents(students) {
  const uniqueStudents = [];
  students.map(normalizeStudent).forEach((student) => {
    if (!student.id || !student.name) {
      return;
    }

    const existingIndex = uniqueStudents.findIndex((item) => item.id === student.id);
    if (existingIndex >= 0) {
      uniqueStudents[existingIndex] = student;
    } else {
      uniqueStudents.push(student);
    }
  });
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(uniqueStudents));
}

function currentStudent() {
  const found = getStudents().find((student) => student.id === elements.userId.value.trim());
  return found || {
    id: elements.userId.value.trim() || "65010001",
    name: "นักศึกษาฝึกงาน",
    major: "ไม่ระบุสาขา",
    profilePhoto: "",
  };
}

function validLatLng(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function parseCoordinatePair(text) {
  const match = String(text || "").match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) {
    return null;
  }

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  return validLatLng(lat, lng) ? { lat, lng } : null;
}

function parseGoogleMapsCoordinates(value) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  const bangCoords = text.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (bangCoords) {
    const lat = Number(bangCoords[1]);
    const lng = Number(bangCoords[2]);
    if (validLatLng(lat, lng)) {
      return { lat, lng };
    }
  }

  const atCoords = text.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (atCoords) {
    const lat = Number(atCoords[1]);
    const lng = Number(atCoords[2]);
    if (validLatLng(lat, lng)) {
      return { lat, lng };
    }
  }

  try {
    const url = new URL(text);
    for (const key of ["q", "query", "ll", "center"]) {
      const coords = parseCoordinatePair(url.searchParams.get(key));
      if (coords) {
        return coords;
      }
    }
  } catch {
    // Not a URL; it may still be a plain coordinate pair.
  }

  return parseCoordinatePair(text);
}

function validationErrorId(element) {
  return `${element.id || element.dataset.validationId}Error`;
}

function ensureFieldError(element) {
  const errorId = validationErrorId(element);
  let error = document.querySelector(`#${errorId}`);
  if (!error) {
    error = document.createElement("small");
    error.className = "field-error";
    error.id = errorId;
    element.insertAdjacentElement("afterend", error);
  }
  return error;
}

function setFieldError(element, message) {
  const error = ensureFieldError(element);
  error.textContent = message;
  element.classList.add("field-invalid");
  element.setAttribute("aria-invalid", "true");
  element.setAttribute("aria-describedby", validationErrorId(element));
}

function clearFieldError(element) {
  const error = document.querySelector(`#${validationErrorId(element)}`);
  if (error) {
    error.textContent = "";
  }
  element.classList.remove("field-invalid");
  element.removeAttribute("aria-invalid");
  element.removeAttribute("aria-describedby");
}

function clearAllFieldErrors(scope = document) {
  scope.querySelectorAll(".field-invalid").forEach((element) => clearFieldError(element));
  scope.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
}

function validateRequiredFields(fields) {
  let firstInvalid = null;

  fields.forEach(({ element, message }) => {
    if (String(element.value || "").trim()) {
      clearFieldError(element);
      return;
    }

    setFieldError(element, message);
    firstInvalid ||= element;
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return false;
  }

  return true;
}

function validateAccountForm() {
  const hasRequiredValues = validateRequiredFields([
    { element: elements.accountStudentId, message: "กรุณากรอกรหัสนักศึกษา" },
    { element: elements.accountStudentName, message: "กรุณากรอกชื่อนักศึกษา" },
    { element: elements.accountStudentMajor, message: "กรุณากรอกสาขา" },
    { element: elements.accountStudentPassword, message: "กรุณากำหนดรหัสผ่าน" },
    { element: elements.accountWorkplace, message: "กรุณากรอกสถานที่ฝึกงาน" },
    { element: elements.accountStartTime, message: "กรุณาเลือกเวลาเข้างาน" },
    { element: elements.accountEndTime, message: "กรุณาเลือกเวลาเลิกงาน" },
    { element: elements.accountMapsLink, message: "กรุณาวาง Google Maps Link หรือพิกัด" },
    { element: elements.accountRadius, message: "กรุณากำหนดรัศมีที่ยอมรับ" },
  ]);

  if (!hasRequiredValues) {
    return null;
  }

  const coordinates = parseGoogleMapsCoordinates(elements.accountMapsLink.value);
  if (!coordinates) {
    setFieldError(
      elements.accountMapsLink,
      "ระบบอ่านพิกัดจากลิงก์นี้ไม่ได้ กรุณาวางลิงก์ที่มีพิกัด หรือพิมพ์ 13.7563,100.5018",
    );
    elements.accountMapsLink.focus();
    return null;
  }
  clearFieldError(elements.accountMapsLink);

  const radius = Number(elements.accountRadius.value);
  if (!Number.isFinite(radius) || radius < 50) {
    setFieldError(elements.accountRadius, "กรุณากำหนดรัศมีอย่างน้อย 50 เมตร");
    elements.accountRadius.focus();
    return null;
  }
  clearFieldError(elements.accountRadius);

  if (elements.accountStartTime.value && elements.accountEndTime.value && elements.accountStartTime.value >= elements.accountEndTime.value) {
    setFieldError(elements.accountEndTime, "เวลาเลิกงานต้องมากกว่าเวลาเข้างาน");
    elements.accountEndTime.focus();
    return null;
  }
  clearFieldError(elements.accountEndTime);

  return coordinates;
}

function setupInlineValidation() {
  [
    elements.userId,
    elements.password,
    elements.accountStudentId,
    elements.accountStudentName,
    elements.accountStudentMajor,
    elements.accountStudentPassword,
    elements.accountWorkplace,
    elements.accountStartTime,
    elements.accountEndTime,
    elements.accountMapsLink,
    elements.accountRadius,
    elements.profileCurrentPassword,
    elements.profileNewPassword,
    elements.profileConfirmPassword,
  ].forEach((element) => {
    element?.addEventListener("input", () => clearFieldError(element));
    element?.addEventListener("change", () => clearFieldError(element));
  });
}

function avatarInitial(user = state.user) {
  return String(user?.name || user?.id || "I").trim().charAt(0).toUpperCase() || "I";
}

function renderAvatar(initialElement, imageElement, user = state.user) {
  if (!initialElement || !imageElement) {
    return;
  }

  initialElement.textContent = avatarInitial(user);
  if (user?.profilePhoto) {
    imageElement.src = user.profilePhoto;
    imageElement.classList.remove("hidden");
    initialElement.classList.add("hidden");
  } else {
    imageElement.removeAttribute("src");
    imageElement.classList.add("hidden");
    initialElement.classList.remove("hidden");
  }
}

function updateShellProfile() {
  renderAvatar(elements.topbarAvatarInitial, elements.topbarAvatarImg, state.user);
}

function hasWorkplaceRule(student = state.user) {
  const workplace = student?.workplace;
  return Boolean(
    workplace?.name &&
      workplace?.startTime &&
      workplace?.endTime &&
      Number.isFinite(Number(workplace.lat)) &&
      Number.isFinite(Number(workplace.lng)) &&
      Number(workplace.radius) > 0,
  );
}

function formatWorkplaceRule(student = state.user) {
  if (!hasWorkplaceRule(student)) {
    return "Admin ยังไม่ได้ตั้งค่าสถานที่และเวลาฝึกงาน";
  }

  const workplace = student.workplace;
  return `${workplace.name} · เวลา ${workplace.startTime}-${workplace.endTime} · รัศมี ${workplace.radius} เมตร`;
}

function distanceMeters(from, to) {
  const earthRadius = 6371000;
  const toRadians = (value) => (value * Math.PI) / 180;
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isLateForWork(startTime, date = new Date()) {
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
    return false;
  }

  const [hour, minute] = startTime.split(":").map(Number);
  const start = new Date(date);
  start.setHours(hour, minute, 0, 0);
  return date > start;
}

function validateWorkplacePosition(position) {
  if (!hasWorkplaceRule()) {
    return { distance: null, rule: null };
  }

  const workplace = state.user.workplace;
  const current = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
  const target = {
    lat: Number(workplace.lat),
    lng: Number(workplace.lng),
  };
  const distance = Math.round(distanceMeters(current, target));

  if (distance > Number(workplace.radius)) {
    throw new Error(`คุณอยู่นอกพื้นที่ ${workplace.name} ระยะห่างประมาณ ${distance} เมตร ต้องอยู่ในรัศมี ${workplace.radius} เมตร`);
  }

  return { distance, rule: workplace };
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 2800);
}

function closeModal() {
  elements.modal.classList.add("hidden");
  elements.modalActions.classList.remove("photo-actions-centered");
  elements.modalConfirmBtn.onclick = null;
  elements.modalCancelBtn.onclick = null;
  elements.modalActions.innerHTML = `
    <button class="secondary-btn" id="modalCancelBtn" type="button">ยกเลิก</button>
    <button class="primary-btn" id="modalConfirmBtn" type="button">ยืนยัน</button>
  `;
  elements.modalCancelBtn = document.querySelector("#modalCancelBtn");
  elements.modalConfirmBtn = document.querySelector("#modalConfirmBtn");
}

function showModal({
  title,
  message,
  icon = "!",
  confirmText = "ตกลง",
  cancelText = "ยกเลิก",
  confirmClass = "primary-btn",
  showCancel = false,
}) {
  return new Promise((resolve) => {
    elements.modalIcon.textContent = icon;
    elements.modalTitle.textContent = title;
    elements.modalMessage.textContent = message;
    elements.modalConfirmBtn.textContent = confirmText;
    elements.modalCancelBtn.textContent = cancelText;
    elements.modalCancelBtn.classList.toggle("hidden", !showCancel);
    elements.modalActions.classList.toggle("single-action", !showCancel);
    elements.modalConfirmBtn.className = confirmClass;

    const finish = (value) => {
      closeModal();
      resolve(value);
    };

    elements.modalConfirmBtn.onclick = () => finish(true);
    elements.modalCancelBtn.onclick = () => finish(false);
    elements.modal.onclick = (event) => {
      if (event.target === elements.modal) {
        finish(false);
      }
    };

    elements.modal.classList.remove("hidden");
    elements.modalConfirmBtn.focus();
  });
}

function showAlert(title, message, icon = "!") {
  return showModal({
    title,
    message,
    icon,
    confirmText: "ตกลง",
    showCancel: false,
  });
}

function isMobilePhotoCapture() {
  return window.matchMedia("(max-width: 820px), (pointer: coarse)").matches;
}

function selectPhotoSource(source) {
  const input = source === "camera" ? elements.cameraInput : elements.photoInput;
  input.value = "";
  input.click();
  closeModal();
}

function showPhotoChoice() {
  elements.modalIcon.textContent = "▣";
  elements.modalTitle.textContent = "เพิ่มรูปภาพ";
  elements.modalMessage.textContent = "ต้องการถ่ายภาพใหม่หรือเลือกรูปภาพจากเครื่อง";
  elements.modalActions.classList.remove("single-action");
  const showCameraChoice = isMobilePhotoCapture();
  elements.modalActions.classList.toggle("photo-actions-centered", !showCameraChoice);
  const cameraChoice = showCameraChoice
    ? `<button class="secondary-btn modal-file-choice" type="button" data-photo-source="camera">ถ่ายภาพ</button>`
    : "";
  elements.modalActions.innerHTML = `
    ${cameraChoice}
    <button class="primary-btn modal-file-choice" type="button" data-photo-source="gallery">เลือกรูปจากเครื่อง</button>
  `;
  elements.modalActions.querySelectorAll("[data-photo-source]").forEach((button) => {
    button.addEventListener("click", () => selectPhotoSource(button.dataset.photoSource));
  });
  elements.modal.onclick = (event) => {
    if (event.target === elements.modal) {
      closeModal();
    }
  };
  elements.modal.classList.remove("hidden");
  elements.modalActions.querySelector(".modal-file-choice")?.focus();
}

function openPhotoPicker(event) {
  event?.preventDefault();
  showPhotoChoice();
}

function resetPhotoSelection() {
  state.selectedPhoto = null;
  state.selectedPhotoName = "";
  elements.photoInput.value = "";
  elements.cameraInput.value = "";
  elements.photoPreview.onload = null;
  elements.photoPreview.src = "";
  elements.photoPreview.classList.add("hidden");
  elements.photoEmpty.classList.remove("hidden");
  elements.photoLabel.textContent = "เพิ่มรูปภาพตอนเช็คอิน";
  clearFieldError(elements.photoPickerBtn);
}

function syncCurrentDay() {
  const currentKey = todayKey();
  if (!state.currentDateKey) {
    state.currentDateKey = currentKey;
    return false;
  }

  if (state.currentDateKey === currentKey) {
    return false;
  }

  state.currentDateKey = currentKey;
  state.isCheckingIn = false;
  resetPhotoSelection();

  if (state.user) {
    render();
    saveSession();
  }

  return true;
}

function startDayRolloverWatcher() {
  state.currentDateKey = todayKey();
  window.setInterval(syncCurrentDay, DAY_ROLLOVER_CHECK_MS);
  window.addEventListener("focus", syncCurrentDay);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      syncCurrentDay();
    }
  });
}

function refreshCurrentView() {
  syncCurrentDay();
  showView(state.activeView, { persist: false });
  saveSession();
  render();
}

function setRole(role) {
  state.role = role;
  elements.roleOptions.forEach((button) => {
    button.classList.toggle("active", button.dataset.role === role);
  });
  elements.userId.value = role === "admin" ? "teacher01" : "65010001";
  elements.password.value = role === "admin" ? "admin123" : "student123";
  clearAllFieldErrors();
}

function defaultView() {
  return state.role === "admin" ? "adminDashboardView" : "studentView";
}

function allowedView(viewId) {
  if (state.role === "admin") {
    return viewId !== "studentView" && viewId !== "studentProfileView";
  }

  return viewId !== "adminDashboardView" && viewId !== "adminView" && viewId !== "accountView";
}

function saveSession() {
  if (!state.user) {
    return;
  }

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      role: state.role,
      user: state.user,
      activeView: state.activeView,
    }),
  );
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function openMobileMenu() {
  elements.mobileBottomDock?.classList.remove("hidden");
  elements.mobileMenuBackdrop?.classList.remove("hidden");
  elements.mobileMenuToggle?.setAttribute("aria-expanded", "true");
  document.body.classList.add("mobile-menu-open");
}

function closeMobileMenu() {
  elements.mobileBottomDock?.classList.add("hidden");
  elements.mobileMenuBackdrop?.classList.add("hidden");
  elements.mobileMenuToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("mobile-menu-open");
}

function toggleMobileMenu() {
  if (!elements.mobileBottomDock || !elements.mobileMenuBackdrop) {
    return;
  }

  if (elements.mobileBottomDock.classList.contains("hidden")) {
    openMobileMenu();
  } else {
    closeMobileMenu();
  }
}

function showView(viewId, options = {}) {
  const shouldPersist = options.persist !== false;
  const nextView = allowedView(viewId) ? viewId : defaultView();
  clearAllFieldErrors();
  state.activeView = nextView;
  elements.views.forEach((view) => view.classList.toggle("hidden", view.id !== nextView));
  elements.navItems.forEach((item) => {
    const isActive = item.dataset.view === nextView;
    item.classList.toggle("active", isActive);
    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  if (shouldPersist) {
    saveSession();
  }

  closeMobileMenu();
}

function showDashboard(viewId = defaultView()) {
  syncCurrentDay();
  elements.loginScreen.classList.add("hidden");
  elements.dashboard.classList.remove("hidden");
  closeMobileMenu();

  elements.welcomeTitle.textContent =
    state.role === "admin" ? "ภาพรวมเวลาฝึกงาน" : `สวัสดี ${state.user.name}`;
  updateShellProfile();

  elements.adminOnly.forEach((item) => item.classList.toggle("hidden", state.role !== "admin"));
  elements.studentOnly.forEach((item) => item.classList.toggle("hidden", state.role === "admin"));
  showView(viewId, { persist: false });
  saveSession();
  render();
}

async function login(event) {
  event.preventDefault();
  syncCurrentDay();

  if (
    !validateRequiredFields([
      { element: elements.userId, message: "กรุณากรอกรหัสผู้ใช้" },
      { element: elements.password, message: "กรุณากรอกรหัสผ่าน" },
    ])
  ) {
    return;
  }

  if (state.role === "admin") {
    if (elements.userId.value.trim() !== "teacher01" || elements.password.value !== "admin123") {
      await showAlert("เข้าสู่ระบบไม่สำเร็จ", "กรุณาตรวจสอบรหัส Admin และรหัสผ่าน", "!");
      return;
    }
    state.user = { id: "teacher01", name: "Admin ผู้ดูแล", role: "admin" };
  } else {
    const student = getStudents().find((item) => item.id === elements.userId.value.trim());
    if (!student || student.password !== elements.password.value) {
      await showAlert("เข้าสู่ระบบไม่สำเร็จ", "กรุณาตรวจสอบรหัสนักศึกษาและรหัสผ่าน", "!");
      return;
    }
    state.user = { ...student, role: "student" };
  }

  showDashboard(defaultView());
}

function logout() {
  state.user = null;
  state.activeView = "studentView";
  state.isCheckingIn = false;
  state.historyVisibleCount = HISTORY_PAGE_SIZE;
  clearSession();
  resetPhotoSelection();
  clearAllFieldErrors();
  elements.dashboard.classList.add("hidden");
  closeMobileMenu();

  elements.loginScreen.classList.remove("hidden");
  setRole("student");
}

function getTodayRecord(records = getRecords()) {
  if (!state.user || state.user.role !== "student") {
    return null;
  }
  return records.find((record) => record.studentId === state.user.id && record.date === todayKey());
}

function updateStudentDashboard() {
  const records = getRecords();
  const record = getTodayRecord(records);
  const now = new Date();

  elements.currentDate.textContent = prettyDate(now);
  elements.summaryDate.textContent = prettyDate(now);
  elements.statusPill.className = "status-pill";
  elements.internRuleTitle.textContent = hasWorkplaceRule() ? state.user.workplace.name : "สถานที่ฝึกงาน";
  elements.internRuleText.textContent = formatWorkplaceRule();

  if (!record) {
    elements.todayStatus.textContent = "ยังไม่ได้เช็คอิน";
    elements.todayMeta.textContent = "เลือกภาพและกดเช็คอินเพื่อเริ่มบันทึกเวลาฝึกงาน";
    elements.statusPill.textContent = "รอดำเนินการ";
    elements.summaryIn.textContent = "-";
    elements.summaryOut.textContent = "-";
    elements.summaryStatus.textContent = "ยังไม่เริ่ม";
    elements.checkInBtn.disabled = state.isCheckingIn;
    elements.checkInBtn.textContent = state.isCheckingIn ? "กำลังอ่าน GPS..." : "เช็คอินพร้อม GPS";
    elements.checkOutBtn.disabled = true;
    elements.locationText.textContent = "ระบบจะขอสิทธิ์ตำแหน่งเมื่อกดเช็คอิน";
    return;
  }

  elements.summaryIn.textContent = prettyTime(record.checkIn);
  elements.summaryOut.textContent = prettyTime(record.checkOut);
  elements.summaryStatus.textContent = record.status;
  elements.locationText.textContent = `${record.location.lat.toFixed(5)}, ${record.location.lng.toFixed(5)}${
    record.distanceMeters ? ` · ห่างจากสถานที่ ${record.distanceMeters} เมตร` : ""
  }`;

  if (record.checkOut) {
    elements.todayStatus.textContent = "เช็คเอาท์แล้ว";
    elements.todayMeta.textContent = `เริ่ม ${prettyTime(record.checkIn)} สิ้นสุด ${prettyTime(record.checkOut)}`;
    elements.statusPill.textContent = "เสร็จสิ้น";
    elements.statusPill.classList.add("done");
    elements.checkInBtn.disabled = true;
    elements.checkInBtn.textContent = "เช็คอินแล้ว";
    elements.checkOutBtn.disabled = true;
  } else {
    elements.todayStatus.textContent = "กำลังฝึกงาน";
    elements.todayMeta.textContent = `เช็คอินเมื่อ ${prettyTime(record.checkIn)}`;
    elements.statusPill.textContent = "กำลังทำงาน";
    elements.statusPill.classList.add("active");
    elements.checkInBtn.disabled = true;
    elements.checkInBtn.textContent = "เช็คอินแล้ว";
    elements.checkOutBtn.disabled = false;
  }
}

function renderHistory() {
  const records = getRecords()
    .filter((record) => !state.user || state.user.role === "admin" || record.studentId === state.user.id)
    .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));

  if (state.user?.role === "admin") {
    if (!records.length) {
      elements.historyList.innerHTML = `<p class="hint">ยังไม่มีประวัติการบันทึกเวลา</p>`;
      return;
    }

    const latestDate = records.reduce((latest, record) => (record.date > latest ? record.date : latest), records[0].date);
    const latestRecords = records.filter((record) => record.date === latestDate);
    const visibleRecords = latestRecords.slice(0, state.historyVisibleCount);
    const moreButton =
      visibleRecords.length < latestRecords.length
        ? `<button class="secondary-btn history-more-btn" type="button" id="historyViewMoreBtn">View more</button>`
        : "";

    elements.historyList.innerHTML = `
      <p class="history-meta">ข้อมูลล่าสุดวันที่ ${prettyDate(latestDate)} แสดง ${visibleRecords.length} จาก ${latestRecords.length} รายการ</p>
      ${visibleRecords.map(recordCardTemplate).join("")}
      ${moreButton}
    `;
    return;
  }

  elements.historyList.innerHTML = records.length
    ? records.map(recordCardTemplate).join("")
    : `<p class="hint">ยังไม่มีประวัติการบันทึกเวลา</p>`;
}

function showMoreHistory() {
  state.historyVisibleCount += HISTORY_PAGE_SIZE;
  renderHistory();
}

function missingStudentTemplate(student) {
  return `
    <div class="missing-item">
      <div>
        <strong>${student.name}</strong>
        <span>${student.id} · ${student.major}</span>
      </div>
      <em>รอเช็คอิน</em>
    </div>
  `;
}

function renderAdminDashboard() {
  if (!elements.adminDashboardDate) {
    return;
  }

  const today = todayKey();
  const students = getStudents();
  const records = getRecords();
  const todayRecords = records
    .filter((record) => record.date === today)
    .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
  const checkedInIds = new Set(todayRecords.map((record) => record.studentId));
  const activeRecords = todayRecords.filter((record) => !record.checkOut);
  const doneRecords = todayRecords.filter((record) => record.checkOut);
  const missingStudents = students.filter((student) => !checkedInIds.has(student.id));

  elements.adminDashboardDate.textContent = prettyDate(today);
  elements.adminDashStudents.textContent = students.length;
  elements.adminDashCheckedIn.textContent = todayRecords.length;
  elements.adminDashActive.textContent = activeRecords.length;
  elements.adminDashDone.textContent = doneRecords.length;
  elements.adminDashMissing.textContent = missingStudents.length;

  elements.adminDashLatestList.innerHTML = todayRecords.length
    ? todayRecords.slice(0, 5).map(recordCardTemplate).join("")
    : `<p class="hint">วันนี้ยังไม่มีรายการเช็คอิน</p>`;

  elements.adminDashMissingList.innerHTML = missingStudents.length
    ? missingStudents.slice(0, 6).map(missingStudentTemplate).join("")
    : `<p class="hint">วันนี้นักศึกษาทุกคนเช็คอินแล้ว</p>`;
}

function recordCardTemplate(record) {
  const statusClass = record.checkOut ? "done" : "active";
  const image = record.hasPhoto
    ? `<div class="photo-badge" aria-label="มีรูปภาพเช็คอิน"><span>▣</span><small>มีรูป</small></div>`
    : `<div class="photo-badge empty" aria-label="ไม่มีรูปภาพเช็คอิน"><span>-</span><small>ไม่มีรูป</small></div>`;

  return `
    <article class="record-card">
      ${image}
      <div>
        <h4>${record.studentName}</h4>
        <p>${prettyDate(record.date)} · เช็คอิน ${prettyTime(record.checkIn)} · เช็คเอาท์ ${prettyTime(record.checkOut)}</p>
        ${record.workplaceName ? `<p>สถานที่ ${record.workplaceName}${record.distanceMeters ? ` · ระยะ ${record.distanceMeters} เมตร` : ""}</p>` : ""}
        <p>GPS ${record.location.lat.toFixed(5)}, ${record.location.lng.toFixed(5)}</p>
      </div>
      <span class="record-status ${statusClass}">${record.status}</span>
    </article>
  `;
}

function renderAdmin() {
  const keyword = elements.adminSearch.value.trim().toLowerCase();
  const selectedDate = elements.adminDateFilter.value;
  const selectedStatus = getAdminStatusFilter();
  const statusDate = selectedDate || todayKey();
  const students = getStudents();
  const records = getRecords().sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
  const dateRecords = selectedDate ? records.filter((record) => record.date === selectedDate) : records;

  const checkedInForStatusDate = new Set(records.filter((record) => record.date === statusDate).map((record) => record.studentId));
  const missingRows = students
    .filter((student) => !checkedInForStatusDate.has(student.id))
    .map((student) => ({
      isMissing: true,
      studentId: student.id,
      studentName: student.name,
      date: statusDate,
      checkIn: "",
      checkOut: "",
      status: "รอเช็คอิน",
      location: null,
    }));

  const statusRecords =
    selectedStatus === "missing"
      ? missingRows
      : dateRecords.filter((record) => {
          if (selectedStatus === "active") {
            return !record.checkOut;
          }
          if (selectedStatus === "done") {
            return Boolean(record.checkOut);
          }
          return true;
        });

  const filtered = statusRecords.filter((record) => {
    const haystack = `${record.studentName} ${record.studentId}`.toLowerCase();
    return !keyword || haystack.includes(keyword);
  });

  const today = todayKey();
  const statDate = selectedDate || today;
  const statRecords = records.filter((record) => record.date === statDate);
  elements.statCheckedIn.textContent = statRecords.length;
  elements.statActive.textContent = statRecords.filter((record) => !record.checkOut).length;
  elements.statTotal.textContent = selectedDate ? dateRecords.length : records.length;

  elements.adminTable.innerHTML = filtered.length
    ? filtered.map(adminRowTemplate).join("")
    : `<tr><td colspan="6">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</td></tr>`;
}

function getAdminStatusFilter() {
  return elements.adminStatusFilter.dataset.status || "all";
}

function setAdminStatusFilter(status) {
  elements.adminStatusFilter.dataset.status = status;
  elements.adminStatusFilter.querySelectorAll("[data-status]").forEach((button) => {
    const isActive = button.dataset.status === status;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function adminRowTemplate(record) {
  const statusClass = record.isMissing ? "waiting" : record.checkOut ? "done" : "active";
  const mapUrl = record.location ? `https://www.google.com/maps?q=${record.location.lat},${record.location.lng}` : "";
  return `
    <tr>
      <td><strong>${record.studentName}</strong><br /><span class="hint">${record.studentId}</span></td>
      <td>${prettyDate(record.date)}</td>
      <td>${prettyTime(record.checkIn)}</td>
      <td>${prettyTime(record.checkOut)}</td>
      <td><span class="record-status ${statusClass}">${record.status}</span></td>
      <td>${mapUrl ? `<a class="gps-link" href="${mapUrl}" target="_blank" rel="noreferrer">เปิดแผนที่</a><br /><span class="hint">${record.workplaceName || ""}${record.distanceMeters ? ` · ${record.distanceMeters} ม.` : ""}</span>` : `<span class="hint">-</span>`}</td>
    </tr>
  `;
}

function accountCardTemplate(student) {
  const isDefaultAccount = demoStudents.some((item) => item.id === student.id);
  return `
    <article class="account-card">
      <div>
        <strong>${student.name}</strong>
        <p>${student.id} · ${student.major}</p>
        <p>${formatWorkplaceRule(student)}</p>
      </div>
      <div class="account-actions">
        <button class="secondary-btn account-edit-btn" type="button" data-student-edit="${student.id}">แก้ไข</button>
        ${
          isDefaultAccount
            ? `<span class="account-fixed">บัญชีเริ่มต้น</span>`
            : `<button class="secondary-btn account-delete-btn" type="button" data-student-delete="${student.id}">ลบ</button>`
        }
      </div>
    </article>
  `;
}

function renderAccounts() {
  const students = getStudents().sort((a, b) => a.id.localeCompare(b.id));
  elements.studentAccountList.innerHTML = students.length
    ? students.map(accountCardTemplate).join("")
    : `<p class="hint">ยังไม่มี account นักศึกษา</p>`;
}

function setAccountFormMode(studentId = null) {
  state.editingStudentId = studentId;
  const isEditing = Boolean(studentId);
  elements.accountForm.classList.toggle("is-editing", isEditing);
  elements.accountFormTitle.textContent = isEditing ? "แก้ไข Account นักศึกษา" : "สร้าง Account ให้นักศึกษา";
  elements.accountSubmitBtn.textContent = isEditing ? "บันทึกการแก้ไข" : "สร้าง account";
  elements.accountCancelEditBtn.classList.toggle("hidden", !isEditing);
  elements.accountStudentId.readOnly = isEditing;
  clearAllFieldErrors(elements.accountForm);
}

function resetAccountForm() {
  elements.accountForm.reset();
  setAccountFormMode(null);
}

function editStudentAccount(studentId) {
  const student = getStudents().find((item) => item.id === studentId);
  if (!student) {
    return;
  }

  const workplace = student.workplace || {};
  const hasCoords = validLatLng(Number(workplace.lat), Number(workplace.lng));
  elements.accountStudentId.value = student.id;
  elements.accountStudentName.value = student.name;
  elements.accountStudentMajor.value = student.major;
  elements.accountStudentPassword.value = student.password;
  elements.accountWorkplace.value = workplace.name || "";
  elements.accountStartTime.value = workplace.startTime || "";
  elements.accountEndTime.value = workplace.endTime || "";
  elements.accountMapsLink.value = workplace.mapLink || (hasCoords ? `${workplace.lat},${workplace.lng}` : "");
  elements.accountRadius.value = workplace.radius || 200;
  setAccountFormMode(student.id);
  elements.accountForm.scrollIntoView({ behavior: "smooth", block: "start" });
  elements.accountStudentName.focus();
}

async function createStudentAccount(event) {
  event.preventDefault();

  const coordinates = validateAccountForm();
  if (!coordinates) {
    return;
  }

  const student = normalizeStudent({
    id: elements.accountStudentId.value,
    name: elements.accountStudentName.value,
    major: elements.accountStudentMajor.value,
    password: elements.accountStudentPassword.value,
    profilePhoto: getStudents().find((item) => item.id === elements.accountStudentId.value.trim())?.profilePhoto || "",
    workplace: {
      name: elements.accountWorkplace.value,
      mapLink: elements.accountMapsLink.value,
      startTime: elements.accountStartTime.value,
      endTime: elements.accountEndTime.value,
      lat: coordinates.lat,
      lng: coordinates.lng,
      radius: elements.accountRadius.value,
    },
  });

  if (!student.id || !student.name || !student.password || !hasWorkplaceRule(student)) {
    setFieldError(elements.accountMapsLink, "กรุณาตรวจสอบข้อมูลสถานที่ฝึกงานให้ครบ");
    elements.accountMapsLink.focus();
    return;
  }

  const students = getStudents();
  const isEditing = Boolean(state.editingStudentId);
  const nextStudents = isEditing
    ? students.map((item) => (item.id === state.editingStudentId ? student : item))
    : [...students, student];
  saveStudents(nextStudents);
  resetAccountForm();
  renderAccounts();
  await showAlert(isEditing ? "แก้ไข account สำเร็จ" : "สร้าง account สำเร็จ", "", "✓");
}

async function deleteStudentAccount(studentId) {
  const students = getStudents();
  const student = students.find((item) => item.id === studentId);
  if (!student || demoStudents.some((item) => item.id === studentId)) {
    return;
  }

  const confirmed = await showModal({
    title: "ลบ account",
    message: `ต้องการลบ account ของ ${student.name} ใช่หรือไม่`,
    icon: "!",
    confirmText: "ลบ account",
    cancelText: "ยกเลิก",
    confirmClass: "secondary-btn danger-btn",
    showCancel: true,
  });

  if (!confirmed) {
    return;
  }

  saveStudents(students.filter((item) => item.id !== studentId));
  if (state.editingStudentId === studentId) {
    resetAccountForm();
  }
  renderAccounts();
}

function renderStudentProfile() {
  if (state.user?.role !== "student") {
    return;
  }

  elements.profileStudentId.value = state.user.id || "";
  elements.profileStudentName.value = state.user.name || "";
  elements.profileStudentMajor.value = state.user.major || "";
  elements.profilePhotoName.textContent = state.selectedProfilePhotoName || (state.user.profilePhoto ? "มีรูปโปรไฟล์แล้ว" : "เลือกรูปภาพจากเครื่อง");
  renderAvatar(elements.profileAvatarInitial, elements.profileAvatarImg, {
    ...state.user,
    profilePhoto: state.selectedProfilePhoto || state.user.profilePhoto,
  });
}

function resizeProfilePhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("อ่านไฟล์รูปภาพไม่ได้"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("ไฟล์รูปภาพนี้ไม่สามารถใช้งานได้"));
      image.onload = () => {
        const size = 320;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const side = Math.min(image.width, image.height);
        const sx = (image.width - side) / 2;
        const sy = (image.height - side) / 2;
        canvas.width = size;
        canvas.height = size;
        context.drawImage(image, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleProfilePhoto(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setFieldError(elements.profilePhotoBtn, "กรุณาเลือกไฟล์รูปภาพเท่านั้น");
    return;
  }

  try {
    state.selectedProfilePhoto = await resizeProfilePhoto(file);
    state.selectedProfilePhotoName = file.name;
    clearFieldError(elements.profilePhotoBtn);
    renderStudentProfile();
  } catch (error) {
    setFieldError(elements.profilePhotoBtn, error.message || "ไม่สามารถใช้รูปภาพนี้ได้");
  }
}

function validateProfilePasswordChange() {
  const currentPassword = elements.profileCurrentPassword.value;
  const newPassword = elements.profileNewPassword.value;
  const confirmPassword = elements.profileConfirmPassword.value;
  const wantsPasswordChange = Boolean(currentPassword || newPassword || confirmPassword);

  if (!wantsPasswordChange) {
    [elements.profileCurrentPassword, elements.profileNewPassword, elements.profileConfirmPassword].forEach(clearFieldError);
    return null;
  }

  let firstInvalid = null;
  if (!currentPassword) {
    setFieldError(elements.profileCurrentPassword, "กรุณากรอกรหัสผ่านเดิม");
    firstInvalid ||= elements.profileCurrentPassword;
  } else if (currentPassword !== state.user.password) {
    setFieldError(elements.profileCurrentPassword, "รหัสผ่านเดิมไม่ถูกต้อง");
    firstInvalid ||= elements.profileCurrentPassword;
  } else {
    clearFieldError(elements.profileCurrentPassword);
  }

  if (!newPassword) {
    setFieldError(elements.profileNewPassword, "กรุณากรอกรหัสผ่านใหม่");
    firstInvalid ||= elements.profileNewPassword;
  } else if (newPassword.length < 6) {
    setFieldError(elements.profileNewPassword, "รหัสผ่านใหม่ควรมีอย่างน้อย 6 ตัวอักษร");
    firstInvalid ||= elements.profileNewPassword;
  } else {
    clearFieldError(elements.profileNewPassword);
  }

  if (!confirmPassword) {
    setFieldError(elements.profileConfirmPassword, "กรุณายืนยันรหัสผ่านใหม่");
    firstInvalid ||= elements.profileConfirmPassword;
  } else if (confirmPassword !== newPassword) {
    setFieldError(elements.profileConfirmPassword, "รหัสผ่านใหม่ไม่ตรงกัน");
    firstInvalid ||= elements.profileConfirmPassword;
  } else {
    clearFieldError(elements.profileConfirmPassword);
  }

  if (firstInvalid) {
    firstInvalid.focus();
    return false;
  }

  return newPassword;
}

async function saveStudentProfile(event) {
  event.preventDefault();

  if (state.user?.role !== "student") {
    return;
  }

  const nextPassword = validateProfilePasswordChange();
  if (nextPassword === false) {
    return;
  }

  if (!state.selectedProfilePhoto && !nextPassword) {
    await showAlert("ไม่มีข้อมูลที่เปลี่ยนแปลง", "กรุณาเลือกรูปโปรไฟล์ใหม่ หรือกรอกรหัสผ่านใหม่ก่อนบันทึก", "i");
    return;
  }

  const students = getStudents();
  const updatedStudent = normalizeStudent({
    ...state.user,
    password: nextPassword || state.user.password,
    profilePhoto: state.selectedProfilePhoto || state.user.profilePhoto || "",
  });
  saveStudents(students.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)));

  state.user = { ...updatedStudent, role: "student" };
  state.selectedProfilePhoto = "";
  state.selectedProfilePhotoName = "";
  elements.studentProfileForm.reset();
  clearAllFieldErrors(elements.studentProfileForm);
  saveSession();
  render();
  await showAlert("บันทึกโปรไฟล์สำเร็จ", "", "✓");
}

function render() {
  updateShellProfile();
  updateStudentDashboard();
  renderStudentProfile();
  renderAdminDashboard();
  renderHistory();
  renderAdmin();
  renderAccounts();
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("เบราว์เซอร์นี้ไม่รองรับ GPS"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    });
  });
}

async function checkIn() {
  syncCurrentDay();

  if (state.isCheckingIn) {
    return;
  }

  if (getTodayRecord()) {
    await showAlert("เช็คอินแล้ว", "วันนี้คุณเช็คอินไปแล้ว ไม่สามารถเช็คอินซ้ำได้", "i");
    render();
    return;
  }

  if (!state.selectedPhoto) {
    setFieldError(elements.photoPickerBtn, "กรุณาเพิ่มรูปภาพหลักฐานก่อนกดเช็คอิน");
    elements.photoPickerBtn.focus();
    return;
  }
  clearFieldError(elements.photoPickerBtn);

  const confirmed = await showModal({
    title: "ยืนยันการเช็คอิน",
    message: "ต้องการเช็คอินพร้อมบันทึกตำแหน่ง GPS และรูปภาพตอนนี้ใช่หรือไม่",
    icon: "✓",
    confirmText: "ยืนยันเช็คอิน",
    cancelText: "ยกเลิก",
    showCancel: true,
  });

  if (!confirmed) {
    return;
  }

  state.isCheckingIn = true;
  render();

  try {
    const position = await getPosition();
    const workplaceCheck = validateWorkplacePosition(position);
    const records = getRecords();
    if (getTodayRecord(records)) {
      state.isCheckingIn = false;
      await showAlert("เช็คอินแล้ว", "วันนี้คุณเช็คอินไปแล้ว ไม่สามารถเช็คอินซ้ำได้", "i");
      render();
      return;
    }
    const now = new Date();
    const late = hasWorkplaceRule() && isLateForWork(state.user.workplace.startTime, now);
    records.push({
      id: crypto.randomUUID(),
      studentId: state.user.id,
      studentName: state.user.name,
      date: todayKey(),
      checkIn: now.toISOString(),
      checkOut: "",
      status: late ? "มาสาย" : "กำลังฝึกงาน",
      location: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      workplaceName: workplaceCheck.rule?.name || "",
      distanceMeters: workplaceCheck.distance,
      photo: "",
      photoName: state.selectedPhotoName,
      hasPhoto: true,
    });
    saveRecords(records);
    state.isCheckingIn = false;
    render();
    await showAlert("เช็คอินสำเร็จ", "บันทึกเวลา ตำแหน่ง GPS และรูปภาพเรียบร้อยแล้ว", "✓");
  } catch (error) {
    state.isCheckingIn = false;
    render();
    await showAlert("เช็คอินไม่สำเร็จ", error.message || "ไม่สามารถอ่านตำแหน่ง GPS ได้", "!");
  }
}

function checkOut() {
  syncCurrentDay();

  const records = getRecords();
  const record = getTodayRecord(records);
  if (!record || record.checkOut) {
    return;
  }

  showModal({
    title: "ยืนยันการเช็คเอาท์",
    message: "ต้องการเช็คเอาท์และสิ้นสุดการบันทึกเวลาฝึกงานวันนี้ใช่หรือไม่",
    icon: "!",
    confirmText: "ยืนยันเช็คเอาท์",
    cancelText: "ยกเลิก",
    confirmClass: "secondary-btn danger-btn",
    showCancel: true,
  }).then((confirmed) => {
    if (!confirmed) {
      return;
    }

    record.checkOut = new Date().toISOString();
    record.status = "เสร็จสิ้น";
    saveRecords(records);
    render();
    showAlert("เช็คเอาท์สำเร็จ", "บันทึกเวลาเช็คเอาท์เรียบร้อยแล้ว", "✓");
  });
}

function handlePhoto(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showToast("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
    return;
  }

  clearFieldError(elements.photoPickerBtn);
  state.selectedPhoto = file;
  state.selectedPhotoName = file.name;
  const previewUrl = URL.createObjectURL(file);
  elements.photoPreview.src = previewUrl;
  elements.photoPreview.onload = () => URL.revokeObjectURL(previewUrl);
  elements.photoPreview.classList.remove("hidden");
  elements.photoEmpty.classList.add("hidden");
  elements.photoLabel.textContent = "เลือกรูปภาพแล้ว";
  closeModal();
}

function exportCsv() {
  const rows = [
    ["student_id", "student_name", "date", "check_in", "check_out", "status", "latitude", "longitude"],
    ...getRecords().map((record) => [
      record.studentId,
      record.studentName,
      record.date,
      record.checkIn,
      record.checkOut,
      record.status,
      record.location.lat,
      record.location.lng,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `intern-time-${todayKey()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function restoreSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    setRole("student");
    return;
  }

  try {
    const session = JSON.parse(raw);
    if (!session?.user || !["student", "admin"].includes(session.role)) {
      throw new Error("Invalid session");
    }

    state.role = session.role;
    state.user = session.user;
    state.activeView = session.activeView || defaultView();
    setRole(state.role);

    if (state.role === "student") {
      const latestStudent = getStudents().find((student) => student.id === state.user.id);
      if (latestStudent) {
        state.user = { ...latestStudent, role: "student" };
      }
      elements.userId.value = state.user.id || "65010001";
      elements.password.value = state.user.password || "student123";
    }

    showDashboard(state.activeView);
  } catch {
    clearSession();
    setRole("student");
  }
}

elements.roleOptions.forEach((button) => {
  button.addEventListener("click", () => setRole(button.dataset.role));
});
elements.loginForm.addEventListener("submit", login);
elements.logoutBtn.addEventListener("click", logout);
elements.refreshBtn?.addEventListener("click", refreshCurrentView);
elements.mobileMenuToggle?.addEventListener("click", toggleMobileMenu);
elements.mobileMenuClose?.addEventListener("click", closeMobileMenu);
elements.mobileMenuBackdrop?.addEventListener("click", closeMobileMenu);
elements.mobileLogoutBtn.addEventListener("click", () => {
  closeMobileMenu();
  logout();
});
elements.mobileRefreshBtn?.addEventListener("click", () => {
  closeMobileMenu();
  refreshCurrentView();
});
elements.navItems.forEach((item) => item.addEventListener("click", () => showView(item.dataset.view)));
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});
elements.photoPickerBtn.addEventListener("click", openPhotoPicker);
elements.photoPickerBtn.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    openPhotoPicker(event);
  }
});
elements.cameraInput.addEventListener("change", handlePhoto);
elements.photoInput.addEventListener("change", handlePhoto);
elements.checkInBtn.addEventListener("click", checkIn);
elements.checkOutBtn.addEventListener("click", checkOut);
elements.adminSearch.addEventListener("input", renderAdmin);
elements.adminDateFilter.addEventListener("change", renderAdmin);
elements.adminStatusFilter.addEventListener("click", (event) => {
  const button = event.target.closest("[data-status]");
  if (!button) {
    return;
  }

  setAdminStatusFilter(button.dataset.status);
  renderAdmin();
});
elements.adminClearDateFilter.addEventListener("click", () => {
  elements.adminDateFilter.value = "";
  setAdminStatusFilter("all");
  renderAdmin();
});
elements.accountForm.addEventListener("submit", createStudentAccount);
elements.accountCancelEditBtn.addEventListener("click", resetAccountForm);
elements.profilePhotoBtn.addEventListener("click", () => elements.profilePhotoInput.click());
elements.profilePhotoInput.addEventListener("change", handleProfilePhoto);
elements.studentProfileForm.addEventListener("submit", saveStudentProfile);
elements.studentAccountList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-student-edit]");
  if (editButton) {
    editStudentAccount(editButton.dataset.studentEdit);
    return;
  }

  const deleteButton = event.target.closest("[data-student-delete]");
  if (deleteButton) {
    deleteStudentAccount(deleteButton.dataset.studentDelete);
  }
});
elements.historyList.addEventListener("click", (event) => {
  if (event.target.closest("#historyViewMoreBtn")) {
    showMoreHistory();
  }
});
elements.exportBtn.addEventListener("click", exportCsv);

setupInlineValidation();
startDayRolloverWatcher();
restoreSession();
