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

