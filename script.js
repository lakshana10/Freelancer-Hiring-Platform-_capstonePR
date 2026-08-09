const searchButton = document.querySelector(".search-box button");
const searchInput = document.querySelector(".search-box input");

searchButton.addEventListener("click", function () {

    const searchText = searchInput.value.trim();

    if (searchText === "") {
        alert("Please enter a job or skill to search.");
    } else {
        alert("Searching for: " + searchText);
    }

});


const signUpButton = document.querySelector("nav button");

signUpButton.addEventListener("click", function () {
    alert("Sign Up page coming soon!");
});