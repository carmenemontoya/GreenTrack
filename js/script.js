document.addEventListener("DOMContentLoaded", function () {
    console.log("GreenTrack Dashboard Loaded!");

    const energyLineChart = document.getElementById("energyLineChart");
    if (energyLineChart) {
        new Chart(energyLineChart, {
            type: "line",
            data: {
                labels: ["February", "March", "April", "May", "June", "July"],
                datasets: [{
                    label: "Energy Usage",
                    data: [101000, 110500, 118300, 121000, 125400, 128000],
                    borderColor: "#2E7D32",
                    backgroundColor: "rgba(46, 125, 50, 0.16)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: "#2E7D32",
                    pointBorderColor: "rgba(46, 125, 50, 0.9)",
                    pointHoverRadius: 6,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: "#555",
                        },
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: "rgba(0, 0, 0, 0.06)",
                        },
                        ticks: {
                            color: "#555",
                        },
                    },
                },
            },
        });
    }

    const buildingBarChart = document.getElementById("buildingBarChart");
    if (buildingBarChart) {
        new Chart(buildingBarChart, {
            type: "bar",
            data: {
                labels: ["Science Hall", "Library", "Student Union", "Engineering Building", "Administration"],
                datasets: [{
                    label: "Energy Used",
                    data: [34120, 25840, 29500, 41300, 18700],
                    backgroundColor: [
                        "#66BB6A",
                        "#42A5F5",
                        "#9CCC65",
                        "#2E7D32",
                        "#64B5F6",
                    ],
                    borderRadius: 12,
                    maxBarThickness: 40,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: "#555",
                        },
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "rgba(0, 0, 0, 0.06)",
                        },
                        ticks: {
                            color: "#555",
                        },
                    },
                },
            },
        });
    }

    const waterLineChart = document.getElementById("waterLineChart");
    if (waterLineChart) {
        new Chart(waterLineChart, {
            type: "line",
            data: {
                labels: ["February", "March", "April", "May", "June", "July"],
                datasets: [{
                    label: "Water Usage",
                    data: [710000, 735000, 760000, 780000, 800000, 820000],
                    borderColor: "#0D47A1",
                    backgroundColor: "rgba(13, 71, 161, 0.16)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: "#0D47A1",
                    pointBorderColor: "rgba(13, 71, 161, 0.9)",
                    pointHoverRadius: 6,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: "#555",
                        },
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: "rgba(0, 0, 0, 0.06)",
                        },
                        ticks: {
                            color: "#555",
                        },
                    },
                },
            },
        });
    }

    const waterBuildingBarChart = document.getElementById("waterBuildingBarChart");
    if (waterBuildingBarChart) {
        new Chart(waterBuildingBarChart, {
            type: "bar",
            data: {
                labels: ["Science Hall", "Library", "Student Union", "Engineering Building", "Administration"],
                datasets: [{
                    label: "Water Used",
                    data: [112000, 96500, 148200, 134800, 84300],
                    backgroundColor: [
                        "#42A5F5",
                        "#64B5F6",
                        "#1E88E5",
                        "#0D47A1",
                        "#90CAF9",
                    ],
                    borderRadius: 12,
                    maxBarThickness: 40,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: "#555",
                        },
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "rgba(0, 0, 0, 0.06)",
                        },
                        ticks: {
                            color: "#555",
                        },
                    },
                },
            },
        });
    }

    const wasteLineChart = document.getElementById("wasteLineChart");
    if (wasteLineChart) {
        new Chart(wasteLineChart, {
            type: "line",
            data: {
                labels: ["February", "March", "April", "May", "June", "July"],
                datasets: [{
                    label: "Waste Collection",
                    data: [9800, 10200, 10850, 11400, 11950, 12400],
                    borderColor: "#F57F17",
                    backgroundColor: "rgba(245, 127, 23, 0.16)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: "#F57F17",
                    pointBorderColor: "rgba(245, 127, 23, 0.9)",
                    pointHoverRadius: 6,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: "#555",
                        },
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: "rgba(0, 0, 0, 0.06)",
                        },
                        ticks: {
                            color: "#555",
                        },
                    },
                },
            },
        });
    }

    const wasteDoughnutChart = document.getElementById("wasteDoughnutChart");
    if (wasteDoughnutChart) {
        new Chart(wasteDoughnutChart, {
            type: "doughnut",
            data: {
                labels: ["Science Hall", "Library", "Student Union", "Engineering Building", "Administration", "Facilities"],
                datasets: [{
                    data: [1980, 1540, 3420, 2860, 1250, 1350],
                    backgroundColor: [
                        "#66BB6A",
                        "#42A5F5",
                        "#FFB300",
                        "#F57F17",
                        "#26A69A",
                        "#7E57C2",
                    ],
                    borderWidth: 0,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#555",
                            boxWidth: 12,
                            padding: 16,
                        },
                    },
                },
            },
        });
    }

    const reportsMonthBarChart = document.getElementById("reportsMonthBarChart");
    if (reportsMonthBarChart) {
        new Chart(reportsMonthBarChart, {
            type: "bar",
            data: {
                labels: ["February", "March", "April", "May", "June", "July"],
                datasets: [{
                    label: "Reports Generated",
                    data: [4, 4, 4, 4, 4, 4],
                    backgroundColor: "#2E7D32",
                    borderRadius: 12,
                    maxBarThickness: 40,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: "#555",
                        },
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "rgba(0, 0, 0, 0.06)",
                        },
                        ticks: {
                            color: "#555",
                            stepSize: 1,
                        },
                    },
                },
            },
        });
    }

    const sustainabilityTrendChart = document.getElementById("sustainabilityTrendChart");
    if (sustainabilityTrendChart) {
        new Chart(sustainabilityTrendChart, {
            type: "line",
            data: {
                labels: ["February", "March", "April", "May", "June", "July"],
                datasets: [
                    {
                        label: "Energy (kWh)",
                        data: [101000, 110500, 118300, 121000, 125400, 128000],
                        borderColor: "#2E7D32",
                        backgroundColor: "rgba(46,125,50,0.12)",
                        fill: false,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: "#2E7D32",
                    },
                    {
                        label: "Water (gal)",
                        data: [710000, 735000, 760000, 780000, 800000, 820000],
                        borderColor: "#0D47A1",
                        backgroundColor: "rgba(13,71,161,0.12)",
                        fill: false,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: "#0D47A1",
                    },
                    {
                        label: "Waste (lbs)",
                        data: [9800, 10200, 10850, 11400, 11950, 12400],
                        borderColor: "#F57F17",
                        backgroundColor: "rgba(245,127,23,0.16)",
                        fill: false,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: "#F57F17",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                        labels: {
                            color: "#555",
                        },
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: "#555",
                        },
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: "rgba(0, 0, 0, 0.06)",
                        },
                        ticks: {
                            color: "#555",
                        },
                    },
                },
            },
        });
    }

    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("loginButton");
    const loginMessage = document.getElementById("loginMessage");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            this.querySelector(".material-symbols-outlined").textContent = type === "password" ? "visibility" : "visibility_off";
        });
    }

    if (loginButton && loginMessage) {
        loginButton.addEventListener("click", function () {
            localStorage.setItem("greentrackLoggedIn", "true");
            loginMessage.textContent = "Signing in...";
            setTimeout(function () {
                window.location.href = "index.html";
            }, 250);
        });
    }

    const signOutButton = document.getElementById("signOutButton");
    if (signOutButton) {
        signOutButton.addEventListener("click", function () {
            localStorage.removeItem("greentrackLoggedIn");
            window.location.href = "login.html";
        });
    }

    const currentPath = window.location.pathname.split("/").pop();
    const loggedIn = localStorage.getItem("greentrackLoggedIn") === "true";

    if (currentPath !== "login.html" && !loggedIn) {
        window.location.href = "login.html";
    }

    if (currentPath === "login.html" && loggedIn) {
        window.location.href = "index.html";
    }
});
