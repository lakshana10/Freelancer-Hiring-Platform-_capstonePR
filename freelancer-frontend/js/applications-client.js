const container =
    document.getElementById("clientApplicationsContainer");

const userEmail =
    localStorage.getItem("userEmail");

const params =
    new URLSearchParams(window.location.search);

const jobId =
    params.get("jobId");


// =========================================
// LOAD APPLICATIONS
// =========================================

async function loadApplications() {

    if (!userEmail) {

        window.location.href =
            "login.html";

        return;
    }


    if (!jobId) {

        container.innerHTML =
            "<p>Job not selected.</p>";

        return;
    }


    try {

        // =========================================
        // GET JOBS
        // =========================================

        const jobsResponse =
            await fetch(
                "http://localhost:8080/api/jobs"
            );


        if (!jobsResponse.ok) {

            throw new Error(
                "Failed to load jobs"
            );

        }


        const jobs =
            await jobsResponse.json();


        const job =
            jobs.find(
                j =>
                    String(j.id) ===
                    String(jobId)
            );


        // =========================================
        // CHECK CLIENT OWNERSHIP
        // =========================================

        if (
            !job ||
            job.clientEmail !== userEmail
        ) {

            container.innerHTML = `

                <div class="no-applications">

                    <h2>
                        Access Denied
                    </h2>

                    <p>
                        You are not authorized
                        to view these applications.
                    </p>

                </div>

            `;

            return;
        }


        // =========================================
        // GET APPLICATIONS
        // =========================================

        const applicationsResponse =
            await fetch(
                "http://localhost:8080/applications"
            );


        if (!applicationsResponse.ok) {

            throw new Error(
                "Failed to load applications"
            );

        }


        const applications =
            await applicationsResponse.json();


        const jobApplications =
            applications.filter(
                application =>
                    String(application.jobId) ===
                    String(jobId)
            );


        // =========================================
        // GET FREELANCERS
        // =========================================

        const usersResponse =
            await fetch(
                "http://localhost:8080/api/users"
            );


        if (!usersResponse.ok) {

            throw new Error(
                "Failed to load freelancers"
            );

        }


        const users =
            await usersResponse.json();


        // =========================================
        // ADD FREELANCER DETAILS
        // =========================================

        const enrichedApplications =
            jobApplications.map(
                application => {

                    const freelancer =
                        users.find(
                            user =>
                                user.email ===
                                application.freelancerEmail
                        );


                    return {
                        ...application,
                        freelancer:
                            freelancer
                    };

                }
            );


        displayApplications(
            enrichedApplications
        );


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="no-applications">

                <h2>
                    Unable to Load Applications
                </h2>

                <p>
                    Please make sure the backend
                    is running.
                </p>

                <button
                    class="jobs-btn"
                    onclick="loadApplications()">

                    Try Again

                </button>

            </div>

        `;

    }

}


// =========================================
// DISPLAY APPLICATIONS
// =========================================

function displayApplications(
    applications
) {

    if (applications.length === 0) {

        container.innerHTML = `

            <div class="no-applications">

                <h2>
                    No Applications Yet
                </h2>

                <p>
                    No freelancer has applied
                    for this job.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    applications.forEach(
        application => {

            const freelancer =
                application.freelancer;


            const card =
                document.createElement("div");


            card.className =
                "client-application-card";


            const freelancerName =
                freelancer
                    ? freelancer.name
                    : application.freelancerEmail;


            const skills =
                freelancer?.skills ||
                "Not added";


            const experience =
                freelancer?.experience ||
                "Not added";


            const bio =
                freelancer?.bio ||
                "No bio available";


            const jobTitle =
                application.jobTitle ||
                "Untitled Job";


            const status =
                application.status ||
                "Pending";


            card.innerHTML = `

                <div class="application-profile">

                    <div class="application-avatar">
                        ✣
                    </div>

                    <div>

                        <h2>
                            ${escapeHTML(
                                freelancerName
                            )}
                        </h2>

                        <p class="application-email">
                            ${escapeHTML(
                                application.freelancerEmail
                            )}
                        </p>

                    </div>

                </div>


                <div class="application-details">

                    <div>

                        <strong>
                            Skills
                        </strong>

                        <p>
                            ${escapeHTML(
                                skills
                            )}
                        </p>

                    </div>


                    <div>

                        <strong>
                            Experience
                        </strong>

                        <p>
                            ${escapeHTML(
                                experience
                            )}
                        </p>

                    </div>


                    <div>

                        <strong>
                            About
                        </strong>

                        <p>
                            ${escapeHTML(
                                bio
                            )}
                        </p>

                    </div>


                    <div>

                        <strong>
                            Job
                        </strong>

                        <p>
                            ${escapeHTML(
                                jobTitle
                            )}
                        </p>

                    </div>


                    <div>

                        <strong>
                            Application ID
                        </strong>

                        <p>
                            #${application.id}
                        </p>

                    </div>


                    <div>

                        <strong>
                            Status
                        </strong>

                        <p class="application-status">

                            ${escapeHTML(
                                status
                            )}

                        </p>

                    </div>

                </div>


                <div class="application-actions">

                    ${
                        status === "Pending"
                        ? `

                            <button
                                onclick="updateStatus(
                                    ${application.id},
                                    'Accepted'
                                )">

                                ✓ Accept

                            </button>


                            <button
                                onclick="updateStatus(
                                    ${application.id},
                                    'Rejected'
                                )">

                                ✕ Reject

                            </button>

                        `
                        : `

                            <span>
                                Application ${escapeHTML(status)}
                            </span>

                        `
                    }

                </div>

            `;


            container.appendChild(card);

        }
    );

}


// =========================================
// UPDATE APPLICATION STATUS
// =========================================

async function updateStatus(
    id,
    status
) {

    try {

        // =========================================
        // UPDATE APPLICATION
        // =========================================

        const response =
            await fetch(
                `http://localhost:8080/applications/${id}/status?status=${encodeURIComponent(status)}`,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to update application status"
            );

        }


        // =========================================
        // ACCEPT → CREATE CONTRACT
        // =========================================

        if (status === "Accepted") {

            const applicationsResponse =
                await fetch(
                    "http://localhost:8080/applications"
                );


            if (!applicationsResponse.ok) {

                throw new Error(
                    "Failed to get applications"
                );

            }


            const applications =
                await applicationsResponse.json();


            const application =
                applications.find(
                    app =>
                        String(app.id) ===
                        String(id)
                );


            if (!application) {

                throw new Error(
                    "Application not found"
                );

            }


            // =========================================
            // CHECK EXISTING CONTRACT
            // =========================================

            const existingContractsResponse =
                await fetch(
                    `http://localhost:8080/api/contracts/client/${encodeURIComponent(userEmail)}`
                );


            if (
                existingContractsResponse.ok
            ) {

                const existingContracts =
                    await existingContractsResponse.json();


                const alreadyExists =
                    existingContracts.some(
                        contract =>
                            String(contract.jobId) ===
                            String(application.jobId) &&
                            contract.freelancerEmail ===
                            application.freelancerEmail
                    );


                if (alreadyExists) {

                    alert(
                        "A contract already exists for this freelancer and job."
                    );

                    loadApplications();

                    return;
                }

            }


            // =========================================
            // CREATE CONTRACT
            // =========================================

            const contract = {

                jobId:
                    application.jobId,

                jobTitle:
                    application.jobTitle,

                clientEmail:
                    userEmail,

                freelancerEmail:
                    application.freelancerEmail,

                status:
                    "ACTIVE"

            };


            const contractResponse =
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


            if (!contractResponse.ok) {

                throw new Error(
                    "Failed to create contract"
                );

            }


            alert(
                "Freelancer accepted and contract created successfully!"
            );


        } else {

            alert(
                "Application rejected."
            );

        }


        // =========================================
        // REFRESH
        // =========================================

        loadApplications();


    } catch (error) {

        console.error(error);


        alert(
            "Unable to update application status."
        );

    }

}


// =========================================
// SAFE HTML
// =========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// =========================================
// START
// =========================================

loadApplications();