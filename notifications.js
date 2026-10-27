(function () {
  "use strict";

  const STYLE_ID = "s2e-notification-styles";
  const ROOT_ID = "s2e-notification-root";

  let supabaseClient = null;
  let currentUserId = null;
  let refreshTimer = null;

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID} {
        position: fixed;
        right: 22px;
        bottom: 22px;
        z-index: 9999;
        font-family: Arial, sans-serif;
      }

      #${ROOT_ID} button {
        cursor: pointer;
        font: inherit;
      }

      .s2e-notification-toggle {
        width: 54px;
        height: 54px;
        border: 0;
        border-radius: 50%;
        background: #1746a2;
        color: #fff;
        font-size: 23px;
        box-shadow: 0 5px 18px rgba(15, 35, 80, .24);
        position: relative;
      }

      .s2e-notification-badge {
        position: absolute;
        top: -3px;
        right: -3px;
        min-width: 19px;
        height: 19px;
        padding: 0 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: #e53935;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        box-sizing: border-box;
      }

      .s2e-notification-panel {
        display: none;
        position: absolute;
        right: 0;
        bottom: 66px;
        width: min(360px, calc(100vw - 32px));
        max-height: 460px;
        overflow: hidden;
        background: #fff;
        border: 1px solid #e4e8f0;
        border-radius: 14px;
        box-shadow: 0 12px 40px rgba(20, 35, 70, .18);
        color: #17233b;
      }

      .s2e-notification-panel.s2e-open {
        display: block;
      }

      .s2e-notification-header {
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #edf0f5;
      }

      .s2e-notification-header h3 {
        margin: 0;
        font-size: 16px;
      }

      .s2e-notification-mark-all {
        border: 0;
        background: transparent;
        color: #1746a2;
        font-size: 12px;
      }

      .s2e-notification-list {
        max-height: 350px;
        overflow-y: auto;
      }

      .s2e-notification-item {
        padding: 13px 16px;
        border-bottom: 1px solid #f0f2f7;
      }

      .s2e-notification-item.s2e-unread {
        background: #f0f5ff;
      }

      .s2e-notification-item strong {
        display: block;
        margin-bottom: 5px;
        font-size: 13px;
      }

      .s2e-notification-item p {
        margin: 0 0 7px;
        font-size: 12px;
        line-height: 1.5;
        color: #536079;
        overflow-wrap: anywhere;
      }

      .s2e-notification-item time {
        font-size: 11px;
        color: #8490a5;
      }

      .s2e-notification-item button {
        display: block;
        margin-top: 8px;
        padding: 0;
        border: 0;
        background: transparent;
        color: #1746a2;
        font-size: 12px;
      }

      .s2e-notification-empty {
        padding: 28px 18px;
        text-align: center;
        color: #77839a;
        font-size: 13px;
      }

      @media (max-width: 480px) {
        #${ROOT_ID} {
          right: 14px;
          bottom: 14px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createInterface() {
    if (document.getElementById(ROOT_ID)) return;

    addStyles();

    const root = document.createElement("div");
    root.id = ROOT_ID;

    root.innerHTML = `
      <section class="s2e-notification-panel"
               id="s2e-notification-panel"
               aria-label="Notifications">
        <header class="s2e-notification-header">
          <h3>Notifications</h3>
          <button class="s2e-notification-mark-all"
                  id="s2e-notification-mark-all"
                  type="button">
            Mark all read
          </button>
        </header>
        <div class="s2e-notification-list"
             id="s2e-notification-list">
          <div class="s2e-notification-empty">Loading notifications...</div>
        </div>
      </section>

      <button class="s2e-notification-toggle"
              id="s2e-notification-toggle"
              type="button"
              aria-label="Open notifications"
              aria-expanded="false">
        ♧
        <span class="s2e-notification-badge"
              id="s2e-notification-badge"
              hidden>0</span>
      </button>
    `;

    document.body.appendChild(root);

    const toggle = document.getElementById("s2e-notification-toggle");
    const panel = document.getElementById("s2e-notification-panel");

    toggle.addEventListener("click", async function () {
      const isOpen = panel.classList.toggle("s2e-open");
      toggle.setAttribute("aria-expanded", String(isOpen));

      if (isOpen) {
        await loadNotifications();
      }
    });

    document.getElementById("s2e-notification-mark-all")
      .addEventListener("click", markAllRead);
  }

  function showMessage(message) {
    const list = document.getElementById("s2e-notification-list");
    if (!list) return;

    list.replaceChildren();

    const item = document.createElement("div");
    item.className = "s2e-notification-empty";
    item.textContent = message;
    list.appendChild(item);
  }

  function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  function updateBadge(notifications) {
    const badge = document.getElementById("s2e-notification-badge");
    if (!badge) return;

    const unread = notifications.filter(function (item) {
      return item.is_read === false;
    }).length;

    badge.textContent = unread > 99 ? "99+" : String(unread);
    badge.hidden = unread === 0;
  }

  async function loadNotifications() {
    const list = document.getElementById("s2e-notification-list");
    if (!list || !supabaseClient || !currentUserId) return;

    list.replaceChildren();

    const loading = document.createElement("div");
    loading.className = "s2e-notification-empty";
    loading.textContent = "Loading notifications...";
    list.appendChild(loading);

    const { data, error } = await supabaseClient
      .from("notifications")
      .select(
        "id,user_id,title,message,notification_type,is_read,created_at"
      )
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("SKILL2EARN notification error:", error);
      showMessage("Notifications could not be loaded. Check your connection and database permissions.");
      return;
    }

    const notifications = data || [];
    updateBadge(notifications);
    list.replaceChildren();

    if (notifications.length === 0) {
      showMessage("You're all caught up. No notifications yet.");
      return;
    }

    notifications.forEach(function (notification) {
      const item = document.createElement("article");
      item.className = "s2e-notification-item";

      if (notification.is_read === false) {
        item.classList.add("s2e-unread");
      }

      const title = document.createElement("strong");
      title.textContent = notification.title || "SKILL2EARN Update";

      const message = document.createElement("p");
      message.textContent = notification.message || "You have a new notification.";

      const date = document.createElement("time");
      date.textContent = formatDate(notification.created_at);

      item.append(title, message, date);

      if (notification.is_read === false) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Mark as read";

        button.addEventListener("click", async function () {
          await markOneRead(notification.id);
        });

        item.appendChild(button);
      }

      list.appendChild(item);
    });
  }

  async function markOneRead(notificationId) {
    if (!supabaseClient || !currentUserId) return;

    const { error } = await supabaseClient
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", currentUserId);

    if (error) {
      console.error("Could not mark notification as read:", error);
      return;
    }

    await loadNotifications();
  }

  async function markAllRead() {
    if (!supabaseClient || !currentUserId) return;

    const { error } = await supabaseClient
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", currentUserId)
      .eq("is_read", false);

    if (error) {
      console.error("Could not mark all notifications as read:", error);
      showMessage("Unable to mark notifications as read. Check database permissions.");
      return;
    }

    await loadNotifications();
  }

  async function initialize() {
    const config = window.SKILL2EARN_SUPABASE_CONFIG;

    if (!config || typeof config.getClient !== "function") {
      console.warn("SKILL2EARN Supabase client is not configured.");
      return;
    }

    try {
      supabaseClient = config.getClient();

      const { data, error } = await supabaseClient.auth.getUser();

      if (error || !data || !data.user) {
        return;
      }

      currentUserId = data.user.id;

      createInterface();
      await loadNotifications();

      if (refreshTimer) clearInterval(refreshTimer);

      refreshTimer = setInterval(function () {
        if (document.visibilityState === "visible") {
          loadNotifications();
        }
      }, 60000);

      supabaseClient.auth.onAuthStateChange(function (_event, session) {
        currentUserId = session && session.user ? session.user.id : null;

        if (!currentUserId) {
          const root = document.getElementById(ROOT_ID);
          if (root) root.remove();
          if (refreshTimer) clearInterval(refreshTimer);
          refreshTimer = null;
        }
      });
    } catch (error) {
      console.error("SKILL2EARN notifications initialization failed:", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();