function recordsFor(records, category) {
    return records.filter(function (record) {
        return record.categoryname === category;
    });
}

function sumReadings(records) {
    return records.reduce(function (total, record) {
        return total + Number(record.reading || 0);
    }, 0);
}

function groupReadings(records, field) {
    return records.reduce(function (groups, record) {
        const key = record[field];
        if (key) {
            groups[key] = (groups[key] || 0) + Number(record.reading || 0);
        }
        return groups;
    }, {});
}

function chartOptions(showLegend) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: showLegend, position: "bottom" }
        },
        scales: showLegend ? {} : {
            x: { grid: { display: false } },
            y: { beginAtZero: true }
        }
    };
}

function renderChart(canvasId, type, labels, values, label, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const oldMessage = canvas.parentElement.querySelector(".chart-empty");
    if (oldMessage) {
        oldMessage.remove();
    }

    if (labels.length === 0) {
        canvas.style.display = "none";
        const message = document.createElement("p");
        message.className = "chart-empty";
        message.textContent = "No data available.";
        canvas.parentElement.appendChild(message);
        return;
    }

    canvas.style.display = "block";
    new Chart(canvas, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: values,
                borderColor: type === "doughnut" ? colors : colors[0],
                backgroundColor: colors,
                borderWidth: type === "doughnut" ? 0 : 2,
                fill: type === "line",
                tension: 0.3
            }]
        },
        options: chartOptions(type === "doughnut")
    });
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function updateDashboard(records) {
    const energy = recordsFor(records, "Energy");
    const water = recordsFor(records, "Water");
    const waste = recordsFor(records, "Waste");
    setText("dashboardEnergyTotal", sumReadings(energy).toLocaleString() + " kWh");
    setText("dashboardWaterTotal", sumReadings(water).toLocaleString() + " gal");
    setText("dashboardWasteTotal", sumReadings(waste).toLocaleString() + " lbs");
    const energyByDate = groupReadings(energy, "daterecorded");
    const waterByDate = groupReadings(water, "daterecorded");
    const wasteByBuilding = groupReadings(waste, "buildingname");
    renderChart("dashboardEnergyChart", "line", Object.keys(energyByDate), Object.values(energyByDate), "Energy Usage (kWh)", ["#FFE196"]);
    renderChart("dashboardWaterChart", "line", Object.keys(waterByDate), Object.values(waterByDate), "Water Usage (gal)", ["#9FC3F5"]);
    renderChart("dashboardWasteChart", "doughnut", Object.keys(wasteByBuilding), Object.values(wasteByBuilding), "Waste (lbs)", ["#FFBE8F", "#FFD8B8", "#F5A868", "#E8935A", "#D9803F", "#C46A2E"]);
}

function updateCategoryPage(records, category, config) {
    const categoryRecords = recordsFor(records, category);
    const total = sumReadings(categoryRecords);
    const byDate = groupReadings(categoryRecords, "daterecorded");
    const byBuilding = groupReadings(categoryRecords, "buildingname");
    const buildings = Object.entries(byBuilding).sort(function (first, second) {
        return second[1] - first[1];
    });
    const highest = buildings[0] || ["None", 0];
    setText(config.totalId, total.toLocaleString() + " " + config.unit);
    setText(config.averageId, (Object.keys(byDate).length ? total / Object.keys(byDate).length : 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + config.unit);
    setText(config.highestId, highest[0]);
    setText(config.highestValueId, highest[1].toLocaleString() + " " + config.unit);
    renderChart(config.dateChartId, "line", Object.keys(byDate), Object.values(byDate), category + " Usage (" + config.unit + ")", [config.color]);
    renderChart(config.buildingChartId, config.buildingChartType, Object.keys(byBuilding), Object.values(byBuilding), category + " Usage (" + config.unit + ")", config.colors || [config.color]);
}

function updateReports(records) {
    setText("reportsRecordTotal", records.length.toLocaleString());
    setText("reportsEnergyTotal", recordsFor(records, "Energy").length.toLocaleString());
    setText("reportsWasteTotal", recordsFor(records, "Waste").length.toLocaleString());
    const dates = records.map(function (record) { return record.daterecorded; }).sort();
    setText("reportsLatestDate", dates[dates.length - 1] || "None");
    const series = {};
    ["Energy", "Water", "Waste"].forEach(function (category) {
        series[category] = groupReadings(recordsFor(records, category), "daterecorded");
    });
    const labels = Array.from(new Set(records.map(function (record) { return record.daterecorded; }))).sort();
    const canvas = document.getElementById("sustainabilityTrendChart");
    if (!canvas || typeof Chart === "undefined") return;
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();
    const oldMessage = canvas.parentElement.querySelector(".chart-empty");
    if (oldMessage) oldMessage.remove();
    if (labels.length === 0) {
        canvas.style.display = "none";
        const message = document.createElement("p");
        message.className = "chart-empty";
        message.textContent = "No data available.";
        canvas.parentElement.appendChild(message);
        return;
    }
    canvas.style.display = "block";
    new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                { label: "Energy (kWh)", data: labels.map(function (key) { return series.Energy[key] || 0; }), borderColor: "#FFE196", fill: false, tension: 0.3 },
                { label: "Water (gal)", data: labels.map(function (key) { return series.Water[key] || 0; }), borderColor: "#9FC3F5", fill: false, tension: 0.3 },
                { label: "Waste (lbs)", data: labels.map(function (key) { return series.Waste[key] || 0; }), borderColor: "#FFBE8F", fill: false, tension: 0.3 }
            ]
        },
        options: chartOptions(true)
    });
}

async function loadPostgreSQLVisualizations() {
    try {
        const response = await fetch("/api/environmental-data");
        if (!response.ok) throw new Error("Environmental data request failed.");
        const records = await response.json();
        updateDashboard(records);
        updateCategoryPage(records, "Energy", { totalId: "energyTotal", averageId: "energyDailyAverage", highestId: "energyHighestBuilding", highestValueId: "energyHighestBuildingValue", dateChartId: "energyLineChart", buildingChartId: "buildingBarChart", buildingChartType: "bar", unit: "kWh", color: "#FFE196" });
        updateCategoryPage(records, "Water", { totalId: "waterTotal", averageId: "waterDailyAverage", highestId: "waterHighestBuilding", highestValueId: "waterHighestBuildingValue", dateChartId: "waterLineChart", buildingChartId: "waterBuildingBarChart", buildingChartType: "bar", unit: "gal", color: "#9FC3F5" });
        updateCategoryPage(records, "Waste", { totalId: "wasteTotal", averageId: "wasteDailyAverage", highestId: "wasteHighestBuilding", highestValueId: "wasteHighestBuildingValue", dateChartId: "wasteLineChart", buildingChartId: "wasteDoughnutChart", buildingChartType: "doughnut", unit: "lbs", color: "#FFBE8F", colors: ["#FFBE8F", "#FFD8B8", "#F5A868", "#E8935A", "#D9803F", "#C46A2E"] });
        updateReports(records);
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadPostgreSQLVisualizations();
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("loginButton");
    const loginMessage = document.getElementById("loginMessage");
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const type = passwordInput.type === "password" ? "text" : "password";
            passwordInput.type = type;
            this.querySelector(".material-symbols-outlined").textContent = type === "password" ? "visibility" : "visibility_off";
        });
    }
    if (loginButton && loginMessage) {
        loginButton.addEventListener("click", function () {
            const result = login(document.getElementById("email").value.trim(), passwordInput.value);
            if (!result.success) {
                loginMessage.textContent = result.message;
                loginMessage.style.color = "#d32f2f";
                return;
            }
            loginMessage.textContent = "Signing in...";
            loginMessage.style.color = "#78975F";
            setTimeout(function () { window.location.href = "/"; }, 250);
        });
    }
    const signOutButton = document.getElementById("signOutButton");
    if (signOutButton) {
        signOutButton.addEventListener("click", function () {
            localStorage.removeItem("greenTrackUser");
            localStorage.removeItem("greentrackLoggedIn");
            document.cookie = "greenTrackRole=; Max-Age=0; path=/; SameSite=Lax";
            window.location.href = "/login";
        });
    }
    const currentUser = getCurrentUser();
    document.querySelectorAll('a[href="/upload"]').forEach(function (link) {
        if (!currentUser || !canEditData()) {
            const menuItem = link.closest("li");
            if (menuItem) menuItem.remove();
        }
    });
    const currentPath = window.location.pathname;
    if (currentPath !== "/login" && !currentUser) window.location.href = "/login";
    if (currentPath === "/login" && currentUser) window.location.href = "/";
    if (currentUser) {
        const name = document.querySelector('.profile .profile-info strong');
        const role = document.querySelector('.profile .profile-info small');
        if (name) name.textContent = currentUser.name || "";
        if (role) role.textContent = currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : "";
    }
});
