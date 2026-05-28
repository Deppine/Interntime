const STORAGE_KEY = "intern-time-records";
const SESSION_KEY = "intern-time-session";

const state = {
  role: "student",
  user: null,
  activeView: "studentView",
  isCheckingIn: false,
  selectedPhoto: null,
  selectedPhotoName: "",
};

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
  logoutBtn: document.querySelector("#logoutBtn"),
  refreshBtn: document.querySelector("#refreshBtn"),
  mobileLogoutBtn: document.querySelector("#mobileLogoutBtn"),
  mobileRefreshBtn: document.querySelector("#mobileRefreshBtn"),
  navItems: document.querySelectorAll(".nav-item"),
  views: document.querySelectorAll(".view"),
  adminOnly: document.querySelectorAll(".admin-only"),
  currentDate: document.querySelector("#currentDate"),
  todayStatus: document.querySelector("#todayStatus"),
  todayMeta: document.querySelector("#todayMeta"),
  statusPill: document.querySelector("#statusPill"),
  photoInput: document.querySelector("#photoInput"),
  photoPreview: document.querySelector("#photoPreview"),
  photoLabel: document.querySelector("#photoLabel"),
  locationText: document.querySelector("#locationText"),
  checkInBtn: document.querySelector("#checkInBtn"),
  checkOutBtn: document.querySelector("#checkOutBtn"),
  summaryDate: document.querySelector("#summaryDate"),
  summaryIn: document.querySelector("#summaryIn"),
  summaryOut: document.querySelector("#summaryOut"),
  summaryStatus: document.querySelector("#summaryStatus"),
  historyList: document.querySelector("#historyList"),
  adminTable: document.querySelector("#adminTable"),
  adminSearch: document.querySelector("#adminSearch"),
  statCheckedIn: document.querySelector("#statCheckedIn"),
  statActive: document.querySelector("#statActive"),
  statTotal: document.querySelector("#statTotal"),
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

function currentStudent() {
  const found = demoStudents.find((student) => student.id === elements.userId.value.trim());
  return found || {
    id: elements.userId.value.trim() || "65010001",
    name: "นักศึกษาฝึกงาน",
    major: "ไม่ระบุสาขา",
  };
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 2800);
}

function closeModal() {
  elements.modal.classList.add("hidden");
  elements.modalConfirmBtn.onclick = null;
  elements.modalCancelBtn.onclick = null;
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

function setRole(role) {
  state.role = role;
  elements.roleOptions.forEach((button) => {
    button.classList.toggle("active", button.dataset.role === role);
  });
  elements.userId.value = role === "admin" ? "teacher01" : "65010001";
  elements.password.value = role === "admin" ? "admin123" : "student123";
}

function defaultView() {
  return state.role === "admin" ? "adminView" : "studentView";
}

function allowedView(viewId) {
  return state.role === "admin" || viewId !== "adminView";
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

function showView(viewId, options = {}) {
  const shouldPersist = options.persist !== false;
  const nextView = allowedView(viewId) ? viewId : defaultView();
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
}

function showDashboard(viewId = defaultView()) {
  elements.loginScreen.classList.add("hidden");
  elements.dashboard.classList.remove("hidden");
  elements.welcomeTitle.textContent =
    state.role === "admin" ? "ภาพรวมเวลาฝึกงาน" : `สวัสดี ${state.user.name}`;

  elements.adminOnly.forEach((item) => item.classList.toggle("hidden", state.role !== "admin"));
  showView(viewId, { persist: false });
  saveSession();
  render();
}

function login(event) {
  event.preventDefault();
  state.user =
    state.role === "admin"
      ? { id: "teacher01", name: "อาจารย์ผู้ดูแล", role: "admin" }
      : { ...currentStudent(), role: "student" };

  showDashboard(defaultView());
}

function logout() {
  state.user = null;
  state.activeView = "studentView";
  state.isCheckingIn = false;
  state.selectedPhoto = null;
  state.selectedPhotoName = "";
  clearSession();
  elements.photoInput.value = "";
  elements.photoPreview.src = "";
  elements.photoPreview.classList.add("hidden");
  elements.photoLabel.textContent = "เพิ่มรูปภาพตอนเช็คอิน";
  elements.dashboard.classList.add("hidden");
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
  elements.locationText.textContent = `${record.location.lat.toFixed(5)}, ${record.location.lng.toFixed(5)}`;

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

  elements.historyList.innerHTML = records.length
    ? records.map(recordCardTemplate).join("")
    : `<p class="hint">ยังไม่มีประวัติการบันทึกเวลา</p>`;
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
        <p>GPS ${record.location.lat.toFixed(5)}, ${record.location.lng.toFixed(5)}</p>
      </div>
      <span class="record-status ${statusClass}">${record.status}</span>
    </article>
  `;
}

function renderAdmin() {
  const keyword = elements.adminSearch.value.trim().toLowerCase();
  const records = getRecords().sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
  const filtered = keyword
    ? records.filter((record) => record.studentName.toLowerCase().includes(keyword))
    : records;

  const today = todayKey();
  elements.statCheckedIn.textContent = records.filter((record) => record.date === today).length;
  elements.statActive.textContent = records.filter((record) => record.date === today && !record.checkOut).length;
  elements.statTotal.textContent = records.length;

  elements.adminTable.innerHTML = filtered.length
    ? filtered.map(adminRowTemplate).join("")
    : `<tr><td colspan="6">ไม่พบข้อมูลที่ค้นหา</td></tr>`;
}

function adminRowTemplate(record) {
  const statusClass = record.checkOut ? "done" : "active";
  const mapUrl = `https://www.google.com/maps?q=${record.location.lat},${record.location.lng}`;
  return `
    <tr>
      <td><strong>${record.studentName}</strong><br /><span class="hint">${record.studentId}</span></td>
      <td>${prettyDate(record.date)}</td>
      <td>${prettyTime(record.checkIn)}</td>
      <td>${prettyTime(record.checkOut)}</td>
      <td><span class="record-status ${statusClass}">${record.status}</span></td>
      <td><a class="gps-link" href="${mapUrl}" target="_blank" rel="noreferrer">เปิดแผนที่</a></td>
    </tr>
  `;
}

function render() {
  updateStudentDashboard();
  renderHistory();
  renderAdmin();
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
  if (state.isCheckingIn) {
    return;
  }

  if (getTodayRecord()) {
    await showAlert("เช็คอินแล้ว", "วันนี้คุณเช็คอินไปแล้ว ไม่สามารถเช็คอินซ้ำได้", "i");
    render();
    return;
  }

  if (!state.selectedPhoto) {
    await showAlert("กรุณาเพิ่มรูปภาพ", "ต้องเพิ่มรูปภาพหลักฐานก่อนกดเช็คอิน", "!");
    elements.photoInput.focus();
    return;
  }

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
    const records = getRecords();
    if (getTodayRecord(records)) {
      state.isCheckingIn = false;
      await showAlert("เช็คอินแล้ว", "วันนี้คุณเช็คอินไปแล้ว ไม่สามารถเช็คอินซ้ำได้", "i");
      render();
      return;
    }
    const now = new Date();
    records.push({
      id: crypto.randomUUID(),
      studentId: state.user.id,
      studentName: state.user.name,
      date: todayKey(),
      checkIn: now.toISOString(),
      checkOut: "",
      status: "กำลังฝึกงาน",
      location: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
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

  state.selectedPhoto = file;
  state.selectedPhotoName = file.name;
  const previewUrl = URL.createObjectURL(file);
  elements.photoPreview.src = previewUrl;
  elements.photoPreview.onload = () => URL.revokeObjectURL(previewUrl);
  elements.photoPreview.classList.remove("hidden");
  elements.photoLabel.textContent = "เลือกรูปภาพแล้ว";
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
      elements.userId.value = state.user.id || "65010001";
      elements.password.value = "student123";
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
elements.refreshBtn.addEventListener("click", render);
elements.mobileLogoutBtn.addEventListener("click", logout);
elements.mobileRefreshBtn.addEventListener("click", render);
elements.navItems.forEach((item) => item.addEventListener("click", () => showView(item.dataset.view)));
elements.photoInput.addEventListener("change", handlePhoto);
elements.checkInBtn.addEventListener("click", checkIn);
elements.checkOutBtn.addEventListener("click", checkOut);
elements.adminSearch.addEventListener("input", renderAdmin);
elements.exportBtn.addEventListener("click", exportCsv);

restoreSession();
