const allocationUnallocated =
    document.getElementById(
        "allocation-unallocated"
    );

const billsCard =
    document.getElementById("bills-card");

const billsView =
    document.getElementById("bills-view");

const allocationView =
    document.getElementById("allocation-view");

const updatePayButton =
    document.getElementById("update-pay-button");

const paycheckCard =
    document.getElementById("paycheck-card");

const updatePayForm =
    document.getElementById("update-pay-form");

const updatePayModal =
    document.getElementById("update-pay-modal");


// ----------------------------------------
// Show Update Paycheck form
// ----------------------------------------

if (updatePayModal) {

    function openUpdatePaycheck() {

        updatePayModal.classList.add("show");

    }


    if (updatePayButton) {

        updatePayButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                openUpdatePaycheck();

            }
        );

    }

}


// ----------------------------------------
// Initialize bill editing
// ----------------------------------------

function initializeBillEditing() {

    initializeBillSelection();

    initializeBillDeletion();

    initializeBillAmounts();

    initializeBillDates();

    initializeBillFrequencies();

    initializeBillNames();

}


// ----------------------------------------
// Bill selection
// ----------------------------------------

function initializeBillSelection() {

    const bills =
        document.querySelectorAll(".bill");


    bills.forEach(function (bill) {

        bill.addEventListener(
            "click",
            function (event) {

                if (
                    event.target.closest(".bill-delete") ||
                    event.target.closest(".bill-name-input") ||
                    event.target.closest(".bill-amount-input") ||
                    event.target.closest(".bill-date-input") ||
                    event.target.closest(".bill-frequency-input")
                ) {
                    return;
                }


                if (bill.classList.contains("selected")) {

                    bill.classList.remove(
                        "selected"
                    );


                    resetBillDeleteButton(
                        bill
                    );

                    return;

                }


                document
                    .querySelectorAll(".bill.selected")
                    .forEach(function (selectedBill) {

                        selectedBill.classList.remove(
                            "selected"
                        );

                        resetBillDeleteButton(
                            selectedBill
                        );

                    });


                bill.classList.add("selected");

            }
        );

    });

}


// ----------------------------------------
// Reset bill delete button
// ----------------------------------------

function resetBillDeleteButton(bill) {

    const button =
        bill.querySelector(".bill-delete");


    if (!button) {
        return;
    }


    button.classList.remove(
        "delete-confirm"
    );

    button.textContent = "×";

}


// ----------------------------------------
// Bill deletion
// ----------------------------------------

function initializeBillDeletion() {

    const deleteButtons =
        document.querySelectorAll(".bill-delete");


    deleteButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                const bill =
                    button.closest(".bill");


                if (!bill) {
                    return;
                }


                if (
                    !button.classList.contains(
                        "delete-confirm"
                    )
                ) {

                    document
                        .querySelectorAll(
                            ".bill-delete.delete-confirm"
                        )
                        .forEach(
                            function (otherButton) {

                                otherButton.classList.remove(
                                    "delete-confirm"
                                );

                                otherButton.textContent =
                                    "×";

                            }
                        );


                    button.classList.add(
                        "delete-confirm"
                    );

                    button.textContent = "✓";

                    return;

                }


                const billId =
                    bill.dataset.billId;


                fetch(
                    `/bill/${billId}/delete/`,
                    {

                        method: "POST",

                        headers: {
                            "X-CSRFToken":
                                getCookie(
                                    "csrftoken"
                                ),

                            "X-Requested-With":
                                "XMLHttpRequest",
                        },

                    }
                )
                    .then(function (response) {

                        return response.json();

                    })
                    .then(function (data) {

                        if (data.success) {

                            updateDashboard(
                                data
                            );

                        }

                    });

            }
        );

    });

}


// ----------------------------------------
// Show Bills view
// ----------------------------------------

function showBillsView() {

    billsView.classList.add("active");

    allocationView.classList.remove(
        "active"
    );

    billsCard.classList.add("active");

    paycheckCard.classList.remove(
        "active"
    );


    localStorage.setItem(
        "billio-dashboard-view",
        "bills"
    );

}


// ----------------------------------------
// Show Allocation view
// ----------------------------------------

function showAllocationView() {

    billsView.classList.remove("active");

    allocationView.classList.add(
        "active"
    );

    billsCard.classList.remove(
        "active"
    );

    paycheckCard.classList.add(
        "active"
    );


    localStorage.setItem(
        "billio-dashboard-view",
        "allocation"
    );

}


// ----------------------------------------
// Bills / Allocation card behavior
// ----------------------------------------

if (billsCard) {

    billsCard.addEventListener(
        "click",
        function () {

            if (
                allocationView.classList.contains(
                    "active"
                )
            ) {

                showBillsView();

                return;

            }


            fetch(
                "/bill/add/",
                {

                    method: "POST",

                    headers: {
                        "X-CSRFToken":
                            getCookie(
                                "csrftoken"
                            ),

                        "X-Requested-With":
                            "XMLHttpRequest",
                    },

                }
            )
                .then(function (response) {

                    return response.json();

                })
                .then(function (data) {

                    if (!data.success) {
                        return;
                    }

                    updateDashboard(
                        data
                    );

                });

        }
    );

}


if (paycheckCard) {

    paycheckCard.addEventListener(
        "click",
        function () {

            if (
                billsView.classList.contains(
                    "active"
                )
            ) {

                showAllocationView();

                return;

            }


            fetch(
                "/allocation/add/",
                {

                    method: "POST",

                    headers: {
                        "X-CSRFToken":
                            getCookie(
                                "csrftoken"
                            ),

                        "X-Requested-With":
                            "XMLHttpRequest",
                    },

                }
            )
                .then(function (response) {

                    return response.json();

                })
                .then(function (data) {

                    if (!data.success) {
                        return;
                    }

                    updateDashboard(
                        data
                    );

                });

        }
    );

}


// ----------------------------------------
// Bill amount editing
// ----------------------------------------

function initializeBillAmounts() {

    const billAmounts =
        document.querySelectorAll(
            ".bill-amount"
        );


    billAmounts.forEach(function (billAmount) {

        const display =
            billAmount.querySelector(
                ".bill-amount-display"
            );

        const input =
            billAmount.querySelector(
                ".bill-amount-input"
            );

        const bill =
            billAmount.closest(".bill");


        if (
            !display ||
            !input ||
            !bill
        ) {
            return;
        }


        let saving = false;


        display.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                selectBill(
                    bill
                );

                billAmount.classList.add(
                    "editing"
                );

                input.focus();

                input.select();

            }
        );


        input.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    saveBillAmount();

                }


                if (event.key === "Escape") {

                    event.preventDefault();

                    input.value =
                        input.defaultValue;

                    billAmount.classList.remove(
                        "editing"
                    );

                }

            }
        );


        input.addEventListener(
            "blur",
            function () {

                if (saving) {
                    return;
                }

                saveBillAmount();

            }
        );


        function saveBillAmount() {

            if (saving) {
                return;
            }


            const amount =
                input.value.trim();


            if (!amount) {

                input.value =
                    input.defaultValue;

                billAmount.classList.remove(
                    "editing"
                );

                return;

            }


            const billId =
                bill.dataset.billId;


            saving = true;


            fetch(
                `/bill/${billId}/amount/`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",

                        "X-CSRFToken":
                            getCookie(
                                "csrftoken"
                            ),

                        "X-Requested-With":
                            "XMLHttpRequest",
                    },

                    body:
                        `amount=${encodeURIComponent(
                            amount
                        )}`

                }
            )
                .then(function (response) {

                    return response.json();

                })
                .then(function (data) {

                    if (data.success) {

                        updateDashboard(
                            data
                        );

                    }

                })
                .finally(function () {

                    saving = false;

                });

        }

    });

}


// ----------------------------------------
// Bill due date editing
// ----------------------------------------

function initializeBillDates() {

    const billDates =
        document.querySelectorAll(
            ".bill-date"
        );


    billDates.forEach(function (billDate) {

        const display =
            billDate.querySelector(
                ".bill-date-display"
            );

        const input =
            billDate.querySelector(
                ".bill-date-input"
            );

        const bill =
            billDate.closest(".bill");


        if (
            !display ||
            !input ||
            !bill
        ) {
            return;
        }


        let saving = false;


        display.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                selectBill(
                    bill
                );

                billDate.classList.add(
                    "editing"
                );

                input.focus();


                if (input.showPicker) {

                    input.showPicker();

                }

            }
        );


        input.addEventListener(
            "change",
            function () {

                saveBillDate();

            }
        );


        input.addEventListener(
            "blur",
            function () {

                billDate.classList.remove(
                    "editing"
                );

            }
        );


        function saveBillDate() {

            if (saving) {
                return;
            }


            const date =
                input.value;


            if (!date) {
                return;
            }


            const billId =
                bill.dataset.billId;


            saving = true;


            fetch(
                `/bill/${billId}/date/`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",

                        "X-CSRFToken":
                            getCookie(
                                "csrftoken"
                            ),

                        "X-Requested-With":
                            "XMLHttpRequest",
                    },

                    body:
                        `due_date=${encodeURIComponent(
                            date
                        )}`

                }
            )
                .then(function (response) {

                    return response.json();

                })
                .then(function (data) {

                    if (data.success) {

                        updateDashboard(
                            data
                        );

                    }

                })
                .finally(function () {

                    saving = false;

                });

        }

    });

}


// ----------------------------------------
// Bill frequency editing
// ----------------------------------------

function initializeBillFrequencies() {

    const billFrequencies =
        document.querySelectorAll(
            ".bill-frequency"
        );


    billFrequencies.forEach(
        function (billFrequency) {

            const display =
                billFrequency.querySelector(
                    ".bill-frequency-display"
                );

            const input =
                billFrequency.querySelector(
                    ".bill-frequency-input"
                );

            const bill =
                billFrequency.closest(
                    ".bill"
                );


            if (
                !display ||
                !input ||
                !bill
            ) {
                return;
            }


            let saving = false;


            display.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    selectBill(
                        bill
                    );

                    billFrequency.classList.add(
                        "editing"
                    );

                    input.focus();

                }
            );


            input.addEventListener(
                "change",
                function () {

                    saveBillFrequency();

                }
            );


            input.addEventListener(
                "blur",
                function () {

                    billFrequency.classList.remove(
                        "editing"
                    );

                }
            );


            function saveBillFrequency() {

                if (saving) {
                    return;
                }


                const frequency =
                    input.value;


                if (!frequency) {
                    return;
                }


                const billId =
                    bill.dataset.billId;


                saving = true;


                fetch(
                    `/bill/${billId}/frequency/`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded",

                            "X-CSRFToken":
                                getCookie(
                                    "csrftoken"
                                ),

                            "X-Requested-With":
                                "XMLHttpRequest",
                        },

                        body:
                            `frequency=${encodeURIComponent(
                                frequency
                            )}`

                    }
                )
                    .then(function (response) {

                        return response.json();

                    })
                    .then(function (data) {

                        if (data.success) {

                            updateDashboard(
                                data
                            );

                        }

                    })
                    .finally(function () {

                        saving = false;

                    });

            }

        }
    );

}


// ----------------------------------------
// Bill name editing
// ----------------------------------------

function initializeBillNames() {

    const billNames =
        document.querySelectorAll(
            ".bill-name"
        );


    billNames.forEach(function (billName) {

        const display =
            billName.querySelector(
                ".bill-name-display"
            );

        const input =
            billName.querySelector(
                ".bill-name-input"
            );

        const bill =
            billName.closest(".bill");


        if (
            !display ||
            !input ||
            !bill
        ) {
            return;
        }


        let saving = false;


        display.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                selectBill(
                    bill
                );

                billName.classList.add(
                    "editing"
                );

                input.focus();

                input.select();

                resizeNameInput();

            }
        );


        input.addEventListener(
            "input",
            function () {

                resizeNameInput();

            }
        );


        input.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    saveBillName();

                }


                if (event.key === "Escape") {

                    event.preventDefault();

                    input.value =
                        input.defaultValue;

                    billName.classList.remove(
                        "editing"
                    );

                }

            }
        );


        input.addEventListener(
            "blur",
            function () {

                if (saving) {
                    return;
                }

                saveBillName();

            }
        );


        function resizeNameInput() {

            const textLength =
                Math.max(
                    input.value.length,
                    1
                );


            input.style.width =
                `${textLength}ch`;

        }


        function saveBillName() {

            if (saving) {
                return;
            }


            const name =
                input.value.trim();


            if (!name) {

                input.value =
                    input.defaultValue;

                billName.classList.remove(
                    "editing"
                );

                return;

            }


            const billId =
                bill.dataset.billId;


            saving = true;


            fetch(
                `/bill/${billId}/name/`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",

                        "X-CSRFToken":
                            getCookie(
                                "csrftoken"
                            ),

                        "X-Requested-With":
                            "XMLHttpRequest",
                    },

                    body:
                        `name=${encodeURIComponent(
                            name
                        )}`

                }
            )
                .then(function (response) {

                    return response.json();

                })
                .then(function (data) {

                    if (data.success) {

                        display.textContent =
                            name;

                        input.defaultValue =
                            name;

                        billName.classList.remove(
                            "editing"
                        );

                    }

                })
                .finally(function () {

                    saving = false;

                });

        }

    });

}


// ----------------------------------------
// Select a bill
// ----------------------------------------

function selectBill(bill) {

    if (!bill) {
        return;
    }


    document
        .querySelectorAll(".bill.selected")
        .forEach(function (selectedBill) {

            if (selectedBill !== bill) {

                selectedBill.classList.remove(
                    "selected"
                );

                resetBillDeleteButton(
                    selectedBill
                );

            }

        });


    bill.classList.add(
        "selected"
    );

}


// ----------------------------------------
// Update dashboard
// ----------------------------------------

function updateDashboard(data) {

    if (
        !data ||
        !data.success
    ) {
        return;
    }


    // ----------------------------------------
    // Remember selected bill
    // ----------------------------------------

    const selectedBill =
        document.querySelector(
            ".bill.selected"
        );


    const selectedBillId =
        selectedBill
            ? selectedBill.dataset.billId
            : null;


    // ----------------------------------------
    // Remember selected allocation
    // ----------------------------------------

    const selectedAllocation =
        document.querySelector(
            ".allocation.selected"
        );


    const selectedAllocationId =
        selectedAllocation
            ? selectedAllocation.dataset.allocationId
            : null;


    // ----------------------------------------
    // Update remaining amount
    // ----------------------------------------

    const remainingAmount =
        document.querySelector(
            ".hero-amount"
        );


    if (remainingAmount) {

        const remaining =
            parseFloat(
                data.remaining
            );


        if (
            !Number.isNaN(
                remaining
            )
        ) {

            remainingAmount.textContent =
                `$${remaining.toFixed(2)}`;

        }

    }


    // ----------------------------------------
    // Update total bills
    // ----------------------------------------

    const totalBills =
        document.querySelector(
            ".bills-total"
        );


    if (totalBills) {

        const total =
            parseFloat(
                data.total_bills
            );


        if (
            !Number.isNaN(
                total
            )
        ) {

            totalBills.textContent =
                `$${total.toFixed(2)}`;

        }

    }


    // ----------------------------------------
    // Replace bill list
    // ----------------------------------------

    const billsList =
        document.querySelector(
            ".bills-list"
        );


    if (billsList) {

        billsList.innerHTML =
            data.bills_html || "";


        initializeBillEditing();

        initializeBillSorting();

    }


    // ----------------------------------------
    // Replace allocation list
    // ----------------------------------------

    const allocationList =
        document.querySelector(
            ".allocation-list-container"
        );


    if (
        allocationList &&
        typeof data.allocations_html !==
            "undefined"
    ) {

        allocationList.innerHTML =
            data.allocations_html || "";


        initializeAllocationEditing();

        initializeAllocationSorting();

    }


    // ----------------------------------------
    // Restore selected bill
    // ----------------------------------------

    if (selectedBillId) {

        const updatedBill =
            document.querySelector(
                `.bill[data-bill-id="${selectedBillId}"]`
            );


        if (updatedBill) {

            updatedBill.classList.add(
                "selected"
            );

        }

    }


    // ----------------------------------------
    // Restore selected allocation
    // ----------------------------------------

    if (selectedAllocationId) {

        const updatedAllocation =
            document.querySelector(
                `.allocation[data-allocation-id="${selectedAllocationId}"]`
            );


        if (updatedAllocation) {

            updatedAllocation.classList.add(
                "selected"
            );

        }

    }


    // ----------------------------------------
    // New bill creation flow
    // ----------------------------------------

    if (data.new_bill_id) {

        const newBill =
            document.querySelector(
                `.bill[data-bill-id="${data.new_bill_id}"]`
            );


        if (!newBill) {
            return;
        }


        newBill.classList.add(
            "selected"
        );


        const nameElement =
            newBill.querySelector(
                ".bill-name"
            );


        const nameInput =
            newBill.querySelector(
                ".bill-name-input"
            );


        if (
            !nameElement ||
            !nameInput
        ) {
            return;
        }


        nameElement.classList.add(
            "editing"
        );


        nameInput.focus();

        nameInput.select();


        // ----------------------------------------
        // New bill: Name → Amount
        // ----------------------------------------

        nameInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key !== "Enter") {
                    return;
                }


                event.preventDefault();

                event.stopPropagation();


                const name =
                    nameInput.value.trim();


                if (!name) {
                    return;
                }


                nameInput.dataset.creationCompleted =
                    "true";


                const billId =
                    newBill.dataset.billId;


                fetch(
                    `/bill/${billId}/name/`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded",

                            "X-CSRFToken":
                                getCookie(
                                    "csrftoken"
                                ),

                            "X-Requested-With":
                                "XMLHttpRequest",
                        },

                        body:
                            `name=${encodeURIComponent(
                                name
                            )}`

                    }
                )
                    .then(function (response) {

                        return response.json();

                    })
                    .then(function (saveData) {

                        if (
                            !saveData.success
                        ) {
                            return;
                        }


                        updateDashboard(
                            saveData
                        );


                        const updatedBill =
                            document.querySelector(
                                `.bill[data-bill-id="${billId}"]`
                            );


                        if (!updatedBill) {
                            return;
                        }


                        updatedBill.classList.add(
                            "selected"
                        );


                        const amountElement =
                            updatedBill.querySelector(
                                ".bill-amount"
                            );


                        const amountInput =
                            updatedBill.querySelector(
                                ".bill-amount-input"
                            );


                        if (
                            amountElement &&
                            amountInput
                        ) {

                            amountElement.classList.add(
                                "editing"
                            );


                            amountInput.focus();

                            amountInput.select();


                            initializeCreationAmountFlow(
                                updatedBill,
                                amountInput
                            );

                        }

                    });

            }
        );


        // ----------------------------------------
        // New bill: Empty name → Untitled
        // ----------------------------------------

        nameInput.addEventListener(
            "blur",
            function () {

                if (
                    nameInput.dataset.creationCompleted ===
                    "true"
                ) {
                    return;
                }


                const name =
                    nameInput.value.trim();


                if (!name) {

                    const billId =
                        newBill.dataset.billId;


                    nameInput.value =
                        "Untitled";

                    nameInput.defaultValue =
                        "Untitled";


                    nameElement.classList.remove(
                        "editing"
                    );


                    const display =
                        newBill.querySelector(
                            ".bill-name-display"
                        );


                    if (display) {

                        display.textContent =
                            "Untitled";

                    }


                    fetch(
                        `/bill/${billId}/name/`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/x-www-form-urlencoded",

                                "X-CSRFToken":
                                    getCookie(
                                        "csrftoken"
                                    ),

                                "X-Requested-With":
                                    "XMLHttpRequest",
                            },

                            body:
                                `name=${encodeURIComponent(
                                    "Untitled"
                                )}`

                        }
                    );

                }

            }
        );

    }

}


// ----------------------------------------
// Creation: Amount → Date
// ----------------------------------------

function initializeCreationAmountFlow(
    bill,
    amountInput
) {

    if (
        amountInput.dataset.creationFlowInitialized ===
        "true"
    ) {
        return;
    }


    amountInput.dataset.creationFlowInitialized =
        "true";


    amountInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Enter") {
                return;
            }


            event.preventDefault();

            event.stopPropagation();


            const amount =
                amountInput.value.trim();


            if (!amount) {
                return;
            }


            const billId =
                bill.dataset.billId;


            fetch(
                `/bill/${billId}/amount/`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",

                        "X-CSRFToken":
                            getCookie(
                                "csrftoken"
                            ),

                        "X-Requested-With":
                            "XMLHttpRequest",
                    },

                    body:
                        `amount=${encodeURIComponent(
                            amount
                        )}`

                }
            )
                .then(function (response) {

                    return response.json();

                })
                .then(function (saveData) {

                    if (
                        !saveData.success
                    ) {
                        return;
                    }


                    updateDashboard(
                        saveData
                    );


                    const updatedBill =
                        document.querySelector(
                            `.bill[data-bill-id="${billId}"]`
                        );


                    if (!updatedBill) {
                        return;
                    }


                    updatedBill.classList.add(
                        "selected"
                    );


                    const dateElement =
                        updatedBill.querySelector(
                            ".bill-date"
                        );


                    const dateInput =
                        updatedBill.querySelector(
                            ".bill-date-input"
                        );


                    if (
                        !dateElement ||
                        !dateInput
                    ) {
                        return;
                    }


                    dateElement.classList.add(
                        "editing"
                    );


                    initializeCreationDateFlow(
                        updatedBill,
                        dateInput
                    );


                    dateInput.focus();


                    if (dateInput.showPicker) {

                        dateInput.showPicker();

                    }

                });

        }
    );

}


// ----------------------------------------
// Creation: Date → Frequency
// ----------------------------------------

function initializeCreationDateFlow(
    bill,
    dateInput
) {

    if (
        dateInput.dataset.creationFlowInitialized ===
        "true"
    ) {
        return;
    }


    dateInput.dataset.creationFlowInitialized =
        "true";


    dateInput.addEventListener(
        "change",
        function () {

            const date =
                dateInput.value;


            if (!date) {
                return;
            }


            const billId =
                bill.dataset.billId;


            fetch(
                `/bill/${billId}/date/`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",

                        "X-CSRFToken":
                            getCookie(
                                "csrftoken"
                            ),

                        "X-Requested-With":
                            "XMLHttpRequest",
                    },

                    body:
                        `due_date=${encodeURIComponent(
                            date
                        )}`

                }
            )
                .then(function (response) {

                    return response.json();

                })
                .then(function (saveData) {

                    if (
                        !saveData.success
                    ) {
                        return;
                    }


                    updateDashboard(
                        saveData
                    );


                    const updatedBill =
                        document.querySelector(
                            `.bill[data-bill-id="${billId}"]`
                        );


                    if (!updatedBill) {
                        return;
                    }


                    updatedBill.classList.add(
                        "selected"
                    );


                    const frequencyElement =
                        updatedBill.querySelector(
                            ".bill-frequency"
                        );


                    const frequencyInput =
                        updatedBill.querySelector(
                            ".bill-frequency-input"
                        );


                    if (
                        !frequencyElement ||
                        !frequencyInput
                    ) {
                        return;
                    }


                    initializeCreationFrequencyFlow(
                        updatedBill,
                        frequencyInput
                    );


                    frequencyElement.classList.add(
                        "editing"
                    );


                    frequencyInput.focus();

                });

        }
    );

}


// ----------------------------------------
// Creation: Frequency → Finish
// ----------------------------------------

function initializeCreationFrequencyFlow(
    bill,
    frequencyInput
) {

    if (
        frequencyInput.dataset.creationFlowInitialized ===
        "true"
    ) {
        return;
    }


    frequencyInput.dataset.creationFlowInitialized =
        "true";


    frequencyInput.addEventListener(
        "change",
        function () {

            const frequency =
                frequencyInput.value;


            if (!frequency) {
                return;
            }


            const billId =
                bill.dataset.billId;


            fetch(
                `/bill/${billId}/frequency/`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",

                        "X-CSRFToken":
                            getCookie(
                                "csrftoken"
                            ),

                        "X-Requested-With":
                            "XMLHttpRequest",
                    },

                    body:
                        `frequency=${encodeURIComponent(
                            frequency
                        )}`

                }
            )
                .then(function (response) {

                    return response.json();

                })
                .then(function (saveData) {

                    if (
                        !saveData.success
                    ) {
                        return;
                    }


                    updateDashboard(
                        saveData
                    );


                    const finishedBill =
                        document.querySelector(
                            `.bill[data-bill-id="${billId}"]`
                        );


                    if (finishedBill) {

                        finishedBill.classList.add(
                            "selected"
                        );

                    }

                });

        }
    );

}


// ----------------------------------------
// Get Django CSRF cookie
// ----------------------------------------

function getCookie(name) {

    const cookies =
        document.cookie.split(";");


    for (
        let cookie of cookies
    ) {

        cookie = cookie.trim();


        if (
            cookie.startsWith(
                name + "="
            )
        ) {

            return decodeURIComponent(
                cookie.substring(
                    name.length + 1
                )
            );

        }

    }


    return null;

}


// ----------------------------------------
// Bill drag-and-drop ordering
// ----------------------------------------

function initializeBillSorting() {

    const currentBills =
        document.getElementById(
            "current-bills"
        );

    const upcomingBills =
        document.getElementById(
            "upcoming-bills"
        );


    if (currentBills) {

        new Sortable(
            currentBills,
            {

                animation: 200,

                delay: 200,

                draggable: ".bill",

                forceFallback: true,

                group: {
                    name: "current-bills",
                    pull: false,
                    put: false,
                },


                onEnd: function () {

                    saveBillOrder(
                        currentBills
                    );

                },

            }
        );

    }


    if (upcomingBills) {

        new Sortable(
            upcomingBills,
            {

                animation: 200,

                delay: 200,

                draggable: ".bill",

                forceFallback: true,

                group: {
                    name: "upcoming-bills",
                    pull: false,
                    put: false,
                },


                onEnd: function () {

                    saveBillOrder(
                        upcomingBills
                    );

                },

            }
        );

    }

}


// ----------------------------------------
// Save bill order
// ----------------------------------------

function saveBillOrder(container) {

    const billIds =
        Array.from(
            container.querySelectorAll(
                ".bill"
            )
        ).map(function (bill) {

            return bill.dataset.billId;

        });


    fetch(
        "/bill/reorder/",
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",

                "X-CSRFToken":
                    getCookie(
                        "csrftoken"
                    ),

            },

            body: JSON.stringify({

                bill_ids:
                    billIds,

            }),

        }
    )
        .catch(function (error) {

            console.error(
                "Reorder failed:",
                error
            );

        });

}


// ----------------------------------------
// Allocation editing
// ----------------------------------------

function initializeAllocationEditing() {

    initializeAllocationDeletion();


    const allocations =
        document.querySelectorAll(
            ".allocation"
        );


    allocations.forEach(
        function (allocation) {

            const nameDisplay =
                allocation.querySelector(
                    ".allocation-name-display"
                );

            const nameInput =
                allocation.querySelector(
                    ".allocation-name-input"
                );

            const amountDisplay =
                allocation.querySelector(
                    ".allocation-amount-display"
                );

            const amountInput =
                allocation.querySelector(
                    ".allocation-amount-input"
                );


            if (
                !nameDisplay ||
                !nameInput ||
                !amountDisplay ||
                !amountInput
            ) {
                return;
            }


            let savingName = false;

            let savingAmount = false;


            // ----------------------------------------
            // Select allocation
            // ----------------------------------------

            allocation.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target.closest(
                            ".allocation-delete"
                        ) ||
                        event.target.closest(
                            ".allocation-name-input"
                        ) ||
                        event.target.closest(
                            ".allocation-amount-input"
                        )
                    ) {
                        return;
                    }


                    if (
                        allocation.classList.contains(
                            "selected"
                        )
                    ) {

                        allocation.classList.remove(
                            "selected"
                        );

                        allocation.classList.remove(
                            "editing-name"
                        );

                        allocation.classList.remove(
                            "editing-amount"
                        );


                        resetAllocationDeleteButton(
                            allocation
                        );


                        return;

                    }


                    document
                        .querySelectorAll(
                            ".allocation.selected"
                        )
                        .forEach(
                            function (
                                otherAllocation
                            ) {

                                if (
                                    otherAllocation !==
                                    allocation
                                ) {

                                    otherAllocation.classList.remove(
                                        "selected"
                                    );

                                    otherAllocation.classList.remove(
                                        "editing-name"
                                    );

                                    otherAllocation.classList.remove(
                                        "editing-amount"
                                    );


                                    resetAllocationDeleteButton(
                                        otherAllocation
                                    );

                                }

                            }
                        );


                    allocation.classList.add(
                        "selected"
                    );

                }
            );


            // ----------------------------------------
            // Edit name
            // ----------------------------------------

            nameDisplay.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    selectAllocation(
                        allocation
                    );


                    allocation.classList.add(
                        "editing-name"
                    );


                    nameInput.focus();

                    nameInput.select();

                }
            );


            // ----------------------------------------
            // Save name
            // ----------------------------------------

            nameInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key !==
                        "Enter"
                    ) {
                        return;
                    }


                    event.preventDefault();

                    event.stopPropagation();


                    saveAllocationName();

                }
            );


            nameInput.addEventListener(
                "blur",
                function () {

                    if (
                        savingName
                    ) {
                        return;
                    }


                    if (
                        allocation.classList.contains(
                            "editing-name"
                        )
                    ) {

                        saveAllocationName();

                    }

                }
            );


            function saveAllocationName() {

                if (savingName) {
                    return;
                }


                const name =
                    nameInput.value.trim();


                if (!name) {
                    return;
                }


                const allocationId =
                    allocation.dataset.allocationId;


                savingName = true;


                fetch(
                    `/allocation/${allocationId}/name/`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded",

                            "X-CSRFToken":
                                getCookie(
                                    "csrftoken"
                                ),

                            "X-Requested-With":
                                "XMLHttpRequest",
                        },

                        body:
                            `name=${encodeURIComponent(
                                name
                            )}`,

                    }
                )
                    .then(function (response) {

                        return response.json();

                    })
                    .then(function (data) {

                        if (
                            data.success
                        ) {

                            updateDashboard(
                                data
                            );

                        }

                    })
                    .finally(function () {

                        savingName = false;

                    });

            }


            // ----------------------------------------
            // Cancel name editing
            // ----------------------------------------

            nameInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key !==
                        "Escape"
                    ) {
                        return;
                    }


                    event.preventDefault();


                    nameInput.value =
                        nameInput.defaultValue;


                    allocation.classList.remove(
                        "editing-name"
                    );

                }
            );


            // ----------------------------------------
            // Edit amount
            // ----------------------------------------

            amountDisplay.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    selectAllocation(
                        allocation
                    );


                    allocation.classList.add(
                        "editing-amount"
                    );


                    amountInput.focus();

                    amountInput.select();

                }
            );


            // ----------------------------------------
            // Save amount
            // ----------------------------------------

            amountInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key !==
                        "Enter"
                    ) {
                        return;
                    }


                    event.preventDefault();

                    event.stopPropagation();


                    saveAllocationAmount();

                }
            );


            amountInput.addEventListener(
                "blur",
                function () {

                    if (
                        savingAmount
                    ) {
                        return;
                    }


                    if (
                        allocation.classList.contains(
                            "editing-amount"
                        )
                    ) {

                        saveAllocationAmount();

                    }

                }
            );


            function saveAllocationAmount() {

                if (savingAmount) {
                    return;
                }


                const amount =
                    amountInput.value.trim();


                if (!amount) {

                    amountInput.value =
                        amountInput.defaultValue;

                    allocation.classList.remove(
                        "editing-amount"
                    );

                    return;

                }


                const allocationId =
                    allocation.dataset.allocationId;


                savingAmount = true;


                fetch(
                    `/allocation/${allocationId}/amount/`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded",

                            "X-CSRFToken":
                                getCookie(
                                    "csrftoken"
                                ),

                            "X-Requested-With":
                                "XMLHttpRequest",
                        },

                        body:
                            `amount=${encodeURIComponent(
                                amount
                            )}`,

                    }
                )
                    .then(function (response) {

                        return response.json();

                    })
                    .then(function (data) {

                        if (
                            data.success
                        ) {

                            updateDashboard(
                                data
                            );

                        }

                    })
                    .finally(function () {

                        savingAmount = false;

                    });

            }


            // ----------------------------------------
            // Cancel amount editing
            // ----------------------------------------

            amountInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key !==
                        "Escape"
                    ) {
                        return;
                    }


                    event.preventDefault();


                    amountInput.value =
                        amountInput.defaultValue;


                    allocation.classList.remove(
                        "editing-amount"
                    );

                }
            );

        }
    );

}


// ----------------------------------------
// Allocation deletion
// ----------------------------------------

function initializeAllocationDeletion() {

    const deleteButtons =
        document.querySelectorAll(
            ".allocation-delete"
        );


    deleteButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    const allocation =
                        button.closest(
                            ".allocation"
                        );


                    if (!allocation) {
                        return;
                    }


                    if (
                        !button.classList.contains(
                            "delete-confirm"
                        )
                    ) {

                        document
                            .querySelectorAll(
                                ".allocation-delete.delete-confirm"
                            )
                            .forEach(
                                function (
                                    otherButton
                                ) {

                                    otherButton.classList.remove(
                                        "delete-confirm"
                                    );

                                    otherButton.textContent =
                                        "×";

                                }
                            );


                        button.classList.add(
                            "delete-confirm"
                        );

                        button.textContent =
                            "✓";

                        return;

                    }


                    const allocationId =
                        allocation.dataset.allocationId;


                    fetch(
                        `/allocation/${allocationId}/delete/`,
                        {

                            method: "POST",

                            headers: {
                                "X-CSRFToken":
                                    getCookie(
                                        "csrftoken"
                                    ),

                                "X-Requested-With":
                                    "XMLHttpRequest",
                            },

                        }
                    )
                        .then(function (response) {

                            return response.json();

                        })
                        .then(function (data) {

                            if (
                                data.success
                            ) {

                                updateDashboard(
                                    data
                                );

                            }

                        });

                }
            );

        }
    );

}


// ----------------------------------------
// Reset allocation delete button
// ----------------------------------------

function resetAllocationDeleteButton(
    allocation
) {

    const button =
        allocation.querySelector(
            ".allocation-delete"
        );


    if (!button) {
        return;
    }


    button.classList.remove(
        "delete-confirm"
    );

    button.textContent =
        "×";

}


// ----------------------------------------
// Select an allocation
// ----------------------------------------

function selectAllocation(
    allocation
) {

    document
        .querySelectorAll(
            ".allocation.selected"
        )
        .forEach(
            function (
                selectedAllocation
            ) {

                if (
                    selectedAllocation !==
                    allocation
                ) {

                    selectedAllocation.classList.remove(
                        "selected"
                    );

                    selectedAllocation.classList.remove(
                        "editing-name"
                    );

                    selectedAllocation.classList.remove(
                        "editing-amount"
                    );


                    resetAllocationDeleteButton(
                        selectedAllocation
                    );

                }

            }
        );


    allocation.classList.add(
        "selected"
    );

}


// ----------------------------------------
// Allocation drag-and-drop ordering
// ----------------------------------------

function initializeAllocationSorting() {

    const allocationList =
        document.querySelector(
            ".allocation-list"
        );


    if (!allocationList) {
        return;
    }


    new Sortable(
        allocationList,
        {

            animation: 150,

            delay: 200,

            draggable: ".allocation",


            onEnd: function () {

                const allocationIds =
                    Array.from(
                        allocationList.querySelectorAll(
                            ".allocation"
                        )
                    ).map(
                        function (
                            allocation
                        ) {

                            return allocation.dataset
                                .allocationId;

                        }
                    );


                fetch(
                    "/allocation/reorder/",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "X-CSRFToken":
                                getCookie(
                                    "csrftoken"
                                ),

                            "X-Requested-With":
                                "XMLHttpRequest",
                        },

                        body:
                            JSON.stringify({
                                allocation_ids:
                                    allocationIds,
                            }),

                    }
                );

            },

        }
    );

}


// ----------------------------------------
// Initial setup
// ----------------------------------------

initializeAllocationEditing();

initializeAllocationSorting();

initializeBillEditing();

initializeBillSorting();


const savedView =
    localStorage.getItem(
        "billio-dashboard-view"
    );


if (
    savedView ===
    "allocation"
) {

    showAllocationView();

} else {

    showBillsView();

}


// ----------------------------------------
// Close Update Paycheck modal
// ----------------------------------------

if (updatePayModal) {

    updatePayModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                updatePayModal
            ) {

                updatePayModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


// ----------------------------------------
// Escape key closes Update Paycheck modal
// ----------------------------------------

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            if (updatePayModal) {

                updatePayModal.classList.remove(
                    "show"
                );

            }

        }

    }
);


// ----------------------------------------
// Deselect bill when clicking outside
// ----------------------------------------

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                ".bill"
            )
        ) {

            document
                .querySelectorAll(
                    ".bill.selected"
                )
                .forEach(
                    function (bill) {

                        bill.classList.remove(
                            "selected"
                        );

                        resetBillDeleteButton(
                            bill
                        );

                    }
                );

        }

    }
);
