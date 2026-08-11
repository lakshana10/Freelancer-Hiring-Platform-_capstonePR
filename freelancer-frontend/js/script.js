/* =========================================
   SEARCH
========================================= */

function searchJobs() {

    const input = document.getElementById("searchInput");

    const searchValue = input.value.trim();

    if (searchValue === "") {

        alert("Please enter a job or skill to search.");

        input.focus();

        return;
    }

    alert(
        "Searching for: " + searchValue
    );

    // Later this will connect to Spring Boot API
}


/* =========================================
   CATEGORY SEARCH
========================================= */

function searchCategory(category) {

    const input = document.getElementById("searchInput");

    input.value = category;

    input.focus();

    alert(
        "Searching freelancers for " + category
    );

}


/* =========================================
   LOGIN
========================================= */

function loginUser() {

    alert(
        "Login page will be connected to the Spring Boot backend."
    );

}


/* =========================================
   SIGN UP
========================================= */

function signupUser() {

    alert(
        "Registration page will be connected to the Spring Boot backend."
    );

}


/* =========================================
   POST JOB
========================================= */

function postJob() {

    alert(
        "Post Job page coming next."
    );

}


/* =========================================
   JOIN AS FREELANCER
========================================= */

function joinFreelancer() {

    alert(
        "Freelancer registration will be connected to the backend."
    );

}


/* =========================================
   DARK MODE
========================================= */

const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        themeBtn.textContent = "☀";

    } else {

        themeBtn.textContent = "☾";

    }

});