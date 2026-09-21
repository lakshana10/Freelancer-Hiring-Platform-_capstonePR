let allJobs = [];
let selectedJobId = null;


/* =====================================================
   LOAD JOBS FROM DATABASE
===================================================== */

async function loadJobs() {

    try {

        const response =
            await fetch("https://freelancer-backend-9cw6.onrender.com/api/jobs");

        if (!response.ok) {
            throw new Error("Failed to fetch jobs");
        }

        allJobs = await response.json();

        console.log(
            "Jobs from database:",
            allJobs
        );

        applyHomeFilters();

    } catch (error) {

        console.error(
            "Error loading jobs:",
            error
        );

        const jobList =
            document.getElementById("jobList");

        if (jobList) {

            jobList.innerHTML = `
                <div class="job-card">
                    <h3>Unable to load jobs</h3>
                    <p>
                        Please make sure the backend is running.
                    </p>
                </div>
            `;

        }

    }

}


/* =====================================================
   APPLY HOME SEARCH / CATEGORY / SELECTED JOB
===================================================== */

function applyHomeFilters() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const search =
        params.get("search");

    const category =
        params.get("category");

    selectedJobId =
        params.get("jobId");

    let filteredJobs =
        [...allJobs];


    /* ================= SELECTED JOB ================= */

    if (selectedJobId) {

        filteredJobs =
            filteredJobs.filter(
                function(job) {

                    return String(job.id) ===
                        String(selectedJobId);

                }
            );

    }


    /* ================= SEARCH ================= */

    if (search) {

        const searchText =
            search
                .toLowerCase()
                .trim();


        filteredJobs =
            filteredJobs.filter(
                function(job) {

                    const jobText =
                        (
                            (job.title || "") +
                            " " +
                            (job.description || "") +
                            " " +
                            (job.skills || "")
                        ).toLowerCase();


                    return jobText.includes(
                        searchText
                    );

                }
            );

    }


    /* ================= CATEGORY ================= */

    if (category) {

        const categoryText =
            category
                .toLowerCase()
                .trim();


        const categoryKeywords = {

            "web development": [
                "html",
                "css",
                "javascript",
                "react",
                "web"
            ],

            "ui/ux design": [
                "ui",
                "ux",
                "figma",
                "design"
            ],

            "mobile development": [
                "android",
                "mobile",
                "flutter",
                "firebase",
                "app"
            ],

            "content writing": [
                "content",
                "writing",
                "writer",
                "blog"
            ],

            "digital marketing": [
                "marketing",
                "seo",
                "social media"
            ],

            "video editing": [
                "video",
                "editing",
                "editor"
            ]

        };


        const keywords =
            categoryKeywords[categoryText]
            || [categoryText];


        filteredJobs =
            filteredJobs.filter(
                function(job) {

                    const jobText =
                        (
                            (job.title || "") +
                            " " +
                            (job.description || "") +
                            " " +
                            (job.skills || "")
                        ).toLowerCase();


                    return keywords.some(
                        function(keyword) {

                            return jobText.includes(
                                keyword
                            );

                        }
                    );

                }
            );

    }


    displayJobs(
        filteredJobs
    );


    /* ================= SHOW SEARCH VALUE ================= */

    const jobSearch =
        document.getElementById(
            "jobSearch"
        );


    if (
        jobSearch &&
        search
    ) {

        jobSearch.value =
            search;

    }

}


/* =====================================================
   SEARCH JOBS
===================================================== */

function searchJobs() {

    const keywordElement =
        document.getElementById(
            "jobSearch"
        );


    const locationElement =
        document.getElementById(
            "locationSearch"
        );


    const keyword =
        keywordElement
            ? keywordElement.value
                .trim()
                .toLowerCase()
            : "";


    const location =
        locationElement
            ? locationElement.value
                .trim()
                .toLowerCase()
            : "";


    if (
        keyword === "" &&
        location === ""
    ) {

        displayJobs(
            allJobs
        );

        return;

    }


    const filteredJobs =
        allJobs.filter(
            function(job) {

                const jobText =
                    (
                        (job.title || "") +
                        " " +
                        (job.description || "") +
                        " " +
                        (job.skills || "")
                    ).toLowerCase();


                return (

                    (
                        keyword === "" ||
                        jobText.includes(
                            keyword
                        )
                    )

                    &&

                    (
                        location === "" ||
                        jobText.includes(
                            location
                        )
                    )

                );

            }
        );


    displayJobs(
        filteredJobs
    );

}


/* =====================================================
   DISPLAY JOBS
===================================================== */

function displayJobs(jobs) {

    const jobList =
        document.getElementById(
            "jobList"
        );


    if (!jobList) {
        return;
    }


    jobList.innerHTML = "";


    if (
        !jobs ||
        jobs.length === 0
    ) {

        jobList.innerHTML = `

            <div class="job-card">

                <h3>
                    No jobs found
                </h3>

                <p>
                    Try another keyword or location.
                </p>

            </div>

        `;

        return;

    }


    jobs.forEach(
        function(job) {

            const jobCard =
                document.createElement(
                    "article"
                );


            jobCard.className =
                "job-card";


            const jobTitle =
                String(
                    job.title ||
                    "Untitled Job"
                );


            const jobDescription =
                String(
                    job.description ||
                    "No description available."
                );


            const clientEmail =
                String(
                    job.clientEmail ||
                    "N/A"
                );


            const budget =
                Number(
                    job.budget || 0
                ).toLocaleString(
                    "en-IN"
                );


            jobCard.innerHTML = `

                <div class="job-top">

                    <div class="company-logo">

                        ${jobTitle
                            .charAt(0)
                            .toUpperCase()}

                    </div>


                    <div class="job-title">

                        <span class="job-type">
                            AVAILABLE
                        </span>


                        <h3>
                            ${jobTitle}
                        </h3>


                        <p>
                            Web Development • Available Now
                        </p>

                    </div>


                    <button
                        type="button"
                        class="save-job">

                        ♡

                    </button>

                </div>


                <p class="job-description">

                    ${jobDescription}

                </p>


                <div class="skills">

                    ${createSkills(
                        job.skills
                    )}

                </div>


                <div class="job-bottom">


                    <div class="budget">

                        <strong>
                            ₹${budget}
                        </strong>


                        <span>
                            Fixed Price
                        </span>

                    </div>


                    <div class="applications">

                        Client:
                        ${clientEmail}

                    </div>


                    <button
                        type="button"
                        class="apply-btn">

                        Apply Now →

                    </button>


                </div>

            `;


            jobList.appendChild(
                jobCard
            );


            /* =================================================
               APPLY BUTTON
            ================================================= */

            const applyButton =
                jobCard.querySelector(
                    ".apply-btn"
                );


            if (applyButton) {

                applyButton.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        event.stopPropagation();


                        console.log(
                            "Apply clicked:",
                            job.id,
                            jobTitle
                        );


                        applyJob(
                            job.id,
                            jobTitle
                        );

                    }
                );

            }


            /* =================================================
               SAVE BUTTON
            ================================================= */

            const saveButton =
                jobCard.querySelector(
                    ".save-job"
                );


            if (saveButton) {

                saveButton.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        event.stopPropagation();


                        if (
                            saveButton
                                .textContent
                                .trim()
                            === "♡"
                        ) {

                            saveButton.textContent =
                                "♥";


                            saveButton.style.color =
                                "#6845e8";

                        }

                        else {

                            saveButton.textContent =
                                "♡";


                            saveButton.style.color =
                                "#888";

                        }

                    }
                );

            }

        }
    );

}


/* =====================================================
   CREATE SKILL TAGS
===================================================== */

function createSkills(skills) {

    if (!skills) {

        return "";

    }


    return String(skills)
        .split(",")
        .map(
            function(skill) {

                return `

                    <span>
                        ${skill.trim()}
                    </span>

                `;

            }
        )
        .join("");

}


/* =====================================================
   GET LOGGED-IN USER EMAIL
===================================================== */

function getLoggedInUserEmail() {

    /* ================= CHECK userEmail ================= */

    let email =
        localStorage.getItem(
            "userEmail"
        );


    if (email) {

        return email;

    }


    /* ================= CHECK loggedInUser ================= */

    const loggedInUser =
        localStorage.getItem(
            "loggedInUser"
        );


    if (loggedInUser) {

        try {

            const user =
                JSON.parse(
                    loggedInUser
                );


            email =
                user.email ||
                user.userEmail ||
                "";


            if (email) {

                localStorage.setItem(
                    "userEmail",
                    email
                );


                return email;

            }

        }

        catch (error) {

            console.error(
                "Invalid loggedInUser data:",
                error
            );

        }

    }


    return "";

}


/* =====================================================
   APPLY FOR JOB
===================================================== */

async function applyJob(
    jobId,
    jobName
) {

    console.log(
        "================================="
    );


    console.log(
        "APPLY JOB FUNCTION CALLED"
    );


    console.log(
        "Job ID:",
        jobId
    );


    console.log(
        "Job Name:",
        jobName
    );


    /* ================= GET USER EMAIL ================= */

    const userEmail =
        getLoggedInUserEmail();


    console.log(
        "Logged-in email:",
        userEmail
    );


    /* ================= NOT LOGGED IN ================= */

    if (!userEmail) {

        showApplicationModal(
            "Login Required",
            "Please login before applying for a job."
        );


        return;

    }


    try {

        /* ================= SEND APPLICATION ================= */

        const response =
            await fetch(
                "https://freelancer-backend-9cw6.onrender.com/applications/apply",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },


                    body: JSON.stringify({

                        freelancerEmail:
                            userEmail,

                        jobId:
                            Number(jobId),

                        jobTitle:
                            jobName

                    })

                }
            );


        const responseText =
            await response.text();


        console.log(
            "Backend status:",
            response.status
        );


        console.log(
            "Backend response:",
            responseText
        );


        /* ================= SUCCESS ================= */

        if (response.ok) {

            showApplicationModal(
                "Application Submitted",
                "Your application has been submitted successfully!"
            );


            return;

        }


        /* ================= BACKEND ERROR ================= */

        throw new Error(
            responseText ||
            "Application failed."
        );

    }


    catch (error) {

        console.error(
            "Application error:",
            error
        );


        showApplicationModal(
            "Application Status",
            error.message ||
            "Unable to submit application."
        );

    }

}


/* =====================================================
   APPLICATION POPUP
===================================================== */

function showApplicationModal(
    title,
    message
) {

    const modal =
        document.getElementById(
            "applicationModal"
        );


    const titleElement =
        document.getElementById(
            "applicationModalTitle"
        );


    const messageElement =
        document.getElementById(
            "applicationModalMessage"
        );


    /* ================= SAFETY FALLBACK ================= */

    if (!modal) {

        alert(message);

        return;

    }


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    modal.style.display =
        "flex";

}


/* =====================================================
   CLOSE APPLICATION POPUP
===================================================== */

function closeApplicationModal() {

    const modal =
        document.getElementById(
            "applicationModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/* =====================================================
   CLEAR FILTERS
===================================================== */

function clearFilters() {

    const checkboxes =
        document.querySelectorAll(
            '.filters input[type="checkbox"]'
        );


    checkboxes.forEach(
        function(checkbox) {

            checkbox.checked =
                false;

        }
    );


    const jobSearch =
        document.getElementById(
            "jobSearch"
        );


    const locationSearch =
        document.getElementById(
            "locationSearch"
        );


    if (jobSearch) {

        jobSearch.value =
            "";

    }


    if (locationSearch) {

        locationSearch.value =
            "";

    }


    displayJobs(
        allJobs
    );

}


/* =====================================================
   SORT JOBS
===================================================== */

function sortJobs() {

    const sortElement =
        document.getElementById(
            "sortJobs"
        );


    if (!sortElement) {

        return;

    }


    const value =
        sortElement.value;


    let sortedJobs =
        [...allJobs];


    /* ================= HIGHEST BUDGET ================= */

    if (
        value === "budget"
    ) {

        sortedJobs.sort(
            function(a, b) {

                return (
                    Number(
                        b.budget || 0
                    ) -

                    Number(
                        a.budget || 0
                    )
                );

            }
        );

    }


    /* ================= MOST APPLICATIONS ================= */

    else if (
        value === "applications"
    ) {

        sortedJobs.sort(
            function(a, b) {

                return (
                    Number(
                        b.applicationCount || 0
                    ) -

                    Number(
                        a.applicationCount || 0
                    )
                );

            }
        );

    }


    /* ================= MOST RECENT ================= */

    else {

        sortedJobs =
            [...allJobs];

    }


    displayJobs(
        sortedJobs
    );

}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadJobs();

    }
);
