let allJobs = [];


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

        displayJobs(allJobs);

    } catch (error) {

        console.error("Error:", error);

        const jobList =
            document.getElementById("jobList");

        jobList.innerHTML =
            "<p>Unable to load jobs. Please check the backend.</p>";
    }
}


/* SEARCH JOBS */

async function searchJobs() {

    const keyword =
        document.getElementById("jobSearch")
            .value
            .trim()
            .toLowerCase();

    const location =
        document.getElementById("locationSearch")
            .value
            .trim()
            .toLowerCase();

    if (keyword === "" && location === "") {

        displayJobs(allJobs);

        return;
    }

    const filteredJobs = allJobs.filter(function(job) {

        const jobText =
            (
                job.title + " " +
                job.description + " " +
                job.skills
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

        jobCard.className = "job-card";


        jobCard.innerHTML = `

            <div class="job-top">

                <div class="company-logo">
                    ${job.title.charAt(0).toUpperCase()}
                </div>

                <div class="job-title">

                    <span class="job-type">
                        AVAILABLE
                    </span>

                    <h3>
                        ${job.title}
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
                ${job.description}
            </p>


            <div class="skills">
                ${createSkills(job.skills)}
            </div>


            <div class="job-bottom">

                <div class="budget">

                    <strong>
                        ₹${Number(job.budget).toLocaleString("en-IN")}
                    </strong>

                    <span>
                        Fixed Price
                    </span>

                </div>


                <div class="applications">
                    Client: ${job.clientEmail}
                </div>


                <button
                    class="apply-btn"
                    onclick="applyJob('${job.title.replace(/'/g, "\\'")}')">

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

                    if (button.textContent.trim() === "♡") {

                        button.textContent = "♥";
                        button.style.color = "#6845e8";

                    } else {

                        button.textContent = "♡";
                        button.style.color = "#888";

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

            return `<span>${skill.trim()}</span>`;

        })
        .join("");
}


/* APPLY JOB */

function applyJob(jobName) {

    alert(
        "Application started for: " +
        jobName +
        "\n\nApplication feature will be connected to Spring Boot later."
    );
}


/* CLEAR FILTERS */

function clearFilters() {

    const checkboxes =
        document.querySelectorAll(
            '.filters input[type="checkbox"]'
        );

    checkboxes.forEach(function(checkbox) {

        checkbox.checked = false;

    });

}


/* SORT JOBS */

function sortJobs() {

    const value =
        document.getElementById("sortJobs").value;


    let sortedJobs = [...allJobs];


    if (value === "budget") {

        sortedJobs.sort(function(a, b) {

            return Number(b.budget) -
                   Number(a.budget);

        });

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