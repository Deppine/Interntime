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
    return JSON.parse(raw);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
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
  elements.navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === nextView));

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
  const image = record.photo
    ? `<img src="${record.photo}" alt="รูปภาพเช็คอินของ ${record.studentName}" />`
    : `<img alt="" />`;

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
    showToast("วันนี้เช็คอินแล้ว ไม่สามารถเช็คอินซ้ำได้");
    render();
    return;
  }

  if (!state.selectedPhoto) {
    showToast("กรุณาเพิ่มรูปภาพก่อนเช็คอิน");
    return;
  }

  state.isCheckingIn = true;
  render();

  try {
    const position = await getPosition();
    const records = getRecords();
    if (getTodayRecord(records)) {
      state.isCheckingIn = false;
      showToast("วันนี้เช็คอินแล้ว ไม่สามารถเช็คอินซ้ำได้");
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
      photo: state.selectedPhoto,
    });
    saveRecords(records);
    state.isCheckingIn = false;
    showToast("เช็คอินสำเร็จ พร้อมบันทึก GPS และรูปภาพ");
    render();
  } catch (error) {
    state.isCheckingIn = false;
    showToast(error.message || "ไม่สามารถอ่านตำแหน่ง GPS ได้");
    render();
  }
}

function checkOut() {
  const records = getRecords();
  const record = getTodayRecord(records);
  if (!record || record.checkOut) {
    return;
  }

  record.checkOut = new Date().toISOString();
  record.status = "เสร็จสิ้น";
  saveRecords(records);
  showToast("เช็คเอาท์สำเร็จ");
  render();
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

  const reader = new FileReader();
  reader.onload = () => {
    state.selectedPhoto = reader.result;
    state.selectedPhotoName = file.name;
    elements.photoPreview.src = reader.result;
    elements.photoPreview.classList.remove("hidden");
    elements.photoLabel.textContent = "เลือกรูปภาพแล้ว";
  };
  reader.readAsDataURL(file);
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
elements.navItems.forEach((item) => item.addEventListener("click", () => showView(item.dataset.view)));
elements.photoInput.addEventListener("change", handlePhoto);
elements.checkInBtn.addEventListener("click", checkIn);
elements.checkOutBtn.addEventListener("click", checkOut);
elements.adminSearch.addEventListener("input", renderAdmin);
elements.exportBtn.addEventListener("click", exportCsv);

restoreSession();
