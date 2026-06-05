function exportCsv() {
  const isAdminReport = state.user?.role === "admin";
  const reportDate = isAdminReport ? selectedHistoryReportDate() : todayKey();
  const exportRecords = isAdminReport
    ? buildDailyReportRows(reportDate)
    : getRecords().filter((record) => record.studentId === state.user?.id);
  const rows = [
    [
      "student_id",
      "student_name",
      "education_level",
      "student_phone",
      "profile_status",
      "profile_updated_at",
      "guardian_name",
      "guardian_phone",
      "workplace",
      "workplace_address",
      "mentor_name",
      "mentor_phone",
      "residence_address",
      "roommate",
      "date",
      "check_in",
      "check_out",
      "status",
      "latitude",
      "longitude",
      "distance_meters",
      "has_photo",
    ],
    ...exportRecords.map((record) => [
      record.studentId,
      record.studentName,
      record.educationLevel || (!isAdminReport ? state.user?.educationLevel || "" : ""),
      record.phone || (!isAdminReport ? state.user?.phone || "" : ""),
      record.profileStatus || (!isAdminReport ? profileStatusMeta(state.user).label : ""),
      record.profileUpdatedAt || (!isAdminReport ? state.user?.profileUpdatedAt || "" : ""),
      record.guardianName || (!isAdminReport ? state.user?.guardianName || "" : ""),
      record.guardianPhone || (!isAdminReport ? state.user?.guardianPhone || "" : ""),
      record.workplaceName || "",
      record.workplaceAddress || (!isAdminReport ? state.user?.workplace?.address || "" : ""),
      record.mentorName || (!isAdminReport ? state.user?.workplace?.mentorName || "" : ""),
      record.mentorPhone || (!isAdminReport ? state.user?.workplace?.mentorPhone || "" : ""),
      record.residenceAddress || (!isAdminReport ? state.user?.residenceAddress || "" : ""),
      record.roommate || (!isAdminReport ? state.user?.roommate || "" : ""),
      record.date,
      record.checkIn,
      record.checkOut,
      record.status,
      record.location?.lat || "",
      record.location?.lng || "",
      record.distanceMeters || "",
      record.hasPhoto ? "yes" : "no",
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = isAdminReport ? `intern-report-${reportDate}.csv` : `intern-time-${state.user?.id || todayKey()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
