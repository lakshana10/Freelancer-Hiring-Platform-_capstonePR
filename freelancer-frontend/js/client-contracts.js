const API_URL = "https://freelancer-backend-9cw6.onrender.com/api/contracts";

const userEmail = localStorage.getItem("userEmail");

const container = document.getElementById("contractsContainer");

async function loadClientContracts() {

    if (!userEmail) {

        container.innerHTML = `
            <div class="no-contracts">
                <div class="empty-icon">🔐</div>
                <h2>Please Login</h2>
                <p>You need to login to view your contracts.</p>
                <a href="login.html" class="jobs-btn">Login</a>
            </div>
        `;

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/client/${encodeURIComponent(userEmail)}`
        );

        if (!response.ok) {
            throw new Error("Failed to load contracts");
        }

        const contracts = await response.json();

        if (contracts.length === 0) {

            container.innerHTML = `
                <div class="no-contracts">
                    <div class="empty-icon">📄</div>
                    <h2>No Contracts Yet</h2>
                    <p>You don't have any contracts yet.</p>

                    <a href="jobs.html" class="jobs-btn">
                        Find Jobs →
                    </a>
                </div>
            `;

            return;
        }

        container.innerHTML = "";

        contracts.forEach(contract => {

            const card = document.createElement("div");

            card.className = "contract-card";

            const status = contract.status || "ACTIVE";

            card.innerHTML = `

                <div class="contract-top">

                    <div class="contract-title-section">

                        <div class="contract-icon">
                            📄
                        </div>

                        <div>

                            <h3>
                                ${contract.jobTitle || "Untitled Job"}
                            </h3>

                            <div class="contract-number">
                                Contract #${contract.id}
                            </div>

                        </div>

                    </div>

                    <div class="status">

                        <span class="status-dot"></span>

                        ${status}

                    </div>

                </div>


                <div class="contract-details">

                    <div class="detail-box">

                        <span class="detail-label">
                            Job ID
                        </span>

                        <span class="detail-value">
                            #${contract.jobId}
                        </span>

                    </div>


                    <div class="detail-box">

                        <span class="detail-label">
                            Client
                        </span>

                        <span class="detail-value">
                            ${contract.clientEmail}
                        </span>

                    </div>


                    <div class="detail-box">

                        <span class="detail-label">
                            Freelancer
                        </span>

                        <span class="detail-value">
                            ${contract.freelancerEmail}
                        </span>

                    </div>


                    <div class="detail-box">

                        <span class="detail-label">
                            Contract Status
                        </span>

                        <span class="detail-value">
                            ${status}
                        </span>

                    </div>

                </div>


                <div class="contract-footer">

                    <div class="contract-info">

                        Contract ID:
                        <strong>#${contract.id}</strong>

                    </div>


                    <div class="contract-actions">

                        <button
                            class="details-btn"
                            onclick="showContractDetails(${contract.id})">

                            View Details

                        </button>


                        <button
                            class="review-btn"
                            onclick="giveReview(${contract.id})">

                            ⭐ Give Review

                        </button>


                        <button
                            class="message-btn"
                            onclick="openMessage('${escapeValue(contract.freelancerEmail)}')">

                            💬 Message Freelancer

                        </button>

                    </div>

                </div>
            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="no-contracts">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Contracts
                </h2>

                <p>
                    Please make sure the backend is running.
                </p>

                <button
                    class="jobs-btn"
                    onclick="loadClientContracts()">

                    Try Again

                </button>

            </div>
        `;
    }
}


/* =========================================
   VIEW CONTRACT DETAILS
========================================= */

function showContractDetails(id) {

    const contractCard =
        [...document.querySelectorAll(".contract-card")]
        .find(card =>
            card.innerHTML.includes(`Contract #${id}`)
        );

    if (!contractCard) {

        alert("Contract details not found.");

        return;
    }


    const jobTitle =
        contractCard
            .querySelector("h3")
            ?.textContent
            .trim() || "Untitled Job";


    const details =
        contractCard.querySelectorAll(".detail-box");


    let jobId = "-";
    let clientEmail = "-";
    let freelancerEmail = "-";
    let status = "ACTIVE";


    details.forEach(detail => {

        const label =
            detail
                .querySelector(".detail-label")
                ?.textContent
                .trim();


        const value =
            detail
                .querySelector(".detail-value")
                ?.textContent
                .trim();


        if (label === "Job ID") {

            jobId = value;

        }


        if (label === "Client") {

            clientEmail = value;

        }


        if (label === "Freelancer") {

            freelancerEmail = value;

        }


        if (label === "Contract Status") {

            status = value;

        }

    });


    /* OPEN THE HTML POPUP */

    const modal =
        document.getElementById("contractDetailsModal");


    if (!modal) {

        alert("Contract details popup not found.");

        return;

    }


    document.getElementById("modalContractId").textContent =
        "#" + id;


    document.getElementById("modalJobTitle").textContent =
        jobTitle;


    document.getElementById("modalJobId").textContent =
        jobId;


    document.getElementById("modalClientEmail").textContent =
        clientEmail;


    document.getElementById("modalFreelancerEmail").textContent =
        freelancerEmail;


    document.getElementById("modalContractStatus").textContent =
        status;


    modal.classList.add("active");

    document.body.style.overflow = "hidden";

}


/* =========================================
   CLOSE CONTRACT DETAILS POPUP
========================================= */

function closeContractDetails() {

    const modal =
        document.getElementById("contractDetailsModal");


    if (modal) {

        modal.classList.remove("active");

    }


    document.body.style.overflow = "";

}


/* =========================================
   CLOSE POPUP WITH ESC KEY
========================================= */

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        closeContractDetails();

    }

});


/* =========================================
   GIVE REVIEW
========================================= */

function giveReview(contractId) {

    window.location.href =
        `give-review.html?contractId=${contractId}`;

}


/* =========================================
   MESSAGE FREELANCER
========================================= */

function openMessage(freelancerEmail) {

    if (!freelancerEmail || freelancerEmail === "-") {

        alert("Freelancer email not found.");

        return;

    }


    window.location.href =
        `messages.html?receiver=${encodeURIComponent(freelancerEmail)}`;

}


/* =========================================
   ESCAPE VALUE
========================================= */

function escapeValue(value) {

    if (!value) {

        return "";

    }


    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}


/* =========================================
   LOAD CLIENT CONTRACTS
========================================= */

loadClientContracts();
