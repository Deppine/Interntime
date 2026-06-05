function renderStudentProfile() {
  if (state.user?.role !== "student") {
    return;
  }

  elements.profileStudentId.value = state.user.id || "";
  elements.profileStudentName.value = state.user.name || "";
  elements.profileStudentMajor.value = state.user.major || "";
  elements.profileEducationLevel.value = state.user.educationLevel || "";
  elements.profilePhone.value = state.user.phone || "";
  elements.profileGuardianName.value = state.user.guardianName || "";
  elements.profileGuardianPhone.value = state.user.guardianPhone || "";
  elements.profileWorkplace.value = state.user.workplace?.name || "";
  elements.profileWorkplaceAddress.value = state.user.workplace?.address || "";
  elements.profileMentorName.value = state.user.workplace?.mentorName || "";
  elements.profileMentorPhone.value = state.user.workplace?.mentorPhone || "";
  elements.profileResidenceAddress.value = state.user.residenceAddress || "";
  elements.profileRoommate.value = state.user.roommate || "";
  elements.profileSchedule.value = formatScheduleRule(state.user);
  elements.profileMapRule.value = state.user.workplace?.mapLink || formatLatLngRule(state.user);
  elements.profileRadiusRule.value = state.user.workplace?.radius ? `${state.user.workplace.radius} เมตร` : "Admin ยังไม่ได้ตั้งค่ารัศมี";
  const status = profileStatusMeta(state.user);
  elements.profileDataStatus.textContent = status.label;
  elements.profileDataStatus.className = `profile-status-badge ${status.className}`;
  elements.profileUpdatedAt.textContent = formattedProfileUpdatedAt(state.user);
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

function validateStudentProfileInfo() {
  return validateRequiredFields([
    { element: elements.profilePhone, message: "กรุณากรอกเบอร์โทรนักศึกษา" },
    { element: elements.profileGuardianName, message: "กรุณากรอกชื่อผู้ปกครอง" },
    { element: elements.profileGuardianPhone, message: "กรุณากรอกเบอร์โทรผู้ปกครอง" },
    { element: elements.profileWorkplace, message: "กรุณากรอกสถานที่ฝึกงาน" },
    { element: elements.profileWorkplaceAddress, message: "กรุณากรอกที่อยู่สถานประกอบการ" },
  ]);
}

async function saveStudentProfile(event) {
  event.preventDefault();

  if (state.user?.role !== "student") {
    return;
  }

  if (!validateStudentProfileInfo()) {
    return;
  }

  const nextPassword = validateProfilePasswordChange();
  if (nextPassword === false) {
    return;
  }

  const workplaceName = elements.profileWorkplace.value.trim();
  const educationLevel = elements.profileEducationLevel.value.trim();
  const phone = elements.profilePhone.value.trim();
  const guardianName = elements.profileGuardianName.value.trim();
  const guardianPhone = elements.profileGuardianPhone.value.trim();
  const workplaceAddress = elements.profileWorkplaceAddress.value.trim();
  const mentorName = elements.profileMentorName.value.trim();
  const mentorPhone = elements.profileMentorPhone.value.trim();
  const residenceAddress = elements.profileResidenceAddress.value.trim();
  const roommate = elements.profileRoommate.value.trim();
  const currentWorkplaceName = String(state.user.workplace?.name || "").trim();
  const currentEducationLevel = String(state.user.educationLevel || "").trim();
  const changedProfileFields = [
    [educationLevel, currentEducationLevel],
    [phone, state.user.phone],
    [guardianName, state.user.guardianName],
    [guardianPhone, state.user.guardianPhone],
    [workplaceName, currentWorkplaceName],
    [workplaceAddress, state.user.workplace?.address],
    [mentorName, state.user.workplace?.mentorName],
    [mentorPhone, state.user.workplace?.mentorPhone],
    [residenceAddress, state.user.residenceAddress],
    [roommate, state.user.roommate],
  ].some(([nextValue, currentValue]) => nextValue !== String(currentValue || "").trim());

  if (!state.selectedProfilePhoto && !nextPassword && !changedProfileFields) {
    await showAlert("ไม่มีข้อมูลที่เปลี่ยนแปลง", "กรุณาแก้ไขข้อมูลโปรไฟล์ เลือกรูปโปรไฟล์ใหม่ หรือกรอกรหัสผ่านใหม่ก่อนบันทึก", "i");
    return;
  }

  const students = getStudents();
  const updatedStudent = normalizeStudent({
    ...state.user,
    educationLevel,
    phone,
    guardianName,
    guardianPhone,
    residenceAddress,
    roommate,
    profileStatus: "pending",
    profileUpdatedAt: new Date().toISOString(),
    password: nextPassword || state.user.password,
    profilePhoto: state.selectedProfilePhoto || state.user.profilePhoto || "",
    workplace: {
      ...(state.user.workplace || {}),
      name: workplaceName,
      address: workplaceAddress,
      mentorName,
      mentorPhone,
    },
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

