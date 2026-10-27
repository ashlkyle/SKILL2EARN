
"use strict";

const projectFiles = [
  "index.html",
  "student/login.html",
  "student/register.html",
  "student/dashboard.html",
  "student/jobs.html",
  "student/profile.html",
  "student/resume.html",
  "student/support.html",
  "student/settings.html",
  "employer/login.html",
  "employer/register.html",
  "employer/dashboard.html",
  "employer/jobs.html",
  "employer/post-job.html",
  "employer/profile.html",
  "employer/verification.html",
  "employer/support.html",
  "employer/settings.html",
  "admin/login.html",
  "admin/dashboard.html",
  "admin/verifications.html",
  "admin/jobs.html",
  "admin/reports.html",
  "admin/settings.html",
  "css/style.css",
  "css/auth.css",
  "css/student.css",
  "css/employer.css",
  "css/admin.css",
  "css/frontend-check.css",
  "js/auth.js",
  "js/student.js",
  "js/employer.js",
  "js/employer-register.js",
  "js/admin.js",
  "js/frontend-check.js"
];

const resultsContainer = document.getElementById("results");
const runButton = document.getElementById("runChecks");
const totalCount = document.getElementById("totalCount");
const passCount = document.getElementById("passCount");
const failCount = document.getElementById("failCount");
const statusText = document.getElementById("statusText");
const progressBar = document.getElementById("progressBar");

function makeResult(name, passed, detail) {
  return { name, passed, detail };
}

function renderResults(results, complete = true) {
  resultsContainer.innerHTML = "";

  if (!results.length) {
    resultsContainer.innerHTML = '<p class="empty-state">No checks have run yet.</p>';
    return;
  }

  results.forEach(result => {
    const row = document.createElement("div");
    row.className = "result-row";

    const name = document.createElement("div");
    name.className = "result-name";
    name.textContent = result.name;

    const status = document.createElement("div");
    status.className = "result-status " +
      (result.passed === true ? "pass" :
       result.passed === false ? "fail" : "checking");

    status.textContent = result.passed === true ? "PASS" :
      result.passed === false ? "ISSUE" : "CHECKING";

    row.append(name, status);

    if (result.detail) {
      const detail = document.createElement("div");
      detail.className = "result-name";
      detail.style.color = "var(--muted)";
      detail.style.marginTop = "6px";
      detail.textContent = result.detail;
      name.appendChild(detail);
    }

    resultsContainer.appendChild(row);
  });

  const passed = results.filter(result => result.passed === true).length;
  const failed = results.filter(result => result.passed === false).length;

  totalCount.textContent = String(results.length);
  passCount.textContent = String(passed);
  failCount.textContent = String(failed);

  if (complete) {
    statusText.textContent = failed === 0
      ? "All checked files are reachable."
      : `${failed} issue(s) found. Review the results below.`;
  }
}

async function checkFile(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });

    if (!response.ok) {
      return makeResult(path, false, `HTTP ${response.status}`);
    }

    const content = await response.text();

    if (!content.trim()) {
      return makeResult(path, false, "File exists but is empty.");
    }

    return makeResult(path, true, "File is reachable.");
  } catch (error) {
    return makeResult(
      path,
      false,
      "Could not fetch this file. Confirm the filename and open this page using Live Server."
    );
  }
}

function resolveLocalReference(reference, pagePath) {
  const trimmed = reference.trim();

  if (!trimmed ||
      trimmed.startsWith("#") ||
      /^(https?:|mailto:|tel:|data:|blob:|javascript:)/i.test(trimmed) ||
      trimmed.startsWith("//")) {
    return null;
  }

  const cleanPath = trimmed.split("#")[0].split("?")[0];
  if (!cleanPath) return null;

  try {
    const pageUrl = new URL(pagePath, window.location.href);
    const resolved = new URL(cleanPath, pageUrl);

    if (resolved.origin !== window.location.origin) return null;

    return decodeURIComponent(resolved.pathname)
      .replace(window.location.pathname.replace(/[^/]*$/, ""), "");
  } catch {
    return null;
  }
}

async function checkHtmlReferences(pagePath) {
  try {
    const response = await fetch(pagePath, { cache: "no-store" });
    if (!response.ok) {
      return makeResult(`${pagePath} local references`, false, "Could not read this HTML page.");
    }

    const html = await response.text();
    const documentParser = new DOMParser();
    const parsed = documentParser.parseFromString(html, "text/html");
    const references = [];

    parsed.querySelectorAll('script[src], link[rel~="stylesheet"][href]').forEach(element => {
      const reference = element.tagName.toLowerCase() === "script"
        ? element.getAttribute("src")
        : element.getAttribute("href");

      const resolved = resolveLocalReference(reference || "", pagePath);
      if (resolved) references.push(resolved);
    });

    const uniqueReferences = [...new Set(references)];

    if (!uniqueReferences.length) {
      return makeResult(`${pagePath} local references`, true, "No local script or stylesheet references found.");
    }

    const checks = await Promise.all(uniqueReferences.map(checkFile));
    const missing = checks.filter(result => !result.passed);

    return missing.length
      ? makeResult(
          `${pagePath} local references`,
          false,
          `Missing/unreachable: ${missing.map(item => item.name).join(", ")}`
        )
      : makeResult(
          `${pagePath} local references`,
          true,
          `${uniqueReferences.length} local script/stylesheet reference(s) are reachable.`
        );
  } catch {
    return makeResult(`${pagePath} local references`, false, "Could not inspect the page references.");
  }
}

async function runChecks() {
  runButton.disabled = true;
  runButton.textContent = "Checking…";
  statusText.textContent = "Checking project files…";
  progressBar.style.width = "0%";
  totalCount.textContent = "0";
  passCount.textContent = "0";
  failCount.textContent = "0";

  const results = [];
  renderResults([makeResult("Starting file checks…", null, "")], false);

  for (let index = 0; index < projectFiles.length; index++) {
    const path = projectFiles[index];
    results.push(await checkFile(path));

    progressBar.style.width = `${((index + 1) / projectFiles.length) * 100}%`;
    renderResults(results, false);
  }

  const htmlFiles = projectFiles.filter(path => path.endsWith(".html"));

  for (let index = 0; index < htmlFiles.length; index++) {
    results.push(await checkHtmlReferences(htmlFiles[index]));

    const progress = 100 * (projectFiles.length + index + 1) /
      (projectFiles.length + htmlFiles.length);
    progressBar.style.width = `${progress}%`;
    renderResults(results, false);
  }

  renderResults(results, true);
  progressBar.style.width = "100%";

  runButton.disabled = false;
  runButton.textContent = "Run checks again";
}

runButton.addEventListener("click", runChecks);