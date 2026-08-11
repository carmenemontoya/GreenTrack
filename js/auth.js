const users = [
    {
        email: "admin@greentrack.edu",
        password: "admin123",
        name: "Carmen Montoya",
        role: "admin"
    },
    {
        email: "staff@greentrack.edu",
        password: "staff123",
        name: "Sustainability Office Staff",
        role: "staff"
    },
    {
        email: "student@greentrack.edu",
        password: "student123",
        name: "Student User",
        role: "student"
    },
    {
        email: "faculty@greentrack.edu",
        password: "faculty123",
        name: "Faculty User",
        role: "faculty"
    }
];

function login(email, password) {
    const user = users.find(function (account) {
        return account.email === email &&
               account.password === password;
    });

    if (!user) {
        return {
            success: false,
            message: "Invalid email or password."
        };
    }

    // Store only the information needed by the prototype.
    const storedUser = {
        name: user.name,
        role: user.role
    };

    localStorage.setItem("greenTrackUser", JSON.stringify(storedUser));
    localStorage.setItem("greentrackLoggedIn", "true");

    return {
        success: true,
        user: storedUser
    };
}

function getCurrentUser() {
    const storedUser = localStorage.getItem("greenTrackUser");

    if (!storedUser) {
        return null;
    }

    return JSON.parse(storedUser);
}

function logout() {
    localStorage.removeItem("greenTrackUser");
    localStorage.removeItem("greentrackLoggedIn");
    window.location.href = "login.html";
}

function canEditData() {
    const user = getCurrentUser();

    if (!user) {
        return false;
    }

    return user.role === "admin" || user.role === "staff";
}
