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
      const latestStudent = getStudents().find((student) => student.id === state.user.id);
      if (latestStudent) {
        state.user = { ...latestStudent, role: "student" };
      }
      elements.userId.value = state.user.id || "65010001";
      elements.password.value = state.user.password || "student123";
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
elements.refreshBtn?.addEventListener("click", refreshCurrentView);
elements.mobileMenuToggle?.addEventListener("click", toggleMobileMenu);
elements.mobileMenuClose?.addEventListener("click", closeMobileMenu);
elements.mobileMenuBackdrop?.addEventListener("click", closeMobileMenu);
elements.mobileLogoutBtn.addEventListener("click", () => {
  closeMobileMenu();
  logout();
});
elements.mobileRefreshBtn?.addEventListener("click", () => {
  closeMobileMenu();
  refreshCurrentView();
});
elements.navItems.forEach((item) => item.addEventListener("click", () => showView(item.dataset.view)));
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});
elements.photoPickerBtn.addEventListener("click", openPhotoPicker);
elements.photoPickerBtn.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    openPhotoPicker(event);
  }
});
elements.cameraInput.addEventListener("change", handlePhoto);
elements.photoInput.addEventListener("change", handlePhoto);
elements.checkInBtn.addEventListener("click", checkIn);
elements.checkOutBtn.addEventListener("click", checkOut);
elements.adminSearch.addEventListener("input", renderAdmin);
elements.adminDateFilter.addEventListener("change", renderAdmin);
elements.accountSearch?.addEventListener("input", () => {
  state.accountVisibleCount = ACCOUNT_PAGE_SIZE;
  renderAccounts();
});
elements.accountStatusFilter?.addEventListener("change", () => {
  state.accountVisibleCount = ACCOUNT_PAGE_SIZE;
  renderAccounts();
});
elements.accountViewMoreBtn?.addEventListener("click", showMoreAccounts);
elements.adminStatusFilter.addEventListener("click", (event) => {
  const button = event.target.closest("[data-status]");
  if (!button) {
    return;
  }

  setAdminStatusFilter(button.dataset.status);
  renderAdmin();
});
elements.adminClearDateFilter.addEventListener("click", () => {
  elements.adminDateFilter.value = "";
  setAdminStatusFilter("all");
  renderAdmin();
});
elements.historyDateFilter.addEventListener("change", () => {
  state.historyVisibleCount = HISTORY_PAGE_SIZE;
  renderHistory();
});
elements.accountForm.addEventListener("submit", createStudentAccount);
elements.accountCancelEditBtn.addEventListener("click", resetAccountForm);
elements.profilePhotoBtn.addEventListener("click", () => elements.profilePhotoInput.click());
elements.profilePhotoInput.addEventListener("change", handleProfilePhoto);
elements.studentProfileForm.addEventListener("submit", saveStudentProfile);
elements.studentAccountList.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-student-detail]");
  if (detailButton) {
    showStudentAccountDetail(detailButton.dataset.studentDetail);
    return;
  }

  const editButton = event.target.closest("[data-student-edit]");
  if (editButton) {
    editStudentAccount(editButton.dataset.studentEdit);
    return;
  }

  const deleteButton = event.target.closest("[data-student-delete]");
  if (deleteButton) {
    deleteStudentAccount(deleteButton.dataset.studentDelete);
  }
});
elements.historyList.addEventListener("click", (event) => {
  if (event.target.closest("#historyViewMoreBtn")) {
    showMoreHistory();
  }
});
elements.exportBtn.addEventListener("click", exportCsv);

setupInlineValidation();
startDayRolloverWatcher();
restoreSession();
