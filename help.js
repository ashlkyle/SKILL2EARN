/* SKILL2EARN first-time guide: a short "Start here" checklist on the dashboards. */
(function () {
  "use strict";
  const path = location.pathname.toLowerCase();
  if (!/\/(student|employer)\/dashboard\.html$/.test(path)) return;
  const role = path.includes("/student/") ? "student" : "employer";
  const key = "s2e-guide-" + role;
  try { if (localStorage.getItem(key) === "hidden") return; } catch (_) {}

  const steps = role === "student" ? [
    ["Complete your profile", "Add your school, course, skills and a short bio.", "profile.html", "Open profile"],
    ["Verify your student status", "Verified students are easier for employers to trust.", "verification.html", "Verify now"],
    ["Find jobs that fit you", "We list jobs that match the skills in your profile.", "recommended-jobs.html", "See jobs"],
    ["Apply and keep track", "After you apply, follow each application's status here.", "applications.html", "My applications"]
  ] : [
    ["Complete your company profile", "Tell students who you are and what you do.", "profile.html", "Open profile"],
    ["Submit your verification", "Verification lets students know your account is real.", "verification.html", "Verify now"],
    ["Post your first job", "Describe the task, the skills needed and the budget.", "jobs.html", "Manage jobs"],
    ["Review applicants", "Read applications and choose who to hire.", "applicants.html", "See applicants"]
  ];

  function build() {
    const box = document.createElement("section");
    box.className = "s2e-guide";
    box.setAttribute("aria-label", "Getting started guide");
    box.innerHTML = '<div class="s2e-guide-head"><div><h2>New here? Start with these 4 steps</h2>' +
      '<p>Do them in order. You can come back to this list any time you open your dashboard.</p></div>' +
      '<button type="button" class="s2e-guide-close">Hide guide</button></div><ol class="s2e-guide-list">' +
      steps.map(s => '<li><strong>' + s[0] + '</strong><span>' + s[1] + '</span><a href="' + s[2] + '">' + s[3] + '</a></li>').join("") +
      '</ol>';
    box.querySelector(".s2e-guide-close").addEventListener("click", function () {
      try { localStorage.setItem(key, "hidden"); } catch (_) {}
      box.remove();
    });
    const main = document.querySelector("main") || document.body;
    const header = main.querySelector("header");
    if (header) header.after(box); else main.prepend(box);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
