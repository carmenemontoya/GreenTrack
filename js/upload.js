function validateEnvironmentalData(data) {

    if (!data.building) {
        return {
            valid: false,
            message: "Please select a building."
        };
    }

    if (!data.category) {
        return {
            valid: false,
            message: "Please select a category."
        };
    }

    if (!data.date) {
        return {
            valid: false,
            message: "Please enter a date."
        };
    }

    if (data.reading === "") {
        return {
            valid: false,
            message: "Please enter a reading."
        };
    }

    const reading = Number(data.reading);

    if (Number.isNaN(reading)) {
        return {
            valid: false,
            message: "Reading must be a number."
        };
    }

    if (reading < 0) {
        return {
            valid: false,
            message: "Reading cannot be negative."
        };
    }

    const validCategories = ["Energy", "Water", "Waste"];

    if (!validCategories.includes(data.category)) {
        return {
            valid: false,
            message: "Invalid environmental category."
        };
    }

    return {
        valid: true,
        message: "Data is valid."
    };
}


function submitEnvironmentalData(data) {

    const user = getCurrentUser();

    if (!user) {
        return {
            success: false,
            message: "Please log in before uploading data."
        };
    }

    if (!canEditData()) {
        return {
            success: false,
            message: "You do not have permission to add environmental data."
        };
    }

    const validation = validateEnvironmentalData(data);

    if (!validation.valid) {
        return {
            success: false,
            message: validation.message
        };
    }

    const newRecord = {
        building: data.building,
        category: data.category,
        date: data.date,
        reading: Number(data.reading),
        unit: data.unit
    };

    return addEnvironmentalData(newRecord);
}

function normalizeHeader(header) {
    return header
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[_-]+/g, "");
}

function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                field += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (!inQuotes && char === ',') {
            row.push(field);
            field = "";
            continue;
        }

        if (!inQuotes && (char === '\n' || char === '\r')) {
            if (char === '\r' && nextChar === '\n') {
                i += 1;
            }
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
            continue;
        }

        field += char;
    }

    if (field !== "" || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows;
}

function parseCsvToObjects(text) {
    const rows = parseCsv(text);

    if (rows.length === 0) {
        return [];
    }

    const headerRow = rows[0].map(normalizeHeader);
    const fieldMap = {
        building: "building",
        location: "building",
        facility: "building",
        category: "category",
        type: "category",
        date: "date",
        reading: "reading",
        value: "reading",
        unit: "unit",
        measurement: "unit"
    };

    const records = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        if (row.every(function (cell) { return cell.trim() === ""; })) {
            continue;
        }

        const record = {};

        headerRow.forEach(function (columnName, index) {
            const mappedKey = fieldMap[columnName];
            if (!mappedKey) {
                return;
            }

            record[mappedKey] = row[index] !== undefined ? row[index].trim() : "";
        });

        records.push(record);
    }

    return records;
}

function getDefaultUnit(category) {
    const units = {
        Energy: "kWh",
        Water: "gal",
        Waste: "lbs"
    };

    return units[category] || "";
}

function showUploadStatus(message, isError) {
    const statusElement = document.getElementById("uploadStatus");

    if (!statusElement) {
        return;
    }

    statusElement.textContent = message;
    statusElement.style.color = isError ? "#d32f2f" : "#1b5e20";
}

function processUploadFile(file, category) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const rawText = event.target.result;
        const records = parseCsvToObjects(rawText);

        if (records.length === 0) {
            showUploadStatus("No valid records found in the selected file.", true);
            return;
        }

        const user = getCurrentUser();

        if (!user) {
            showUploadStatus("Please log in before uploading data.", true);
            return;
        }

        if (!canEditData()) {
            showUploadStatus("You do not have permission to upload data.", true);
            return;
        }

        let addedCount = 0;

        for (let i = 0; i < records.length; i++) {
            const sourceRecord = records[i];
            const uploadRecord = {
                building: sourceRecord.building || "",
                category: category,
                date: sourceRecord.date || "",
                reading: sourceRecord.reading || "",
                unit: sourceRecord.unit || getDefaultUnit(category)
            };

            const result = submitEnvironmentalData(uploadRecord);

            if (!result.success) {
                showUploadStatus(
                    "Upload failed on row " + (i + 2) + ": " + result.message,
                    true
                );
                return;
            }

            addedCount += 1;
        }

        showUploadStatus(
            addedCount + " record" + (addedCount === 1 ? "" : "s") + " uploaded successfully for " + category + ".",
            false
        );
    };

    reader.onerror = function () {
        showUploadStatus("Unable to read the selected file.", true);
    };

    reader.readAsText(file);
}

function setupUploadButtons() {
    const mapping = [
        { buttonId: "energyUploadButton", inputId: "energyFileInput", category: "Energy" },
        { buttonId: "waterUploadButton", inputId: "waterFileInput", category: "Water" },
        { buttonId: "wasteUploadButton", inputId: "wasteFileInput", category: "Waste" }
    ];

    mapping.forEach(function (item) {
        const button = document.getElementById(item.buttonId);
        const input = document.getElementById(item.inputId);

        if (!button || !input) {
            return;
        }

        button.addEventListener("click", function () {
            input.value = "";
            input.click();
        });

        input.addEventListener("change", function () {
            if (input.files && input.files[0]) {
                processUploadFile(input.files[0], item.category);
            }
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupUploadButtons);
} else {
    setupUploadButtons();
}
