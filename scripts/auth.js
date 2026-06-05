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
  state.accountVisibleCount = ACCOUNT_PAGE_SIZE;
  clearSession();
  resetPhotoSelection();
  clearAllFieldErrors();
  elements.dashboard.classList.add("hidden");
  closeMobileMenu();

  elements.loginScreen.classList.remove("hidden");
  setRole("student");
}

