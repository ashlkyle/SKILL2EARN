
/* SKILL2EARN employer frontend prototype.
   Sample data only. No real authentication, uploads,
   job publishing, or admin submissions occur here. */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("#employerApp");
  if (!root) return;

  const page = document.body.dataset.page || "dashboard";

  const nav = [
    ["dashboard", "Dashboard", "⌂", "dashboard.html"],
    ["jobs", "My Job Listings", "▤", "jobs.html"],
    ["post-job", "Post a Job", "+", "post-job.html"],
    ["profile", "My Profile", "◉", "profile.html"],
    ["verification", "ID Verification", "✓", "verification.html"],
    ["support", "Help & Reports", "?", "support.html"],
    ["settings", "Settings", "⚙", "settings.html"]
  ];

  const pages = {
    dashboard: ["EMPLOYER WORKSPACE", "Dashboard", "Manage your sample listings and find the right student talent."],
    jobs: ["YOUR OPPORTUNITIES", "My job listings", "Review and manage your sample job posts."],
    "post-job": ["FIND STUDENT TALENT", "Post a job", "Describe the opportunity and the skills you need."],
    profile: ["YOUR PROFESSIONAL IDENTITY", "My profile", "Manage the information students can view."],
    verification: ["TRUST & SAFETY", "ID verification", "Review the demonstration of the identity verification process."],
    support: ["WE'RE HERE TO HELP", "Help & reports", "Prepare a sample report or view the support contact."],
    settings: ["ACCOUNT PREFERENCES", "Settings", "Review account details and deletion request options."]
  };

  const profile = {
    type: "Company",
    name: "Northstar Creative",
    contact: "Alex Morgan",
    email: "client@example.com",
    bio: "A sample creative team looking to collaborate with emerging student talent.",
    website: "",
    verified: false
  };

  let photoUrl = "";
  let idFileName = "";
  let jobs = [
    {
      id: 1,
      title: "Social Media Graphic Designer",
      category: "Creative",
      type: "Remote",
      budget: "₱800–₱1,500 per project",
      description: "Create engaging social media graphics for a sample campaign.",
      skills: "Canva, Graphic Design",
      status: "Draft"
    },
    {
      id: 2,
      title: "Junior Website Assistant",
      category: "Technology",
      type: "Flexible",
      budget: "₱1,000–₱2,000 per project",
      description: "Assist with basic HTML and CSS updates.",
      skills: "HTML, CSS",
      status: "Draft"
    }
  ];

  let nextId = 3;

  function esc(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function initials(value) {
    return value.trim().split(/\s+/).slice(0, 2)
      .map(part => part[0] || "").join("").toUpperCase() || "E";
  }

  function avatar(className = "employer-avatar") {
    return `<div class="${className}">${photoUrl
      ? `<img src="${photoUrl}" alt="Profile picture">`
      : esc(initials(profile.name))}</div>`;
  }

  function status(text) {
    const className = text === "Verified" || text === "Published"
      ? ""
      : text === "Rejected" ? "rejected" : "pending";
    return `<span class="employer-status ${className}">${esc(text)}</span>`;
  }

  function button(label, action, primary = false, danger = false) {
    return `<button type="button" class="employer-button ${primary ? "employer-button-primary" : ""} ${danger ? "employer-button-danger" : ""}" data-action="${action}">${label}</button>`;
  }

  function heading(kicker, title, description, action = "") {
    return `<div class="employer-heading"><div>
      <div class="employer-eyebrow">${kicker}</div>
      <h1>${title}</h1><p>${description}</p>
    </div>${action}</div>`;
  }

  function jobCard(job) {
    return `<article class="employer-job">
      <div class="employer-job-top">
        <div>
          <h3>${esc(job.title)}</h3>
          <p>${esc(job.category)} · ${esc(job.type)} · ${esc(job.budget)}</p>
        </div>
        ${status(job.status)}
      </div>
      <p style="margin-top:13px;">${esc(job.description)}</p>
      <div class="employer-tags">
        ${job.skills.split(",").map(s => s.trim()).filter(Boolean)
          .map(s => `<span class="employer-tag">${esc(s)}</span>`).join("")}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:17px;">
        ${button("Edit", `edit-job:${job.id}`)}
        ${button("Delete", `delete-job:${job.id}`, false, true)}
      </div>
    </article>`;
  }

  function dashboard() {
    return `${heading("OVERVIEW", "Welcome, " + esc(profile.name), "Your workspace for creating opportunities and connecting with student talent.")}
      <section class="employer-welcome">
        <div class="employer-eyebrow">BUILD YOUR NEXT TEAM</div>
        <h2>Great work starts with the right people.</h2>
        <p>Create clear, student-friendly listings, explain the budget, and show candidates what they can learn and contribute.</p>
        ${button("Create a job listing →", "go:post-job", true)}
      </section>
      <div class="employer-grid">
        <article class="employer-stat"><div class="employer-stat-icon">▤</div><div class="employer-stat-label">Total sample listings</div><div class="employer-stat-value">${jobs.length}</div></article>
        <article class="employer-stat"><div class="employer-stat-icon">◷</div><div class="employer-stat-label">Draft listings</div><div class="employer-stat-value">${jobs.filter(j => j.status === "Draft").length}</div></article>
        <article class="employer-stat"><div class="employer-stat-icon">✓</div><div class="employer-stat-label">Identity verification</div><div class="employer-stat-value">${profile.verified ? "Verified" : "Pending"}</div></article>
      </div>
      <div class="employer-section-heading"><h2>Recent job listings</h2>${button("View all →", "go:jobs")}</div>
      <div class="employer-list">${jobs.slice(0, 3).map(jobCard).join("") || '<div class="employer-panel">No sample listings yet. Create your first job.</div>'}</div>`;
  }

  function jobsPage() {
    return `${heading("YOUR OPPORTUNITIES", "My job listings", "Edit your sample listings or create a new opportunity.", button("+ Post a job", "go:post-job", true))}
      <div class="employer-notice" data-notice role="status" aria-live="polite"></div>
      <div class="employer-section-heading"><h2>All listings</h2><span class="employer-status">${jobs.length} sample posts</span></div>
      <div class="employer-list" id="employerJobList">${jobs.map(jobCard).join("") || '<div class="employer-panel">No listings yet. Select Post a Job to begin.</div>'}</div>`;
  }

  function postJobPage() {
    const editId = new URLSearchParams(location.search).get("edit");
    const existing = jobs.find(j => j.id === Number(editId));
    const job = existing || { title: "", category: "Creative", type: "Remote", budget: "", description: "", skills: "" };

    return `${heading("FIND STUDENT TALENT", existing ? "Edit job listing" : "Create a job listing", "Be clear about responsibilities, required skills, and compensation.")}
      <div class="employer-notice" data-notice role="status" aria-live="polite"></div>
      <section class="employer-panel" style="max-width:850px;">
        <form class="employer-form" id="jobForm" data-edit-id="${existing ? existing.id : ""}">
          <div class="employer-field"><label for="jobTitle">Job title *</label>
            <input class="employer-input" id="jobTitle" name="title" maxlength="120" required value="${esc(job.title)}" placeholder="e.g. Junior Graphic Designer"></div>
          <div class="employer-two-col">
            <div class="employer-field"><label for="jobCategory">Job category *</label>
              <select class="employer-select" id="jobCategory" name="category" required>
                ${["Creative","Technology","Administrative","Writing","Marketing","Other"].map(c => `<option ${job.category === c ? "selected" : ""}>${c}</option>`).join("")}
              </select></div>
            <div class="employer-field"><label for="jobType">Work arrangement *</label>
              <select class="employer-select" id="jobType" name="type" required>
                ${["Remote","Flexible","On-site"].map(t => `<option ${job.type === t ? "selected" : ""}>${t}</option>`).join("")}
              </select></div>
          </div>
          <div class="employer-field"><label for="jobBudget">Budget / compensation *</label>
            <input class="employer-input" id="jobBudget" name="budget" maxlength="100" required value="${esc(job.budget)}" placeholder="e.g. ₱800 per project"></div>
          <div class="employer-field"><label for="jobDescription">Job description and responsibilities *</label>
            <textarea class="employer-textarea" id="jobDescription" name="description" maxlength="2000" required placeholder="Describe the work, deliverables, and expectations.">${esc(job.description)}</textarea></div>
          <div class="employer-field"><label for="jobSkills">Required skills (separate with commas) *</label>
            <input class="employer-input" id="jobSkills" name="skills" maxlength="300" required value="${esc(job.skills)}" placeholder="e.g. Canva, communication"></div>
          <div class="employer-field"><label for="jobDeadline">Application deadline (optional)</label>
            <input class="employer-input" id="jobDeadline" name="deadline" type="date"></div>
          <p class="employer-file-note">Frontend demo only. This form creates a local sample listing. Publishing and employer verification will be connected later.</p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            <button class="employer-button employer-button-primary" type="submit">${existing ? "Save changes" : "Create demo listing"}</button>
            <button class="employer-button" type="button" data-action="go:jobs">Cancel</button>
          </div>
        </form>
      </section>`;
  }

  function profilePage() {
    return `${heading("YOUR PROFESSIONAL IDENTITY", "My profile", "Update your client information and preview what students may see.")}
      <div class="employer-notice" data-notice role="status" aria-live="polite"></div>
      <div class="employer-profile-layout">
        <section class="employer-panel">
          <div class="employer-profile-hero">${avatar("employer-profile-avatar")}<div><h2>${esc(profile.name)}</h2><p class="employer-muted">${esc(profile.type)} account</p><div style="margin-top:8px;">${status(profile.verified ? "Verified" : "Verification pending")}</div></div></div>
          <form class="employer-form" id="profileForm">
            <div class="employer-field"><label for="clientType">Account type</label><input class="employer-input" id="clientType" value="${esc(profile.type)}" disabled><span class="employer-file-note">Account type cannot be changed after registration in this prototype.</span></div>
            <div class="employer-field"><label for="clientName">${profile.type === "Company" ? "Company name" : "Full name"} *</label><input class="employer-input" id="clientName" name="name" maxlength="150" required value="${esc(profile.name)}"></div>
            <div class="employer-field"><label for="clientContact">Contact person *</label><input class="employer-input" id="clientContact" name="contact" maxlength="100" required value="${esc(profile.contact)}"></div>
            <div class="employer-field"><label for="clientEmail">Email</label><input class="employer-input" id="clientEmail" type="email" value="${esc(profile.email)}" disabled><span class="employer-file-note">Email changes will require backend authentication.</span></div>
            <div class="employer-field"><label for="clientWebsite">Website (optional)</label><input class="employer-input" id="clientWebsite" name="website" type="url" maxlength="200" value="${esc(profile.website)}" placeholder="https://example.com"></div>
            <div class="employer-field"><label for="clientBio">About *</label><textarea class="employer-textarea" id="clientBio" name="bio" maxlength="800" required>${esc(profile.bio)}</textarea></div>
            <div class="employer-field"><label for="clientPhoto">Profile picture</label><input class="employer-input" id="clientPhoto" type="file" accept="image/png,image/jpeg,image/webp"><span class="employer-file-note">JPG, PNG, or WebP up to 2 MB. Preview only.</span></div>
            <button class="employer-button employer-button-primary" type="submit">Save profile preview</button>
          </form>
        </section>
        <aside class="employer-panel"><div class="employer-eyebrow">STUDENT PREVIEW</div><h2 id="clientPreviewName">${esc(profile.name)}</h2><p class="employer-muted" id="clientPreviewType">${esc(profile.type)} client</p><div class="employer-resume-section"><h3>About</h3><p id="clientPreviewBio">${esc(profile.bio)}</p></div><div class="employer-resume-section"><h3>Identity status</h3>${status(profile.verified ? "Verified" : "Verification pending")}<p style="margin-top:9px;">A verified badge must only be granted after genuine ID review by the admin.</p></div>${button("Manage ID verification →", "go:verification")}</aside>
      </div>`;
  }

  function verificationPage() {
    return `${heading("TRUST & SAFETY", "ID verification", "Submit a sample ID file and understand the review process.")}
      <div class="employer-notice" data-notice role="status" aria-live="polite"></div>
      <div class="employer-profile-layout">
        <section class="employer-panel">
          <h2>Identity verification request</h2>
          <p class="employer-muted" style="margin-bottom:22px;">The completed system will allow an administrator to review the submitted ID and approve or reject verification.</p>
          <div class="employer-resume-section"><h3>Current status</h3>${status(profile.verified ? "Verified" : "Verification pending")}<p style="margin-top:9px;">No identity check has been performed in this frontend prototype.</p></div>
          <form id="verificationForm" class="employer-form" style="margin-top:22px;">
            <div class="employer-field"><label for="idType">ID type *</label><select class="employer-select" id="idType" required><option value="">Choose ID type</option><option>Government-issued ID</option><option>Business registration document</option><option>Other official identification</option></select></div>
            <div class="employer-field"><label for="idFile">Upload ID file *</label><input class="employer-input" id="idFile" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required><span class="employer-file-note">Demo accepts JPG, PNG, WebP, or PDF up to 5 MB. Use a sample file, not sensitive personal documents.</span></div>
            <button class="employer-button employer-button-primary" type="submit">Preview verification request</button>
          </form>
        </section>
        <aside class="employer-panel"><div class="employer-stat-icon">✓</div><h2 style="margin-top:15px;">How verification works</h2><div class="employer-resume-section"><h3>1. Submit information</h3><p>Provide the required identity or company documentation through the secure system.</p></div><div class="employer-resume-section"><h3>2. Admin review</h3><p>An authorized administrator checks the submitted information.</p></div><div class="employer-resume-section"><h3>3. Receive a decision</h3><p>The real system updates your verification status after review.</p></div><p class="employer-file-note">This page does not transmit or store the selected ID file.</p></aside>
      </div>`;
  }

  function supportPage() {
    return `${heading("WE'RE HERE TO HELP", "Help & reports", "Prepare a sample issue report or view the support contact.")}
      <div class="employer-notice" data-notice role="status" aria-live="polite"></div>
      <div class="employer-profile-layout">
        <section class="employer-panel"><h2>Report a problem</h2><p class="employer-muted" style="margin-bottom:22px;">This form demonstrates reporting; it does not create a real support ticket.</p>
          <form class="employer-form" id="reportForm">
            <div class="employer-field"><label for="reportCategory">Category *</label><select class="employer-select" id="reportCategory" required><option value="">Choose a category</option><option>Account access</option><option>ID verification</option><option>Job listing</option><option>Safety concern</option><option>Technical issue</option><option>Other</option></select></div>
            <div class="employer-field"><label for="reportSubject">Subject *</label><input class="employer-input" id="reportSubject" maxlength="120" required></div>
            <div class="employer-field"><label for="reportDetails">Details *</label><textarea class="employer-textarea" id="reportDetails" maxlength="1500" required></textarea></div>
            <button class="employer-button employer-button-primary" type="submit">Prepare demo report</button>
          </form>
        </section>
        <aside class="employer-panel"><div class="employer-stat-icon">☎</div><h2 style="margin-top:15px;">Contact support</h2><p class="employer-muted">Mock number: replace this placeholder before deployment.</p><div class="employer-resume-section"><div class="employer-eyebrow">FICTIONAL CONTACT</div><h2>+63 900 000 0000</h2><p>This is not a real customer service number.</p></div></aside>
      </div>`;
  }

  function settingsPage() {
    return `${heading("ACCOUNT PREFERENCES", "Settings", "Review your account information and deletion request options.")}
      <div class="employer-notice" data-notice role="status" aria-live="polite"></div>
      <div class="employer-profile-layout">
        <section class="employer-panel"><h2>Account information</h2><div class="employer-resume-section"><h3>Account type</h3><p>${esc(profile.type)}</p></div><div class="employer-resume-section"><h3>Account name</h3><p>${esc(profile.name)}</p></div><div class="employer-resume-section"><h3>Verification status</h3>${status(profile.verified ? "Verified" : "Verification pending")}</div><div class="employer-resume-section"><h3>Support contact</h3><p>+63 900 000 0000 (mock number only)</p></div>${button("Report a problem →", "go:support")}</section>
        <section class="employer-panel"><h2>Request account deletion</h2><p class="employer-muted" style="margin-bottom:18px;">Account deletion will require admin approval in the intended system. This prototype will not delete your account or send a request.</p><div class="employer-field"><label for="deleteReason">Reason (optional)</label><textarea class="employer-textarea" id="deleteReason" maxlength="500"></textarea></div><button class="employer-button employer-button-danger" data-action="delete-request">Preview deletion request</button><p class="employer-file-note" style="margin-top:14px;">No data will be deleted.</p></section>
      </div>`;
  }

  const renderers = {
    dashboard, jobs: jobsPage, "post-job": postJobPage,
    profile: profilePage, verification: verificationPage,
    support: supportPage, settings: settingsPage
  };

  const current = pages[page] || pages.dashboard;

  root.innerHTML = `<div class="employer-shell">
    <aside class="employer-sidebar">
      <a class="brand" href="../index.html"><span class="brand-icon">S</span><span>SKILL<span class="brand-accent">2</span>EARN</span></a>
      <div class="employer-nav-label">CLIENT WORKSPACE</div>
      <nav class="employer-nav" aria-label="Employer navigation">
        ${nav.map(([id, label, icon, file]) => `<a href="${file}" class="${page === id ? "active" : ""}" ${page === id ? 'aria-current="page"' : ""}><span class="employer-nav-icon">${icon}</span>${label}</a>`).join("")}
      </nav>
      <div class="employer-sidebar-bottom"><div class="employer-mini-profile">${avatar()}<div style="min-width:0;"><div style="font-size:11px;font-weight:750;">${esc(profile.name)}</div><div class="employer-muted">${esc(profile.type)} · Demo</div></div></div></div>
    </aside>
    <main class="employer-main">
      <header class="employer-topbar"><div class="employer-breadcrumb">Workspace / <strong>${esc(current[1])}</strong></div><span class="employer-status">● Frontend demo</span></header>
      <div class="employer-content">${(renderers[page] || dashboard)()}</div>
    </main>
  </div>`;

  function notice(message, error = false) {
    const el = root.querySelector("[data-notice]");
    if (!el) return;
    el.textContent = message;
    el.classList.add("visible");
    el.classList.toggle("error", error);
  }

  function refreshJobs() {
    const list = root.querySelector("#employerJobList");
    if (list) list.innerHTML = jobs.map(jobCard).join("") ||
      '<div class="employer-panel">No sample listings yet. Create your first job.</div>';
  }

  root.addEventListener("click", event => {
    const target = event.target.closest("[data-action]");
    if (!target) return;

    const action = target.dataset.action;

    if (action.startsWith("go:")) {
      const id = action.slice(3);
      const item = nav.find(link => link[0] === id);
      if (item) location.href = item[3];
      return;
    }

    if (action.startsWith("edit-job:")) {
      const id = Number(action.split(":")[1]);
      location.href = `post-job.html?edit=${id}`;
      return;
    }

    if (action.startsWith("delete-job:")) {
      const id = Number(action.split(":")[1]);
      if (!confirm("Remove this sample listing from this browser session?")) return;
      jobs = jobs.filter(job => job.id !== id);
      refreshJobs();
      notice("Sample listing removed. This change is temporary and has not affected any server.");
      return;
    }

    if (action === "delete-request") {
      const reason = root.querySelector("#deleteReason")?.value.trim();
      notice("Demo only: deletion request previewed" + (reason ? ` — ${reason}` : "") + ". No request was sent and no account was deleted.");
    }
  });

  root.addEventListener("submit", event => {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;

    if (form.id === "jobForm") {
      const data = new FormData(form);
      const values = {
        title: String(data.get("title")).trim(),
        category: String(data.get("category")),
        type: String(data.get("type")),
        budget: String(data.get("budget")).trim(),
        description: String(data.get("description")).trim(),
        skills: String(data.get("skills")).trim()
      };

      const editId = Number(form.dataset.editId);
      if (editId) {
        const index = jobs.findIndex(job => job.id === editId);
        if (index >= 0) jobs[index] = { ...jobs[index], ...values };
      } else {
        jobs.unshift({ id: nextId++, ...values, status: "Draft" });
      }

      location.href = "jobs.html";
      return;
    }

    if (form.id === "profileForm") {
      profile.name = form.elements.name.value.trim();
      profile.contact = form.elements.contact.value.trim();
      profile.website = form.elements.website.value.trim();
      profile.bio = form.elements.bio.value.trim();

      root.querySelector("#clientPreviewName").textContent = profile.name;
      root.querySelector("#clientPreviewBio").textContent = profile.bio;
      root.querySelectorAll(".employer-mini-profile > div > div:first-child")
        .forEach(el => el.textContent = profile.name);

      notice("Profile preview updated for this page. Changes reset on navigation or reload.");
      return;
    }

    if (form.id === "reportForm") {
      notice(`Demo report prepared: ${form.elements.reportCategory.value} — ${form.elements.reportSubject.value.trim()}. Nothing was sent to customer service.`);
      form.reset();
      return;
    }

    if (form.id === "verificationForm") {
      const file = root.querySelector("#idFile").files[0];
      if (!file) return;

      const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!allowed.includes(file.type)) {
        notice("Unsupported file. Choose a JPG, PNG, WebP, or PDF file.", true);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        notice("File is larger than 5 MB. Select a smaller sample file.", true);
        return;
      }

      idFileName = file.name;
      notice(`Demo verification request previewed for ${idFileName}. The file was not uploaded and your status has not changed.`);
    }
  });

  root.addEventListener("change", event => {
    if (event.target.matches("#clientPhoto")) {
      const file = event.target.files[0];
      if (!file) return;

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        notice("Choose a JPG, PNG, or WebP image.", true);
        event.target.value = "";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        notice("Profile pictures must be 2 MB or smaller.", true);
        event.target.value = "";
        return;
      }

      if (photoUrl) URL.revokeObjectURL(photoUrl);
      photoUrl = URL.createObjectURL(file);
      root.querySelectorAll(".employer-avatar, .employer-profile-avatar").forEach(el => {
        el.innerHTML = `<img src="${photoUrl}" alt="Profile picture">`;
      });
      notice("Temporary profile picture preview updated. Nothing was uploaded to a server.");
    }
  });
});