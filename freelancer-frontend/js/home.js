// ================= SEARCH JOBS =================

function searchWork() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) {
        return;
    }

    const search =
        searchInput.value.trim();

    if (search === "") {

        alert("Please enter a job or skill to search.");

        searchInput.focus();

        return;
    }

    window.location.href =
        "jobs.html?search=" +
        encodeURIComponent(search);
}


// ================= LOGIN =================

function login() {

    window.location.href =
        "login.html";

}


// ================= SIGN UP =================

function signup() {

    window.location.href =
        "signup.html";

}


// ================= DARK MODE =================

const themeBtn =
    document.getElementById("themeBtn");

if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        function() {

            document.body.classList.toggle("dark");

            if (
                document.body.classList.contains("dark")
            ) {

                themeBtn.innerHTML = "☀";

            } else {

                themeBtn.innerHTML = "☾";

            }

        }
    );

}


// ================= CATEGORY CLICK =================

const categoryLinks =
    document.querySelectorAll(
        ".category-card a"
    );

categoryLinks.forEach(
    function(link) {

        link.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                const categoryCard =
                    this.closest(".category-card");

                if (!categoryCard) {
                    return;
                }

                const heading =
                    categoryCard.querySelector("h3");

                if (!heading) {
                    return;
                }

                const category =
                    heading.innerText.trim();

                window.location.href =
                    "jobs.html?category=" +
                    encodeURIComponent(category);

            }
        );

    }
);


// ================= SEARCH WITH ENTER KEY =================

const searchInput =
    document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                searchWork();

            }

        }
    );

}


// ================= LOAD LATEST JOBS =================

async function loadLatestJobs() {

    const homeJobs =
        document.getElementById("homeJobs");

    if (!homeJobs) {
        return;
    }

    try {

        const response =
            await fetch(
                "https://freelancer-backend-9cw6.onrender.com/api/jobs"
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load jobs"
            );

        }

        const jobs =
            await response.json();

        console.log(
            "Latest jobs:",
            jobs
        );


        homeJobs.innerHTML = "";


        // ================= NO JOBS =================

        if (
            !jobs ||
            jobs.length === 0
        ) {

            homeJobs.innerHTML = `
                <p>
                    No jobs available right now.
                </p>
            `;

            return;
        }


        // ================= LATEST 6 JOBS =================

        const latestJobs =
            jobs.slice(-6).reverse();


        latestJobs.forEach(
            function(job) {

                const card =
                    document.createElement("div");

                card.className =
                    "job-card";


                // ================= TITLE =================

                const title =
                    document.createElement("h3");

                title.textContent =
                    job.title ||
                    "Untitled Job";


                // ================= DESCRIPTION =================

                const description =
                    document.createElement("p");

                description.textContent =
                    job.description ||
                    "No description available.";


                // ================= JOB INFORMATION =================

                const jobInfo =
                    document.createElement("div");

                jobInfo.className =
                    "job-info";


                // ================= BUDGET =================

                const budget =
                    document.createElement("span");

                budget.className =
                    "job-budget";

                budget.textContent =
                    "₹ " +
                    (
                        job.budget ||
                        "Not specified"
                    );


                // ================= JOB TYPE =================

                const jobType =
                    document.createElement("span");

                jobType.className =
                    "job-type";

                jobType.textContent =
                    "Project";


                jobInfo.appendChild(
                    budget
                );

                jobInfo.appendChild(
                    jobType
                );


                // ================= SKILLS =================

                const skillsContainer =
                    document.createElement("div");

                skillsContainer.className =
                    "job-skills";


                if (job.skills) {

                    const skills =
                        job.skills
                            .split(",")
                            .map(
                                function(skill) {

                                    return skill.trim();

                                }
                            )
                            .filter(
                                function(skill) {

                                    return skill !== "";

                                }
                            );


                    skills
                        .slice(0, 4)
                        .forEach(
                            function(skill) {

                                const skillTag =
                                    document.createElement(
                                        "span"
                                    );

                                skillTag.textContent =
                                    skill;

                                skillsContainer.appendChild(
                                    skillTag
                                );

                            }
                        );

                }


                // ================= VIEW JOB BUTTON =================

                const viewButton =
                    document.createElement("button");

                viewButton.className =
                    "view-job-btn";

                viewButton.textContent =
                    "View Job →";


                viewButton.addEventListener(
                    "click",
                    function() {

                        /*
                         * Open the selected job
                         * using its database ID.
                         */

                        window.location.href =
                            "jobs.html?jobId=" +
                            job.id;

                    }
                );


                // ================= ADD TO CARD =================

                card.appendChild(
                    title
                );

                card.appendChild(
                    description
                );

                card.appendChild(
                    jobInfo
                );

                card.appendChild(
                    skillsContainer
                );

                card.appendChild(
                    viewButton
                );


                homeJobs.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Error loading latest jobs:",
            error
        );


        homeJobs.innerHTML = `
            <p>
                Unable to load latest jobs.
                Please make sure Spring Boot is running.
            </p>
        `;

    }

}


// ================= START LATEST JOBS =================

loadLatestJobs();


// =========================================
// LOGGED-IN USER
// =========================================

function updateUserSection() {

    const userSection =
        document.getElementById("userSection");

    if (!userSection) {
        return;
    }


    const storedUser =
        localStorage.getItem("loggedInUser");


    if (!storedUser) {
        return;
    }


    let user;


    try {

        user =
            JSON.parse(storedUser);

    } catch (error) {

        console.error(
            "Invalid logged-in user data:",
            error
        );

        localStorage.removeItem(
            "loggedInUser"
        );

        return;
    }


    const role =
        user.role === "CLIENT"
            ? "Client"
            : "Freelancer";


    userSection.innerHTML = `

        <div class="user-profile">

            <div class="user-avatar">
                👤
            </div>

            <div class="user-details">

                <span class="user-name">
                    ${user.name || "User"}
                </span>

                <span class="user-role">
                    ${role}
                </span>

            </div>

            <button
                class="logout-btn"
                onclick="logoutUser()">

                Logout

            </button>

        </div>

    `;

}


// =========================================
// LOGOUT
// =========================================

function logoutUser() {

    localStorage.removeItem(
        "loggedInUser"
    );


    alert(
        "You have been logged out successfully."
    );


    window.location.href =
        "home.html";

}


// =========================================
// UPDATE USER SECTION
// =========================================

updateUserSection();
