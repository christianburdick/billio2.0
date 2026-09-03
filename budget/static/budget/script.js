const addButton = document.getElementById("add-button");
const actionMenu = document.getElementById("action-menu");

const addBillButton = document.getElementById("add-bill-button");
const addBillForm = document.getElementById("add-bill-form");

const updatePayButton = document.getElementById("update-pay-button");
const updatePayForm = document.getElementById("update-pay-form");


addButton.addEventListener("click", function () {
    actionMenu.classList.toggle("show");
});


addBillButton.addEventListener("click", function () {
    actionMenu.classList.remove("show");

    addBillForm.style.display = "block";
});


updatePayButton.addEventListener("click", function () {
    actionMenu.classList.remove("show");

    updatePayForm.style.display = "block";
});
