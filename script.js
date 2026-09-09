const SUPABASE_URL =
    "https://bxqheqspochtrwdhzgbm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_6PMbk6vjMrngVwF4fVloVA_5iOnBfGk";


/* =========================================================
   SUPABASE
   ========================================================= */

async function getIncome() {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/income?select=*&order=pay_date.desc&limit=1`,
        {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
            },
        }
    );


    if (!response.ok) {

        console.error(
            "Failed to load income:",
            await response.text()
        );

        return null;
    }


    const income =
        await response.json();


    return income[0] || null;
}


async function getBills() {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/bills?select=*&order=sort_order.asc,id.asc`,
        {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
            },
        }
    );


    if (!response.ok) {

        console.error(
            "Failed to load bills:",
            await response.text()
        );

        return [];
    }


    return await response.json();
}


/* =========================================================
   DATE / CALCULATION FUNCTIONS
   ========================================================= */

function addDays(originalDate, days) {

    const result =
        new Date(originalDate);


    result.setDate(
        result.getDate() + days
    );


    return result;
}


function addMonths(originalDate, months) {

    const year =
        originalDate.getFullYear();

    const month =
        originalDate.getMonth() + months;

    const day =
        originalDate.getDate();


    const result =
        new Date(
            year,
            month,
            1
        );


    const lastDay =
        new Date(
            result.getFullYear(),
            result.getMonth() + 1,
            0
        ).getDate();


    result.setDate(
        Math.min(day, lastDay)
    );


    return result;
}


function parseDate(dateString) {

    const [
        year,
        month,
        day
    ] =
        dateString
            .split("-")
            .map(Number);


    return new Date(
        year,
        month - 1,
        day
    );
}


function formatDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    );
}


function getNextPayDate(
    payDate,
    frequency
) {

    if (frequency === "weekly") {

        return addDays(
            payDate,
            7
        );
    }


    if (frequency === "biweekly") {

        return addDays(
            payDate,
            14
        );
    }


    if (frequency === "monthly") {

        return addMonths(
            payDate,
            1
        );
    }


    throw new Error(
        "Invalid pay frequency"
    );
}


function getPayPeriod(
    payDate,
    frequency
) {

    const nextPayDate =
        getNextPayDate(
            payDate,
            frequency
        );


    const periodStart =
        payDate;


    const periodEnd =
        addDays(
            nextPayDate,
            -1
        );


    return {
        periodStart,
        periodEnd,
    };
}


function getBillOccurrencesForPeriod(
    bill,
    periodStart,
    periodEnd
) {

    const dueDate =
        parseDate(
            bill.due_date
        );


    if (
        bill.frequency === "one_time"
    ) {

        if (
            dueDate >= periodStart &&
            dueDate <= periodEnd
        ) {

            return [dueDate];
        }


        return [];
    }


    const occurrences = [];


    if (
        bill.frequency === "weekly" ||
        bill.frequency === "biweekly"
    ) {

        const intervalDays =
            bill.frequency === "weekly"
                ? 7
                : 14;


        let occurrence =
            new Date(dueDate);


        while (
            occurrence < periodStart
        ) {

            occurrence =
                addDays(
                    occurrence,
                    intervalDays
                );
        }


        while (
            occurrence <= periodEnd
        ) {

            occurrences.push(
                new Date(occurrence)
            );


            occurrence =
                addDays(
                    occurrence,
                    intervalDays
                );
        }
    }


    else if (
        bill.frequency === "monthly" ||
        bill.frequency === "quarterly" ||
        bill.frequency === "yearly"
    ) {

        let intervalMonths;


        if (
            bill.frequency === "monthly"
        ) {

            intervalMonths = 1;
        }

        else if (
            bill.frequency === "quarterly"
        ) {

            intervalMonths = 3;
        }

        else {

            intervalMonths = 12;
        }


        let monthNumber = 0;


        let occurrence =
            addMonths(
                dueDate,
                monthNumber
            );


        while (
            occurrence < periodStart
        ) {

            monthNumber +=
                intervalMonths;


            occurrence =
                addMonths(
                    dueDate,
                    monthNumber
                );
        }


        while (
            occurrence <= periodEnd
        ) {

            occurrences.push(
                new Date(occurrence)
            );


            monthNumber +=
                intervalMonths;


            occurrence =
                addMonths(
                    dueDate,
                    monthNumber
                );
        }
    }


    return occurrences;
}


function getAllBillOccurrences(
    bills,
    periodStart,
    periodEnd
) {

    const allOccurrences = [];


    for (
        const bill of bills
    ) {

        const occurrenceDates =
            getBillOccurrencesForPeriod(
                bill,
                periodStart,
                periodEnd
            );


        for (
            const occurrenceDate
            of occurrenceDates
        ) {

            allOccurrences.push({
                bill,
                occurrenceDate,
            });
        }
    }


    return allOccurrences;
}


function calculateRemaining(
    paycheck,
    billOccurrences
) {

    const totalBills =
        billOccurrences.reduce(
            (
                total,
                occurrence
            ) => {

                return (
                    total +
                    Number(
                        occurrence.bill.amount
                    )
                );
            },
            0
        );


    const remaining =
        Number(paycheck) -
        totalBills;


    return {
        totalBills,
        remaining,
    };
}


/* =========================================================
   DASHBOARD
   ========================================================= */

async function loadDashboard() {

    const selectedBillId =
        document.querySelector(".bill.selected")
            ?.dataset.billId;


    const income =
        await getIncome();


    const bills =
        await getBills();


    const addPaycheckSection =
        document.getElementById(
            "add-paycheck-section"
        );


    const paycheckAmount =
        document.querySelector(
            ".paycheck-amount"
        );


    const heroAmount =
        document.querySelector(
            ".hero-amount"
        );


    const payPeriod =
        document.querySelector(
            ".pay-period"
        );


    const billsTotal =
        document.querySelector(
            ".bills-total"
        );


    if (!income) {

        addPaycheckSection.style.display =
            "block";


        console.log(
            "No income found."
        );


        return;
    }


    addPaycheckSection.style.display =
        "none";


    const payDate =
        parseDate(
            income.pay_date
        );


    const {
        periodStart,
        periodEnd
    } =
        getPayPeriod(
            payDate,
            income.frequency
        );


    const billOccurrences =
        getAllBillOccurrences(
            bills,
            periodStart,
            periodEnd
        );


    const {
        totalBills,
        remaining
    } =
        calculateRemaining(
            income.amount,
            billOccurrences
        );


    renderBills(
        bills,
        billOccurrences,
        periodStart,
        periodEnd
    );


    initializeBillNames();
    initializeBillAmounts();
    initializeBillDates();
    initializeBillFrequencies();
    initializeBillDeletes();
    initializeBillSelection();


    paycheckAmount.textContent =
        `$${Number(
            income.amount
        ).toFixed(2)}`;


    billsTotal.textContent =
        `$${totalBills.toFixed(2)}`;


    heroAmount.textContent =
        `$${remaining.toFixed(2)}`;


    payPeriod.textContent =
        `${formatDate(
            periodStart
        )} — ${formatDate(
            periodEnd
        )}`;


    console.log(
        "Dashboard loaded."
    );


    console.log(
        "Income:",
        income
    );


    console.log(
        "Bills:",
        bills
    );


    console.log(
        "Total bills:",
        totalBills
    );


    console.log(
        "Remaining:",
        remaining
    );


    if (selectedBillId) {

        const bill =
            document.querySelector(
                `.bill[data-bill-id="${selectedBillId}"]`
            );

        if (bill) {

            bill.classList.add(
                "selected"
            );
        }
    }
}

/* =========================================================
   ADD PAYCHECK
   ========================================================= */

async function saveIncome(form) {

    const formData =
        new FormData(form);


    const amount =
        formData.get("amount");


    const payDate =
        formData.get("pay_date");


    const frequency =
        formData.get("frequency");


    const response =
        await fetch(
            `${SUPABASE_URL}/rest/v1/income`,
            {
                method: "POST",

                headers: {
                    apikey: SUPABASE_KEY,

                    Authorization:
                        `Bearer ${SUPABASE_KEY}`,

                    "Content-Type":
                        "application/json",

                    Prefer:
                        "return=representation",
                },

                body: JSON.stringify({
                    amount: amount,
                    pay_date: payDate,
                    frequency: frequency,
                }),
            }
        );


    if (!response.ok) {

        console.error(
            "Failed to save income:",
            await response.text()
        );


        return null;
    }


    const savedIncome =
        await response.json();


    console.log(
        "Income saved:",
        savedIncome
    );


    return savedIncome[0];
}


const addIncomeForm =
    document.getElementById(
        "add-income-form"
    );


if (addIncomeForm) {

    addIncomeForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const savedIncome =
                await saveIncome(
                    addIncomeForm
                );


            if (savedIncome) {

                await loadDashboard();

                addIncomeForm.reset();
            }
        }
    );
}


/* =========================================================
   UPDATE PAYCHECK
   ========================================================= */

const paycheckCard =
    document.getElementById(
        "paycheck-card"
    );


const updatePayModal =
    document.getElementById(
        "update-pay-modal"
    );


const incomeForm =
    document.getElementById(
        "income-form"
    );


if (
    paycheckCard &&
    updatePayModal &&
    incomeForm
) {

    paycheckCard.addEventListener(
        "click",
        async function() {

            const income =
                await getIncome();


            if (!income) {
                return;
            }


            document.getElementById(
                "income-amount"
            ).value =
                income.amount;


            document.getElementById(
                "income-pay-date"
            ).value =
                income.pay_date;


            document.getElementById(
                "income-frequency"
            ).value =
                income.frequency;


            updatePayModal.classList.add(
                "show"
            );
        }
    );


    incomeForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const formData =
                new FormData(
                    incomeForm
                );


            const income =
                await getIncome();


            if (!income) {
                return;
            }


            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/income?id=eq.${income.id}`,
                    {
                        method: "PATCH",

                        headers: {
                            apikey:
                                SUPABASE_KEY,

                            Authorization:
                                `Bearer ${SUPABASE_KEY}`,

                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            amount:
                                formData.get(
                                    "amount"
                                ),

                            pay_date:
                                formData.get(
                                    "pay_date"
                                ),

                            frequency:
                                formData.get(
                                    "frequency"
                                ),
                        }),
                    }
                );


            if (!response.ok) {

                console.error(
                    "Failed to update income:",
                    await response.text()
                );


                return;
            }


            updatePayModal.classList.remove(
                "show"
            );


            await loadDashboard();
        }
    );
}

/* =========================================================
   BILL DISPLAY
   ========================================================= */

function getFrequencyLabel(frequency) {

    const labels = {
        one_time: "One time",
        weekly: "Weekly",
        biweekly: "Every 2 weeks",
        monthly: "Monthly",
        quarterly: "Every 3 months",
        yearly: "Yearly",
    };

    return labels[frequency] || frequency;
}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function createBillHtml(
    bill,
    occurrenceDates,
    periodStart,
    periodEnd
) {

    const billName =
        escapeHtml(bill.name);


    const amount =
        Number(bill.amount).toFixed(2);

    const billClass =
    occurrenceDates.length === 0
        ? "outside-period"
        : "";

    const dateText =
    occurrenceDates.length > 1
        ? `${occurrenceDates.length} payments this period`
        : `Due ${formatDate(
            parseDate(bill.due_date)
        )}`;

    return `
       <div
            class="bill ${billClass}"
            data-bill-id="${bill.id}"
        >

            <div class="bill-main">

                <div
                    class="bill-name"
                    data-bill-id="${bill.id}"
                >

                    <span class="bill-name-display">
                        ${billName}
                    </span>

                    <input
                        class="bill-name-input"
                        type="text"
                        value="${billName}"
                        maxlength="100"
                    >

                </div>


                <div class="bill-amount-area">

                    <div
                        class="bill-amount"
                        data-bill-id="${bill.id}"
                    >

                        <span class="bill-amount-display">
                            $${amount}
                        </span>

                        <input
                            class="bill-amount-input"
                            type="number"
                            step="0.01"
                            min="0"
                            value="${amount}"
                        >

                    </div>


                    <button
                        class="bill-delete"
                        type="button"
                        aria-label="Delete ${billName}"
                    >
                        ×
                    </button>

                </div>

            </div>


            <div class="bill-details">

                <div
                    class="bill-frequency"
                    data-bill-id="${bill.id}"
                >

                    <span class="bill-frequency-display">
                        ${getFrequencyLabel(
                            bill.frequency
                        )}
                    </span>

                    <select
                        class="bill-frequency-input"
                    >

                        <option
                            value="one_time"
                            ${bill.frequency === "one_time" ? "selected" : ""}
                        >
                            One time
                        </option>

                        <option
                            value="weekly"
                            ${bill.frequency === "weekly" ? "selected" : ""}
                        >
                            Weekly
                        </option>

                        <option
                            value="biweekly"
                            ${bill.frequency === "biweekly" ? "selected" : ""}
                        >
                            Every 2 weeks
                        </option>

                        <option
                            value="monthly"
                            ${bill.frequency === "monthly" ? "selected" : ""}
                        >
                            Monthly
                        </option>

                        <option
                            value="quarterly"
                            ${bill.frequency === "quarterly" ? "selected" : ""}
                        >
                            Every 3 months
                        </option>

                        <option
                            value="yearly"
                            ${bill.frequency === "yearly" ? "selected" : ""}
                        >
                            Yearly
                        </option>

                    </select>

                </div>

                <div
                    class="bill-date"
                    data-bill-id="${bill.id}"
                >

                    <span class="bill-date-display">
                        ${dateText}
                    </span>

                    <input
                        class="bill-date-input"
                        type="date"
                        value="${bill.due_date}"
                    >

                </div>


                

            </div>

        </div>
    `;
}


function renderBills(
    bills,
    billOccurrences,
    periodStart,
    periodEnd
) {

    const billsList =
        document.querySelector(
            ".bills-list"
        );


    if (!billsList) {
        return;
    }


    const occurrencesByBill =
        new Map();


    for (
        const occurrence
        of billOccurrences
    ) {

        if (
            !occurrencesByBill.has(
                occurrence.bill.id
            )
        ) {

            occurrencesByBill.set(
                occurrence.bill.id,
                []
            );
        }


        occurrencesByBill
            .get(
                occurrence.bill.id
            )
            .push(
                occurrence.occurrenceDate
            );
    }


    const currentBills =
        bills.filter(
            bill =>
                occurrencesByBill.has(
                    bill.id
                )
        );


    const upcomingBills =
        bills.filter(
            bill =>
                !occurrencesByBill.has(
                    bill.id
                )
        );


    let currentHtml = "";


    for (
        const bill
        of currentBills
    ) {

        currentHtml +=
            createBillHtml(
                bill,
                occurrencesByBill.get(
                    bill.id
                ),
                periodStart,
                periodEnd
            );
    }


    let upcomingHtml = "";


    for (
        const bill
        of upcomingBills
    ) {

        upcomingHtml +=
            createBillHtml(
                bill,
                [],
                periodStart,
                periodEnd
            );
    }


    if (
        currentHtml === "" &&
        upcomingHtml === ""
    ) {

        billsList.innerHTML = `
            <div class="bill-group" id="current-bills">
                ${currentHtml}
            </div>

            <div
                class="bill-group${upcomingBills.length ? " has-upcoming-bills" : ""}"
                id="upcoming-bills"
            >
                ${upcomingHtml}
            </div>
        `;

        return;
    }


    billsList.innerHTML = `
        <div class="bill-group" id="current-bills">
            ${currentHtml}
        </div>

        <div
            class="bill-group${upcomingBills.length ? " has-upcoming-bills" : ""}"
            id="upcoming-bills"
        >
            ${upcomingHtml}
        </div>
    `;

    new Sortable(
        document.getElementById("current-bills"),
        {
            animation: 150,
            onEnd: saveBillOrder
        }
    );

    new Sortable(
        document.getElementById("upcoming-bills"),
        {
            animation: 150,
            onEnd: saveBillOrder
        }
    );
}

async function saveBillOrder() {

    const billElements =
        document.querySelectorAll(
            ".bill"
        );

    for (
        let i = 0;
        i < billElements.length;
        i++
    ) {

        const billId =
            billElements[i].dataset.billId;

        await fetch(
            `${SUPABASE_URL}/rest/v1/bills?id=eq.${billId}`,
            {
                method: "PATCH",
                headers: {
                    apikey:
                        SUPABASE_KEY,
                    Authorization:
                        `Bearer ${SUPABASE_KEY}`,
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    sort_order: i
                }),
            }
        );
    }

    await loadDashboard();
}

/* =========================================================
   BILL SELECTION
   ========================================================= */

function selectBill(billElement) {

    document
        .querySelectorAll(".bill.selected")
        .forEach(bill => {

            const nameArea =
                bill.querySelector(".bill-name");

            if (nameArea) {
                nameArea.classList.remove("editing");
            }

            const deleteButton =
                bill.querySelector(".bill-delete");

            if (deleteButton) {
                deleteButton.textContent = "×";

                deleteButton.classList.remove(
                    "confirm-delete"
                );
            }

            bill.classList.remove("selected");
        });

    billElement.classList.add("selected");
}

function startBillNameEditing(
    billElement
) {

    const nameArea =
        billElement.querySelector(
            ".bill-name"
        );


    const nameDisplay =
        billElement.querySelector(
            ".bill-name-display"
        );


    const nameInput =
        billElement.querySelector(
            ".bill-name-input"
        );


    if (
        !nameArea ||
        !nameDisplay ||
        !nameInput
    ) {
        return;
    }


    nameInput.value =
        nameDisplay.textContent.trim();


    nameArea.classList.add(
        "editing"
    );


    nameInput.focus();

    nameInput.select();
}


function initializeBillNames() {

    document
        .querySelectorAll(".bill-name")
        .forEach(nameArea => {

            const display =
                nameArea.querySelector(
                    ".bill-name-display"
                );

            const input =
                nameArea.querySelector(
                    ".bill-name-input"
                );

            const bill =
                nameArea.closest(".bill");


            if (
                !display ||
                !input ||
                !bill
            ) {
                return;
            }


            display.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();

                    input.value =
                        display.textContent.trim();

                    nameArea.classList.add(
                        "editing"
                    );

                    input.focus();
                    input.select();
                }
            );


            input.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();
                }
            );


            input.addEventListener(
                "keydown",
                async function(event) {

                    if (event.key === "Escape") {

                        input.value =
                            display.textContent.trim();

                        nameArea.classList.remove(
                            "editing"
                        );

                        return;
                    }


                    if (event.key !== "Enter") {
                        return;
                    }


                    event.preventDefault();


                    const name =
                        input.value.trim() || "Untitled";


                    if (!name) {

                        return;
                    }


                    const response =
                        await fetch(
                            `${SUPABASE_URL}/rest/v1/bills?id=eq.${bill.dataset.billId}`,
                            {
                                method: "PATCH",

                                headers: {
                                    apikey:
                                        SUPABASE_KEY,

                                    Authorization:
                                        `Bearer ${SUPABASE_KEY}`,

                                    "Content-Type":
                                        "application/json",
                                },

                                body: JSON.stringify({
                                    name: name,
                                }),
                            }
                        );


                    if (!response.ok) {

                        console.error(
                            "Failed to update bill name:",
                            await response.text()
                        );

                        return;
                    }


                    display.textContent =
                        name;

                    input.value =
                        name;

                    nameArea.classList.remove(
                        "editing"
                    );
                }
            );

            input.addEventListener(
                "blur",
                async function() {

                    if (
                        !nameArea.classList.contains("editing")
                    ) {
                        return;
                    }

                    const name =
                        input.value.trim() || "Untitled";

                    const response =
                        await fetch(
                            `${SUPABASE_URL}/rest/v1/bills?id=eq.${bill.dataset.billId}`,
                            {
                                method: "PATCH",

                                headers: {
                                    apikey:
                                        SUPABASE_KEY,

                                    Authorization:
                                        `Bearer ${SUPABASE_KEY}`,

                                    "Content-Type":
                                        "application/json",
                                },

                                body: JSON.stringify({
                                    name: name,
                                }),
                            }
                        );

                    if (!response.ok) {

                        console.error(
                            "Failed to update bill name:",
                            await response.text()
                        );

                        return;
                    }

                    display.textContent =
                        name;

                    input.value =
                        name;

                    nameArea.classList.remove(
                        "editing"
                    );
                }
            );
        });
}

function initializeBillAmounts() {

    document
        .querySelectorAll(".bill-amount")
        .forEach(amountArea => {

            const display =
                amountArea.querySelector(
                    ".bill-amount-display"
                );

            const input =
                amountArea.querySelector(
                    ".bill-amount-input"
                );

            const bill =
                amountArea.closest(".bill");


            if (
                !display ||
                !input ||
                !bill
            ) {
                return;
            }


            display.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();

                    input.value =
                        Number(
                            display.textContent
                                .replace("$", "")
                        ).toFixed(2);

                    amountArea.classList.add(
                        "editing"
                    );

                    input.focus();
                    input.select();
                }
            );


            input.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();
                }
            );


            input.addEventListener(
                "keydown",
                async function(event) {

                    if (event.key === "Escape") {

                        input.value =
                            Number(
                                display.textContent
                                    .replace("$", "")
                            ).toFixed(2);

                        amountArea.classList.remove(
                            "editing"
                        );

                        return;
                    }


                    if (event.key !== "Enter") {
                        return;
                    }


                    event.preventDefault();


                    const amount =
                        Number(
                            input.value
                        );


                    if (
                        Number.isNaN(amount) ||
                        amount < 0
                    ) {
                        return;
                    }


                    const response =
                        await fetch(
                            `${SUPABASE_URL}/rest/v1/bills?id=eq.${bill.dataset.billId}`,
                            {
                                method: "PATCH",

                                headers: {
                                    apikey:
                                        SUPABASE_KEY,

                                    Authorization:
                                        `Bearer ${SUPABASE_KEY}`,

                                    "Content-Type":
                                        "application/json",
                                },

                                body: JSON.stringify({
                                    amount: amount,
                                }),
                            }
                        );


                    if (!response.ok) {

                        console.error(
                            "Failed to update bill amount:",
                            await response.text()
                        );

                        return;
                    }


                    display.textContent =
                        `$${amount.toFixed(2)}`;

                    input.value =
                        amount.toFixed(2);

                    amountArea.classList.remove(
                        "editing"
                    );


                    await loadDashboard();
                }
            );

            input.addEventListener(
                "blur",
                async function() {

                    if (
                        !amountArea.classList.contains("editing")
                    ) {
                        return;
                    }

                    const amount =
                        Number(input.value);

                    if (
                        Number.isNaN(amount) ||
                        amount < 0
                    ) {
                        return;
                    }

                    const response =
                        await fetch(
                            `${SUPABASE_URL}/rest/v1/bills?id=eq.${bill.dataset.billId}`,
                            {
                                method: "PATCH",

                                headers: {
                                    apikey:
                                        SUPABASE_KEY,

                                    Authorization:
                                        `Bearer ${SUPABASE_KEY}`,

                                    "Content-Type":
                                        "application/json",
                                },

                                body: JSON.stringify({
                                    amount: amount,
                                }),
                            }
                        );

                    if (!response.ok) {

                        console.error(
                            "Failed to update bill amount:",
                            await response.text()
                        );

                        return;
                    }

                    display.textContent =
                        `$${amount.toFixed(2)}`;

                    input.value =
                        amount.toFixed(2);

                    amountArea.classList.remove(
                        "editing"
                    );

                    await loadDashboard();
                }
            );
        });
}

function initializeBillDates() {
    document
        .querySelectorAll(".bill-date")
        .forEach(dateArea => {

            const display =
                dateArea.querySelector(
                    ".bill-date-display"
                );

            const input =
                dateArea.querySelector(
                    ".bill-date-input"
                );

            const bill =
                dateArea.closest(".bill");

            if (!display || !input || !bill) {
                return;
            }

            display.addEventListener(
                "click",
                function(event) {
                    event.stopPropagation();

                    selectBill(bill);

                    dateArea.classList.add(
                        "editing"
                    );

                    input.focus();
                }
            );

            input.addEventListener(
                "click",
                function(event) {
                    event.stopPropagation();
                }
            );

            input.addEventListener(
                "change",
                async function() {

                    const date =
                        input.value;

                    if (!date) {
                        return;
                    }

                    const response =
                        await fetch(
                            `${SUPABASE_URL}/rest/v1/bills?id=eq.${bill.dataset.billId}`,
                            {
                                method: "PATCH",
                                headers: {
                                    apikey:
                                        SUPABASE_KEY,
                                    Authorization:
                                        `Bearer ${SUPABASE_KEY}`,
                                    "Content-Type":
                                        "application/json",
                                },
                                body: JSON.stringify({
                                    due_date: date,
                                }),
                            }
                        );

                    if (!response.ok) {
                        console.error(
                            "Failed to update bill date:",
                            await response.text()
                        );
                        return;
                    }

                    dateArea.classList.remove(
                        "editing"
                    );

                    await loadDashboard();
                                    }
                                );

            input.addEventListener(
                "keydown",
                function(event) {

                    if (event.key === "Escape") {
                        dateArea.classList.remove(
                            "editing"
                        );
                    }

                }
            );

            input.addEventListener(
                "blur",
                function() {

                    dateArea.classList.remove(
                        "editing"
                    );

                }
            );
        });
}

function initializeBillFrequencies() {
    document
        .querySelectorAll(".bill-frequency")
        .forEach(frequencyArea => {

            const display =
                frequencyArea.querySelector(
                    ".bill-frequency-display"
                );

            const input =
                frequencyArea.querySelector(
                    ".bill-frequency-input"
                );

            const bill =
                frequencyArea.closest(".bill");

            if (!display || !input || !bill) {
                return;
            }

            display.addEventListener(
                "click",
                function(event) {
                    event.stopPropagation();

                    selectBill(bill);

                    frequencyArea.classList.add(
                        "editing"
                    );

                    input.focus();
                }
            );

            input.addEventListener(
                "click",
                function(event) {
                    event.stopPropagation();
                }
            );

            input.addEventListener(
                "change",
                async function() {

                    const frequency =
                        input.value;

                    const response =
                        await fetch(
                            `${SUPABASE_URL}/rest/v1/bills?id=eq.${bill.dataset.billId}`,
                            {
                                method: "PATCH",
                                headers: {
                                    apikey:
                                        SUPABASE_KEY,
                                    Authorization:
                                        `Bearer ${SUPABASE_KEY}`,
                                    "Content-Type":
                                        "application/json",
                                },
                                body: JSON.stringify({
                                    frequency: frequency,
                                }),
                            }
                        );

                    if (!response.ok) {
                        console.error(
                            "Failed to update bill frequency:",
                            await response.text()
                        );
                        return;
                    }

                    frequencyArea.classList.remove(
                        "editing"
                    );

                    await loadDashboard();
                }
            );

            input.addEventListener(
                "blur",
                function() {
                    frequencyArea.classList.remove(
                        "editing"
                    );
                }
            );
        });
}

function initializeBillDeletes() {

    document
        .querySelectorAll(".bill-delete")
        .forEach(button => {

            button.addEventListener(
                "click",
                async function(event) {

                    event.stopPropagation();

                    const bill =
                        button.closest(".bill");

                    if (!bill) {
                        return;
                    }

                    if (
                        button.classList.contains(
                            "confirm-delete"
                        )
                    ) {

                        const billId =
                            bill.dataset.billId;

                        const response =
                            await fetch(
                                `${SUPABASE_URL}/rest/v1/bills?id=eq.${billId}`,
                                {
                                    method: "DELETE",

                                    headers: {
                                        apikey:
                                            SUPABASE_KEY,

                                        Authorization:
                                            `Bearer ${SUPABASE_KEY}`,
                                    },
                                }
                            );

                        if (!response.ok) {

                            console.error(
                                "Failed to delete bill:",
                                await response.text()
                            );

                            return;
                        }

                        await loadDashboard();

                        return;
                    }

                    button.textContent = "✓";

                    button.classList.add(
                        "confirm-delete"
                    );
                }
            );
        });
}

function initializeBillSelection() {

    document
        .querySelectorAll(".bill")
        .forEach(bill => {

            bill.addEventListener(
                "click",
                function() {

                    if (
                        bill.classList.contains("selected")
                    ) {
                        bill.classList.remove("selected");
                    }
                    else {
                        selectBill(bill);
                    }

                }
            );

        });
}

/* =========================================================
   ADD BILL
   ========================================================= */

async function addBill() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const bills =
        await getBills();


    const sortOrders =
        bills.map(
            bill =>
                Number(
                    bill.sort_order
                )
        );


    const nextSortOrder =
        sortOrders.length
            ? Math.max(
                ...sortOrders
            ) + 1
            : 0;


    const response =
        await fetch(
            `${SUPABASE_URL}/rest/v1/bills`,
            {
                method: "POST",

                headers: {
                    apikey:
                        SUPABASE_KEY,

                    Authorization:
                        `Bearer ${SUPABASE_KEY}`,

                    "Content-Type":
                        "application/json",

                    Prefer:
                        "return=representation",
                },

                body: JSON.stringify({
                    name: "Untitled",
                    amount: 0,
                    due_date: today,
                    sort_order:
                        nextSortOrder,
                    frequency:
                        "one_time",
                }),
            }
        );


    if (!response.ok) {

        console.error(
            "Failed to add bill:",
            await response.text()
        );


        return null;
    }


    const savedBill =
        await response.json();


    console.log(
        "Bill created:",
        savedBill
    );


    await loadDashboard();


    const newBill =
        savedBill[0];


    const newBillElement =
        document.querySelector(
            `.bill[data-bill-id="${newBill.id}"]`
        );


    if (newBillElement) {

        selectBill(
            newBillElement
        );

        startBillNameEditing(
            newBillElement
        );
    }


    return newBill;
}


/* =========================================================
   BILLS CARD
   ========================================================= */


/* =========================================================
   BILLS CARD
   ========================================================= */

const billsCard =
    document.getElementById(
        "bills-card"
    );


if (billsCard) {

    billsCard.addEventListener(
        "click",
        async function() {

            await addBill();

        }
    );
}


/* =========================================================
   INITIAL LOAD
   ========================================================= */

loadDashboard();
