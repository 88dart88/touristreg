document.addEventListener("DOMContentLoaded", () => {
  // 1. SELECTORS (Matching your NEW HTML)
  const loginForm = document.getElementById("adminLoginForm"); // Matches your HTML ID
  const errorMessageDiv = document.getElementById("loginErrorMessage"); // Matches your HTML ID
  const loginBtn = loginForm ? loginForm.querySelector("button[type='submit']") : null;

  // 2. CONFIGURATION
  // Path to backend relative to admin/admin_login.html
  const API_URL = "../backend/process_admin_login.php";
  // Path to dashboard relative to admin/admin_login.html
  const DASHBOARD_URL = "../admin_dashboard.php";

  // 4. EVENT LISTENER
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Reset UI
      if (errorMessageDiv) {
        errorMessageDiv.classList.add("hidden");
        errorMessageDiv.textContent = "";
      }

      // Loading State
      if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = "Logging in...";
      }

      const formData = new FormData(loginForm);

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });

        // Parse JSON
        const result = await response.json();

        if (result.success) {
          // Success: Redirect
          window.location.href = DASHBOARD_URL;
        } else {
          // Error: Show message
          showError(result.message || "Invalid username or password.");
        }
      } catch (error) {
        console.error("Login Error:", error);
        showError("Unable to connect to the server. Please check your connection.");
      } finally {
        // Reset Button
        if (loginBtn) {
          loginBtn.disabled = false;
          loginBtn.textContent = "Login";
        }
      }
    });
  }

  // 5. HELPER FUNCTION
  function showError(message) {
    if (errorMessageDiv) {
      errorMessageDiv.textContent = message;
      errorMessageDiv.classList.remove("hidden"); // Using your 'hidden' class
      errorMessageDiv.style.display = "block"; // Force display just in case css fails
      errorMessageDiv.style.color = "red"; // Fallback styling
      errorMessageDiv.style.marginBottom = "15px";
    } else {
      alert(message);
    }
  }
});
