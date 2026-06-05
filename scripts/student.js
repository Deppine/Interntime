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
    const reportDate = selectedHistoryReportDate();
    const reportRows = buildDailyReportRows(reportDate);
    const checkedIn = reportRows.filter((record) => !record.isMissing);
    const done = checkedIn.filter((record) => record.checkOut);
    const late = checkedIn.filter((record) => record.status === "มาสาย");

    elements.historyReportSummary.innerHTML = `
      <div class="stat-card"><span>นักศึกษาทั้งหมด</span><strong>${reportRows.length}</strong></div>
      <div class="stat-card"><span>เช็คอินแล้ว</span><strong>${checkedIn.length}</strong></div>
      <div class="stat-card"><span>ยังไม่เช็คอิน</span><strong>${reportRows.length - checkedIn.length}</strong></div>
      <div class="stat-card"><span>เช็คเอาท์แล้ว</span><strong>${done.length}</strong></div>
      <div class="stat-card"><span>มาสาย</span><strong>${late.length}</strong></div>
    `;

    elements.historyList.innerHTML = `
      <p class="history-meta">รายงานประจำวันที่ ${prettyDate(reportDate)} แสดงนักศึกษา ${reportRows.length} คน</p>
      ${reportRows.map(recordCardTemplate).join("")}
    `;
    return;
  }

  elements.historyReportSummary.innerHTML = "";
  elements.historyList.innerHTML = records.length
    ? records.map(recordCardTemplate).join("")
    : `<p class="hint">ยังไม่มีประวัติการบันทึกเวลา</p>`;
}

function showMoreHistory() {
  state.historyVisibleCount += HISTORY_PAGE_SIZE;
  renderHistory();
}

function selectedHistoryReportDate() {
  if (!elements.historyDateFilter.value) {
    elements.historyDateFilter.value = todayKey();
  }
  return elements.historyDateFilter.value;
}

function buildDailyReportRows(date = selectedHistoryReportDate()) {
  const records = getRecords().filter((record) => record.date === date);
  const students = getStudents().sort((a, b) => a.id.localeCompare(b.id));

  return students.map((student) => {
    const record = records.find((item) => item.studentId === student.id);
    if (record) {
      return {
        ...record,
        workplaceName: record.workplaceName || student.workplace?.name || "",
        phone: student.phone || "",
        profileStatus: profileStatusMeta(student).label,
        profileUpdatedAt: student.profileUpdatedAt || "",
        guardianName: student.guardianName || "",
        guardianPhone: student.guardianPhone || "",
        workplaceAddress: student.workplace?.address || "",
        mentorName: student.workplace?.mentorName || "",
        mentorPhone: student.workplace?.mentorPhone || "",
        residenceAddress: student.residenceAddress || "",
        roommate: student.roommate || "",
        educationLevel: student.educationLevel || "",
        profilePhoto: student.profilePhoto || "",
      };
    }

    return {
      id: `missing-${student.id}-${date}`,
      isMissing: true,
      studentId: student.id,
      studentName: student.name,
      educationLevel: student.educationLevel || "",
      phone: student.phone || "",
      profileStatus: profileStatusMeta(student).label,
      profileUpdatedAt: student.profileUpdatedAt || "",
      guardianName: student.guardianName || "",
      guardianPhone: student.guardianPhone || "",
      workplaceAddress: student.workplace?.address || "",
      mentorName: student.workplace?.mentorName || "",
      mentorPhone: student.workplace?.mentorPhone || "",
      residenceAddress: student.residenceAddress || "",
      roommate: student.roommate || "",
      date,
      checkIn: "",
      checkOut: "",
      status: "รอเช็คอิน",
      location: null,
      workplaceName: student.workplace?.name || "",
      profilePhoto: student.profilePhoto || "",
      distanceMeters: null,
      hasPhoto: false,
    };
  });
}
