function displayEnvironmentalData(records) {

    const tableBody = document.getElementById("environmentalDataBody");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    records.forEach(function (record) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${record.building}</td>
            <td>${record.category}</td>
            <td>${record.date}</td>
            <td>${record.reading}</td>
            <td>${record.unit}</td>
            <td>
                <button onclick="editRecord(${record.id})">
                    Edit
                </button>

                <button onclick="removeRecord(${record.id})">
                    Delete
                </button>
            </td>
        `;

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


// Load records when page opens
document.addEventListener("DOMContentLoaded", function () {
    loadEnvironmentalData();
});
