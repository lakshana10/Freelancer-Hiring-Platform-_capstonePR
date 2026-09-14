const container = document.getElementById("clientApplicationsContainer");

const userEmail = localStorage.getItem("userEmail");

const params = new URLSearchParams(window.location.search);
const jobId = params.get("jobId");


async function loadApplications() {

    if (!userEmail) {
        window.location.href = "login.html";
        return;
    }

    if (!jobId) {
        container.innerHTML =
            "<p>Job not selected.</p>";
        return;
    }

    try {

        const jobsResponse = await fetch(
            "http://localhost:8080/api/jobs"
        );

        if (!jobsResponse.ok) {
            throw new Error("Failed to load jobs");
        }

        const jobs = await jobsResponse.json();

        const job = jobs.find(
            j => String(j.id) === String(jobId)
        );

        if (!job || job.clientEmail !== userEmail) {

            container.innerHTML = `
                <div class="no-applications">
                    <h2>Access Denied</h2>
                    <p>You are not authorized to view these applications.</p>
                </div>
            `;

            return;
        }


        const applicationsResponse = await fetch(
            "http://localhost:8080/applications"
        );

        if (!applicationsResponse.ok) {
            throw new Error("Failed to load applications");
        }

        const applications =
            await applicationsResponse.json();


        const jobApplications =
            applications.filter(
                application =>
                    String(application.jobId) === String(jobId)
            );


        const usersResponse = await fetch(
            "http://localhost:8080/api/users"
        );

        if (!usersResponse.ok) {
            throw new Error("Failed to load freelancers");
        }

        const users = await usersResponse.json();


        const enrichedApplications =
            jobApplications.map(application => {

                const freelancer = users.find(
                    user =>
                        user.email ===
                        application.freelancerEmail
                );

                return {
                    ...application,
                    freelancer: freelancer
                };
            });


        displayApplications(enrichedApplications);


    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="no-applications">
                <h2>Unable to Load Applications</h2>
                <p>Please make sure the backend is running.</p>
            </div>
        `;
    }
}


function displayApplications(applications) {

    if (applications.length === 0) {

        container.innerHTML = `
            <div class="no-applications">
                <h2>No Applications Yet</h2>
                <p>No freelancer has applied for this job.</p>
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    applications.forEach(application => {

        const freelancer =
            application.freelancer;


        const card =
            document.createElement("div");


        card.className =
            "client-application-card";


        card.innerHTML = `

            <div class="application-profile">

                <div class="application-avatar">
                    ✣
                </div>

                <div>
                    <h2>
                        ${freelancer
                            ? freelancer.name
                            : application.freelancerEmail}
                    </h2>

                    <p class="application-email">
                        ${application.freelancerEmail}
                    </p>
                </div>

            </div>


            <div class="application-details">

                <div>
                    <strong>Skills</strong>

                    <p>
                        ${freelancer?.skills || "Not added"}
                    </p>
                </div>


                <div>
                    <strong>Experience</strong>

                    <p>
                        ${freelancer?.experience || "Not added"}
                    </p>
                </div>


                <div>
                    <strong>About</strong>

                    <p>
                        ${freelancer?.bio || "No bio available"}
                    </p>
                </div>


                <div>
                    <strong>Job</strong>

                    <p>
                        ${application.jobTitle}
                    </p>
                </div>


                <div>
                    <strong>Application ID</strong>

                    <p>
                        #${application.id}
                    </p>
                </div>


                <div>
                    <strong>Status</strong>

                    <p class="application-status">
                        ${application.status}
                    </p>
                </div>

            </div>


            <div class="application-actions">

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

            </div>
        `;


        container.appendChild(card);

    });
}


async function updateStatus(id, status) {

    try {

        const response = await fetch(
            `http://localhost:8080/applications/${id}/status?status=${status}`,
            {
                method: "PUT"
            }
        );


        if (!response.ok) {
            throw new Error(
                "Failed to update status"
            );
        }


        loadApplications();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to update application status."
        );
    }
}


loadApplications();