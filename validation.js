/* SKILL2EARN form validation.
   - Blocks characters that do not belong in a field (for example numbers in a name).
   - Shows a short hint under each field and a clear error when something is wrong.
   - Runs before the page's own submit code, so invalid forms are never sent. */
(function () {
  "use strict";

  const L = "\\p{L}\\p{M}";
  const RULES = {
    person: {
      strip: new RegExp("[^" + L + " .'’-]", "gu"),
      test: v => (v.match(new RegExp("[" + L + "]", "gu")) || []).length >= 2 && new RegExp("^[" + L + "]", "u").test(v),
      hint: "Letters only. Example: Juan Dela Cruz.",
      bad: "Letters only. Numbers and special characters can't be used in a name.",
      invalid: "Enter a real name using letters only (at least 2 letters)."
    },
    place: {
      strip: new RegExp("[^" + L + " .,'’&()/–-]", "gu"),
      test: v => (v.match(new RegExp("[" + L + "]", "gu")) || []).length >= 2,
      hint: "Letters only. Example: Technological Institute of the Philippines.",
      bad: "Letters only. Numbers and most symbols can't be used here.",
      invalid: "Enter at least 2 letters."
    },
    company: {
      strip: new RegExp("[^" + L + "\\p{N} .,'’&()/–+-]", "gu"),
      test: v => (v.match(new RegExp("[" + L + "\\p{N}]", "gu")) || []).length >= 2,
      hint: "Letters and numbers are fine. Example: Northstar Creative.",
      bad: "Special characters like @ # $ % ! ? can't be used in a name.",
      invalid: "Enter at least 2 letters or numbers."
    },
    studentNo: {
      strip: /[^0-9-]/g,
      test: v => /^[0-9][0-9-]{5,14}$/.test(v),
      hint: "Numbers and hyphens only. Example: 2023-00123.",
      bad: "Numbers and hyphens only. Letters can't be used here.",
      invalid: "Enter 6 to 15 digits. Example: 2023-00123."
    },
    skills: {
      strip: new RegExp("[^" + L + "\\p{N} ,.+#/&()-]", "gu"),
      test: v => (v.match(new RegExp("[" + L + "]", "gu")) || []).length >= 2,
      hint: "Separate skills with commas. Example: Canva, HTML, Excel.",
      bad: "Special characters can't be used here. Use letters, numbers and commas.",
      invalid: "Enter at least one skill, using letters."
    },
    text3: { test: v => v.length >= 3, invalid: "Enter at least 3 characters." },
    text10: { test: v => v.length >= 10, invalid: "Please write at least 10 characters so others can understand." }
  };
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const URLRE = new RegExp("^(https?://)?([\\p{L}\\p{N}-]+\\.)+[\\p{L}]{2,}(/\\S*)?$", "iu");

  const BY_KEY = {
    profileName: "person", name: "person", fullName: "*fullName",
    school: "place", profileSchool: "place", course: "place", profileCourse: "place",
    companyName: "company", studentNumber: "studentNo",
    jobSkills: "skills", skills: "skills", skillInput: "skills",
    jobTitle: "text3", title: "text3", subject: "text3",
    jobDescription: "text10", description: "text10", messageText: "text10"
  };

  function formOf(el) { return el.form || el.closest("form"); }

  function ruleFor(el) {
    let key = BY_KEY[el.id] || BY_KEY[el.name];
    if (key === "*fullName") {
      const type = formOf(el) && formOf(el).querySelector("#accountType");
      key = type && type.value === "Company" ? "company" : "person";
    }
    return key ? RULES[key] : null;
  }

  function labelText(el) {
    let label = el.id && document.querySelector('label[for="' + el.id + '"]');
    label = label || el.closest("label");
    let t = label ? Array.from(label.childNodes).filter(n => n.nodeType === 3 || n === label.querySelector("span")).map(n => n.textContent).join(" ") : "";
    t = (t || el.getAttribute("aria-label") || el.placeholder || "this field").replace(/[*:]/g, "").replace(/\s+/g, " ").trim();
    return t || "this field";
  }

  function slot(el) {
    const anchor = el.type === "checkbox" || el.type === "radio" ? (el.closest("label") || el) : el;
    let box = anchor.nextElementSibling;
    if (!box || !box.classList.contains("field-msg")) {
      box = document.createElement("div");
      box.className = "field-msg";
      box.id = "msg-" + (el.id || el.name || Math.random().toString(36).slice(2));
      box.setAttribute("aria-live", "polite");
      anchor.after(box);
      el.setAttribute("aria-describedby", ((el.getAttribute("aria-describedby") || "") + " " + box.id).trim());
    }
    return box;
  }

  function setMsg(el, text, kind) {
    const box = slot(el);
    box.textContent = text || "";
    box.className = "field-msg" + (text ? " is-" + kind : "");
    if (kind === "error") el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    el.classList.toggle("is-valid", kind === "ok");
  }

  function prepare(el) {
    if (el.dataset.s2e) return;
    el.dataset.s2e = "1";
    const form = formOf(el);
    if (form) form.noValidate = true;
    const rule = ruleFor(el);
    const hint = hintFor(el, rule);
    if (hint && !(el.parentElement && el.parentElement.querySelector(".auth-hint, .hint"))) {
      setMsg(el, hint, "hint");
    }
  }

  function hintFor(el, rule) {
    if (el.type === "password" && formOf(el) && formOf(el).dataset.auth === "register" && el.id === "password") {
      return "At least 8 characters, with at least one letter and one number.";
    }
    return rule && rule.hint;
  }

  // Returns an error message, or "" when the value is fine.
  function check(el) {
    if (el.disabled || el.type === "hidden" || el.type === "button" || el.type === "submit" || el.type === "file") return "";
    const form = formOf(el);
    const name = labelText(el);

    if (el.type === "checkbox") return el.required && !el.checked ? "Please tick this box to continue." : "";
    let v = String(el.value || "").trim();
    if (!v) {
      if (!el.required) return "";
      return el.tagName === "SELECT" ? "Please choose an option for “" + name + "”." : "Please fill in “" + name + "”.";
    }
    if (el.type === "email") {
      if (!EMAIL.test(v)) return "Enter a valid email address. Example: you@school.edu.ph.";
      const auth = form && form.dataset;
      if (auth && auth.auth === "register" && auth.role === "student" && !/(@tip\.edu\.ph|@edu\.ph)$/i.test(v)) {
        return "Use your school email. It must end in @tip.edu.ph or @edu.ph.";
      }
      return "";
    }
    if (el.type === "password") {
      if (form && form.dataset.auth === "register") {
        if (v.length < 8) return "Your password needs at least 8 characters.";
        if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return "Add at least one letter and one number to your password.";
      }
      if (el.id === "confirmPassword" && form) {
        const pw = form.querySelector("#password");
        if (pw && pw.value !== el.value) return "The passwords don't match. Type the same password again.";
      }
      return "";
    }
    if (el.id === "website" || el.name === "website") {
      return URLRE.test(v) ? "" : "Enter a website like https://www.yourcompany.com.";
    }
    const rule = ruleFor(el);
    if (rule) {
      if (rule.strip && rule.strip.test(v)) { rule.strip.lastIndex = 0; return rule.bad; }
      if (!rule.test(v)) return rule.invalid;
    }
    if (el.minLength > 0 && v.length < el.minLength) return "Use at least " + el.minLength + " characters.";
    return "";
  }

  function validateField(el) {
    const msg = check(el);
    if (msg) setMsg(el, msg, "error");
    else if (el.value && el.type !== "checkbox") setMsg(el, "", "ok");
    else setMsg(el, hintFor(el, ruleFor(el)) || "", "hint");
    return msg;
  }

  const timers = new WeakMap();
  document.addEventListener("input", function (e) {
    const el = e.target;
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) || e.isComposing) return;
    prepare(el);
    const rule = ruleFor(el);
    if (rule && rule.strip && el.value) {
      const clean = el.value.replace(rule.strip, "");
      if (clean !== el.value) {
        const pos = el.selectionStart == null ? clean.length : el.value.slice(0, el.selectionStart).replace(rule.strip, "").length;
        el.value = clean;
        try { el.setSelectionRange(pos, pos); } catch (_) {}
        setMsg(el, rule.bad, "warn");
        clearTimeout(timers.get(el));
        timers.set(el, setTimeout(() => { if (el.dataset.touched) validateField(el); else setMsg(el, hintFor(el, rule) || "", "hint"); }, 3500));
        return;
      }
    }
    if (el.dataset.touched || el.getAttribute("aria-invalid")) validateField(el);
    if (el.id === "password") {
      const c = formOf(el) && formOf(el).querySelector("#confirmPassword");
      if (c && c.value) validateField(c);
    }
  });

  document.addEventListener("focusin", function (e) {
    const el = e.target;
    if (el.matches && el.matches("input, select, textarea")) prepare(el);
  });

  document.addEventListener("focusout", function (e) {
    const el = e.target;
    if (!el.matches || !el.matches("input, select, textarea") || el.type === "submit") return;
    prepare(el);
    el.dataset.touched = "1";
    if (el.type === "text" && ruleFor(el)) el.value = el.value.trim().replace(/\s{2,}/g, " ");
    validateField(el);
  });

  document.addEventListener("change", function (e) {
    const el = e.target;
    if (el.id === "accountType") {
      const name = formOf(el).querySelector("#fullName");
      if (name) { name.value = name.value.replace((ruleFor(name) || {}).strip || /$^/, ""); setMsg(name, hintFor(name, ruleFor(name)) || "", "hint"); }
    }
    if (el.matches && el.matches("select, input[type=checkbox]") && el.dataset.touched) validateField(el);
  });

  // Make sure the browser's own pop-up messages never replace ours.
  document.addEventListener("click", function (e) {
    const b = e.target.closest && e.target.closest("button, input[type=submit]");
    const f = b && formOf(b);
    if (f) f.noValidate = true;
  }, true);

  // Check every field before the page's own submit code runs.
  document.addEventListener("submit", function (e) {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    form.noValidate = true;
    const fields = Array.from(form.elements).filter(el => /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName));
    let first = null, count = 0;
    fields.forEach(el => {
      prepare(el);
      el.dataset.touched = "1";
      if (el.type === "text" && ruleFor(el)) el.value = el.value.trim().replace(/\s{2,}/g, " ");
      if (validateField(el)) { count++; first = first || el; }
    });
    let summary = form.querySelector(".form-summary");
    if (count) {
      e.preventDefault();
      e.stopPropagation();
      if (!summary) {
        summary = document.createElement("div");
        summary.className = "form-summary";
        summary.setAttribute("role", "alert");
        const btn = form.querySelector('[type="submit"], button:not([type])');
        if (btn) btn.before(summary); else form.append(summary);
      }
      summary.textContent = count === 1 ? "Please fix the 1 field marked in red." : "Please fix the " + count + " fields marked in red.";
      first.focus();
      first.scrollIntoView({ block: "center", behavior: "smooth" });
    } else if (summary) {
      summary.remove();
    }
  }, true);

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form input, form select, form textarea").forEach(prepare);
  });
})();
