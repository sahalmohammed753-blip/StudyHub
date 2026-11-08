
/* ==========================================
   STUDYHUB AUTHENTICATION
   Connected to Node.js + MongoDB
========================================== */

const API_URL = "http://localhost:5000/api/auth";

const CURRENT_USER = "studyhub_current_user";
const TOKEN_KEY = "studyhub_token";

/* ==========================================
   EMAIL VALIDATION
========================================== */

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ==========================================
   PASSWORD VALIDATION
========================================== */

function validatePassword(password) {
    if (password.length < 6) {
        alert("Password must contain at least 6 characters.");
        return false;
    }

    return true;
}

/* ==========================================
   REGISTER USER
========================================== */

async function registerUser(event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const phone = document.getElementById("phone").value.trim();
    const college = document.getElementById("college").value.trim();
    const department = document.getElementById("department").value;
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (!name || !email || !phone || !college ||
        !department || !role || !password) {

        alert("Please fill all fields.");
        return;
    }

    if (!validateEmail(email)) {
        alert("Invalid email address.");
        return;
    }

    if (!validatePassword(password)) return;

    if (password !== confirm) {
        alert("Passwords do not match.");
        return;
    }

    const button = event.submitter;

    if (button) button.disabled = true;

    try {

        const response = await fetch(`${API_URL}/signup`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                phone,
                college,
                department,
                role,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Registration failed.");
        }

        alert(data.message);

        window.location.href = "login.html";

    } catch (error) {

        console.error("Registration Error:", error);

        alert(error.message || "Unable to connect to the server.");

    } finally {

        if (button) button.disabled = false;

    }
}

/* ==========================================
   LOGIN USER
========================================== */

async function loginUser(event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    const button = event.submitter;

    if (button) button.disabled = true;

    try {

        const response = await fetch(`${API_URL}/login`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed.");
        }

        // Save JWT token
        localStorage.setItem(TOKEN_KEY, data.token);

        // Save logged-in user details
        localStorage.setItem(
            CURRENT_USER,
            JSON.stringify(data.user)
        );

        alert("Welcome " + data.user.name + "!");

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error("Login Error:", error);

        alert(error.message || "Unable to connect to the server.");

    } finally {

        if (button) button.disabled = false;

    }
}

/* ==========================================
   CURRENT USER
========================================== */

function getCurrentUser() {

    return JSON.parse(
        localStorage.getItem(CURRENT_USER)
    );

}

/* ==========================================
   LOGOUT
========================================== */

function logout() {

    localStorage.removeItem(CURRENT_USER);
    localStorage.removeItem(TOKEN_KEY);

    window.location.href = "login.html";

}

/* ==========================================
   CHECK LOGIN
========================================== */

function requireLogin() {

    const user = getCurrentUser();
    const token = localStorage.getItem(TOKEN_KEY);

    if (!user || !token) {
        window.location.href = "login.html";
    }

}

/* ==========================================
   POPULATE PROFILE
========================================== */

function loadProfile() {

    const user = getCurrentUser();

    if (!user) return;

    if (document.getElementById("profileName"))
        document.getElementById("profileName").textContent = user.name;

    if (document.getElementById("profileEmail"))
        document.getElementById("profileEmail").textContent = user.email;

    if (document.getElementById("profileRole"))
        document.getElementById("profileRole").textContent = user.role;

    if (document.getElementById("profileCollege"))
        document.getElementById("profileCollege").textContent = user.college;

}
/* DASHBOARD GREETING */
function loadDashboard() {
    const user = getCurrentUser();
    if (!user) return;

    // Display registered name in dashboard heading
    const welcome = document.getElementById("welcomeUser");

    if (welcome) {
        welcome.textContent = user.name;
    }

    // Display registered name in top-right user section
    const username = document.getElementById("username");

    if (username) {
        username.textContent = user.name;
    }
}
/* ==========================================
   TOGGLE PASSWORD
========================================== */

function togglePassword(inputId, icon) {

    const input = document.getElementById(inputId);

    if (!input) return;

    if (input.type === "password") {

        input.type = "text";

        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");

    } else {

        input.type = "password";

        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");

    }

}

/* ==========================================
   ACCOUNT MANAGEMENT
   Backend integration will be added later.
========================================== */

function deleteAccount() {

    alert("Account deletion will be available after we connect the account management API.");

}

function updateProfile(event) {

    event.preventDefault();

    alert("Profile editing will be connected to MongoDB in a later step.");

}

/* ==========================================
   AUTO INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadDashboard();
    loadProfile();

});
