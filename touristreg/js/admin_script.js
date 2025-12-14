document.addEventListener("DOMContentLoaded", () => {
  // --- GLOBAL VARIABLES ---
  let statusChartInstance = null;
  let nationalityChartInstance = null; // ✅ NEW: For the bar chart
  let currentPage = 1;
  const rowsPerPage = 10;

  // --- CONFIGURATION ---
  const API_BASE_URL = "backend/admin_api.php";

  // --- ELEMENT SELECTION ---
  const tabs = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  // Registration Table Elements
  const enrollmentTableBody = document.getElementById("enrollmentTableBody");
  const filterStatusSelect = document.getElementById("filterStatus");
  const refreshRequestsButton = document.getElementById("refreshRequests");
  const paginationControls = document.getElementById("paginationControls");
  const searchInput = document.getElementById("searchInput"); // ✅ NEW: Search Box

  // Modal Elements
  const detailsModal = document.getElementById("detailsModal");
  const closeModalButton = document.getElementById("closeModal");
  const cancelModalButton = document.getElementById("cancelModalButton");
  const saveStatusButton = document.getElementById("saveStatusButton");

  // Modal Form Inputs
  const modalStatusSelect = document.getElementById("modalStatus");
  const rejectionReasonGroup = document.getElementById("rejectionReasonGroup");
  const modalRejectionReason = document.getElementById("modalRejectionReason");
  const modalRefNo = document.getElementById("modalRefNo");

  // Summary Elements
  const summaryDataContainer = document.getElementById("summaryData");
  const statPending = document.getElementById("statPending");
  const statApproved = document.getElementById("statApproved");
  const statRejected = document.getElementById("statRejected");

  // UI Feedback
  const adminLoadingIndicator = document.getElementById("adminLoadingIndicator");

  // --- INITIALIZATION ---
  if (enrollmentTableBody) {
    fetchRegistrations(1);
  }
  if (summaryDataContainer) {
    fetchSummary();
  }

  // --- TAB NAVIGATION ---
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      tabContents.forEach((c) => c.classList.remove("active-content"));
      const targetId = tab.dataset.tab + "Content";
      document.getElementById(targetId).classList.add("active-content");

      if (tab.dataset.tab === "enrollmentRequests") fetchRegistrations(1);
      if (tab.dataset.tab === "enrollmentSummary") fetchSummary();
    });
  });

  // --- EVENT LISTENERS ---
  if (refreshRequestsButton)
    refreshRequestsButton.addEventListener("click", () => fetchRegistrations(currentPage)); // Trigger search/refresh

  if (filterStatusSelect) filterStatusSelect.addEventListener("change", () => fetchRegistrations(1));

  // ✅ NEW: Trigger search on "Enter" key
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") fetchRegistrations(1);
    });
  }

  if (closeModalButton) closeModalButton.addEventListener("click", closeDetailsModal);
  if (cancelModalButton) cancelModalButton.addEventListener("click", closeDetailsModal);

  if (modalStatusSelect) {
    modalStatusSelect.addEventListener("change", function () {
      if (rejectionReasonGroup) {
        rejectionReasonGroup.classList.toggle("hidden", this.value !== "rejected");
      }
    });
  }

  if (saveStatusButton) {
    saveStatusButton.addEventListener("click", updateStatus);
  }

  // --- CORE FUNCTION 1: FETCH REGISTRATIONS (With Search) ---
  async function fetchRegistrations(page = 1) {
    if (!enrollmentTableBody) return;
    showLoading();
    currentPage = page;

    const status = filterStatusSelect ? filterStatusSelect.value : "all";
    const search = searchInput ? searchInput.value.trim() : ""; // ✅ NEW: Get search text

    try {
      // ✅ UPDATED: Include &search=... in URL
      const response = await fetch(
        `${API_BASE_URL}?action=get_registrations&status=${status}&page=${page}&limit=${rowsPerPage}&search=${encodeURIComponent(
          search
        )}`
      );
      const result = await response.json();

      if (result.success) {
        renderTable(result.data.registrations);
        renderPagination(result.data.total_pages, result.data.current_page);
      } else {
        enrollmentTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">${result.message}</td></tr>`;
      }
    } catch (error) {
      console.error(error);
      enrollmentTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red; padding:20px;">Error loading data.</td></tr>`;
    } finally {
      hideLoading();
    }
  }

  function renderTable(data) {
    enrollmentTableBody.innerHTML = "";
    if (data.length === 0) {
      enrollmentTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">No records found.</td></tr>`;
      return;
    }

    data.forEach((row) => {
      const tr = document.createElement("tr");
      const dateStr = new Date(row.created_at).toLocaleDateString();

      let statusClass = "status-pending";
      if (row.status === "approved") statusClass = "status-approved";
      if (row.status === "rejected") statusClass = "status-rejected";

      tr.innerHTML = `
        <td><strong>${row.reference_number}</strong></td>
        <td>${row.last_name}, ${row.first_name}</td>
        <td>${capitalize(row.registration_type)}</td>
        <td>${row.nationality || "Local"}</td>
        <td>${dateStr}</td>
        <td><span class="${statusClass}">${capitalize(row.status)}</span></td>
        <td>
            <button class="button-secondary view-btn" data-ref="${
              row.reference_number
            }" style="padding:5px 10px; cursor:pointer; margin-right: 5px;">View</button>
            <button class="button-secondary delete-btn" data-ref="${
              row.reference_number
            }" style="padding:5px 10px; cursor:pointer; background-color: #e74c3c; color: white; border: none;">Delete</button>
        </td>
      `;
      enrollmentTableBody.appendChild(tr);
    });

    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => openDetailsModal(e.target.dataset.ref));
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => deleteRegistration(e.target.dataset.ref));
    });
  }

  // --- CORE FUNCTION 2: VIEW DETAILS MODAL ---
  async function openDetailsModal(ref) {
    if (!detailsModal) return;
    showLoading();

    try {
      const response = await fetch(`${API_BASE_URL}?action=get_details&ref=${ref}`);
      const result = await response.json();

      if (result.success) {
        const data = result.data;

        fill("modalRefNo", data.reference_number);
        fill("modalSubmissionDate", new Date(data.created_at).toLocaleString());
        fill("modalEnrollmentType", capitalize(data.registration_type));
        fill("modalNationality", data.nationality || "N/A");

        fill("modalStudentName", `${data.first_name} ${data.middle_name || ""} ${data.last_name}`);
        fill("modalDob", data.dob);
        fill("modalGender", capitalize(data.gender));
        fill("modalReligion", data.religion);

        showIf("modalIndigenousContainer", data.is_indigenous === "yes");
        fill("modalIndigenousGroup", data.indigenous_group);

        fill("modalPassportStatus", capitalize(data.passport_status));
        showIf("modalPassportNumContainer", data.passport_status === "with");
        fill("modalPassportNum", data.passport_number);

        const addr = [data.street_address, data.barangay, data.city, data.province]
          .filter(Boolean)
          .join(", ");
        fill("modalAddress", addr);

        fill("modalEmergencyName", `${data.emergency_first_name} ${data.emergency_last_name}`);
        fill("modalEmergencyRel", data.emergency_relationship);
        fill("modalEmergencyContact", data.emergency_contact);

        fill("modalPurpose", capitalize(data.purpose));
        showIf("modalPackageContainer", data.purpose === "tourism");
        fill("modalPackage", capitalize(data.travel_package));

        const docList = document.getElementById("modalDocumentsList");
        if (docList) {
          docList.innerHTML = "";
          if (data.documents && data.documents.length > 0) {
            data.documents.forEach((doc) => {
              const link = document.createElement("a");
              link.href = `uploads/${doc.file_path}`;
              link.target = "_blank";
              link.textContent = doc.document_type;
              link.style.display = "block";
              link.style.marginBottom = "5px";
              link.style.color = "#3498db";
              docList.appendChild(link);
            });
          } else {
            docList.innerHTML = '<p class="placeholder-text-small">No documents found.</p>';
          }
        }

        if (modalStatusSelect) modalStatusSelect.value = data.status;
        if (modalRejectionReason) modalRejectionReason.value = data.rejection_reason || "";
        if (rejectionReasonGroup) rejectionReasonGroup.classList.toggle("hidden", data.status !== "rejected");

        detailsModal.classList.remove("hidden");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load details.");
    } finally {
      hideLoading();
    }
  }

  // --- CORE FUNCTION 3: UPDATE STATUS ---
  async function updateStatus() {
    const ref = document.getElementById("modalRefNo").textContent;
    const newStatus = modalStatusSelect.value;
    const reason = modalRejectionReason.value;

    if (newStatus === "rejected" && !reason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    if (!confirm(`Are you sure you want to mark this as ${newStatus.toUpperCase()}?`)) return;

    showLoading();
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          ref: ref,
          status: newStatus,
          reason: reason,
        }),
      });
      const result = await response.json();

      if (result.success) {
        alert("Status Updated!");
        closeDetailsModal();
        fetchRegistrations(currentPage);
        fetchSummary();
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Connection Failed.");
    } finally {
      hideLoading();
    }
  }

  // --- CORE FUNCTION 3.5: DELETE REGISTRATION ---
  async function deleteRegistration(ref) {
    if (!confirm("Are you sure you want to PERMANENTLY DELETE this record? This cannot be undone.")) {
      return;
    }

    showLoading();
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_enrollment",
          reference_number: ref,
        }),
      });
      const result = await response.json();

      if (result.success) {
        alert("Record Deleted Successfully.");
        fetchRegistrations(currentPage);
        fetchSummary();
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Delete Failed.");
    } finally {
      hideLoading();
    }
  }

  // --- CORE FUNCTION 4: FETCH SUMMARY & RENDER CHARTS ---
  async function fetchSummary() {
    if (!statPending) return;

    try {
      const response = await fetch(`${API_BASE_URL}?action=get_summary`);
      const result = await response.json();

      if (result.success) {
        const pending = parseInt(result.data.pending_count);
        const approved = parseInt(result.data.approved_count);
        const rejected = parseInt(result.data.rejected_count);

        statPending.textContent = pending;
        statApproved.textContent = approved;
        statRejected.textContent = rejected;

        // Render BOTH charts
        renderStatusChart(pending, approved, rejected);

        // ✅ NEW: Render Nationality Bar Chart
        if (result.data.nationality_labels && result.data.nationality_counts) {
          renderNationalityChart(result.data.nationality_labels, result.data.nationality_counts);
        }
      }
    } catch (error) {
      console.error("Summary load error:", error);
    }
  }

  function renderStatusChart(pending, approved, rejected) {
    const ctx = document.getElementById("statusChart");
    if (!ctx) return;

    if (statusChartInstance) {
      statusChartInstance.destroy();
    }

    statusChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Pending", "Approved", "Rejected"],
        datasets: [
          {
            data: [pending, approved, rejected],
            backgroundColor: ["#f59e0b", "#10b981", "#ef4444"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { family: "'Inter', sans-serif" }, usePointStyle: true },
          },
          title: {
            display: true,
            text: "Application Status",
            font: { family: "'Inter', sans-serif", size: 14 },
          },
        },
        cutout: "70%",
      },
    });
  }

  // ✅ NEW: Function to render the Bar Chart
  function renderNationalityChart(labels, counts) {
    const ctx = document.getElementById("nationalityChart");
    if (!ctx) return;

    if (nationalityChartInstance) {
      nationalityChartInstance.destroy();
    }

    nationalityChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Tourists",
            data: counts,
            backgroundColor: "#2e8a45",
            borderRadius: 4,
            barThickness: 40,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Top Nationalities",
            font: { family: "'Inter', sans-serif", size: 14 },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#f3f4f6" },
            ticks: { stepSize: 1, font: { family: "'Inter', sans-serif" } },
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Inter', sans-serif" } },
          },
        },
      },
    });
  }

  // --- UTILITIES ---
  function closeDetailsModal() {
    if (detailsModal) detailsModal.classList.add("hidden");
  }

  function showLoading() {
    if (adminLoadingIndicator) adminLoadingIndicator.classList.remove("hidden");
  }

  function hideLoading() {
    if (adminLoadingIndicator) adminLoadingIndicator.classList.add("hidden");
  }

  function fill(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || "N/A";
  }

  function showIf(id, condition) {
    const el = document.getElementById(id);
    if (el) condition ? el.classList.remove("hidden") : el.classList.add("hidden");
  }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  }

  function renderPagination(totalPages, current) {
    paginationControls.innerHTML = "";
    if (totalPages <= 1) return;

    if (current > 1) {
      const prev = document.createElement("button");
      prev.textContent = "Prev";
      prev.className = "button-secondary";
      prev.onclick = () => fetchRegistrations(current - 1);
      paginationControls.appendChild(prev);
    }

    const span = document.createElement("span");
    span.textContent = ` Page ${current} of ${totalPages} `;
    span.style.margin = "0 10px";
    paginationControls.appendChild(span);

    if (current < totalPages) {
      const next = document.createElement("button");
      next.textContent = "Next";
      next.className = "button-secondary";
      next.onclick = () => fetchRegistrations(current + 1);
      paginationControls.appendChild(next);
    }
  }
});
