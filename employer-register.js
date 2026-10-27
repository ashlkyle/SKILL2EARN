
document.addEventListener("DOMContentLoaded", () => {
  const type = document.querySelector("#accountType");
  const label = document.querySelector("#nameLabel");
  const name = document.querySelector("#fullName");

  if (!type || !label || !name) return;

  function updateLabel() {
    const isCompany = type.value === "Company";
    label.textContent = isCompany
      ? "Company name *"
      : type.value === "Individual Client"
        ? "Full name *"
        : "Company / full name *";

    name.placeholder = isCompany
      ? "Enter your registered company name"
      : type.value === "Individual Client"
        ? "Enter your full name"
        : "Enter your company or full name";
  }

  type.addEventListener("change", updateLabel);
  updateLabel();
});