const API_STORAGE_KEY = "greenTrackEnvironmentalData";

function initializeData() {

    const existingData = localStorage.getItem(API_STORAGE_KEY);

    if (existingData) {
        return;
    }

    const sampleData = [
        {
            id: 1,
            building: "Science Building",
            category: "Energy",
            date: "2026-08-01",
            reading: 4500,
            unit: "kWh"
        },
        {
            id: 2,
            building: "Student Center",
            category: "Water",
            date: "2026-08-01",
            reading: 12000,
            unit: "gal"
        },
        {
            id: 3,
            building: "Library",
            category: "Waste",
            date: "2026-08-01",
            reading: 350,
            unit: "lbs"
        }
    ];

    localStorage.setItem(
        API_STORAGE_KEY,
        JSON.stringify(sampleData)
    );
}


// GET
function getEnvironmentalData() {

    initializeData();

    const data = localStorage.getItem(API_STORAGE_KEY);

    return data ? JSON.parse(data) : [];
}


// POST
function addEnvironmentalData(record) {

    const data = getEnvironmentalData();

    const newId = data.length > 0
        ? Math.max(...data.map(item => item.id)) + 1
        : 1;

    const newRecord = {
        id: newId,
        ...record
    };

    data.push(newRecord);

    localStorage.setItem(
        API_STORAGE_KEY,
        JSON.stringify(data)
    );

    return {
        success: true,
        message: "Environmental data added successfully.",
        data: newRecord
    };
}


// PUT
function updateEnvironmentalData(id, updatedRecord) {

    const data = getEnvironmentalData();

    const index = data.findIndex(function (record) {
        return record.id === Number(id);
    });

    if (index === -1) {
        return {
            success: false,
            message: "Environmental record not found."
        };
    }

    data[index] = {
        ...data[index],
        ...updatedRecord
    };

    localStorage.setItem(
        API_STORAGE_KEY,
        JSON.stringify(data)
    );

    return {
        success: true,
        message: "Environmental data updated successfully.",
        data: data[index]
    };
}


// DELETE
function deleteEnvironmentalData(id) {

    const data = getEnvironmentalData();

    const filteredData = data.filter(function (record) {
        return record.id !== Number(id);
    });

    if (filteredData.length === data.length) {
        return {
            success: false,
            message: "Environmental record not found."
        };
    }

    localStorage.setItem(
        API_STORAGE_KEY,
        JSON.stringify(filteredData)
    );

    return {
        success: true,
        message: "Environmental data deleted successfully."
    };
}
