function missingStudentTemplate(student) {
  return `
    <div class="missing-item">
      <div>
        <strong>${student.name}</strong>
        <span>${student.id} · ${student.major}${student.educationLevel ? ` · ${student.educationLevel}` : ""}</span>
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
  const statusClass = record.isMissing ? "waiting" : record.checkOut ? "done" : "active";
  const showProfilePhoto = Object.hasOwn(record, "profilePhoto");
  const profileImage = record.profilePhoto
    ? `<img class="student-profile-photo" src="${record.profilePhoto}" alt="รูปโปรไฟล์ ${record.studentName}" />`
    : `<div class="student-profile-badge" aria-label="รูปโปรไฟล์ ${record.studentName}">${avatarInitial({ name: record.studentName, id: record.studentId })}</div>`;
  const image = showProfilePhoto
    ? profileImage
    : record.hasPhoto
    ? `<div class="photo-badge" aria-label="มีรูปภาพเช็คอิน"><span>▣</span><small>มีรูป</small></div>`
    : `<div class="photo-badge empty" aria-label="ไม่มีรูปภาพเช็คอิน"><span>-</span><small>ไม่มีรูป</small></div>`;
  const workplaceText = record.workplaceName ? `<p>สถานที่ ${record.workplaceName}${record.distanceMeters ? ` · ระยะ ${record.distanceMeters} เมตร` : ""}</p>` : "";
  const gpsText = record.location ? `<p>GPS ${record.location.lat.toFixed(5)}, ${record.location.lng.toFixed(5)}</p>` : `<p>GPS -</p>`;

  return `
    <article class="record-card">
      ${image}
      <div>
        <h4>${record.studentName}</h4>
        <p>${prettyDate(record.date)} · เช็คอิน ${prettyTime(record.checkIn)} · เช็คเอาท์ ${prettyTime(record.checkOut)}</p>
        ${workplaceText}
        ${gpsText}
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
  const educationText = student.educationLevel ? ` · ${student.educationLevel}` : "";
  const workplace = student.workplace || {};
  const status = profileStatusMeta(student);
  return `
    <article class="account-card">
      <div class="account-card-main">
        <div class="account-card-head">
          <strong>${student.name}</strong>
          <span>${student.id}</span>
          <em class="profile-status-badge ${status.className}">${status.label}</em>
        </div>
        <p>${student.id} · ${student.major}${educationText}</p>
        <p>โทร ${student.phone || "-"} · สถานประกอบการ ${workplace.name || "-"}</p>
        <p>${formatScheduleRule(student)}</p>
        <p>${formattedProfileUpdatedAt(student)}</p>
      </div>
      <div class="account-actions">
        <button class="secondary-btn account-detail-btn" type="button" data-student-detail="${student.id}">ดูรายละเอียด</button>
        <button class="secondary-btn account-edit-btn" type="button" data-student-edit="${student.id}">แก้ไข</button>
        <button class="secondary-btn account-delete-btn" type="button" data-student-delete="${student.id}">ลบ</button>
      </div>
    </article>
  `;
}

function studentDetailHtml(student) {
  const workplace = student.workplace || {};
  const details = [
    ["รหัสนักศึกษา", student.id],
    ["ชื่อ-นามสกุล", student.name],
    ["ระดับ / สาขา", `${student.educationLevel || "-"} · ${student.major || "-"}`],
    ["เบอร์นักศึกษา", student.phone || "-"],
    ["ผู้ปกครอง", student.guardianName ? `${student.guardianName}${student.guardianPhone ? ` · ${student.guardianPhone}` : ""}` : "-"],
    ["สถานประกอบการ", workplace.name || "-"],
    ["ที่อยู่สถานประกอบการ", workplace.address || "-"],
    ["ครูฝึก / พี่เลี้ยง", workplace.mentorName ? `${workplace.mentorName}${workplace.mentorPhone ? ` · ${workplace.mentorPhone}` : ""}` : "-"],
    ["ที่พักปัจจุบัน", student.residenceAddress || "-"],
    ["เพื่อนร่วมห้อง", student.roommate || "-"],
    ["สถานะข้อมูล", profileStatusMeta(student).label],
    ["แก้ไขล่าสุด", formattedProfileUpdatedAt(student)],
    ["วันและเวลาฝึกงาน", formatScheduleRule(student)],
    ["GPS / พิกัด", workplace.mapLink || formatLatLngRule(student)],
    ["รัศมีเช็คอิน", `${workplace.radius || 200} เมตร`],
  ];

  return `
    <div class="account-detail-grid modal-detail-grid">
      ${details
        .map(
          ([label, value]) => `
            <div>
              <span>${label}</span>
              <strong>${value}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

async function showStudentAccountDetail(studentId) {
  const student = getStudents().find((item) => item.id === studentId);
  if (!student) {
    return;
  }

  await showAlertHtml(`ข้อมูล Account: ${student.name}`, studentDetailHtml(student), "i");
}

function renderAccounts() {
  const students = getStudents().sort((a, b) => a.id.localeCompare(b.id));
  const keyword = elements.accountSearch?.value.trim().toLowerCase() || "";
  const selectedStatus = elements.accountStatusFilter?.value || "all";
  const filtered = students.filter((student) => {
    const workplace = student.workplace || {};
    const status = profileStatusMeta(student).key;
    const haystack = [
      student.id,
      student.name,
      student.major,
      student.educationLevel,
      student.phone,
      student.guardianName,
      student.guardianPhone,
      workplace.name,
      workplace.address,
      workplace.mentorName,
      workplace.mentorPhone,
      student.residenceAddress,
      student.roommate,
    ]
      .join(" ")
      .toLowerCase();
    return (!keyword || haystack.includes(keyword)) && (selectedStatus === "all" || status === selectedStatus);
  });
  const visibleAccounts = filtered.slice(0, state.accountVisibleCount);
  const hasMoreAccounts = filtered.length > visibleAccounts.length;

  elements.accountSummary.textContent = keyword
    ? `แสดง ${visibleAccounts.length} จาก ${filtered.length} ผลลัพธ์ / นักศึกษาทั้งหมด ${students.length} คน`
    : `แสดง ${visibleAccounts.length} จากนักศึกษาทั้งหมด ${students.length} คน`;
  elements.studentAccountList.innerHTML = visibleAccounts.length
    ? visibleAccounts.map(accountCardTemplate).join("")
    : `<p class="hint">ไม่พบ account ตามคำค้นหา</p>`;
  elements.accountViewMoreBtn.classList.toggle("hidden", !hasMoreAccounts);
}

function showMoreAccounts() {
  state.accountVisibleCount += ACCOUNT_PAGE_SIZE;
  renderAccounts();
}

function setAccountFormMode(studentId = null) {
  state.editingStudentId = studentId;
  const isEditing = Boolean(studentId);
  elements.accountForm.classList.toggle("is-editing", isEditing);
  elements.accountFormTitle.textContent = isEditing ? "แก้ไข Account นักศึกษา" : "สร้าง Account ให้นักศึกษา";
  elements.accountSubmitBtn.textContent = isEditing ? "บันทึกการแก้ไข" : "สร้าง account";
  elements.accountCancelEditBtn.classList.toggle("hidden", !isEditing);
  elements.accountStudentId.readOnly = isEditing;
  if (!isEditing) {
    elements.accountReviewStatus.value = "pending";
  }
  clearAllFieldErrors(elements.accountForm);
  syncAccountScheduleFields();
}

function resetAccountForm() {
  elements.accountForm.reset();
  setAccountFormMode(null);
}

function selectAccountSchedule(workplace = {}) {
  const radios = Array.from(elements.accountScheduleRadios || []);
  const presetRadio = radios.find((radio) => {
    return (
      radio.value !== "custom" &&
      (radio.value === workplace.schedulePreset ||
        radio.dataset.label === workplace.scheduleLabel ||
        (radio.dataset.start === workplace.startTime && radio.dataset.end === workplace.endTime))
    );
  });

  const selectedRadio = presetRadio || elements.accountScheduleOther || radios[0];
  if (selectedRadio) {
    selectedRadio.checked = true;
  }

  elements.accountCustomSchedule.value = presetRadio ? "" : workplace.scheduleLabel || "";
  elements.accountStartTime.value = workplace.startTime || selectedRadio?.dataset.start || "";
  elements.accountEndTime.value = workplace.endTime || selectedRadio?.dataset.end || "";
  syncAccountScheduleFields();
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
  elements.accountEducationLevel.value = student.educationLevel || "";
  elements.accountPhone.value = student.phone || "";
  elements.accountGuardianName.value = student.guardianName || "";
  elements.accountGuardianPhone.value = student.guardianPhone || "";
  elements.accountStudentPassword.value = student.password;
  elements.accountReviewStatus.value = student.profileStatus || "pending";
  elements.accountWorkplace.value = workplace.name || "";
  elements.accountWorkplaceAddress.value = workplace.address || "";
  elements.accountMentorName.value = workplace.mentorName || "";
  elements.accountMentorPhone.value = workplace.mentorPhone || "";
  elements.accountResidenceAddress.value = student.residenceAddress || "";
  elements.accountRoommate.value = student.roommate || "";
  selectAccountSchedule(workplace);
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

  const isEditing = Boolean(state.editingStudentId);
  const student = normalizeStudent({
    id: elements.accountStudentId.value,
    name: elements.accountStudentName.value,
    major: elements.accountStudentMajor.value,
    educationLevel: elements.accountEducationLevel.value,
    phone: elements.accountPhone.value,
    guardianName: elements.accountGuardianName.value,
    guardianPhone: elements.accountGuardianPhone.value,
    residenceAddress: elements.accountResidenceAddress.value,
    roommate: elements.accountRoommate.value,
    profileStatus: isEditing ? elements.accountReviewStatus.value || "pending" : "pending",
    profileUpdatedAt: new Date().toISOString(),
    password: elements.accountStudentPassword.value,
    profilePhoto: getStudents().find((item) => item.id === elements.accountStudentId.value.trim())?.profilePhoto || "",
    workplace: {
      name: elements.accountWorkplace.value,
      address: elements.accountWorkplaceAddress.value,
      mentorName: elements.accountMentorName.value,
      mentorPhone: elements.accountMentorPhone.value,
      mapLink: elements.accountMapsLink.value,
      schedulePreset: getSelectedAccountSchedule()?.value || "",
      scheduleLabel: getAccountScheduleLabel(),
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
  if (!student) {
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

