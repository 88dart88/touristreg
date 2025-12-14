document.addEventListener("DOMContentLoaded", function () {
  const registrationForm = document.getElementById("registration-form");
  const registrationTypeSelect = document.getElementById("registrationType");

  // Logic Containers
  const foreignField = document.querySelector(".foreign-field");
  const lrnField = document.querySelector(".lrn-field");

  // Visibility Containers
  const otherReligionField = document.querySelector(".other-religion-field");
  const indigenousField = document.querySelector(".indigenous-field");
  const otherIndigenousField = document.querySelector(".other-indigenous-field");
  const otherRelationshipField = document.querySelector(".other-relationship-field");
  const travelPackageField = document.querySelector(".travel-package-field");

  // Inputs needing specific logic
  const nationalitySelect = document.getElementById("Nationality");
  const religionSelect = document.getElementById("religion");
  const indigenousRadios = document.querySelectorAll('input[name="indigenous"]');
  const indigenousGroupSelect = document.getElementById("indigenousGroup");
  const emergencyRelationshipSelect = document.getElementById("emergencyRelationship");
  const purposeSelect = document.getElementById("purpose");
  const trackPackageSelect = document.getElementById("trackPackage");

  // Buttons
  const reviewButton = document.getElementById("review-button");
  const submitButton = document.getElementById("submit-button");
  const editButton = document.getElementById("edit-button");
  const summarySection = document.getElementById("summary-section");

  // --- INITIALIZATION ---
  console.log("Tourist Form Logic Loaded.");
  addFileValidationStyles();

  if (document.getElementById("dob")) {
    document.getElementById("dob").setAttribute("max", new Date().toISOString().split("T")[0]);
  }

  // --- EVENT LISTENERS ---

  if (registrationForm) {
    registrationForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (validateForm()) {
        submitRegistrationForm();
      }
    });
  }

  if (registrationTypeSelect) {
    registrationTypeSelect.addEventListener("change", handleRegistrationTypeChange);
    handleRegistrationTypeChange();
  }

  // Nationality "Other" Toggle
  if (nationalitySelect) {
    nationalitySelect.addEventListener("change", function () {
      const otherInput = document.getElementById("otherNationality");
      const isOther = this.value === "Other";
      if (otherInput) {
        otherInput.style.display = isOther ? "block" : "none";
        otherInput.required = isOther;
      }
    });
  }

  const withPassportRadio = document.getElementById("withPassport");
  const noPassportRadio = document.getElementById("noPassport");
  if (withPassportRadio) withPassportRadio.addEventListener("change", handlePassportChange);
  if (noPassportRadio) noPassportRadio.addEventListener("change", handlePassportChange);

  if (religionSelect) religionSelect.addEventListener("change", handleReligionChange);
  indigenousRadios.forEach((radio) => radio.addEventListener("change", handleIndigenousChange));
  if (indigenousGroupSelect) indigenousGroupSelect.addEventListener("change", handleIndigenousGroupChange);
  if (emergencyRelationshipSelect)
    emergencyRelationshipSelect.addEventListener("change", handleEmergencyRelationshipChange);
  if (purposeSelect) purposeSelect.addEventListener("change", handlePurposeChange);

  if (reviewButton) reviewButton.addEventListener("click", showSummary);
  if (editButton) editButton.addEventListener("click", editForm);

  document.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener("change", function () {
      validateFileSize(this);
    });
  });

  const contactInput = document.getElementById("emergencyContact");
  if (contactInput) {
    contactInput.addEventListener("input", function () {
      let val = this.value.replace(/\D/g, "");
      if (val.length > 11) val = val.substring(0, 11);
      this.value = val;
    });
  }

  // --- CORE LOGIC: DOCUMENT REQUIREMENTS ---

  function handleRegistrationTypeChange() {
    const selectedType = registrationTypeSelect.value;

    const docGroups = document.querySelectorAll(".doc-group");
    docGroups.forEach((group) => (group.style.display = "none"));

    if (foreignField) foreignField.style.display = "none";

    const visibilityRules = {
      new: ["group-valid-id", "group-hotel", "group-itinerary"],
      foreign: ["group-passport", "group-itinerary", "group-hotel", "group-ticket", "group-visa"],
      returning: ["group-passport", "group-itinerary", "group-residence", "group-ticket"],
      business: ["group-passport", "group-itinerary", "group-hotel", "group-ticket"],
      vip: ["group-passport", "group-itinerary"],
    };

    if (visibilityRules[selectedType]) {
      visibilityRules[selectedType].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = "block";
      });
    }

    // Show Nationality for Foreign, Business, and VIP
    const typesWithNationality = ["foreign", "business", "vip"];
    if (typesWithNationality.includes(selectedType) && foreignField) {
      foreignField.style.display = "block";
    }

    updateRequiredDocuments();
  }

  function updateRequiredDocuments() {
    const selectedType = registrationTypeSelect.value;
    document.querySelectorAll('input[type="file"]').forEach((input) => (input.required = false));

    const requirementRules = {
      new: ["validID", "hotelProof"],
      foreign: ["passportScan", "itinerary", "hotelProof", "returnTicket"],
      returning: ["passportScan", "itinerary", "proofResidence", "returnTicket"],
      business: ["passportScan", "itinerary", "hotelProof"],
      vip: ["passportScan"],
    };

    if (selectedType === "foreign") requirementRules["foreign"].push("visa");

    if (requirementRules[selectedType]) {
      requirementRules[selectedType].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.required = true;
      });
    }

    updateFileInputLabels();
  }

  function handlePassportChange() {
    const hasPassport = document.getElementById("withPassport").checked;
    if (lrnField) lrnField.style.display = hasPassport ? "block" : "none";
    const passportInput = document.getElementById("passportNum");
    if (passportInput) passportInput.required = hasPassport;
  }

  // --- HELPER FUNCTIONS ---

  function handleReligionChange() {
    const isOther = religionSelect.value === "Other";
    if (otherReligionField) otherReligionField.style.display = isOther ? "block" : "none";
    const el = document.getElementById("otherReligion");
    if (el) el.required = isOther;
  }

  function handleIndigenousChange() {
    const isInd = document.getElementById("indigenousYes").checked;
    if (indigenousField) indigenousField.style.display = isInd ? "block" : "none";
    const el = document.getElementById("indigenousGroup");
    if (el) el.required = isInd;
    if (!isInd && otherIndigenousField) otherIndigenousField.style.display = "none";
  }

  function handleIndigenousGroupChange() {
    const isOther = indigenousGroupSelect.value === "Other";
    if (otherIndigenousField) otherIndigenousField.style.display = isOther ? "block" : "none";
    const el = document.getElementById("otherIndigenousGroup");
    if (el) el.required = isOther;
  }

  function handleEmergencyRelationshipChange() {
    const isOther = emergencyRelationshipSelect.value === "Other";
    if (otherRelationshipField) otherRelationshipField.style.display = isOther ? "block" : "none";
    const el = document.getElementById("otherRelationship");
    if (el) el.required = isOther;
  }

  function handlePurposeChange() {
    const isTourism = purposeSelect.value === "tourism";
    if (travelPackageField) travelPackageField.style.display = isTourism ? "block" : "none";
    if (trackPackageSelect) trackPackageSelect.required = isTourism;
  }

  function getTrueNationality() {
    const sel = document.getElementById("Nationality");
    if (sel && sel.value === "Other") {
      return document.getElementById("otherNationality").value;
    }
    return sel ? sel.value : "";
  }

  // --- VALIDATION & SUBMIT ---

  function validateForm() {
    if (!registrationForm.checkValidity()) {
      registrationForm.reportValidity();
      return false;
    }

    let valid = true;
    document.querySelectorAll('input[type="file"][required]').forEach((input) => {
      if (input.offsetParent !== null && input.files.length === 0) {
        const labelText = input.previousElementSibling
          ? input.previousElementSibling.textContent.replace("*", "").trim()
          : "Document";
        alert(`Please upload: ${labelText}`);
        valid = false;
      }
    });
    if (!valid) return false;

    if (!document.getElementById("termsAgreement").checked) {
      alert("Please agree to the terms.");
      return false;
    }
    return true;
  }

  function submitRegistrationForm() {
    const overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.innerHTML = `<div style="color:white;font-weight:bold;">Processing Registration...</div>`;
    document.body.appendChild(overlay);

    // Send FormData to Backend
    const formData = new FormData(registrationForm);

    // Ensure this path matches your PHP file location exactly
    fetch("../backend/save_registration.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        overlay.remove();
        if (data.status === "success") {
          // STRICT: Only use the number returned by PHP
          showConfirmationMessage(data.reference_number);
        } else {
          alert("Error: " + (data.message || "Unknown Error"));
        }
      })
      .catch((error) => {
        overlay.remove();
        console.error("Backend connection error:", error);
        // NO FALLBACK GENERATION HERE.
        alert("Unable to submit registration. Please check your connection or contact the administrator.");
      });
  }

  // --- SUMMARY & PDF ---

  function showSummary(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setText("summary-registration-type", getSelectText(registrationTypeSelect));
    setText("summary-name", `${getVal("firstName")} ${getVal("lastName")}`);
    setText("summary-dob", getVal("dob"));
    setText("summary-place-of-birth", getVal("placeOfBirth"));
    setText("summary-gender", getSelectText(document.getElementById("gender")));
    setText("summary-religion", getVal("religion"));

    const isInd = document.getElementById("indigenousYes").checked;
    setText("summary-indigenous", isInd ? "Yes" : "No");

    const hasPass = document.getElementById("withPassport").checked;
    setText("summary-lrn", hasPass ? "With Passport" : "No Passport");
    const passRow = document.getElementById("summary-passport-number-row");
    if (passRow) passRow.style.display = hasPass ? "flex" : "none";
    if (hasPass) setText("summary-passport-number", getVal("passportNum"));

    setText("summary-address", `${getVal("streetAddress")}, ${getVal("city")}`);
    setText("summary-emergency-name", `${getVal("emergencyFirstName")} ${getVal("emergencyLastName")}`);
    setText("summary-emergency-relationship", getSelectText(emergencyRelationshipSelect));
    setText("summary-emergency-contact", getVal("emergencyContact"));
    setText("summary-emergency-email", getVal("emergencyEmail"));
    setText("summary-purpose", getSelectText(purposeSelect));

    const isTourism = purposeSelect.value === "tourism";
    const trackRow = document.getElementById("summary-track-row");
    if (trackRow) {
      trackRow.style.display = isTourism ? "flex" : "none";
      if (isTourism) setText("summary-track", getSelectText(trackPackageSelect));
    }

    const list = document.getElementById("summary-documents");
    list.innerHTML = "";
    document.querySelectorAll('input[type="file"]').forEach((input) => {
      if (input.files.length > 0 && input.closest(".doc-group").style.display !== "none") {
        const li = document.createElement("li");
        const label = input.previousElementSibling
          ? input.previousElementSibling.textContent.replace("*", "").trim()
          : "Doc";
        li.textContent = `${label}: ${input.files[0].name}`;
        list.appendChild(li);
      }
    });

    summarySection.style.display = "block";
    reviewButton.style.display = "none";
    submitButton.style.display = "inline-block";
    summarySection.scrollIntoView({ behavior: "smooth" });
  }

  function generatePDF(ref) {
    if (!window.jspdf) {
      alert("PDF Lib Missing");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("TOURIST REGISTRATION RECEIPT", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Reference: ${ref}`, 105, 30, { align: "center" });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 36, { align: "center" });

    let y = 50;
    const left = 20;

    const addLine = (label, val) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, left, y);
      doc.setFont("helvetica", "normal");
      doc.text(val, left + 50, y);
      y += 8;
    };

    addLine("Name:", `${getVal("firstName")} ${getVal("lastName")}`);
    addLine("Type:", getSelectText(registrationTypeSelect));

    const typesWithNationality = ["foreign", "business", "vip"];
    if (typesWithNationality.includes(registrationTypeSelect.value)) {
      addLine("Nationality:", getTrueNationality());
    }

    addLine("Address:", `${getVal("city")}, ${getVal("province")}`);
    addLine("Contact:", getVal("emergencyContact"));
    addLine("Purpose:", getSelectText(purposeSelect));

    doc.save(`Tourist_Ref_${ref}.pdf`);
  }

  // --- UTILITIES ---
  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }
  function getSelectText(el) {
    return el && el.selectedIndex >= 0 ? el.options[el.selectedIndex].text : "N/A";
  }
  function setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  function addFileValidationStyles() {
    const s = document.createElement("style");
    s.innerHTML = `
        .loading-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:9999}
        .required-mark { color: red; margin-left: 4px; }
      `;
    document.head.appendChild(s);
  }

  function validateFileSize(i) {
    if (i.files[0]?.size > 5 * 1024 * 1024) {
      alert("Max 5MB");
      i.value = "";
      return false;
    }
    return true;
  }

  function updateFileInputLabels() {
    document.querySelectorAll('input[type="file"]').forEach((input) => {
      const label = input.previousElementSibling;
      if (label) {
        if (input.required && !label.innerHTML.includes("required")) {
          if (!label.querySelector(".required")) label.innerHTML += ` <span class="required">*</span>`;
        } else if (!input.required) {
          const span = label.querySelector(".required");
          if (span) span.remove();
        }
      }
    });
  }

  function editForm() {
    summarySection.style.display = "none";
    reviewButton.style.display = "inline-block";
    submitButton.style.display = "none";
    document.querySelector(".welcome-panel").scrollIntoView({ behavior: "smooth" });
  }

  function showConfirmationMessage(ref) {
    const div = document.createElement("div");
    div.className = "loading-overlay";
    div.innerHTML = `<div style="background:white;padding:30px;border-radius:8px;text-align:center;">
          <h2 style="color:#2ecc71;">Success!</h2>
          <p>Registration Reference: <strong>${ref}</strong></p>
          <div style="margin-top:15px;">
            <button onclick="window.location.reload()" style="padding:8px 15px;cursor:pointer;">New</button>
            <button id="pdf-btn" style="padding:8px 15px;cursor:pointer;background:#3498db;color:white;border:none;margin-left:10px;">Download Receipt</button>
          </div>
        </div>`;
    document.body.appendChild(div);
    document.getElementById("pdf-btn").onclick = () => generatePDF(ref);
  }
});

