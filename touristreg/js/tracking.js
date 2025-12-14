document.addEventListener("DOMContentLoaded", () => {
  // 1. SELECTORS (Matched to your new Tourist HTML)
  const trackForm = document.getElementById("trackForm");
  const statusResultDiv = document.getElementById("statusResult");
  const loadingIndicator = document.getElementById("trackingLoadingIndicator");
  const errorMessageDiv = document.getElementById("trackingErrorMessage");
  const errorMessageText = document.getElementById("trackingErrorMessageText");

  // Display Fields
  const displayRefNo = document.getElementById("displayRefNo");
  const displayTouristName = document.getElementById("displayTouristName"); // Renamed from StudentName
  const displayRegType = document.getElementById("displayRegType"); // Renamed from GradeLevel
  const displaySubmissionDate = document.getElementById("displaySubmissionDate");
  const displayStatus = document.getElementById("displayStatus");

  // Rejection Area
  const rejectionReasonContainer = document.getElementById("rejectionReasonContainer");
  const displayRejectionReason = document.getElementById("displayRejectionReason");

  // Actions
  const resubmitActionContainer = document.getElementById("resubmitActionContainer");
  const startNewApplicationBtn = document.getElementById("startNewApplicationBtn");

  // API Configuration
  const TRACK_API_URL = "../backend/tracking_status.php";
  const REGISTRATION_FORM_URL = "../index.html"; // Path to return to home/registration

  // 2. EVENT LISTENER
  if (trackForm) {
    trackForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      // Reset UI
      showLoading();
      hideError();
      if (statusResultDiv) statusResultDiv.classList.add("hidden");
      if (resubmitActionContainer) resubmitActionContainer.classList.add("hidden");

      // Get Input
      const referenceNumberInput = document.getElementById("referenceNumberInput");
      const referenceNumber = referenceNumberInput ? referenceNumberInput.value.trim() : "";

      if (!referenceNumber) {
        showError("Please enter your reference number.");
        hideLoading();
        return;
      }

      // Fetch Data
      try {
        const response = await fetch(`${TRACK_API_URL}?ref=${encodeURIComponent(referenceNumber)}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`Server Error: ${response.status}`);
        }

        const result = await response.json();
        hideLoading();

        if (result.status === "success" && result.data) {
          populateStatusDetails(result.data);

          if (statusResultDiv) statusResultDiv.classList.remove("hidden");

          // Handle Rejection State
          if (result.data.status && result.data.status.toLowerCase() === "rejected") {
            if (resubmitActionContainer) resubmitActionContainer.classList.remove("hidden");
          }
        } else {
          showError(result.message || "Reference number not found.");
        }
      } catch (error) {
        hideLoading();
        console.error("Tracking Error:", error);
        showError("Unable to connect to the server. Please try again later.");
      }
    });
  }

  // 3. HELPER: POPULATE UI
  function populateStatusDetails(data) {
    // Reference Number
    if (displayRefNo) displayRefNo.textContent = data.reference_number || "N/A";

    // Name (First + Last)
    const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim();
    if (displayTouristName) displayTouristName.textContent = fullName || "N/A";

    // Registration Type (Capitalized)
    if (displayRegType) {
      const type = data.registration_type || "N/A";
      displayRegType.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    }

    // Date Format
    if (displaySubmissionDate) {
      // Check if created_at exists, otherwise fallback
      const dateStr = data.created_at || data.submission_date;
      displaySubmissionDate.textContent = dateStr
        ? new Date(dateStr).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";
    }

    // Status Styling
    if (displayStatus) {
      const statusValue = data.status ? data.status.toLowerCase() : "unknown";
      displayStatus.textContent = data.status
        ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
        : "Unknown";

      // CSS Class Reset
      displayStatus.className = "status-text";
      displayStatus.classList.add(`status-${statusValue}`); // e.g. .status-approved
    }

    // Rejection Reason
    if (rejectionReasonContainer && displayRejectionReason) {
      // Note: Ensure your database has a 'rejection_reason' column if you want this to work
      if (data.status === "rejected" && data.rejection_reason) {
        displayRejectionReason.textContent = data.rejection_reason;
        rejectionReasonContainer.classList.remove("hidden");
      } else {
        rejectionReasonContainer.classList.add("hidden");
      }
    }
  }

  // 4. ACTION BUTTONS
  if (startNewApplicationBtn) {
    startNewApplicationBtn.addEventListener("click", () => {
      window.location.href = REGISTRATION_FORM_URL;
    });
  }

  // 5. UI UTILITIES
  function showLoading() {
    if (loadingIndicator) loadingIndicator.classList.remove("hidden");
  }

  function hideLoading() {
    if (loadingIndicator) loadingIndicator.classList.add("hidden");
  }

  function showError(message) {
    if (errorMessageText) errorMessageText.textContent = message;
    if (errorMessageDiv) errorMessageDiv.classList.remove("hidden");
  }

  function hideError() {
    if (errorMessageDiv) errorMessageDiv.classList.add("hidden");
    if (errorMessageText) errorMessageText.textContent = "";
  }
});
