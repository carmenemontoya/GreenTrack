function displayEnvironmentalData(records) {

    const tableBody = document.getElementById("environmentalDataBody");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    records.forEach(function (record) {

        const row = document.createElement("tr");

        const buildingCell = document.createElement("td");
        buildingCell.textContent = record.building || "";
        row.appendChild(buildingCell);

        const categoryCell = document.createElement("td");
        categoryCell.textContent = record.category || "";
        row.appendChild(categoryCell);

        const dateCell = document.createElement("td");
        dateCell.textContent = record.date || "";
        row.appendChild(dateCell);

        const readingCell = document.createElement("td");
        readingCell.textContent = record.reading || "";
        row.appendChild(readingCell);

        const unitCell = document.createElement("td");
        unitCell.textContent = record.unit || "";
        row.appendChild(unitCell);

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function () {
            editRecord(record.id);
        });
        actionCell.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            removeRecord(record.id);
        });
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}


// READ
function loadEnvironmentalData() {

    const records = getEnvironmentalData();

    displayEnvironmentalData(records);
}


// UPDATE
function editRecord(id) {

    const records = getEnvironmentalData();

    const record = records.find(function (item) {
        return item.id === Number(id);
    });

    if (!record) {
        alert("Record not found.");
        return;
    }

    const newReading = prompt(
        "Enter the updated reading:",
        record.reading
    );

    if (newReading === null) {
        return;
    }

    if (newReading.trim() === "") {
        alert("Reading cannot be empty.");
        return;
    }

    const reading = Number(newReading);

    if (Number.isNaN(reading) || reading < 0) {
        alert("Please enter a valid positive number.");
        return;
    }

    const result = updateEnvironmentalData(id, {
        reading: reading
    });

    alert(result.message);

    if (result.success) {
        loadEnvironmentalData();
    }
}


// DELETE
function removeRecord(id) {

    const user = getCurrentUser();

    if (!user || !canEditData()) {
        alert("You do not have permission to delete data.");
        return;
    }

    const confirmation = confirm(
        "Are you sure you want to delete this environmental record?"
    );

    if (!confirmation) {
        return;
    }

    const result = deleteEnvironmentalData(id);

    alert(result.message);

    if (result.success) {
        loadEnvironmentalData();
    }
}


function displayDashboardEnvironmentalData(records) {

    const tableBody = document.getElementById("environmentalDataBody");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    records.forEach(function (record) {
        const row = document.createElement("tr");

        [
            record.buildingname,
            record.categoryname,
            record.daterecorded,
            record.reading,
            record.unit
        ].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";
            row.appendChild(cell);
        });

        if (canEditData()) {
            const actionCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", function () {
                editPostgresRecord(record, loadDashboardEnvironmentalData);
            });
            actionCell.appendChild(editButton);

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", function () {
                deletePostgresRecord(record.dataid, loadDashboardEnvironmentalData);
            });
            actionCell.appendChild(deleteButton);

            row.appendChild(actionCell);
        }

        tableBody.appendChild(row);
    });
}


async function loadDashboardEnvironmentalData() {

    const tableBody = document.getElementById("environmentalDataBody");

    if (!tableBody) {
        return;
    }

    try {
        const response = await fetch("/api/environmental-data");

        if (!response.ok) {
            throw new Error("Environmental data request failed.");
        }

        const records = await response.json();
        displayDashboardEnvironmentalData(records);
    } catch (error) {
        tableBody.innerHTML = "";
        const messageRow = document.createElement("tr");
        const messageCell = document.createElement("td");
        messageCell.colSpan = 6;
        messageCell.textContent = "Unable to load environmental data.";
        messageRow.appendChild(messageCell);
        tableBody.appendChild(messageRow);
        console.error(error);
    }
}


function createEditorField(form, labelText, type, value) {

    const label = document.createElement("label");
    label.textContent = labelText;
    label.style.display = "block";
    label.style.marginTop = "10px";

    const input = document.createElement("input");
    input.type = type;
    input.value = value ?? "";
    input.required = true;
    input.style.display = "block";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";
    label.appendChild(input);
    form.appendChild(label);
    return input;
}


async function editPostgresRecord(record, refresh) {

    if (!canEditData()) {
        return;
    }

    const dialog = document.createElement("dialog");
    dialog.className = "card";
    dialog.style.maxWidth = "420px";
    dialog.style.width = "calc(100% - 32px)";
    const form = document.createElement("form");
    const heading = document.createElement("h2");
    heading.textContent = "Edit Environmental Record";
    form.appendChild(heading);

    const building = createEditorField(form, "Building", "text", record.buildingname);
    const categoryLabel = document.createElement("label");
    categoryLabel.textContent = "Category";
    categoryLabel.style.display = "block";
    categoryLabel.style.marginTop = "10px";
    const category = document.createElement("select");
    ["Energy", "Water", "Waste"].forEach(function (name) {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        option.selected = name === record.categoryname;
        category.appendChild(option);
    });
    category.style.display = "block";
    category.style.width = "100%";
    categoryLabel.appendChild(category);
    form.appendChild(categoryLabel);
    const dateRecorded = createEditorField(form, "Date", "date", record.daterecorded);
    const reading = createEditorField(form, "Reading", "number", record.reading);
    reading.step = "any";
    const unit = createEditorField(form, "Unit", "text", record.unit);
    const buttons = document.createElement("div");
    buttons.style.marginTop = "16px";
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", function () {
        dialog.remove();
    });
    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.textContent = "Save";
    buttons.appendChild(cancelButton);
    buttons.appendChild(saveButton);
    form.appendChild(buttons);
    dialog.appendChild(form);
    document.body.appendChild(dialog);
    dialog.showModal();

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const currentUser = getCurrentUser();
        try {
            const response = await fetch("/api/environmental-data/" + record.dataid, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-GreenTrack-Role": currentUser.role
                },
                body: JSON.stringify({
                    building: building.value,
                    category: category.value,
                    date: dateRecorded.value,
                    reading: reading.value,
                    unit: unit.value
                })
            });
            const result = await response.json();
            console.log("PUT response:", response.status, result);

            alert(result.message || result.error);

            if (response.ok) {
                dialog.remove();
                refresh();
            }
        } catch (error) {
            console.error(error);
            alert("Unable to update environmental data.");
        }
    });
}


async function deletePostgresRecord(dataId, refresh) {

    if (!canEditData()) {
        return;
    }

    if (!confirm("Are you sure you want to delete this environmental record?")) {
        return;
    }

    try {
        const currentUser = getCurrentUser();
        const response = await fetch("/api/environmental-data/" + dataId, {
            method: "DELETE",
            headers: {
                "X-GreenTrack-Role": currentUser.role
            }
        });
        const result = await response.json();
        console.log("DELETE response:", response.status, result);

        alert(result.message || result.error);

        if (response.ok) {
            refresh();
        }
    } catch (error) {
        console.error(error);
        alert("Unable to delete environmental data.");
    }
}


function appendPostgresActions(row, record, refresh) {

    if (!canEditData()) {
        return;
    }

    const actionCell = document.createElement("td");
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function () {
        editPostgresRecord(record, refresh);
    });
    actionCell.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
        deletePostgresRecord(record.dataid, refresh);
    });
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);
}


function updateActionsHeaders() {

    const showActions = canEditData();
    document.querySelectorAll(".actions-header").forEach(function (header) {
        header.style.display = showActions ? "" : "none";
    });
}


function displayEnergyEnvironmentalData(records) {

    const tableBody = document.getElementById("energyDataBody");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    records
        .filter(function (record) {
            return record.categoryname === "Energy";
        })
        .forEach(function (record) {
            const row = document.createElement("tr");

            [
                record.buildingname,
                record.daterecorded,
                record.reading,
                record.unit
            ].forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });

            appendPostgresActions(row, record, loadEnergyEnvironmentalData);

            tableBody.appendChild(row);
        });
}


async function loadEnergyEnvironmentalData() {

    const tableBody = document.getElementById("energyDataBody");

    if (!tableBody) {
        return;
    }

    try {
        const response = await fetch("/api/environmental-data");

        if (!response.ok) {
            throw new Error("Energy data request failed.");
        }

        const records = await response.json();
        displayEnergyEnvironmentalData(records);
    } catch (error) {
        tableBody.innerHTML = "";
        const messageRow = document.createElement("tr");
        const messageCell = document.createElement("td");
        messageCell.colSpan = 4;
        messageCell.textContent = "Unable to load energy data.";
        messageRow.appendChild(messageCell);
        tableBody.appendChild(messageRow);
        console.error(error);
    }
}


function displayWaterEnvironmentalData(records) {

    const tableBody = document.getElementById("waterDataBody");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    const waterRecords = records.filter(function (record) {
        return record.categoryname === "Water";
    });
    console.log("Water records after filtering:", waterRecords);

    waterRecords.forEach(function (record) {
            const row = document.createElement("tr");

            [
                record.buildingname,
                record.daterecorded,
                record.reading,
                record.unit
            ].forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });

            appendPostgresActions(row, record, loadWaterEnvironmentalData);
            tableBody.appendChild(row);
        });

    console.log("Number of Water rows rendered:", tableBody.rows.length);
}


async function loadWaterEnvironmentalData() {

    const tableBody = document.getElementById("waterDataBody");

    if (!tableBody) {
        return;
    }

    try {
        const response = await fetch("/api/environmental-data");

        if (!response.ok) {
            throw new Error("Water data request failed.");
        }

        const records = await response.json();
        console.log("Water API response received:", records);
        displayWaterEnvironmentalData(records);
    } catch (error) {
        tableBody.innerHTML = "";
        const messageRow = document.createElement("tr");
        const messageCell = document.createElement("td");
        messageCell.colSpan = 4;
        messageCell.textContent = "Unable to load water data.";
        messageRow.appendChild(messageCell);
        tableBody.appendChild(messageRow);
        console.error(error);
    }
}


function displayWasteEnvironmentalData(records) {

    const tableBody = document.getElementById("wasteDataBody");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    const wasteRecords = records.filter(function (record) {
        return record.categoryname === "Waste";
    });
    console.log("Waste records after filtering:", wasteRecords);

    wasteRecords.forEach(function (record) {
        const row = document.createElement("tr");

        [
            record.buildingname,
            record.daterecorded,
            record.reading,
            record.unit
        ].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";
            row.appendChild(cell);
        });

            appendPostgresActions(row, record, loadWasteEnvironmentalData);
        tableBody.appendChild(row);
    });

    console.log("Number of Waste records rendered:", tableBody.rows.length);
}


async function loadWasteEnvironmentalData() {

    const tableBody = document.getElementById("wasteDataBody");

    if (!tableBody) {
        return;
    }

    try {
        const response = await fetch("/api/environmental-data");

        if (!response.ok) {
            throw new Error("Waste data request failed.");
        }

        const records = await response.json();
        console.log("Waste API response received:", records);
        displayWasteEnvironmentalData(records);
    } catch (error) {
        tableBody.innerHTML = "";
        const messageRow = document.createElement("tr");
        const messageCell = document.createElement("td");
        messageCell.colSpan = 4;
        messageCell.textContent = "Unable to load waste data.";
        messageRow.appendChild(messageCell);
        tableBody.appendChild(messageRow);
        console.error(error);
    }
}


// Load records when page opens
document.addEventListener("DOMContentLoaded", function () {
    updateActionsHeaders();
    loadDashboardEnvironmentalData();
    loadEnergyEnvironmentalData();
    loadWaterEnvironmentalData();
    loadWasteEnvironmentalData();
    loadEnvironmentalData();
});
