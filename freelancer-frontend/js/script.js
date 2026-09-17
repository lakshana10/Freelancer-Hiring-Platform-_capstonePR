/* =========================================
   SEARCH
========================================= */

function searchJobs() {

    const input = document.getElementById("searchInput");

    if (!input) {
        return;
    }

    const searchValue = input.value.trim();

    if (searchValue === "") {

        alert("Please enter a job or skill to search.");

        input.focus();

        return;
    }

    window.location.href =
        "jobs.html?search=" +
        encodeURIComponent(searchValue);
}


/* =========================================
   CATEGORY SEARCH
========================================= */

function searchCategory(category) {

    const input = document.getElementById("searchInput");

    if (input) {
        input.value = category;
    }

    window.location.href =
        "jobs.html?search=" +
        encodeURIComponent(category);
}


/* =========================================
   LOGIN
========================================= */

function loginUser() {

    window.location.href = "login.html";

}


/* =========================================
   SIGN UP
========================================= */

function signupUser() {

    window.location.href = "signup.html";

}


/* =========================================
   POST JOB
========================================= */

function postJob() {

    const user =
        JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) {

        alert("Please login first to post a job.");

        window.location.href = "login.html";

        return;
    }

    if (
        !user.role ||
        user.role.toUpperCase() !== "CLIENT"
    ) {

        alert("Only clients can post jobs.");

        return;
    }

    window.location.href = "post-job.html";

}


/* =========================================
   JOIN AS FREELANCER
========================================= */

function joinFreelancer() {

    window.location.href = "signup.html";

}


/* =========================================
   DARK MODE
========================================= */

const themeBtn =
    document.getElementById("themeBtn");

if (themeBtn) {

    themeBtn.addEventListener("click", function () {

        document.body.classList.toggle("dark");

        if (
            document.body.classList.contains("dark")
        ) {

            themeBtn.textContent = "☀";

        } else {

            themeBtn.textContent = "☾";

        }

    });

}