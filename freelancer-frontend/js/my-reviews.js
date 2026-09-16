const API_URL = "http://localhost:8080/api/reviews";

const userEmail = localStorage.getItem("userEmail");

const reviewsContainer =
    document.getElementById("reviewsContainer");

const ratingSummary =
    document.getElementById("ratingSummary");


async function loadReviews() {

    if (!userEmail) {

        ratingSummary.innerHTML = "";

        reviewsContainer.innerHTML = `
            <div class="no-reviews">

                <div class="empty-icon">
                    🔐
                </div>

                <h2>Please Login</h2>

                <p>
                    Login to view your reviews.
                </p>

                <a
                    href="login.html"
                    class="jobs-btn">
                    Login
                </a>

            </div>
        `;

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/freelancer/${encodeURIComponent(userEmail)}`
        );


        if (!response.ok) {
            throw new Error("Failed to load reviews");
        }


        const reviews = await response.json();


        /* ================= RATING SUMMARY ================= */

        if (reviews.length === 0) {

            ratingSummary.innerHTML = `

                <div>

                    <div class="rating-number">
                        0.0
                    </div>

                    <div class="stars">
                        ☆☆☆☆☆
                    </div>

                </div>

                <div>

                    <h3>
                        No ratings yet
                    </h3>

                    <div class="rating-count">
                        Complete projects to receive client reviews.
                    </div>

                </div>

            `;

        } else {

            const totalRating =
                reviews.reduce(
                    (total, review) =>
                        total + Number(review.rating || 0),
                    0
                );


            const averageRating =
                totalRating / reviews.length;


            const roundedRating =
                Math.round(averageRating);


            const stars =
                "★".repeat(roundedRating) +
                "☆".repeat(5 - roundedRating);


            ratingSummary.innerHTML = `

                <div>

                    <div class="rating-number">
                        ${averageRating.toFixed(1)}
                    </div>

                    <div class="stars">
                        ${stars}
                    </div>

                </div>

                <div>

                    <h3>
                        Overall Rating
                    </h3>

                    <div class="rating-count">
                        Based on ${reviews.length}
                        review${reviews.length > 1 ? "s" : ""}
                    </div>

                </div>

            `;
        }


        /* ================= NO REVIEWS ================= */

        if (reviews.length === 0) {

            reviewsContainer.innerHTML = `

                <div class="no-reviews">

                    <div class="empty-icon">
                        ⭐
                    </div>

                    <h2>
                        No Reviews Yet
                    </h2>

                    <p>
                        Your client reviews will appear here
                        after completed projects.
                    </p>

                </div>

            `;

            return;
        }


        /* ================= DISPLAY REVIEWS ================= */

        reviewsContainer.innerHTML = "";


        reviews.forEach(review => {

            const card =
                document.createElement("div");


            card.className =
                "review-card";


            const rating =
                Number(review.rating || 0);


            const stars =
                "★".repeat(rating) +
                "☆".repeat(5 - rating);


            card.innerHTML = `

                <div class="review-top">

                    <div>

                        <div class="review-job">
                            ${review.jobTitle || "Freelance Project"}
                        </div>

                        <div class="review-client">
                            Client: ${review.clientEmail}
                        </div>

                    </div>

                    <div class="stars">
                        ${stars}
                    </div>

                </div>


                <p class="review-comment">
                    "${review.comment}"
                </p>


            `;


            reviewsContainer.appendChild(card);

        });


    } catch (error) {

        console.error(error);


        ratingSummary.innerHTML = "";


        reviewsContainer.innerHTML = `

            <div class="no-reviews">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Reviews
                </h2>

                <p>
                    Please make sure the backend is running.
                </p>

                <button
                    class="jobs-btn"
                    onclick="loadReviews()">
                    Try Again
                </button>

            </div>

        `;

    }

}


loadReviews();