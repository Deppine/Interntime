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
  accountVisibleCount: 5,
  editingStudentId: null,
};

const DAY_ROLLOVER_CHECK_MS = 60 * 1000;
const HISTORY_PAGE_SIZE = 5;
const ACCOUNT_PAGE_SIZE = 5;

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
  historyDateFilter: document.querySelector("#historyDateFilter"),
  historyReportSummary: document.querySelector("#historyReportSummary"),
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
  accountEducationLevel: document.querySelector("#accountEducationLevel"),
  accountPhone: document.querySelector("#accountPhone"),
  accountGuardianName: document.querySelector("#accountGuardianName"),
  accountGuardianPhone: document.querySelector("#accountGuardianPhone"),
  accountStudentPassword: document.querySelector("#accountStudentPassword"),
  accountReviewStatus: document.querySelector("#accountReviewStatus"),
  accountWorkplace: document.querySelector("#accountWorkplace"),
  accountWorkplaceAddress: document.querySelector("#accountWorkplaceAddress"),
  accountMentorName: document.querySelector("#accountMentorName"),
  accountMentorPhone: document.querySelector("#accountMentorPhone"),
  accountResidenceAddress: document.querySelector("#accountResidenceAddress"),
  accountRoommate: document.querySelector("#accountRoommate"),
  accountScheduleRadios: document.querySelectorAll('input[name="accountSchedule"]'),
  accountScheduleOther: document.querySelector("#accountScheduleOther"),
  accountCustomScheduleFields: document.querySelector("#accountCustomScheduleFields"),
  accountCustomSchedule: document.querySelector("#accountCustomSchedule"),
  accountStartTime: document.querySelector("#accountStartTime"),
  accountEndTime: document.querySelector("#accountEndTime"),
  accountMapsLink: document.querySelector("#accountMapsLink"),
  accountRadius: document.querySelector("#accountRadius"),
  accountSubmitBtn: document.querySelector("#accountSubmitBtn"),
  accountCancelEditBtn: document.querySelector("#accountCancelEditBtn"),
  accountSearch: document.querySelector("#accountSearch"),
  accountStatusFilter: document.querySelector("#accountStatusFilter"),
  accountSummary: document.querySelector("#accountSummary"),
  accountViewMoreBtn: document.querySelector("#accountViewMoreBtn"),
  studentAccountList: document.querySelector("#studentAccountList"),
  studentProfileForm: document.querySelector("#studentProfileForm"),
  profilePhotoInput: document.querySelector("#profilePhotoInput"),
  profilePhotoBtn: document.querySelector("#profilePhotoBtn"),
  profilePhotoName: document.querySelector("#profilePhotoName"),
  profileDataStatus: document.querySelector("#profileDataStatus"),
  profileUpdatedAt: document.querySelector("#profileUpdatedAt"),
  profileAvatarInitial: document.querySelector("#profileAvatarInitial"),
  profileAvatarImg: document.querySelector("#profileAvatarImg"),
  profileStudentId: document.querySelector("#profileStudentId"),
  profileStudentName: document.querySelector("#profileStudentName"),
  profileStudentMajor: document.querySelector("#profileStudentMajor"),
  profileEducationLevel: document.querySelector("#profileEducationLevel"),
  profilePhone: document.querySelector("#profilePhone"),
  profileGuardianName: document.querySelector("#profileGuardianName"),
  profileGuardianPhone: document.querySelector("#profileGuardianPhone"),
  profileWorkplace: document.querySelector("#profileWorkplace"),
  profileWorkplaceAddress: document.querySelector("#profileWorkplaceAddress"),
  profileMentorName: document.querySelector("#profileMentorName"),
  profileMentorPhone: document.querySelector("#profileMentorPhone"),
  profileResidenceAddress: document.querySelector("#profileResidenceAddress"),
  profileRoommate: document.querySelector("#profileRoommate"),
  profileSchedule: document.querySelector("#profileSchedule"),
  profileMapRule: document.querySelector("#profileMapRule"),
  profileRadiusRule: document.querySelector("#profileRadiusRule"),
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
    educationLevel: String(student.educationLevel || "").trim(),
    phone: String(student.phone || "").trim(),
    guardianName: String(student.guardianName || "").trim(),
    guardianPhone: String(student.guardianPhone || "").trim(),
    residenceAddress: String(student.residenceAddress || "").trim(),
    roommate: String(student.roommate || "").trim(),
    profileStatus: String(student.profileStatus || "pending").trim(),
    profileUpdatedAt: String(student.profileUpdatedAt || "").trim(),
    password: String(student.password || "student123"),
    profilePhoto: String(student.profilePhoto || ""),
    workplace: {
      name: String(workplace.name || "").trim(),
      address: String(workplace.address || "").trim(),
      mentorName: String(workplace.mentorName || "").trim(),
      mentorPhone: String(workplace.mentorPhone || "").trim(),
      mapLink: String(workplace.mapLink || "").trim(),
      schedulePreset: String(workplace.schedulePreset || "").trim(),
      scheduleLabel: String(workplace.scheduleLabel || "").trim(),
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
  return storedStudents;
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
    educationLevel: "",
    phone: "",
    guardianName: "",
    guardianPhone: "",
    residenceAddress: "",
    roommate: "",
    profileStatus: "pending",
    profileUpdatedAt: "",
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

