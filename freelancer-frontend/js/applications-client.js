let allApplications = [];
let clientApplications = [];
let clientJobs = [];


// ================= GET LOGGED IN USER =================

function getLoggedInUser() {

    const user =
        localStorage.getItem("loggedInUser");

    if (!user) {

        window.location.href =
            "login.html";

        return null;
    }

    return JSON.parse(user);
}


// ================= LOAD DATA =================

async function loadApplications() {

    const user =
        getLoggedInUser();

    if (!user) {
        return;
    }


    try {

        // ================= GET JOBS =================

        const jobsResponse =
            await fetch(
                "http://localhost:8080/api/jobs"
            );


        if (!jobsResponse.ok) {

            throw new Error(
                "Unable to load jobs"
            );
        }


        const jobs =
            await jobsResponse.json();


        // ================= CLIENT JOBS =================

        clientJobs =
            jobs.filter(
                job =>
                    job.clientEmail &&
                    job.clientEmail.toLowerCase() ===
                    user.email.toLowerCase()
            );


        console.log(
            "Client jobs:",
            clientJobs
        );


        // ================= GET APPLICATIONS =================

        const applicationsResponse =
            await fetch(
                "http://localhost:8080/applications"
            );


        if (!applicationsResponse.ok) {

            throw new Error(
                "Unable to load applications"
            );
        }


        allApplications =
            await applicationsResponse.json();


        console.log(
            "All applications:",
            allApplications
        );


        // ================= CLIENT APPLICATIONS =================

        clientApplications =
            allApplications.filter(
                application =>
                    clientJobs.some(
                        job =>
                            Number(job.id) ===
                            Number(application.jobId)
                    )
            );


        console.log(
            "Client applications:",
            clientApplications
        );


        // ================= UPDATE STATISTICS =================

        updateStatistics();


        // ================= DISPLAY =================

        displayApplications(
            clientApplications
        );


    } catch (error) {

        console.error(
            "Error loading applications:",
            error
        );

        showErrorMessage();
    }
}


// ================= STATISTICS =================

function updateStatistics() {

    const total =
        clientApplications.length;


    const pending =
        clientApplications.filter(
            app =>
                app.status &&
                app.status.toLowerCase() ===
                "pending"
        ).length;


    const accepted =
        clientApplications.filter(
            app =>
                app.status &&
                app.status.toLowerCase() ===
                "accepted"
        ).length;


    const rejected =
        clientApplications.filter(
            app =>
                app.status &&
                app.status.toLowerCase() ===
                "rejected"
        ).length;


    document.getElementById(
        "totalApplications"
    ).textContent = total;


    document.getElementById(
        "pendingApplications"
    ).textContent = pending;


    document.getElementById(
        "acceptedApplications"
    ).textContent = accepted;


    document.getElementById(
        "rejectedApplications"
    ).textContent = rejected;
}


// ================= DISPLAY APPLICATIONS =================

function displayApplications(
    applications
) {

    const container =
        document.getElementById(
            "clientApplicationsContainer"
        );


    if (!container) {

        console.error(
            "clientApplicationsContainer not found!"
        );

        return;
    }


    // ================= EMPTY =================

    if (
        !applications ||
        applications.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-message">

                <div class="empty-icon">
                    📭
                </div>

                <h3>
                    No Applications Found
                </h3>

                <p>
                    There are no freelancer applications
                    matching your search.
                </p>

            </div>

        `;

        return;
    }


    // ================= CREATE CARDS =================

    container.innerHTML =
        applications.map(
            application => {


                const status =
                    application.status ||
                    "Pending";


                const statusLower =
                    status.toLowerCase();


                const statusClass =
                    statusLower === "accepted"
                        ? "status-accepted"
                        : statusLower === "rejected"
                            ? "status-rejected"
                            : "status-pending";


                const job =
                    clientJobs.find(
                        j =>
                            Number(j.id) ===
                            Number(application.jobId)
                    );


                const jobTitle =
                    application.jobTitle ||
                    (
                        job
                            ? job.title
                            : "Unknown Job"
                    );


                const freelancerEmail =
                    application.freelancerEmail ||
                    "Unknown Freelancer";


                return `

                    <div
                        class="application-card"
                        data-status="${escapeHTML(
                            status
                        )}"
                        data-search="${escapeHTML(
                            freelancerEmail +
                            " " +
                            jobTitle
                        ).toLowerCase()}"
                    >


                        <!-- HEADER -->

                        <div class="application-header">

                            <div class="freelancer-info">

                                <div class="freelancer-avatar">
                                    👤
                                </div>

                                <div>

                                    <h3>
                                        Freelancer
                                    </h3>

                                    <div class="applicant-email">
                                        ${escapeHTML(
                                            freelancerEmail
                                        )}
                                    </div>

                                </div>

                            </div>


                            <span
                                class="status ${statusClass}"
                            >
                                ${escapeHTML(status)}
                            </span>

                        </div>


                        <!-- JOB -->

                        <div class="job-section">

                            <h4>
                                ${escapeHTML(
                                    jobTitle
                                )}
                            </h4>


                            <p>
                                Application ID:
                                <strong>
                                    #${application.id}
                                </strong>
                            </p>


                            ${
                                job
                                    ? `

                                        <div class="job-meta">

                                            <span>
                                                💰 Budget:
                                                ₹${escapeHTML(
                                                    String(
                                                        job.budget ||
                                                        "N/A"
                                                    )
                                                )}
                                            </span>

                                            <span>
                                                📅 Job ID:
                                                ${job.id}
                                            </span>

                                        </div>

                                      `
                                    : ""
                            }

                        </div>


                        <!-- ACTIONS -->

                        <div class="application-actions">


                            <!-- VIEW -->

                            <button
                                type="button"
                                class="view-btn"
                                onclick="viewApplication(${Number(
                                    application.id
                                )})"
                            >
                                👁 View
                            </button>


                            <!-- ACCEPT / REJECT -->

                            ${
                                statusLower ===
                                "pending"

                                    ? `

                                        <button
                                            type="button"
                                            class="accept-btn"
                                            onclick="updateApplicationStatus(
                                                ${Number(application.id)},
                                                'Accepted'
                                            )"
                                        >
                                            ✅ Accept
                                        </button>


                                        <button
                                            type="button"
                                            class="reject-btn"
                                            onclick="updateApplicationStatus(
                                                ${Number(application.id)},
                                                'Rejected'
                                            )"
                                        >
                                            ❌ Reject
                                        </button>

                                      `

                                    : ""
                            }


                        </div>

                    </div>

                `;

            }
        ).join("");
}


// =====================================================
// VIEW APPLICATION - MODAL POPUP
// =====================================================

function viewApplication(
    applicationId
) {

    console.log(
        "Opening application:",
        applicationId
    );


    // Find application

    const application =
        clientApplications.find(
            app =>
                Number(app.id) ===
                Number(applicationId)
        );


    if (!application) {

        alert(
            "Application not found."
        );

        return;
    }


    // Find job

    const job =
        clientJobs.find(
            j =>
                Number(j.id) ===
                Number(application.jobId)
        );


    const jobTitle =
        application.jobTitle ||
        (
            job
                ? job.title
                : "Unknown Job"
        );


    const budget =
        job && job.budget
            ? job.budget
            : "N/A";


    const status =
        application.status ||
        "Pending";


    const statusLower =
        status.toLowerCase();


    // ================= FILL MODAL =================

    document.getElementById(
        "modalFreelancer"
    ).textContent =
        "Freelancer";


    document.getElementById(
        "modalFreelancerEmail"
    ).textContent =
        application.freelancerEmail ||
        "Unknown Freelancer";


    document.getElementById(
        "modalApplicationId"
    ).textContent =
        "#" + application.id;


    document.getElementById(
        "modalJobTitle"
    ).textContent =
        jobTitle;


    document.getElementById(
        "modalJobId"
    ).textContent =
        "#" + application.jobId;


    document.getElementById(
        "modalBudget"
    ).textContent =
        "₹" + budget;


    // ================= STATUS =================

    const modalStatus =
        document.getElementById(
            "modalStatus"
        );


    modalStatus.textContent =
        status;


    modalStatus.className =
        "modal-detail-value modal-status " +
        statusLower;


    // ================= MODAL ACTIONS =================

    const modalActions =
        document.getElementById(
            "modalActions"
        );


    if (
        statusLower ===
        "pending"
    ) {

        modalActions.innerHTML = `

            <button
                type="button"
                class="modal-close-action"
                onclick="closeApplicationModal()"
            >
                ✕ Close
            </button>


            <button
                type="button"
                class="modal-accept-action"
                onclick="updateApplicationStatus(
                    ${Number(application.id)},
                    'Accepted',
                    true
                )"
            >
                ✅ Accept
            </button>


            <button
                type="button"
                class="modal-reject-action"
                onclick="updateApplicationStatus(
                    ${Number(application.id)},
                    'Rejected',
                    true
                )"
            >
                ❌ Reject
            </button>

        `;

    } else {

        const statusText =
            statusLower === "accepted"
                ? "🟢 Accepted"
                : "🔴 Rejected";


        modalActions.innerHTML = `

            <div
                style="
                    margin-right:auto;
                    font-weight:600;
                    color:#64748b;
                    display:flex;
                    align-items:center;
                "
            >
                ${statusText}
            </div>


            <button
                type="button"
                class="modal-close-action"
                onclick="closeApplicationModal()"
            >
                ✕ Close
            </button>

        `;
    }


    // ================= OPEN MODAL =================

    const modal =
        document.getElementById(
            "applicationModal"
        );


    modal.classList.add(
        "active"
    );


    // Prevent background scrolling

    document.body.style.overflow =
        "hidden";
}


// =====================================================
// CLOSE APPLICATION MODAL
// =====================================================

function closeApplicationModal() {

    const modal =
        document.getElementById(
            "applicationModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";
}


// =====================================================
// UPDATE STATUS
// =====================================================

async function updateApplicationStatus(
    applicationId,
    newStatus,
    fromModal = false
) {

    const confirmMessage =
        newStatus === "Accepted"

            ? "Are you sure you want to accept this application?"

            : "Are you sure you want to reject this application?";


    if (!confirm(
        confirmMessage
    )) {

        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:8080/applications/${applicationId}/status?status=${encodeURIComponent(
                    newStatus
                )}`,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to update application status"
            );
        }


        alert(
            `Application ${newStatus.toLowerCase()} successfully!`
        );


        // Close modal if opened from modal

        if (fromModal) {

            closeApplicationModal();
        }


        // Reload data

        await loadApplications();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            "Unable to update application status. Please check whether Spring Boot is running."
        );
    }
}


// ================= SEARCH =================

function searchApplications() {

    const searchInput =
        document.getElementById(
            "applicationSearch"
        );


    const searchText =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filtered =
        clientApplications.filter(
            application => {


                const job =
                    clientJobs.find(
                        j =>
                            Number(j.id) ===
                            Number(application.jobId)
                    );


                const jobTitle =
                    application.jobTitle ||
                    (
                        job
                            ? job.title
                            : ""
                    );


                const freelancer =
                    application.freelancerEmail ||
                    "";


                return (

                    freelancer
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    jobTitle
                        .toLowerCase()
                        .includes(searchText)

                );

            }
        );


    applyStatusFilter(
        filtered
    );
}


// ================= STATUS FILTER =================

function filterApplications() {

    searchApplications();
}


// ================= APPLY STATUS FILTER =================

function applyStatusFilter(
    applications
) {

    const filter =
        document.getElementById(
            "statusFilter"
        );


    const selectedStatus =
        filter
            ? filter.value
            : "ALL";


    let filtered =
        applications;


    if (
        selectedStatus !==
        "ALL"
    ) {

        filtered =
            applications.filter(
                application => {

                    const status =
                        application.status ||
                        "Pending";


                    return (
                        status.toLowerCase() ===
                        selectedStatus.toLowerCase()
                    );

                }
            );
    }


    displayApplications(
        filtered
    );
}


// ================= HTML ESCAPE =================

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


// ================= ERROR =================

function showErrorMessage() {

    const container =
        document.getElementById(
            "clientApplicationsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-message">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Unable to Load Applications
            </h3>

            <p>
                Please make sure Spring Boot is running.
            </p>

        </div>

    `;
}


// ================= EVENT LISTENERS =================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        const searchInput =
            document.getElementById(
                "applicationSearch"
            );


        const statusFilter =
            document.getElementById(
                "statusFilter"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                searchApplications
            );

        }


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                searchApplications
            );

        }


        loadApplications();

    }
);