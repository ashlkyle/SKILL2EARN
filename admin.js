
"use strict";

const AdminApp = (() => {
  const STORAGE_KEY = "skill2earn_admin_demo_v1";

  const initialData = {
    verifications: [
      { id: "V-1001", name: "Mika Santos", email: "mika.santos@edu.ph", role: "Student", document: "Student ID", status: "Pending" },
      { id: "V-1002", name: "Daniel Reyes", email: "daniel.reyes@edu.ph", role: "Student", document: "School ID", status: "Pending" },
      { id: "V-1003", name: "BrightPixel Studio", email: "hello@brightpixel.example", role: "Employer", document: "Business ID", status: "Pending" },
      { id: "V-1004", name: "Alex Cruz", email: "alex.cruz@example.com", role: "Individual Client", document: "Government ID", status: "Pending" },
      { id: "V-1005", name: "Jamie Flores", email: "jamie.flores@edu.ph", role: "Student", document: "Student ID", status: "Approved" }
    ],
    jobs: [
      { id: "J-2001", title: "Social Media Assistant", employer: "BrightPixel Studio", category: "Marketing", status: "Open" },
      { id: "J-2002", title: "Short-Form Video Editor", employer: "Alex Cruz", category: "Video Editing", status: "Open" },
      { id: "J-2003", title: "Website Content Writer", employer: "Northstar Media", category: "Writing", status: "Open" },
      { id: "J-2004", title: "Data Entry Assistant", employer: "BrightPixel Studio", category: "Admin Support", status: "Closed" }
    ],
    reports: [
      { id: "R-3001", type: "Bug Report", subject: "Job filter not updating", reporter: "Mika Santos", date: "2026-10-21", status: "Open" },
      { id: "R-3002", type: "User Report", subject: "Suspicious job listing", reporter: "Jamie Flores", date: "2026-10-21", status: "Open" },
      { id: "R-3003", type: "Support Request", subject: "Unable to update profile", reporter: "Alex Cruz", date: "2026-10-20", status: "In Review" }
    ],
    settings: { demoMode: true, notifications: true }
  };

  function loadData() {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return structuredClone(initialData);
      const parsed = JSON.parse(saved);
      return {
        verifications: Array.isArray(parsed.verifications) ? parsed.verifications : structuredClone(initialData.verifications),
        jobs: Array.isArray(parsed.jobs) ? parsed.jobs : structuredClone(initialData.jobs),
        reports: Array.isArray(parsed.reports) ? parsed.reports : structuredClone(initialData.reports),
        settings: { ...initialData.settings, ...(parsed.settings || {}) }
      };
    } catch {
      return structuredClone(initialData);
    }
  }

  let data = loadData();

  function saveData() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // The demo remains usable even if browser storage is unavailable.
    }
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function badge(status) {
    const className = {
      Pending: "badge-pending",
      Approved: "badge-approved",
      Rejected: "badge-rejected",
      Open: "badge-open",
      Closed: "badge-closed",
      "In Review": "badge-pending",
      Resolved: "badge-approved"
    }[status] || "badge-closed";

    return `<span class="admin-badge ${className}">${escapeHTML(status)}</span>`;
  }

  function toast(message) {
    document.querySelector(".admin-toast")?.remove();
    const element = document.createElement("div");
    element.className = "admin-toast";
    element.setAttribute("role", "status");
    element.textContent = message;
    document.body.appendChild(element);
    window.setTimeout(() => element.remove(), 3500);
  }

  function confirmDemo(action) {
    return window.confirm(`${action}\n\nThis is a frontend demo only. No real account, identity, or database record will be changed.`);
  }

  function renderDashboard() {
    const pending = data.verifications.filter(item => item.status === "Pending").length;
    const openJobs = data.jobs.filter(item => item.status === "Open").length;
    const openReports = data.reports.filter(item => item.status !== "Resolved").length;

    document.querySelectorAll("[data-stat]").forEach(element => {
      const stats = {
        students: "128",
        employers: "24",
        jobs: String(openJobs),
        pending: String(pending),
        reports: String(openReports)
      };
      if (element.dataset.stat in stats) element.textContent = stats[element.dataset.stat];
    });

    const table = document.querySelector("#recentVerifications");
    if (table) {
      const recent = data.verifications.filter(item => item.status === "Pending").slice(0, 4);
      table.innerHTML = recent.length ? recent.map(item => `
        <tr>
          <td class="primary-cell">${escapeHTML(item.name)}<small>${escapeHTML(item.email)}</small></td>
          <td>${escapeHTML(item.role)}</td>
          <td>${badge(item.status)}</td>
          <td><a class="admin-btn small" href="verifications.html">Review</a></td>
        </tr>`).join("") : `<tr><td colspan="4" class="admin-empty">No pending verifications.</td></tr>`;
    }

    const reportList = document.querySelector("#recentReports");
    if (reportList) {
      const recentReports = data.reports.filter(item => item.status !== "Resolved").slice(0, 3);
      reportList.innerHTML = recentReports.length ? recentReports.map(item => `
        <div class="admin-check-row">
          <div><strong>${escapeHTML(item.subject)}</strong><p>${escapeHTML(item.type)} · ${escapeHTML(item.reporter)}</p></div>
          ${badge(item.status)}
        </div>`).join("") : `<div class="admin-empty">No unresolved reports.</div>`;
    }
  }

  function renderVerifications() {
    const tbody = document.querySelector("#verificationRows");
    if (!tbody) return;

    const search = (document.querySelector("#verificationSearch")?.value || "").toLowerCase();
    const role = document.querySelector("#verificationRole")?.value || "All";
    const status = document.querySelector("#verificationStatus")?.value || "All";

    const rows = data.verifications.filter(item => {
      const matchesSearch = `${item.name} ${item.email} ${item.id}`.toLowerCase().includes(search);
      return matchesSearch &&
        (role === "All" || item.role === role) &&
        (status === "All" || item.status === status);
    });

    tbody.innerHTML = rows.length ? rows.map(item => `
      <tr>
        <td class="primary-cell">${escapeHTML(item.id)}</td>
        <td class="primary-cell">${escapeHTML(item.name)}<small>${escapeHTML(item.email)}</small></td>
        <td>${escapeHTML(item.role)}</td>
        <td>${escapeHTML(item.document)}</td>
        <td>${badge(item.status)}</td>
        <td><div class="admin-actions">
          ${item.status === "Pending" ? `
            <button class="admin-btn success small" data-action="approve-verification" data-id="${escapeHTML(item.id)}">Approve</button>
            <button class="admin-btn danger small" data-action="reject-verification" data-id="${escapeHTML(item.id)}">Reject</button>` :
            `<button class="admin-btn small" data-action="reset-verification" data-id="${escapeHTML(item.id)}">Reset demo</button>`}
        </div></td>
      </tr>`).join("") : `<tr><td colspan="6" class="admin-empty">No verification requests match your filters.</td></tr>`;
  }

  function renderJobs() {
    const tbody = document.querySelector("#jobRows");
    if (!tbody) return;

    const search = (document.querySelector("#jobSearch")?.value || "").toLowerCase();
    const status = document.querySelector("#jobStatus")?.value || "All";
    const rows = data.jobs.filter(item =>
      `${item.title} ${item.employer} ${item.category} ${item.id}`.toLowerCase().includes(search) &&
      (status === "All" || item.status === status)
    );

    tbody.innerHTML = rows.length ? rows.map(item => `
      <tr>
        <td class="primary-cell">${escapeHTML(item.title)}<small>${escapeHTML(item.id)}</small></td>
        <td>${escapeHTML(item.employer)}</td>
        <td>${escapeHTML(item.category)}</td>
        <td>${badge(item.status)}</td>
        <td><div class="admin-actions">
          ${item.status === "Open"
            ? `<button class="admin-btn danger small" data-action="close-job" data-id="${escapeHTML(item.id)}">Close listing</button>`
            : `<button class="admin-btn success small" data-action="reopen-job" data-id="${escapeHTML(item.id)}">Reopen</button>`}
        </div></td>
      </tr>`).join("") : `<tr><td colspan="5" class="admin-empty">No jobs match your filters.</td></tr>`;
  }

  function renderReports() {
    const tbody = document.querySelector("#reportRows");
    if (!tbody) return;

    const search = (document.querySelector("#reportSearch")?.value || "").toLowerCase();
    const status = document.querySelector("#reportStatus")?.value || "All";
    const rows = data.reports.filter(item =>
      `${item.subject} ${item.reporter} ${item.type} ${item.id}`.toLowerCase().includes(search) &&
      (status === "All" || item.status === status)
    );

    tbody.innerHTML = rows.length ? rows.map(item => `
      <tr>
        <td class="primary-cell">${escapeHTML(item.id)}</td>
        <td>${escapeHTML(item.type)}</td>
        <td class="primary-cell">${escapeHTML(item.subject)}<small>Reported by ${escapeHTML(item.reporter)}</small></td>
        <td>${escapeHTML(item.date)}</td>
        <td>${badge(item.status)}</td>
        <td><div class="admin-actions">
          ${item.status !== "Resolved"
            ? `<button class="admin-btn success small" data-action="resolve-report" data-id="${escapeHTML(item.id)}">Mark resolved</button>`
            : `<button class="admin-btn small" data-action="reopen-report" data-id="${escapeHTML(item.id)}">Reopen</button>`}
        </div></td>
      </tr>`).join("") : `<tr><td colspan="6" class="admin-empty">No reports match your filters.</td></tr>`;
  }

  function renderSettings() {
    const demoMode = document.querySelector("#demoMode");
    const notifications = document.querySelector("#adminNotifications");
    if (demoMode) demoMode.checked = Boolean(data.settings.demoMode);
    if (notifications) notifications.checked = Boolean(data.settings.notifications);
  }

  function renderCurrentPage() {
    const page = document.body.dataset.adminPage;
    if (page === "dashboard") renderDashboard();
    if (page === "verifications") renderVerifications();
    if (page === "jobs") renderJobs();
    if (page === "reports") renderReports();
    if (page === "settings") renderSettings();
  }

  function handleAction(action, id) {
    const verification = data.verifications.find(item => item.id === id);
    const job = data.jobs.find(item => item.id === id);
    const report = data.reports.find(item => item.id === id);

    if (action === "approve-verification" && verification && confirmDemo(`Approve the demo request for ${verification.name}?`)) {
      verification.status = "Approved";
      toast("Demo verification marked as approved.");
    } else if (action === "reject-verification" && verification && confirmDemo(`Reject the demo request for ${verification.name}?`)) {
      verification.status = "Rejected";
      toast("Demo verification marked as rejected.");
    } else if (action === "reset-verification" && verification && confirmDemo(`Reset ${verification.name}'s demo verification to Pending?`)) {
      verification.status = "Pending";
      toast("Demo verification reset.");
    } else if (action === "close-job" && job && confirmDemo(`Close the demo listing "${job.title}"?`)) {
      job.status = "Closed";
      toast("Demo listing marked as closed.");
    } else if (action === "reopen-job" && job && confirmDemo(`Reopen the demo listing "${job.title}"?`)) {
      job.status = "Open";
      toast("Demo listing marked as open.");
    } else if (action === "resolve-report" && report && confirmDemo(`Mark "${report.subject}" as resolved?`)) {
      report.status = "Resolved";
      toast("Demo report marked as resolved.");
    } else if (action === "reopen-report" && report && confirmDemo(`Reopen "${report.subject}"?`)) {
      report.status = "Open";
      toast("Demo report reopened.");
    } else {
      renderCurrentPage();
      return;
    }

    saveData();
    renderCurrentPage();
  }

  function bindEvents() {
    document.addEventListener("click", event => {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      handleAction(button.dataset.action, button.dataset.id);
    });

    ["verificationSearch", "verificationRole", "verificationStatus"].forEach(id => {
      document.getElementById(id)?.addEventListener("input", renderVerifications);
      document.getElementById(id)?.addEventListener("change", renderVerifications);
    });

    ["jobSearch", "jobStatus"].forEach(id => {
      document.getElementById(id)?.addEventListener("input", renderJobs);
      document.getElementById(id)?.addEventListener("change", renderJobs);
    });

    ["reportSearch", "reportStatus"].forEach(id => {
      document.getElementById(id)?.addEventListener("input", renderReports);
      document.getElementById(id)?.addEventListener("change", renderReports);
    });

    document.querySelector("#adminLoginForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const email = document.querySelector("#adminEmail")?.value.trim();
      const password = document.querySelector("#adminPassword")?.value;
      const message = document.querySelector("#adminLoginMessage");
      if (!email || !password) {
        if (message) message.textContent = "Enter the demo email and password.";
        return;
      }
      if (message) message.textContent = "Demo login successful. Opening admin dashboard…";
      window.setTimeout(() => { window.location.href = "dashboard.html"; }, 500);
    });

    document.querySelector("#saveAdminSettings")?.addEventListener("click", () => {
      data.settings.demoMode = Boolean(document.querySelector("#demoMode")?.checked);
      data.settings.notifications = Boolean(document.querySelector("#adminNotifications")?.checked);
      saveData();
      toast("Demo settings saved for this browser session.");
    });

    document.querySelector("#resetAdminDemo")?.addEventListener("click", () => {
      if (!window.confirm("Reset all admin demo changes and restore the sample data?")) return;
      data = structuredClone(initialData);
      saveData();
      renderCurrentPage();
      toast("Admin demo data reset.");
    });

    document.querySelector("#adminLogout")?.addEventListener("click", event => {
      event.preventDefault();
      window.location.href = "login.html";
    });
  }

  function init() {
    bindEvents();
    renderCurrentPage();
  }

  document.addEventListener("DOMContentLoaded", init);

  return { init, renderCurrentPage };
})();