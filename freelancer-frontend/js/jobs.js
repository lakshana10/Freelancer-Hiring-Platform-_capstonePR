function searchJobs() {

    const keyword =
        document.getElementById("jobSearch").value.trim();

    const location =
        document.getElementById("locationSearch").value.trim();

    if (keyword === "" && location === "") {
        alert("Please enter a job title, skill or location.");
        return;
    }

    alert(
        "Searching for jobs" +
        (keyword ? " matching: " + keyword : "") +
        (location ? " in " + location : "")
    );
}


function clearFilters() {

    const checkboxes =
        document.querySelectorAll(
            '.filters input[type="checkbox"]'
        );

    checkboxes.forEach(function(checkbox) {
        checkbox.checked = false;
    });
}


function applyJob(jobName) {

    alert(
        "Application started for: " + jobName +
        "\n\nApplication feature will be connected to Spring Boot later."
    );
}


function sortJobs() {

    const value =
        document.getElementById("sortJobs").value;

    console.log("Sorting jobs by:", value);
}


/* SAVE JOB */

document.querySelectorAll(".save-job").forEach(function(button) {

    button.addEventListener("click", function() {

        if (button.textContent === "♡") {

            button.textContent = "♥";
            button.style.color = "#6845e8";

        } else {

            button.textContent = "♡";
            button.style.color = "#888";

        }

    });

});