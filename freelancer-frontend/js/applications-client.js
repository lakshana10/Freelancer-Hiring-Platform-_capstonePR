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
                "https://freelancer-backend-9cw6.onrender.com/api/jobs"
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
                "https://freelancer-backend-9cw6.onrender.com/applications"
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
// CONFIRMATION POPUP
// =====================================================

function showConfirmationPopup(
    action
) {

    return new Promise(
        (resolve) => {

            const isAccept =
                action.toLowerCase() ===
                "accepted";


            const popup =
                document.createElement("div");


            popup.setAttribute(
                "data-confirm-popup",
                "true"
            );


            popup.innerHTML = `

                <div style="
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.45);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                ">

                    <div style="
                        width: 390px;
                        max-width: 90%;
                        background: white;
                        border-radius: 18px;
                        padding: 32px;
                        text-align: center;
                        box-shadow: 0 20px 50px rgba(0,0,0,0.20);
                        animation: popupScale 0.25s ease;
                    ">

                        <div style="
                            width: 64px;
                            height: 64px;
                            margin: 0 auto 18px;
                            border-radius: 50%;
                            background: ${
                                isAccept
                                    ? "#e8f8ef"
                                    : "#feecec"
                            };
                            color: ${
                                isAccept
                                    ? "#16a34a"
                                    : "#dc2626"
                            };
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 30px;
                            font-weight: bold;
                        ">
                            ${
                                isAccept
                                    ? "✓"
                                    : "!"
                            }
                        </div>


                        <h2 style="
                            margin: 0 0 10px;
                            color: #111827;
                            font-size: 22px;
                        ">
                            ${
                                isAccept
                                    ? "Accept Application?"
                                    : "Reject Application?"
                            }
                        </h2>


                        <p style="
                            margin: 0;
                            color: #64748b;
                            font-size: 15px;
                            line-height: 1.6;
                        ">
                            ${
                                isAccept
                                    ? "Are you sure you want to accept this application?"
                                    : "Are you sure you want to reject this application?"
                            }
                        </p>


                        <div style="
                            display: flex;
                            justify-content: center;
                            gap: 12px;
                            margin-top: 25px;
                        ">

                            <button
                                type="button"
                                data-cancel-button
                                style="
                                    border: 1px solid #d1d5db;
                                    background: white;
                                    color: #374151;
                                    padding: 11px 24px;
                                    border-radius: 9px;
                                    font-size: 14px;
                                    font-weight: 600;
                                    cursor: pointer;
                                "
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                data-confirm-button
                                style="
                                    border: none;
                                    background: ${
                                        isAccept
                                            ? "#1f4ed8"
                                            : "#dc2626"
                                    };
                                    color: white;
                                    padding: 11px 24px;
                                    border-radius: 9px;
                                    font-size: 14px;
                                    font-weight: 600;
                                    cursor: pointer;
                                "
                            >
                                ${
                                    isAccept
                                        ? "Accept"
                                        : "Reject"
                                }
                            </button>

                        </div>

                    </div>

                </div>


                <style>

                    @keyframes popupScale {

                        from {
                            opacity: 0;
                            transform: scale(0.9);
                        }

                        to {
                            opacity: 1;
                            transform: scale(1);
                        }

                    }

                </style>

            `;


            document.body.appendChild(
                popup
            );


            // ================= CANCEL =================

            popup
                .querySelector(
                    "[data-cancel-button]"
                )
                .addEventListener(
                    "click",
                    function () {

                        popup.remove();

                        resolve(false);

                    }
                );


            // ================= CONFIRM =================

            popup
                .querySelector(
                    "[data-confirm-button]"
                )
                .addEventListener(
                    "click",
                    function () {

                        popup.remove();

                        resolve(true);

                    }
                );

        }
    );
}


// =====================================================
// SUCCESS POPUP
// =====================================================

function showContractSuccessPopup() {

    const popup =
        document.createElement("div");


    popup.setAttribute(
        "data-success-popup",
        "true"
    );


    popup.innerHTML = `

        <div style="
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        ">

            <div style="
                width: 390px;
                max-width: 90%;
                background: white;
                border-radius: 18px;
                padding: 32px;
                text-align: center;
                box-shadow: 0 20px 50px rgba(0,0,0,0.20);
                animation: popupScale 0.25s ease;
            ">

                <div style="
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 18px;
                    border-radius: 50%;
                    background: #e8f8ef;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 34px;
                    font-weight: bold;
                ">
                    ✓
                </div>


                <h2 style="
                    margin: 0 0 10px;
                    color: #111827;
                    font-size: 23px;
                ">
                    Application Accepted
                </h2>


                <p style="
                    margin: 0;
                    color: #64748b;
                    font-size: 15px;
                    line-height: 1.6;
                ">
                    The application has been accepted
                    and the contract has been created successfully.
                </p>


                <button
                    type="button"
                    onclick="closeContractSuccessPopup()"
                    style="
                        margin-top: 24px;
                        border: none;
                        padding: 11px 28px;
                        border-radius: 9px;
                        background: #1f4ed8;
                        color: white;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    "
                >
                    Done
                </button>

            </div>

        </div>


        <style>

            @keyframes popupScale {

                from {
                    opacity: 0;
                    transform: scale(0.9);
                }

                to {
                    opacity: 1;
                    transform: scale(1);
                }

            }

        </style>

    `;


    document.body.appendChild(
        popup
    );
}


// =====================================================
// CLOSE SUCCESS POPUP
// =====================================================

function closeContractSuccessPopup() {

    const popup =
        document.querySelector(
            "[data-success-popup]"
        );


    if (popup) {

        popup.remove();
    }
}


// =====================================================
// CREATE CONTRACT AFTER ACCEPTING APPLICATION
// =====================================================

async function createContractFromApplication(
    applicationId
) {

    const user =
        getLoggedInUser();


    if (!user) {
        return false;
    }


    const application =
        clientApplications.find(
            app =>
                Number(app.id) ===
                Number(applicationId)
        );


    if (!application) {

        throw new Error(
            "Application not found."
        );
    }


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


    // ================= CHECK EXISTING CONTRACT =================

    const existingResponse =
        await fetch(
            `http://localhost:8080/api/contracts/client/${encodeURIComponent(
                user.email
            )}`
        );


    if (!existingResponse.ok) {

        throw new Error(
            "Unable to check existing contracts."
        );
    }


    const existingContracts =
        await existingResponse.json();


    const alreadyExists =
        existingContracts.some(
            contract =>

                Number(contract.jobId) ===
                    Number(application.jobId)

                &&

                contract.freelancerEmail &&

                contract.freelancerEmail
                    .toLowerCase() ===
                    application.freelancerEmail
                        .toLowerCase()
        );


    if (alreadyExists) {

        console.log(
            "Contract already exists for this application."
        );

        return true;
    }


    // ================= CREATE CONTRACT =================

    const contract = {

        jobId:
            Number(application.jobId),

        jobTitle:
            jobTitle,

        clientEmail:
            user.email,

        freelancerEmail:
            application.freelancerEmail,

        status:
            "ACTIVE"
    };


    const response =
        await fetch(
            "http://localhost:8080/api/contracts",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(contract)
            }
        );


    if (!response.ok) {

        throw new Error(
            "Unable to create contract."
        );
    }


    const createdContract =
        await response.json();


    console.log(
        "Contract created:",
        createdContract
    );


    return true;
}


// =====================================================
// UPDATE STATUS
// =====================================================

async function updateApplicationStatus(
    applicationId,
    newStatus,
    fromModal = false
) {

    // ================= CONFIRMATION POPUP =================

    const confirmed =
        await showConfirmationPopup(
            newStatus
        );


    if (!confirmed) {

        return;
    }


    try {

        // ================= UPDATE APPLICATION STATUS =================

        const response =
            await fetch(
                `https://freelancer-backend-9cw6.onrender.com/applications/${applicationId}/status?status=${encodeURIComponent(
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


        // ================= CREATE CONTRACT =================

        if (
            newStatus.toLowerCase() ===
            "accepted"
        ) {

            try {

                await createContractFromApplication(
                    applicationId
                );

            } catch (contractError) {

                console.error(
                    "Contract creation error:",
                    contractError
                );


                if (fromModal) {

                    closeApplicationModal();
                }


                await loadApplications();


                alert(
                    "Application accepted, but the contract could not be created. Please check whether Spring Boot is running."
                );

                return;
            }
        }


        // ================= SUCCESS =================

        if (
            newStatus.toLowerCase() ===
            "accepted"
        ) {

            showContractSuccessPopup();

        } else {

            alert(
                `Application ${newStatus.toLowerCase()} successfully!`
            );
        }


        // ================= CLOSE MODAL =================

        if (fromModal) {

            closeApplicationModal();
        }


        // ================= RELOAD DATA =================

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
