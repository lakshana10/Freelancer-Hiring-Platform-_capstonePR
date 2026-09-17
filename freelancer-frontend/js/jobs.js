let allJobs = [];
let selectedJobId = null;


/* LOAD JOBS FROM DATABASE */

async function loadJobs() {

    try {

        const response =
            await fetch("http://localhost:8080/api/jobs");

        if (!response.ok) {
            throw new Error("Failed to fetch jobs");
        }

        allJobs = await response.json();

        console.log("Jobs from database:", allJobs);

        applyHomeFilters();

    } catch (error) {

        console.error("Error:", error);

        const jobList =
            document.getElementById("jobList");

        if (jobList) {

            jobList.innerHTML =
                "<p>Unable to load jobs. Please check the backend.</p>";

        }

    }
}


/* APPLY HOME PAGE SEARCH / CATEGORY / SELECTED JOB */

function applyHomeFilters() {

    const params =
        new URLSearchParams(window.location.search);


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
            filteredJobs.filter(function(job) {

                return String(job.id) ===
                       String(selectedJobId);

            });

    }


    /* ================= HOME SEARCH ================= */

    if (search) {

        const searchText =
            search.toLowerCase().trim();


        filteredJobs =
            filteredJobs.filter(function(job) {

                const jobText =
                    (
                        (job.title || "") + " " +
                        (job.description || "") + " " +
                        (job.skills || "")
                    ).toLowerCase();


                return jobText.includes(searchText);

            });

    }


    /* ================= HOME CATEGORY ================= */

    if (category) {

        const categoryText =
            category.toLowerCase().trim();


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
            filteredJobs.filter(function(job) {

                const jobText =
                    (
                        (job.title || "") + " " +
                        (job.description || "") + " " +
                        (job.skills || "")
                    ).toLowerCase();


                return keywords.some(function(keyword) {

                    return jobText.includes(keyword);

                });

            });

    }


    displayJobs(filteredJobs);


    /* SHOW SEARCH IN SEARCH BOX */

    const jobSearch =
        document.getElementById("jobSearch");


    if (jobSearch && search) {

        jobSearch.value =
            search;

    }

}


/* SEARCH JOBS */

async function searchJobs() {

    const keywordElement =
        document.getElementById("jobSearch");


    const locationElement =
        document.getElementById("locationSearch");


    const keyword =
        keywordElement
            ? keywordElement.value.trim().toLowerCase()
            : "";


    const location =
        locationElement
            ? locationElement.value.trim().toLowerCase()
            : "";


    if (
        keyword === "" &&
        location === ""
    ) {

        displayJobs(allJobs);

        return;

    }


    const filteredJobs =
        allJobs.filter(function(job) {

            const jobText =
                (
                    (job.title || "") + " " +
                    (job.description || "") + " " +
                    (job.skills || "")
                ).toLowerCase();


            return (

                (keyword === "" ||
                    jobText.includes(keyword)) &&

                (location === "" ||
                    jobText.includes(location))

            );

        });


    displayJobs(filteredJobs);

}


/* DISPLAY JOBS */

function displayJobs(jobs) {

    const jobList =
        document.getElementById("jobList");


    if (!jobList) {
        return;
    }


    jobList.innerHTML = "";


    if (jobs.length === 0) {

        jobList.innerHTML = `
            <div class="job-card">
                <h3>No jobs found</h3>
                <p>Try another keyword or location.</p>
            </div>
        `;

        return;

    }


    jobs.forEach(function(job) {

        const jobCard =
            document.createElement("article");


        jobCard.className =
            "job-card";


        jobCard.innerHTML = `

            <div class="job-top">

                <div class="company-logo">
                    ${(job.title || "J")
                        .charAt(0)
                        .toUpperCase()}
                </div>

                <div class="job-title">

                    <span class="job-type">
                        AVAILABLE
                    </span>

                    <h3>
                        ${job.title || "Untitled Job"}
                    </h3>

                    <p>
                        Web Development • Available Now
                    </p>

                </div>

                <button class="save-job">
                    ♡
                </button>

            </div>


            <p class="job-description">
                ${job.description || "No description available."}
            </p>


            <div class="skills">
                ${createSkills(job.skills)}
            </div>


            <div class="job-bottom">

                <div class="budget">

                    <strong>
                        ₹${Number(job.budget)
                            .toLocaleString("en-IN")}
                    </strong>

                    <span>
                        Fixed Price
                    </span>

                </div>


                <div class="applications">
                    Client: ${job.clientEmail || "N/A"}
                </div>


                <button
                    class="apply-btn"
                    onclick="applyJob(
                        ${job.id},
                        '${String(job.title || "")
                            .replace(/'/g, "\\'")}'
                    )">

                    Apply Now →

                </button>

            </div>

        `;


        jobList.appendChild(jobCard);

    });


    /* SAVE BUTTONS */

    document
        .querySelectorAll(".save-job")
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    if (
                        button.textContent.trim() === "♡"
                    ) {

                        button.textContent = "♥";

                        button.style.color =
                            "#6845e8";

                    } else {

                        button.textContent = "♡";

                        button.style.color =
                            "#888";

                    }

                }
            );

        });

}


/* CREATE SKILL TAGS */

function createSkills(skills) {

    if (!skills) {
        return "";
    }


    return skills
        .split(",")
        .map(function(skill) {

            return `
                <span>
                    ${skill.trim()}
                </span>
            `;

        })
        .join("");

}


/* APPLY JOB */

async function applyJob(jobId, jobName) {

    try {

        const userEmail =
            localStorage.getItem("userEmail");


        if (!userEmail) {

            alert(
                "Please login before applying for a job."
            );


            window.location.href =
                "login.html";


            return;

        }


        const response =
            await fetch(
                "http://localhost:8080/applications/apply",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        freelancerEmail:
                            userEmail,

                        jobId:
                            jobId,

                        jobTitle:
                            jobName

                    })

                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Application failed"
            );

        }


        alert(
            "Application submitted successfully!"
        );


    } catch (error) {

        alert(
            error.message
        );


        console.error(
            error
        );

    }

}


/* CLEAR FILTERS */

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


    displayJobs(allJobs);

}


/* SORT JOBS */

function sortJobs() {

    const sortElement =
        document.getElementById("sortJobs");


    if (!sortElement) {
        return;
    }


    const value =
        sortElement.value;


    let sortedJobs =
        [...allJobs];


    if (value === "budget") {

        sortedJobs.sort(
            function(a, b) {

                return Number(b.budget) -
                       Number(a.budget);

            }
        );

    }


    displayJobs(sortedJobs);

}


/* LOAD JOBS WHEN PAGE OPENS */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadJobs();

    }
);