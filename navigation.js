(function () {
  "use strict";

  const MENUS = {
    student: [
      ["Dashboard", "dashboard.html"],
      ["My Profile", "profile.html"],
      ["Recommended Jobs", "recommended-jobs.html"],
      ["My Applications", "applications.html"],
      ["Verify My Account", "verification.html"],
      ["Report a Problem", "bug-report.html"],
      ["Help & Support", "support.html"],
      ["Delete Account", "delete-account.html"]
    ],
    employer: [
      ["Dashboard", "dashboard.html"],
      ["Manage Jobs", "jobs.html"],
      ["Company Profile", "profile.html"],
      ["Applicants", "applicants.html"],
      ["Verify My Account", "verification.html"],
      ["Report a Problem", "bug-report.html"],
      ["Help & Support", "support.html"],
      ["Delete Account", "delete-account.html"]
    ],
    admin: [
      ["Admin Dashboard", "dashboard.html"]
    ]
  };

  const style = document.createElement("style");
  style.textContent = `
    #s2e-navigation{position:sticky;top:0;z-index:1000;background:#0f1826;border-bottom:1px solid #2b3b55;font-family:Arial,sans-serif}
    .s2e-inner{width:min(1400px,94%);margin:auto;min-height:66px;display:flex;align-items:center;justify-content:space-between;gap:15px;flex-wrap:wrap}
    .s2e-brand{font-size:21px;font-weight:800;text-decoration:none;color:#e2e8f2;white-space:nowrap}
    .s2e-brand span{color:#5fd3ee}
    .s2e-links{display:flex;align-items:center;gap:4px}
    .s2e-links a{padding:10px;border-radius:8px;color:#a8b6cc;text-decoration:none;font-size:14.5px;font-weight:600}
    .s2e-links a:hover,.s2e-links a.active{background:#1b2f55;color:#fff}
    .s2e-actions{display:flex;align-items:center;gap:10px}
    .s2e-email{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:#a8b6cc}
    .s2e-logout,.s2e-toggle{border:1px solid #435779;background:#1d2c47;color:#e2e8f2;border-radius:8px;padding:10px 12px;font-weight:700;cursor:pointer}
    .s2e-toggle{display:none;font-size:18px}
    @media(max-width:1100px){.s2e-inner{padding:12px 0}.s2e-toggle{display:block}.s2e-links{display:none;width:100%;order:3;flex-direction:column;align-items:stretch}.s2e-links.open{display:flex}.s2e-links a{padding:12px}.s2e-email{display:none}}
  `;
  document.head.appendChild(style);

  function roleFromPath() {
    const path = location.pathname.toLowerCase();
    if (path.includes("/student/")) return "student";
    if (path.includes("/employer/")) return "employer";
    if (path.includes("/admin/")) return "admin";
    return null;
  }

  async function initialize() {
    const role = roleFromPath();
    if (!role) return;

    const config = window.SKILL2EARN_SUPABASE_CONFIG;
    if (!config) {
      console.error("Supabase configuration is missing.");
      return;
    }

    const client = config.getClient();
    const { data: auth, error: authError } = await client.auth.getUser();

    if (authError || !auth.user) {
      location.replace("login.html");
      return;
    }

    const { data: profile, error } = await client
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (error) {
      console.error("Could not verify account role:", error);
      return;
    }

    if (!profile || profile.role !== role) {
      if (profile && MENUS[profile.role]) {
        location.replace("../" + profile.role + "/dashboard.html");
      } else {
        location.replace("login.html");
      }
      return;
    }

    const header = document.createElement("header");
    header.id = "s2e-navigation";

    const links = MENUS[role].map(([label, href]) => {
      const active = location.pathname.split("/").pop().toLowerCase() === href;
      return `<a href="${href}" class="${active ? "active" : ""}" ${active ? 'aria-current="page"' : ""}>${label}</a>`;
    }).join("");

    const brandHref = "dashboard.html";

    header.innerHTML = `
      <div class="s2e-inner">
        <a class="s2e-brand" href="${brandHref}">SKILL<span>2</span>EARN</a>
        <button class="s2e-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button>
        <nav class="s2e-links" aria-label="Main navigation">${links}</nav>
        <div class="s2e-actions">
          <span class="s2e-email">${auth.user.email || ""}</span>
          <button class="s2e-logout" type="button">Sign Out</button>
        </div>
      </div>
    `;

    document.body.insertBefore(header, document.body.firstChild);

    const toggle = header.querySelector(".s2e-toggle");
    const nav = header.querySelector(".s2e-links");

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "✕" : "☰";
    });

    header.querySelector(".s2e-logout").addEventListener("click", async () => {
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) {
        alert("Unable to sign out. Please try again.");
        return;
      }
      location.replace("login.html");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initialize().catch(error => console.error("Navigation error:", error));
    });
  } else {
    initialize().catch(error => console.error("Navigation error:", error));
  }
})();