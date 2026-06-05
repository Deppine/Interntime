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

function getSelectedAccountSchedule() {
  return Array.from(elements.accountScheduleRadios || []).find((radio) => radio.checked) || null;
}

function isCustomAccountSchedule() {
  return getSelectedAccountSchedule()?.value === "custom";
}

function getAccountScheduleLabel() {
  const selectedSchedule = getSelectedAccountSchedule();
  if (!selectedSchedule) {
    return "";
  }

  return selectedSchedule.value === "custom"
    ? elements.accountCustomSchedule.value.trim()
    : selectedSchedule.dataset.label || "";
}

function syncAccountScheduleFields() {
  const selectedSchedule = getSelectedAccountSchedule();
  const isCustom = selectedSchedule?.value === "custom";
  elements.accountCustomScheduleFields?.classList.toggle("is-open", isCustom);

  if (!selectedSchedule || isCustom) {
    return;
  }

  elements.accountStartTime.value = selectedSchedule.dataset.start || "";
  elements.accountEndTime.value = selectedSchedule.dataset.end || "";
  clearFieldError(elements.accountCustomSchedule);
  clearFieldError(elements.accountStartTime);
  clearFieldError(elements.accountEndTime);
}

function validateAccountForm() {
  syncAccountScheduleFields();
  const hasRequiredValues = validateRequiredFields([
    { element: elements.accountStudentId, message: "กรุณากรอกรหัสนักศึกษา" },
    { element: elements.accountStudentName, message: "กรุณากรอกชื่อนักศึกษา" },
    { element: elements.accountStudentMajor, message: "กรุณากรอกสาขา" },
    { element: elements.accountEducationLevel, message: "กรุณากรอกระดับการศึกษา" },
    { element: elements.accountPhone, message: "กรุณากรอกเบอร์โทรนักศึกษา" },
    { element: elements.accountGuardianName, message: "กรุณากรอกชื่อผู้ปกครอง" },
    { element: elements.accountGuardianPhone, message: "กรุณากรอกเบอร์โทรผู้ปกครอง" },
    { element: elements.accountStudentPassword, message: "กรุณากำหนดรหัสผ่าน" },
    { element: elements.accountWorkplace, message: "กรุณากรอกสถานที่ฝึกงาน" },
    { element: elements.accountWorkplaceAddress, message: "กรุณากรอกที่อยู่สถานประกอบการ" },
    { element: elements.accountMapsLink, message: "กรุณาวาง Google Maps Link หรือพิกัด" },
    { element: elements.accountRadius, message: "กรุณากำหนดรัศมีที่ยอมรับ" },
  ]);

  if (!hasRequiredValues) {
    return null;
  }

  if (isCustomAccountSchedule()) {
    const hasCustomSchedule = validateRequiredFields([
      { element: elements.accountCustomSchedule, message: "กรุณากรอกรายละเอียดเวลาอื่นๆ" },
      { element: elements.accountStartTime, message: "กรุณาเลือกเวลาเข้างาน" },
      { element: elements.accountEndTime, message: "กรุณาเลือกเวลาเลิกงาน" },
    ]);

    if (!hasCustomSchedule) {
      return null;
    }
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
    elements.accountEducationLevel,
    elements.accountPhone,
    elements.accountGuardianName,
    elements.accountGuardianPhone,
    elements.accountStudentPassword,
    elements.accountWorkplace,
    elements.accountWorkplaceAddress,
    elements.accountMentorName,
    elements.accountMentorPhone,
    elements.accountResidenceAddress,
    elements.accountRoommate,
    elements.accountCustomSchedule,
    elements.accountStartTime,
    elements.accountEndTime,
    elements.accountMapsLink,
    elements.accountRadius,
    elements.profileEducationLevel,
    elements.profilePhone,
    elements.profileGuardianName,
    elements.profileGuardianPhone,
    elements.profileWorkplace,
    elements.profileWorkplaceAddress,
    elements.profileMentorName,
    elements.profileMentorPhone,
    elements.profileResidenceAddress,
    elements.profileRoommate,
    elements.profileCurrentPassword,
    elements.profileNewPassword,
    elements.profileConfirmPassword,
  ].forEach((element) => {
    element?.addEventListener("input", () => clearFieldError(element));
    element?.addEventListener("change", () => clearFieldError(element));
  });

  elements.accountScheduleRadios?.forEach((radio) => {
    radio.addEventListener("change", () => {
      syncAccountScheduleFields();
      clearFieldError(elements.accountCustomSchedule);
      clearFieldError(elements.accountStartTime);
      clearFieldError(elements.accountEndTime);
    });
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

function profileRequiredMissing(student = state.user) {
  return [
    student?.phone,
    student?.guardianName,
    student?.guardianPhone,
    student?.workplace?.name,
    student?.workplace?.address,
  ].some((value) => !String(value || "").trim());
}

function profileStatusMeta(student = state.user) {
  if (profileRequiredMissing(student)) {
    return { key: "incomplete", label: "ข้อมูลไม่ครบ", className: "incomplete" };
  }

  const status = student?.profileStatus || "pending";
  if (status === "verified") {
    return { key: "verified", label: "ตรวจสอบแล้ว", className: "verified" };
  }
  if (status === "needs_fix") {
    return { key: "needs_fix", label: "ต้องแก้ไข", className: "needs-fix" };
  }
  return { key: "pending", label: "รอตรวจสอบ", className: "pending" };
}

function formattedProfileUpdatedAt(student = state.user) {
  return student?.profileUpdatedAt ? `แก้ไขล่าสุด ${prettyDate(student.profileUpdatedAt)} ${prettyTime(student.profileUpdatedAt)}` : "ยังไม่มีการอัปเดตข้อมูล";
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
  const scheduleText = workplace.scheduleLabel || `เวลา ${workplace.startTime}-${workplace.endTime}`;
  return `${workplace.name} · ${scheduleText} · รัศมี ${workplace.radius} เมตร`;
}

function formatScheduleRule(student = state.user) {
  const workplace = student?.workplace;
  if (!workplace?.startTime || !workplace?.endTime) {
    return "Admin ยังไม่ได้ตั้งค่าวันและเวลาฝึกงาน";
  }

  return workplace.scheduleLabel || `เวลา ${workplace.startTime}-${workplace.endTime}`;
}

function formatLatLngRule(student = state.user) {
  const workplace = student?.workplace;
  const lat = Number(workplace?.lat);
  const lng = Number(workplace?.lng);
  if (!validLatLng(lat, lng)) {
    return "Admin ยังไม่ได้ตั้งค่า Google Maps / พิกัด";
  }

  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
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
  messageHtml = "",
  icon = "!",
  confirmText = "ตกลง",
  cancelText = "ยกเลิก",
  confirmClass = "primary-btn",
  showCancel = false,
}) {
  return new Promise((resolve) => {
    elements.modalIcon.textContent = icon;
    elements.modalTitle.textContent = title;
    if (messageHtml) {
      elements.modalMessage.innerHTML = messageHtml;
    } else {
      elements.modalMessage.textContent = message;
    }
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

function showAlertHtml(title, messageHtml, icon = "!") {
  return showModal({
    title,
    messageHtml,
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

