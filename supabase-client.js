
/*
 * SKILL2EARN - Shared Supabase Client
 *
 * Use only the Supabase Project URL and publishable key here.
 * Never put a service_role key or secret key in frontend code.
 */

(function () {
  "use strict";

  const SUPABASE_URL = "https://ojknrrryjvjsbxtvsxxa.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_ryGqF1DusauMJOQgXd4gEQ_oFBymj3R";

  function isConfigured() {
    return (
      SUPABASE_URL.startsWith("https://") &&
      !SUPABASE_URL.includes("PASTE_YOUR_") &&
      SUPABASE_PUBLISHABLE_KEY.length > 0 &&
      !SUPABASE_PUBLISHABLE_KEY.includes("PASTE_YOUR_")
    );
  }

  window.SKILL2EARN_SUPABASE_CONFIG = {
    isConfigured,
    getClient: function () {
      if (!isConfigured()) {
        throw new Error(
          "Supabase is not configured. Add the Project URL and publishable key."
        );
      }

      if (!window.supabase || !window.supabase.createClient) {
        throw new Error(
          "Supabase library did not load. Check your internet connection."
        );
      }

      if (!window.SKILL2EARN_SUPABASE_CLIENT) {
        window.SKILL2EARN_SUPABASE_CLIENT =
          window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY,
            {
              auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
              }
            }
          );
      }

      return window.SKILL2EARN_SUPABASE_CLIENT;
    }
  };
})();
