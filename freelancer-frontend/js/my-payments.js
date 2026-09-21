const API_URL = "https://freelancer-backend-9cw6.onrender.com/api/payments";

const userEmail = localStorage.getItem("userEmail");

const container =
    document.getElementById("paymentsContainer");

const summary =
    document.getElementById("paymentSummary");


async function loadPayments() {

    if (!userEmail) {

        summary.innerHTML = "";

        container.innerHTML = `
            <div class="no-payments">

                <div class="empty-icon">
                    🔐
                </div>

                <h2>Please Login</h2>

                <p>
                    You need to login to view your payments.
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

            throw new Error(
                "Failed to load payments"
            );
        }


        const payments =
            await response.json();


        /* ================= SUMMARY ================= */

        const totalPayments =
            payments.length;


        const pendingPayments =
            payments.filter(
                payment =>
                    (payment.status || "PENDING")
                        .toUpperCase() === "PENDING"
            );


        const paidPayments =
            payments.filter(
                payment =>
                    (payment.status || "")
                        .toUpperCase() === "PAID"
            );


        const pendingAmount =
            pendingPayments.reduce(
                (total, payment) =>
                    total + (Number(payment.amount) || 0),
                0
            );


        const paidAmount =
            paidPayments.reduce(
                (total, payment) =>
                    total + (Number(payment.amount) || 0),
                0
            );


        summary.innerHTML = `

            <div class="summary-card">

                <div class="summary-label">
                    Total Payments
                </div>

                <div class="summary-value">
                    ${totalPayments}
                </div>

            </div>


            <div class="summary-card">

                <div class="summary-label">
                    Pending Amount
                </div>

                <div class="summary-value">
                    ₹${pendingAmount.toLocaleString("en-IN")}
                </div>

            </div>


            <div class="summary-card">

                <div class="summary-label">
                    Paid Amount
                </div>

                <div class="summary-value">
                    ₹${paidAmount.toLocaleString("en-IN")}
                </div>

            </div>

        `;


        /* ================= EMPTY ================= */

        if (payments.length === 0) {

            container.innerHTML = `

                <div class="no-payments">

                    <div class="empty-icon">
                        💳
                    </div>

                    <h2>
                        No Payments Yet
                    </h2>

                    <p>
                        Your payment details will appear here
                        when a payment is created.
                    </p>

                    <a
                        href="my-contracts.html"
                        class="jobs-btn">
                        View Contracts →
                    </a>

                </div>

            `;

            return;
        }


        /* ================= PAYMENT CARDS ================= */

        container.innerHTML = "";


        payments.forEach(payment => {

            const card =
                document.createElement("div");


            card.className =
                "payment-card";


            const status =
                payment.status || "PENDING";


            const statusClass =
                status.toUpperCase() === "PAID"
                    ? "paid"
                    : "pending";


            const amount =
                payment.amount != null
                    ? `₹${Number(payment.amount).toLocaleString("en-IN")}`
                    : "Amount not set";


            card.innerHTML = `

                <div class="payment-top">

                    <div class="payment-title">

                        <div class="payment-icon">
                            💳
                        </div>

                        <div>

                            <h3>
                                ${payment.jobTitle || "Untitled Job"}
                            </h3>

                            <div class="payment-number">
                                Payment #${payment.id}
                            </div>

                        </div>

                    </div>


                    <div class="payment-status ${statusClass}">
                        ${status}
                    </div>

                </div>


                <div class="payment-details">


                    <div class="detail-box">

                        <span class="detail-label">
                            Amount
                        </span>

                        <span class="detail-value amount">
                            ${amount}
                        </span>

                    </div>


                    <div class="detail-box">

                        <span class="detail-label">
                            Contract ID
                        </span>

                        <span class="detail-value">
                            #${payment.contractId}
                        </span>

                    </div>


                    <div class="detail-box">

                        <span class="detail-label">
                            Job ID
                        </span>

                        <span class="detail-value">
                            #${payment.jobId}
                        </span>

                    </div>


                    <div class="detail-box">

                        <span class="detail-label">
                            Client
                        </span>

                        <span class="detail-value">
                            ${payment.clientEmail}
                        </span>

                    </div>


                    <div class="detail-box">

                        <span class="detail-label">
                            Freelancer
                        </span>

                        <span class="detail-value">
                            ${payment.freelancerEmail}
                        </span>

                    </div>


                    <div class="detail-box">

                        <span class="detail-label">
                            Payment Status
                        </span>

                        <span class="detail-value">
                            ${status}
                        </span>

                    </div>


                </div>


                <div class="payment-footer">

                    <div class="payment-id">

                        Payment ID:
                        <strong>
                            #${payment.id}
                        </strong>

                    </div>


                    ${
                        status.toUpperCase() !== "PAID"
                        ? `
                            <button
                                class="pay-btn"
                                onclick="makePayment(${payment.id})">

                                💳 Make Payment

                            </button>
                        `
                        : `
                            <strong>
                                ✓ Payment Completed
                            </strong>
                        `
                    }


                </div>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(error);

        summary.innerHTML = "";

        container.innerHTML = `

            <div class="no-payments">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Payments
                </h2>

                <p>
                    Please make sure the backend is running.
                </p>

                <button
                    class="jobs-btn"
                    onclick="loadPayments()">
                    Try Again
                </button>

            </div>

        `;

    }

}


/* ================= MAKE PAYMENT ================= */

async function makePayment(paymentId) {

    const confirmPayment =
        confirm(
            "Are you sure you want to make this payment?"
        );


    if (!confirmPayment) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${paymentId}/status?status=PAID`,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Payment update failed"
            );
        }


        alert(
            "Payment completed successfully! 💳"
        );


        await loadPayments();


    } catch (error) {

        console.error(error);


        alert(
            "Unable to complete payment. Please try again."
        );

    }

}


/* ================= LOAD ================= */

loadPayments();
