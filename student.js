
/* SKILL2EARN student frontend prototype.
   All data is sample data held in the browser.
   Connect Supabase only during the backend phase. */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("#studentApp");
  if (!root) return;

  const page = document.body.dataset.page || "dashboard";

  const links = [
    { id: "dashboard", label: "Dashboard", icon: "⌂", file: "dashboard.html" },
    { id: "jobs", label: "Find Jobs", icon: "⌕", file: "jobs.html" },
    { id: "profile", label: "My Profile", icon: "◉", file: "profile.html" },
    { id: "resume", label: "My Resume", icon: "▤", file: "resume.html" },
    { id: "support", label: "Help & Reports", icon: "?", file: "support.html" },
    { id: "settings", label: "Settings", icon: "⚙", file: "settings.html" }
  ];

  const jobs = [
    {
      id: 1,
      title: "Social Media Graphic Designer",
      company: "Northstar Creative",
      type: "Creative",
      mode: "Remote",
      pay: "₱800–₱1,500 / project",
      icon: "✳",
      description: "Create social media graphics and promotional visuals for a growing creative team.",
      skills: ["Canva", "Graphic Design"]
    },
    {
      id: 2,
      title: "Junior Website Assistant",
      company: "PixelWorks Studio",
      type: "Technology",
      mode: "Remote",
      pay: "₱1,000–₱2,000 / project",
      icon: "</>",
      description: "Assist with basic HTML and CSS updates and test website layouts.",
      skills: ["HTML", "CSS"]
    },
    {
      id: 3,
      title: "Short-Form Video Editor",
      company: "FrameLab Media",
      type: "Creative",
      mode: "Flexible",
      pay: "₱500–₱1,200 / video",
      icon: "▶",
      description: "Edit short videos and add captions, transitions, and simple effects.",
      skills: ["Video Editing", "CapCut"]
    },
    {
      id: 4,
      title: "Data Entry Assistant",
      company: "ClearPath Services",
      type: "Administrative",
      mode: "Remote",
      pay: "₱600–₱900 / task",
      icon: "▦",
      description: "Organize spreadsheet records and check entries for completeness.",
      skills: ["Excel", "Accuracy"]
    },
    {
      id: 5,
      title: "Junior Java Programmer",
      company: "CodeBridge",
      type: "Technology",
      mode: "Flexible",
      pay: "₱1,200–₱2,500 / project",
      icon: "{ }",
      description: "Help test small Java programs and document simple bug fixes.",
      skills: ["Java", "Problem Solving"]
    },
    {
      id: 6,
      title: "Research and Writing Assistant",
      company: "BrightPage Learning",
      type: "Writing",
      mode: "Remote",
      pay: "₱700–₱1,300 / task",
      icon: "✎",
      description: "Help organize research notes and proofread educational content.",
      skills: ["Writing", "Research"]
    }
  ];

  const profile = {
    name: "Alex Student",
    school: "Your School Name",
    course: "BS Information Technology",
    bio: "Aspiring IT professional interested in web development, design, and solving practical problems.",
    email: "student@school.edu.ph",
    skills: ["HTML", "CSS", "Java", "Problem Solving"]
  };

  let savedJobs = [];
  let photoUrl = "";
  let isVerified = false;

  const pageInfo = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Your student workspace at a glance."
    },
    jobs: {
      title: "Find Jobs",
      subtitle: "Explore sample opportunities that match your skills."
    },
    profile: {
      title: "My Profile",
      subtitle: "Manage the information employers can view."
    },
    resume: {
      title: "My Resume",
      subtitle: "Build a resume that highlights your skills and experience."
    },
    support: {
      title: "Help & Reports",
      subtitle: "Report a problem or find help with your account."
    },
    settings: {
      title: "Settings",
      subtitle: "Manage your account preferences and requests."
    }
  };

  const info = pageInfo[page] || pageInfo.dashboard;

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function getInitials(name) {
    return name.trim().split(/\s+/).slice(0, 2)
      .map(part => part[0] || "").join("").toUpperCase() || "S";
  }

  function avatarMarkup(className = "student-avatar") {
    return `<div class="${className}">${
      photoUrl
        ? `<img src="${photoUrl}" alt="Student profile picture">`
        : escapeHTML(getInitials(profile.name))
    }</div>`;
  }

  function verifiedMarkup() {
    return isVerified
      ? '<span class="student-verified">✓ Verified student</span>'
      : '<span class="student-verified student-unverified">◷ Verification pending</span>';
  }

  function button(label, action, primary = false) {
    return `<button type="button" class="student-button ${primary ? "student-button-primary" : ""}" data-action="${action}">${label}</button>`;
  }

  function jobCard(job) {
    return `
      <article class="student-job-card">
        <div class="student-job-card-top">
          <div class="student-job-symbol">${escapeHTML(job.icon)}</div>
          <div class="student-job-info">
            <h3>${escapeHTML(job.title)}</h3>
            <p>${escapeHTML(job.company)} · ${escapeHTML(job.mode)}</p>
          </div>
        </div>
        <p class="student-job-description">${escapeHTML(job.description)}</p>
        <div class="student-tag-row">
          <span class="student-tag">${escapeHTML(job.type)}</span>
          ${job.skills.map(skill => `<span class="student-tag">${escapeHTML(skill)}</span>`).join("")}
        </div>
        <div class="student-job-footer">
          <span class="student-job-pay">${escapeHTML(job.pay)}</span>
          ${button(savedJobs.includes(job.id) ? "✓ Saved" : "＋ Save", `save-job:${job.id}`)}
        </div>
      </article>`;
  }

  function heading(kicker, title, subtitle, action = "") {
    return `
      <div class="student-page-heading">
        <div>
          <div class="student-eyebrow">${kicker}</div>
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </div>
        ${action}
      </div>`;
  }

  function dashboardPage() {
    return `
      <section class="student-welcome">
        <div class="student-eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>
        <h2>Welcome back, ${escapeHTML(profile.name.split(" ")[0])}! 👋</h2>
        <p>Discover opportunities, build your resume, and take another step toward your career goals.</p>
        ${button("Explore opportunities →", "go:jobs", true)}
      </section>

      <div class="student-grid">
        <article class="student-stat-card">
          <div class="student-stat-top">
            <span class="student-stat-icon">⌕</span>
            <span class="student-inline-status">Explore</span>
          </div>
          <div class="student-stat-label">Sample job listings</div>
          <div class="student-stat-value">${jobs.length}</div>
          <div class="student-stat-note">Demo opportunities available</div>
        </article>
        <article class="student-stat-card">
          <div class="student-stat-top">
            <span class="student-stat-icon">♡</span>
            <span class="student-inline-status">Your list</span>
          </div>
          <div class="student-stat-label">Saved jobs</div>
          <div class="student-stat-value" id="savedCount">${savedJobs.length}</div>
          <div class="student-stat-note">Saved during this visit</div>
        </article>
        <article class="student-stat-card">
          <div class="student-stat-top">
            <span class="student-stat-icon">✓</span>
            ${verifiedMarkup()}
          </div>
          <div class="student-stat-label">Student verification</div>
          <div class="student-stat-value">${isVerified ? "Verified" : "Pending"}</div>
          <div class="student-stat-note">Demo status; not a real verification</div>
        </article>
      </div>

      <div class="student-section-heading">
        <h2>Recommended opportunities</h2>
        <button class="student-text-link" data-action="go:jobs">View all jobs →</button>
      </div>
      <div class="student-job-list">
        ${jobs.slice(0, 2).map(jobCard).join("")}
      </div>

      <div class="student-section-heading">
        <h2>Quick actions</h2>
      </div>
      <div class="student-grid">
        <section class="student-panel">
          <div class="student-stat-icon">◉</div>
          <h2 style="margin-top:14px;">Complete your profile</h2>
          <p class="student-panel-description">Add your school, course, skills, and a short introduction.</p>
          <div style="margin-top:16px;">${button("Edit profile →", "go:profile")}</div>
        </section>
        <section class="student-panel">
          <div class="student-stat-icon">▤</div>
          <h2 style="margin-top:14px;">Build your resume</h2>
          <p class="student-panel-description">Prepare a resume employers can review when your account is connected.</p>
          <div style="margin-top:16px;">${button("Open resume →", "go:resume")}</div>
        </section>
        <section class="student-panel">
          <div class="student-stat-icon">?</div>
          <h2 style="margin-top:14px;">Need help?</h2>
          <p class="student-panel-description">Send a sample report or view the support contact in settings.</p>
          <div style="margin-top:16px;">${button("Get support →", "go:support")}</div>
        </section>
      </div>`;
  }

  function jobsPage() {
    return `
      ${heading("OPPORTUNITY EXPLORER", "Find your next opportunity", "Search the sample listings and filter by the type of work you want.")}
      <div class="student-notice" data-notice role="status" aria-live="polite"></div>
      <section class="student-filters">
        <input class="student-input" id="jobSearch" type="search" placeholder="Search job title, company, or skill..." aria-label="Search jobs">
        <select class="student-select" id="jobType" aria-label="Filter by category">
          <option value="All">All categories</option>
          <option value="Creative">Creative</option>
          <option value="Technology">Technology</option>
          <option value="Administrative">Administrative</option>
          <option value="Writing">Writing</option>
        </select>
        <select class="student-select" id="jobMode" aria-label="Filter by work arrangement">
          <option value="All">All arrangements</option>
          <option value="Remote">Remote</option>
          <option value="Flexible">Flexible</option>
        </select>
      </section>
      <div class="student-section-heading">
        <h2>Available listings</h2>
        <span class="student-inline-status" id="jobResultCount">${jobs.length} sample jobs</span>
      </div>
      <div class="student-job-list" id="jobResults">${jobs.map(jobCard).join("")}</div>
    `;
  }

  function profilePage() {
    return `
      ${heading("YOUR PROFESSIONAL IDENTITY", "My profile", "Keep your student profile clear, accurate, and ready to present.")}
      <div class="student-notice" data-notice role="status" aria-live="polite"></div>
      <div class="student-profile-layout">
        <section class="student-panel">
          <div class="student-profile-hero">
            ${avatarMarkup("student-profile-avatar")}
            <div>
              <h2 id="profileDisplayName">${escapeHTML(profile.name)}</h2>
              <p class="student-panel-description">${escapeHTML(profile.course)}</p>
              <div style="margin-top:9px;">${verifiedMarkup()}</div>
            </div>
          </div>

          <div class="student-field">
            <label for="profilePhoto">Profile picture</label>
            <input class="student-input" type="file" id="profilePhoto" accept="image/png,image/jpeg,image/webp">
            <span class="auth-hint">Demo upload: JPG, PNG, or WebP, maximum 2 MB. The preview is temporary.</span>
          </div>

          <form id="profileForm">
            <div class="student-field">
              <label for="profileName">Full name</label>
              <input class="student-input" id="profileName" name="name" maxlength="100" required value="${escapeHTML(profile.name)}">
            </div>
            <div class="student-field">
              <label for="profileSchool">School / Institution</label>
              <input class="student-input" id="profileSchool" name="school" maxlength="150" required value="${escapeHTML(profile.school)}">
            </div>
            <div class="student-field">
              <label for="profileCourse">Course / Program</label>
              <input class="student-input" id="profileCourse" name="course" maxlength="150" required value="${escapeHTML(profile.course)}">
            </div>
            <div class="student-field">
              <label for="profileBio">About me</label>
              <textarea class="student-textarea" id="profileBio" name="bio" maxlength="600" required>${escapeHTML(profile.bio)}</textarea>
            </div>
            <div class="student-field">
              <label for="profileSkills">Skills (separate with commas)</label>
              <input class="student-input" id="profileSkills" name="skills" maxlength="300" value="${escapeHTML(profile.skills.join(", "))}">
            </div>
            <button class="student-button student-button-primary" type="submit">Save profile preview</button>
          </form>
        </section>

        <aside class="student-panel">
          <div class="student-eyebrow">EMPLOYER PREVIEW</div>
          <h2>How your profile appears</h2>
          <p class="student-panel-description">This is a sample preview of the information an employer may see.</p>
          <div class="student-resume-section">
            <h3>About</h3>
            <p id="profilePreviewBio">${escapeHTML(profile.bio)}</p>
          </div>
          <div class="student-resume-section">
            <h3>Education</h3>
            <p id="profilePreviewEducation">${escapeHTML(profile.course)}<br>${escapeHTML(profile.school)}</p>
          </div>
          <div class="student-resume-section">
            <h3>Skills</h3>
            <div class="student-tag-row" id="profilePreviewSkills">
              ${profile.skills.map(skill => `<span class="student-tag">${escapeHTML(skill)}</span>`).join("")}
            </div>
          </div>
          <div class="student-resume-section">
            <h3>Verification</h3>
            ${verifiedMarkup()}
            <p class="student-panel-description" style="margin-top:9px;">The displayed status is simulated and does not confirm student identity.</p>
          </div>
          <div style="margin-top:15px;">${button("View my resume →", "go:resume")}</div>
        </aside>
      </div>`;
  }

  function resumePage() {
    return `
      ${heading("YOUR EXPERIENCE, PRESENTED", "Resume builder", "Complete the fields below to create a resume preview.")}
      <div class="student-notice" data-notice role="status" aria-live="polite"></div>
      <div class="student-profile-layout">
        <section class="student-panel">
          <h2>Resume details</h2>
          <p class="student-panel-description" style="margin-bottom:22px;">Your sample resume details are not uploaded to a server.</p>
          <form id="resumeForm">
            <div class="student-field">
              <label for="resumeObjective">Professional summary / objective</label>
              <textarea class="student-textarea" id="resumeObjective" maxlength="800" required>A motivated student eager to apply technical and creative skills, learn from real projects, and contribute to a collaborative team.</textarea>
            </div>
            <div class="student-field">
              <label for="resumeEducation">Education</label>
              <textarea class="student-textarea" id="resumeEducation" maxlength="500" required>${escapeHTML(profile.course)}\n${escapeHTML(profile.school)}</textarea>
            </div>
            <div class="student-field">
              <label for="resumeExperience">Projects / Experience</label>
              <textarea class="student-textarea" id="resumeExperience" maxlength="1200" placeholder="Add school projects, volunteer work, or relevant experience.">Student projects and academic exercises\n• Practiced problem-solving through coursework\n• Developed basic programming and web design skills</textarea>
            </div>
            <div class="student-field">
              <label for="resumeSkills">Skills</label>
              <input class="student-input" id="resumeSkills" maxlength="300" value="${escapeHTML(profile.skills.join(", "))}" required>
            </div>
            <button class="student-button student-button-primary" type="submit">Update resume preview</button>
            <button class="student-button" type="button" data-action="print-resume">Print / Save as PDF</button>
          </form>
        </section>

        <section class="student-panel" id="resumePreview">
          <div class="student-eyebrow">RESUME PREVIEW</div>
          <h2 id="resumePreviewName" style="font-size:25px;">${escapeHTML(profile.name)}</h2>
          <p class="student-panel-description">${escapeHTML(profile.email)}<br>${escapeHTML(profile.course)} · ${escapeHTML(profile.school)}</p>
          <div class="student-resume-section">
            <h3>Professional Summary</h3>
            <p id="resumePreviewObjective">A motivated student eager to apply technical and creative skills, learn from real projects, and contribute to a collaborative team.</p>
          </div>
          <div class="student-resume-section">
            <h3>Education</h3>
            <p id="resumePreviewEducation">${escapeHTML(profile.course)}\n${escapeHTML(profile.school)}</p>
          </div>
          <div class="student-resume-section">
            <h3>Projects & Experience</h3>
            <p id="resumePreviewExperience">Student projects and academic exercises\n• Practiced problem-solving through coursework\n• Developed basic programming and web design skills</p>
          </div>
          <div class="student-resume-section">
            <h3>Skills</h3>
            <div class="student-tag-row" id="resumePreviewSkills">${profile.skills.map(skill => `<span class="student-tag">${escapeHTML(skill)}</span>`).join("")}</div>
          </div>
          <p class="student-panel-description" style="margin-top:18px;">Sample resume. Add accurate information before using it for applications.</p>
        </section>
      </div>`;
  }

  function supportPage() {
    return `
      ${heading("WE'RE HERE TO HELP", "Help & reports", "Describe an issue or find the support contact information.")}
      <div class="student-notice" data-notice role="status" aria-live="polite"></div>
      <div class="student-profile-layout">
        <section class="student-panel">
          <h2>Report a problem</h2>
          <p class="student-panel-description" style="margin-bottom:22px;">This form simulates a report. It does not send a real support ticket.</p>
          <form id="reportForm">
            <div class="student-field">
              <label for="reportCategory">Issue category</label>
              <select class="student-select" id="reportCategory" required>
                <option value="">Choose a category</option>
                <option>Account access</option>
                <option>Profile or verification</option>
                <option>Job listing</option>
                <option>Safety concern</option>
                <option>Technical issue</option>
                <option>Other</option>
              </select>
            </div>
            <div class="student-field">
              <label for="reportSubject">Subject</label>
              <input class="student-input" id="reportSubject" maxlength="120" required placeholder="Briefly describe the issue">
            </div>
            <div class="student-field">
              <label for="reportDetails">Details</label>
              <textarea class="student-textarea" id="reportDetails" maxlength="1500" required placeholder="Explain what happened and what help you need."></textarea>
            </div>
            <button class="student-button student-button-primary" type="submit">Submit demo report</button>
          </form>
        </section>

        <aside class="student-panel">
          <div class="student-stat-icon">☎</div>
          <h2 style="margin-top:15px;">Contact support</h2>
          <p class="student-panel-description">Use the following placeholder for the frontend presentation. Replace it with an approved support contact before deployment.</p>
          <div class="student-resume-section">
            <div class="student-eyebrow">MOCK SUPPORT NUMBER</div>
            <h2>+63 900 000 0000</h2>
            <p>This is a fictional placeholder, not a real customer service number.</p>
          </div>
          <div class="student-resume-section">
            <h3>Before contacting support</h3>
            <p>Describe the issue clearly. Do not include your password, one-time codes, or other sensitive login details.</p>
          </div>
          ${button("Open settings →", "go:settings")}
        </aside>
      </div>`;
  }

  function settingsPage() {
    return `
      ${heading("ACCOUNT PREFERENCES", "Settings", "Review your demo account and manage your requests.")}
      <div class="student-notice" data-notice role="status" aria-live="polite"></div>
      <div class="student-profile-layout">
        <section class="student-panel">
          <h2>Account information</h2>
          <div class="student-resume-section">
            <h3>Account type</h3>
            <p>Student</p>
          </div>
          <div class="student-resume-section">
            <h3>Email</h3>
            <p>${escapeHTML(profile.email)}</p>
          </div>
          <div class="student-resume-section">
            <h3>Verification status</h3>
            ${verifiedMarkup()}
            <p class="student-panel-description" style="margin-top:9px;">Actual verification requires admin review in the completed system.</p>
          </div>
          <div class="student-resume-section">
            <h3>Customer support</h3>
            <p>Mock number: +63 900 000 0000</p>
            <p class="student-panel-description">Fictional placeholder only.</p>
          </div>
          ${button("Report a problem →", "go:support")}
        </section>

        <section class="student-panel">
          <h2>Request account deletion</h2>
          <p class="student-panel-description" style="margin-bottom:18px;">In the intended system, account deletion requires admin approval. This demo does not delete an account or send a request to an administrator.</p>
          <div class="student-notice" data-delete-notice role="status" aria-live="polite"></div>
          <div class="student-field">
            <label for="deleteReason">Reason for request (optional)</label>
            <textarea class="student-textarea" id="deleteReason" maxlength="500" placeholder="Tell us why you want to delete your account."></textarea>
          </div>
          <button class="student-button student-button-danger" type="button" data-action="delete-request">Simulate deletion request</button>
          <p class="student-panel-description" style="margin-top:15px;">Nothing will be deleted. This button only demonstrates the request flow.</p>
        </section>
      </div>`;
  }

  const pageRenderers = {
    dashboard: dashboardPage,
    jobs: jobsPage,
    profile: profilePage,
    resume: resumePage,
    support: supportPage,
    settings: settingsPage
  };

  const navHTML = links.map(link => `
    <a href="${link.file}" class="${page === link.id ? "active" : ""}" ${page === link.id ? 'aria-current="page"' : ""}>
      <span class="student-nav-icon">${link.icon}</span>
      ${link.label}
    </a>`).join("");

  root.innerHTML = `
    <div class="student-shell">
      <aside class="student-sidebar">
        <a class="brand" href="../index.html">
          <span class="brand-icon">S</span>
          <span>SKILL<span class="brand-accent">2</span>EARN</span>
        </a>
        <div class="student-nav-label">STUDENT WORKSPACE</div>
        <nav class="student-nav" aria-label="Student navigation">
          ${navHTML}
        </nav>
        <div class="student-sidebar-bottom">
          <div class="student-mini-profile">
            ${avatarMarkup()}
            <div style="min-width:0;">
              <div class="student-mini-name">${escapeHTML(profile.name)}</div>
              <div class="student-mini-role">Student account · Demo</div>
            </div>
          </div>
        </div>
      </aside>
      <main class="student-main">
        <header class="student-topbar">
          <div class="student-breadcrumb">Workspace / <strong>${escapeHTML(info.title)}</strong></div>
          <div class="student-top-actions">
            <span class="student-status">● Frontend demo</span>
            ${avatarMarkup()}
          </div>
        </header>
        <div class="student-content">
          ${pageRenderers[page] ? pageRenderers[page]() : dashboardPage()}
        </div>
      </main>
    </div>`;

  function showNotice(text, error = false, target = "[data-notice]") {
    const notice = root.querySelector(target);
    if (!notice) return;
    notice.textContent = text;
    notice.classList.add("visible");
    notice.classList.toggle("error", error);
  }

  function updateJobResults() {
    const results = root.querySelector("#jobResults");
    if (!results) return;

    const query = (root.querySelector("#jobSearch")?.value || "").trim().toLowerCase();
    const type = root.querySelector("#jobType")?.value || "All";
    const mode = root.querySelector("#jobMode")?.value || "All";

    const filtered = jobs.filter(job => {
      const searchable = [
        job.title, job.company, job.description, job.type,
        job.mode, ...job.skills
      ].join(" ").toLowerCase();

      return searchable.includes(query) &&
        (type === "All" || job.type === type) &&
        (mode === "All" || job.mode === mode);
    });

    results.innerHTML = filtered.length
      ? filtered.map(jobCard).join("")
      : '<div class="student-empty">No matching sample jobs. Try another search or filter.</div>';

    const count = root.querySelector("#jobResultCount");
    if (count) count.textContent = `${filtered.length} sample job${filtered.length === 1 ? "" : "s"}`;
  }

  root.addEventListener("click", event => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const action = actionButton.dataset.action;

    if (action.startsWith("go:")) {
      const destination = action.slice(3);
      const link = links.find(item => item.id === destination);
      if (link) window.location.href = link.file;
      return;
    }

    if (action.startsWith("save-job:")) {
      const id = Number(action.split(":")[1]);
      if (savedJobs.includes(id)) {
        savedJobs = savedJobs.filter(savedId => savedId !== id);
      } else {
        savedJobs.push(id);
      }

      if (page === "jobs") updateJobResults();
      else if (page === "dashboard") {
        const count = root.querySelector("#savedCount");
        if (count) count.textContent = savedJobs.length;
        actionButton.textContent = savedJobs.includes(id) ? "✓ Saved" : "＋ Save";
      }

      showNotice(
        savedJobs.includes(id)
          ? "Job saved for this visit. Saved jobs are not stored permanently."
          : "Job removed from your temporary saved list."
      );
      return;
    }

    if (action === "print-resume") {
      window.print();
      return;
    }

    if (action === "delete-request") {
      const reason = root.querySelector("#deleteReason")?.value.trim() || "";
      showNotice(
        "Demo only: your deletion request has been previewed" +
        (reason ? ` with reason: ${reason}` : "") +
        ". No request was sent and your account has not been deleted.",
        false,
        "[data-delete-notice]"
      );
    }
  });

  root.addEventListener("input", event => {
    if (event.target.matches("#jobSearch")) updateJobResults();
  });

  root.addEventListener("change", event => {
    if (event.target.matches("#jobType, #jobMode")) updateJobResults();

    if (event.target.matches("#profilePhoto")) {
      const file = event.target.files?.[0];
      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        event.target.value = "";
        showNotice("Unsupported file type. Choose a JPG, PNG, or WebP image.", true);
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        event.target.value = "";
        showNotice("The image exceeds the 2 MB limit. Choose a smaller file.", true);
        return;
      }

      if (photoUrl) URL.revokeObjectURL(photoUrl);
      photoUrl = URL.createObjectURL(file);

      root.querySelectorAll(".student-profile-avatar, .student-avatar").forEach(element => {
        element.innerHTML = `<img src="${photoUrl}" alt="Student profile picture">`;
      });

      showNotice("Profile picture preview updated for this visit. It has not been uploaded to a server.");
    }
  });

  root.addEventListener("submit", event => {
    event.preventDefault();
    const form = event.target;

    if (form.id === "profileForm") {
      if (!form.reportValidity()) return;

      profile.name = form.elements.name.value.trim();
      profile.school = form.elements.school.value.trim();
      profile.course = form.elements.course.value.trim();
      profile.bio = form.elements.bio.value.trim();
      profile.skills = form.elements.skills.value
        .split(",").map(item => item.trim()).filter(Boolean).slice(0, 20);

      const nameDisplay = root.querySelector("#profileDisplayName");
      const bioDisplay = root.querySelector("#profilePreviewBio");
      const educationDisplay = root.querySelector("#profilePreviewEducation");
      const skillsDisplay = root.querySelector("#profilePreviewSkills");

      if (nameDisplay) nameDisplay.textContent = profile.name;
      if (bioDisplay) bioDisplay.textContent = profile.bio;
      if (educationDisplay) educationDisplay.textContent = `${profile.course}\n${profile.school}`;
      if (skillsDisplay) skillsDisplay.innerHTML = profile.skills
        .map(skill => `<span class="student-tag">${escapeHTML(skill)}</span>`).join("");

      root.querySelectorAll(".student-mini-name").forEach(el => {
        el.textContent = profile.name;
      });

      root.querySelectorAll(".student-avatar:not(.student-profile-avatar)").forEach(el => {
        if (!photoUrl) el.textContent = getInitials(profile.name);
      });

      showNotice("Profile preview updated. Changes will reset when this page is reloaded.");
      return;
    }

    if (form.id === "resumeForm") {
      if (!form.reportValidity()) return;

      root.querySelector("#resumePreviewName").textContent = profile.name;
      root.querySelector("#resumePreviewObjective").textContent =
        root.querySelector("#resumeObjective").value.trim();
      root.querySelector("#resumePreviewEducation").textContent =
        root.querySelector("#resumeEducation").value.trim();
      root.querySelector("#resumePreviewExperience").textContent =
        root.querySelector("#resumeExperience").value.trim();

      const skills = root.querySelector("#resumeSkills").value
        .split(",").map(item => item.trim()).filter(Boolean).slice(0, 20);

      root.querySelector("#resumePreviewSkills").innerHTML = skills
        .map(skill => `<span class="student-tag">${escapeHTML(skill)}</span>`).join("");

      showNotice("Resume preview updated. Use Print / Save as PDF to save a local copy.");
      return;
    }

    if (form.id === "reportForm") {
      if (!form.reportValidity()) return;

      const category = root.querySelector("#reportCategory").value;
      const subject = root.querySelector("#reportSubject").value.trim();

      showNotice(
        `Demo report prepared: ${category} — ${subject}. No ticket was submitted to a server.`
      );
      form.reset();
    }
  });
});