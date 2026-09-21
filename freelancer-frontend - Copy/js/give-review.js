const API_URL = "http://localhost:8080/api/reviews";
const CONTRACT_API_URL = "http://localhost:8080/api/contracts";

const userEmail = localStorage.getItem("userEmail");

const params = new URLSearchParams(window.location.search);
const contractId = params.get("contractId");

let selectedRating = 0;


// Load contract details
async function loadContract() {

    if (!userEmail) {
        window.location.href = "login.html";
        return;
    }

    if (!contractId) {

        document.getElementById("jobTitle").textContent =
            "No contract selected";

        document.getElementById("freelancerEmail").textContent = "-";

        document.getElementById("contractId").textContent = "-";

        return;
    }

    try {

        const response = await fetch(
            `${CONTRACT_API_URL}/client/${encodeURIComponent(userEmail)}`
        );

        if (!response.ok) {
            throw new Error("Failed to load contracts");
        }

        const contracts = await response.json();

        const contract = contracts.find(
            c => String(c.id) === String(contractId)
        );

        if (!contract) {

            document.getElementById("jobTitle").textContent =
                "Contract not found";

            document.getElementById("freelancerEmail").textContent = "-";

            document.getElementById("contractId").textContent = "-";

            return;
        }

        document.getElementById("jobTitle").textContent =
            contract.jobTitle || "Freelance Project";

        document.getElementById("freelancerEmail").textContent =
            contract.freelancerEmail || "-";

        document.getElementById("contractId").textContent =
            contract.id;

    } catch (error) {

        console.error(error);

        document.getElementById("jobTitle").textContent =
            "Unable to load contract";

        document.getElementById("freelancerEmail").textContent = "-";

        document.getElementById("contractId").textContent = "-";
    }
}


// Star rating
document.querySelectorAll(".star-rating span").forEach(star => {

    star.addEventListener("click", function () {

        selectedRating = Number(this.dataset.rating);

        document
            .querySelectorAll(".star-rating span")
            .forEach(s => {

                const rating = Number(s.dataset.rating);

                if (rating <= selectedRating) {
                    s.classList.add("selected");
                } else {
                    s.classList.remove("selected");
                }

            });

    });

});


// Submit review
async function submitReview() {

    const comment = document
        .getElementById("comment")
        .value
        .trim();

    const message = document.getElementById("message");


    if (!userEmail) {

        message.textContent =
            "Please login first.";

        return;
    }


    if (!contractId) {

        message.textContent =
            "No contract selected.";

        return;
    }


    if (selectedRating === 0) {

        message.textContent =
            "Please select a rating.";

        return;
    }


    if (comment === "") {

        message.textContent =
            "Please write a review.";

        return;
    }


    try {

        // Get contract details
        const contractResponse = await fetch(
            `${CONTRACT_API_URL}/client/${encodeURIComponent(userEmail)}`
        );

        if (!contractResponse.ok) {

            throw new Error(
                "Failed to load contract"
            );

        }

        const contracts =
            await contractResponse.json();


        const contract =
            contracts.find(
                c => String(c.id) === String(contractId)
            );


        if (!contract) {

            message.textContent =
                "Contract not found.";

            return;
        }


        const review = {

            jobId:
                contract.jobId,

            contractId:
                contract.id,

            clientEmail:
                userEmail,

            freelancerEmail:
                contract.freelancerEmail,

            jobTitle:
                contract.jobTitle,

            rating:
                selectedRating,

            comment:
                comment

        };


        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(review)
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to submit review"
            );

        }


        message.textContent =
            "Review submitted successfully! ⭐";

        message.style.color =
            "green";


        document.getElementById("comment").value =
            "";


        selectedRating =
            0;


        document
            .querySelectorAll(".star-rating span")
            .forEach(star => {

                star.classList.remove("selected");

            });


        setTimeout(() => {

            window.location.href =
                "client-contracts.html";

        }, 1500);


    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to submit review. Please try again.";

        message.style.color =
            "red";
    }
}


loadContract();