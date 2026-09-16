const API_URL = "http://localhost:8080/api/contracts";
const PAYMENT_API_URL = "http://localhost:8080/api/payments";

const userEmail = localStorage.getItem("userEmail");

const container =
    document.getElementById("contractsContainer");


async function loadContracts() {

    if (!userEmail) {

        container.innerHTML = `
            <div class="no-contracts">

                <div class="empty-icon">
                    🔐
                </div>

                <h2>Please Login</h2>

                <p>
                    You need to login to view your contracts.
                </p>

                <a href="login.html" class="jobs-btn">
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

            throw new Error(
                "Failed to load contracts"
            );
        }


        const contracts =
            await response.json();


        if (contracts.length === 0) {

            container.innerHTML = `
                <div class="no-contracts">

                    <div class="empty-icon">
                        📄
                    </div>

                    <h2>No Contracts Yet</h2>

                    <p>
                        You don't have any contracts yet.
                        Apply for jobs and start working with clients.
                    </p>

                    <a
                        href="jobs.html"
                        class="jobs-btn">
                        Find Jobs →
                    </a>

                </div>
            `;

            return;
        }


        container.innerHTML = "";


        contracts.forEach(contract => {

            const card =
                document.createElement("div");


            card.className =
                "contract-card";


            const status =
                contract.status || "ACTIVE";


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
                            onclick="showContractDetails(
                                ${contract.id}
                            )">
                            View Details
                        </button>


                        <button
                            class="payment-btn"
                            onclick="createPayment(
                                ${contract.id},
                                ${contract.jobId},
                                '${escapeValue(contract.jobTitle)}',
                                '${escapeValue(contract.clientEmail)}',
                                '${escapeValue(contract.freelancerEmail)}'
                            )">
                            💳 Payment
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
                    onclick="loadContracts()">
                    Try Again
                </button>

            </div>

        `;

    }

}


/* ================= SAFE TEXT ================= */

function escapeValue(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


/* ================= CONTRACT DETAILS ================= */

function showContractDetails(id) {

    alert(
        "Contract #" +
        id +
        "\n\nDetailed contract view will be added soon."
    );

}


/* ================= CREATE PAYMENT ================= */

async function createPayment(
    contractId,
    jobId,
    jobTitle,
    clientEmail,
    freelancerEmail
) {

    const amountInput =
        prompt(
            "Enter payment amount (₹):"
        );


    if (amountInput === null) {
        return;
    }


    const amount =
        Number(amountInput);


    if (
        isNaN(amount) ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid amount."
        );

        return;
    }


    try {

        const existingResponse =
            await fetch(
                `${PAYMENT_API_URL}/contract/${contractId}`
            );


        if (!existingResponse.ok) {

            throw new Error(
                "Failed to check existing payment"
            );
        }


        const existingPayments =
            await existingResponse.json();


        if (existingPayments.length > 0) {

            alert(
                "A payment already exists for this contract."
            );

            return;
        }


        const payment = {

            contractId: contractId,

            jobId: jobId,

            jobTitle: jobTitle,

            clientEmail: clientEmail,

            freelancerEmail: freelancerEmail,

            amount: amount,

            status: "PENDING"

        };


        const response =
            await fetch(
                PAYMENT_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payment)
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to create payment"
            );
        }


        alert(
            "Payment created successfully! 💳"
        );


        window.location.href =
            "my-payments.html";


    } catch (error) {

        console.error(error);


        alert(
            "Unable to create payment. Please check the backend."
        );

    }

}


/* ================= LOAD ================= */

loadContracts();