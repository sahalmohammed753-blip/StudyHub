/* ==========================================================
   StudyHub
   app.js
   Common JavaScript for Entire Website
========================================================== */

"use strict";

/* ==========================================================
   Global Variables
========================================================== */

const APP_NAME = "StudyHub";

const APP_VERSION = "1.0.0";

/* ==========================================================
   DOM Ready
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeApplication();

});

/* ==========================================================
   Initialize Application
========================================================== */

function initializeApplication() {

    console.log(`${APP_NAME} Started`);

    highlightCurrentPage();

    loadUserName();

    setupSmoothScrolling();

    setupBackToTop();

}

/* ==========================================================
   Highlight Current Navigation Link
========================================================== */

function highlightCurrentPage() {

    const page = window.location.pathname.split("/").pop();

    const links = document.querySelectorAll("nav a, .sidebar a");

    links.forEach(link => {

        const href = link.getAttribute("href");

        if (href === page) {

            link.classList.add("active");

        }

    });

}

/* ==========================================================
   Load Logged In User
========================================================== */

function loadUserName() {

    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) return;

    const username = document.querySelectorAll("#username");

    username.forEach(item => {

        item.textContent = user.name;

    });

}

/* ==========================================================
   Show Notification
========================================================== */

function showNotification(message, type = "success") {

    const notification = document.createElement("div");

    notification.className = `notification ${type}`;

    notification.innerHTML = message;

    document.body.appendChild(notification);

    setTimeout(() => {

        notification.classList.add("show");

    }, 100);

    setTimeout(() => {

        notification.classList.remove("show");

        setTimeout(() => {

            notification.remove();

        }, 400);

    }, 3000);

}

/* ==========================================================
   Loading Screen
========================================================== */

function showLoader() {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.style.display = "flex";

    }

}

function hideLoader() {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.style.display = "none";

    }

}

/* ==========================================================
   Confirm Dialog
========================================================== */

function confirmAction(message) {

    return confirm(message);

}

/* ==========================================================
   Scroll To Top
========================================================== */

function scrollTopPage() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

/* ==========================================================
   Back To Top Button
========================================================== */

function setupBackToTop() {

    const button = document.getElementById("backToTop");

    if (!button) return;

    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {

            button.style.display = "block";

        } else {

            button.style.display = "none";

        }

    });

    button.addEventListener("click", scrollTopPage);

}

/* ==========================================================
   Smooth Scroll
========================================================== */

function setupSmoothScrolling() {

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            const target = document.querySelector(this.getAttribute("href"));

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({

                behavior: "smooth"

            });

        });

    });

}

/* ==========================================================
   Format Date
========================================================== */

function formatDate(date = new Date()) {

    return date.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}

/* ==========================================================
   Generate Random ID
========================================================== */

function generateID() {

    return "ID-" + Date.now();

}

/* ==========================================================
   Save Local Data
========================================================== */

function saveData(key, value) {

    localStorage.setItem(

        key,

        JSON.stringify(value)

    );

}

/* ==========================================================
   Read Local Data
========================================================== */

function getData(key) {

    const data = localStorage.getItem(key);

    return data ? JSON.parse(data) : [];

}

/* ==========================================================
   Remove Local Data
========================================================== */

function removeData(key) {

    localStorage.removeItem(key);

}

/* ==========================================================
   Download File
========================================================== */

function downloadFile(url) {

    const link = document.createElement("a");

    link.href = url;

    link.download = "";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

}

/* ==========================================================
   Copy Text
========================================================== */

function copyText(text) {

    navigator.clipboard.writeText(text)

        .then(() => {

            showNotification("Copied Successfully");

        })

        .catch(() => {

            showNotification("Copy Failed", "error");

        });

}

/* ==========================================================
   Logout
========================================================== */

function logoutUser() {

    if (!confirmAction("Do you want to logout?"))

        return;

    localStorage.removeItem("currentUser");

    showNotification("Logged Out Successfully");

    setTimeout(() => {

        window.location.href = "login.html";

    }, 800);

}

/* ==========================================================
   Search Helper
========================================================== */

function searchArray(array, keyword) {

    keyword = keyword.toLowerCase();

    return array.filter(item =>

        JSON.stringify(item)

        .toLowerCase()

        .includes(keyword)

    );

}

/* ==========================================================
   Empty State
========================================================== */

function showEmpty(container, text) {

    container.innerHTML =

        `<div class="empty-state">

            <h3>${text}</h3>

        </div>`;

}

/* ==========================================================
   Page Title
========================================================== */

function changeTitle(title) {

    document.title = title + " | StudyHub";

}

/* ==========================================================
   Version
========================================================== */

console.log(

    APP_NAME,

    APP_VERSION

);