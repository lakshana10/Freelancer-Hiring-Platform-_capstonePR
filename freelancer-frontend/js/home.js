// ================= SEARCH =================

function searchWork() {

    const search = document.getElementById("searchInput").value.trim();

    if (search === "") {
        alert("Please enter a job or skill to search.");
        return;
    }

    alert("Searching for: " + search);

    // Later we will connect this to Spring Boot backend.
}


// ================= LOGIN =================

function login() {

    alert("Login page will be connected to the backend soon.");

}


// ================= SIGN UP =================

function signup() {

    alert("Sign Up page will be connected to the backend soon.");

}


// ================= DARK MODE =================

const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        themeBtn.innerHTML = "☀";

    } else {

        themeBtn.innerHTML = "☾";

    }

});


// ================= CATEGORY CLICK =================

const categoryLinks = document.querySelectorAll(".category-card a");

categoryLinks.forEach(function (link) {

    link.addEventListener("click", function (event) {

        event.preventDefault();

        const category =
            this.parentElement.querySelector("h3").innerText;

        alert("Opening category: " + category);

    });

});