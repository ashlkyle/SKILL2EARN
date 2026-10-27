
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#connectionForm");
  const urlInput = document.querySelector("#projectUrl");
  const keyInput = document.querySelector("#publishableKey");
  const button = document.querySelector("#testButton");
  const result = document.querySelector("#result");

  function showResult(message) {
    result.textContent = message;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const projectUrl = urlInput.value.trim().replace(/\/+$/, "");
    const publishableKey = keyInput.value.trim();

    let parsedUrl;

    try {
      parsedUrl = new URL(projectUrl);
    } catch {
      showResult("FAILED: Enter a valid Supabase Project URL.");
      return;
    }

    if (
      parsedUrl.protocol !== "https:" ||
      parsedUrl.hostname !== "supabase.co" &&
      !parsedUrl.hostname.endsWith(".supabase.co")
    ) {
      showResult(
        "FAILED: Use the HTTPS Project URL shown in your Supabase dashboard."
      );
      return;
    }

    if (!publishableKey) {
      showResult("FAILED: Enter your Supabase publishable key.");
      return;
    }

    button.disabled = true;
    button.textContent = "Testing connection...";
    showResult("Checking the Supabase authentication service...");

    try {
      const response = await fetch(
        `${projectUrl}/auth/v1/health`,
        {
          method: "GET",
          headers: {
            apikey: publishableKey
          }
        }
      );

      const responseText = await response.text();

      if (response.ok) {
        showResult(
          "PASS: Your browser reached the Supabase authentication service.\n\n" +
          `HTTP status: ${response.status}\n` +
          "Next: verify the database tables, Row Level Security policies, " +
          "and authentication settings before connecting SKILL2EARN pages."
        );
      } else if (response.status === 401 || response.status === 403) {
        showResult(
          "CONNECTION REACHED, BUT ACCESS WAS REJECTED.\n\n" +
          `HTTP status: ${response.status}\n` +
          "Check that you copied the correct Project URL and publishable key."
        );
      } else {
        showResult(
          "The service responded, but the test did not pass.\n\n" +
          `HTTP status: ${response.status}\n` +
          `Response: ${responseText.slice(0, 300)}`
        );
      }
    } catch (error) {
      showResult(
        "CONNECTION FAILED.\n\n" +
        "Check your internet connection, Project URL, and browser console. " +
        "A browser or network restriction may also block the request.\n\n" +
        `Details: ${error.message}`
      );
    } finally {
      button.disabled = false;
      button.textContent = "Test Supabase Connection";
    }
  });
});
