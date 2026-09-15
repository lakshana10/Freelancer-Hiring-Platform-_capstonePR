// ================= SEARCH JOBS =================

function searchWork() {

    const searchInput = document.getElementById("searchInput");

    if (!searchInput) {
        return;
    }

    const search = searchInput.value.trim();

    if (search === "") {
        alert("Please enter a job or skill to search.");
        searchInput.focus();
        return;
    }

    window.location.href =
        "jobs.html?search=" + encodeURIComponent(search);
}


// ================= LOGIN =================

function login() {

    window.location.href = "login.html";

}


// ================= SIGN UP =================

function signup() {

    window.location.href = "signup.html";

}


// ================= DARK MODE =================

const themeBtn = document.getElementById("themeBtn");

if (themeBtn) {

    themeBtn.addEventListener("click", function () {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {

            themeBtn.innerHTML = "☀";

        } else {

            themeBtn.innerHTML = "☾";

        }

    });

}


// ================= CATEGORY CLICK =================

const categoryLinks =
    document.querySelectorAll(".category-card a");

categoryLinks.forEach(function (link) {

    link.addEventListener("click", function (event) {

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
            "jobs.html?category=" + encodeURIComponent(category);

    });

});


// ================= SEARCH WITH ENTER KEY =================

const searchInput =
    document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            searchWork();

        }

    });

}