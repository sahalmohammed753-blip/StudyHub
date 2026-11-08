/* ==========================================================
   StudyHub
   darkmode.js
   Light / Dark Theme Controller
========================================================== */

"use strict";

/* ==========================================================
   Constants
========================================================== */

const THEME_KEY = "studyhub-theme";

const DARK_THEME = "dark";

const LIGHT_THEME = "light";

/* ==========================================================
   Initialize
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeTheme();

});

/* ==========================================================
   Initialize Theme
========================================================== */

function initializeTheme() {

    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme) {

        applyTheme(savedTheme);

    } else {

        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        applyTheme(prefersDark ? DARK_THEME : LIGHT_THEME);

    }

}

/* ==========================================================
   Toggle Theme
========================================================== */

function toggleDarkMode() {

    const currentTheme = document.body.classList.contains(DARK_THEME)
        ? DARK_THEME
        : LIGHT_THEME;

    const nextTheme = currentTheme === DARK_THEME
        ? LIGHT_THEME
        : DARK_THEME;

    applyTheme(nextTheme);

}

/* ==========================================================
   Apply Theme
========================================================== */

function applyTheme(theme) {

    document.body.classList.remove(DARK_THEME, LIGHT_THEME);

    document.body.classList.add(theme);

    localStorage.setItem(THEME_KEY, theme);

    updateThemeButton(theme);

}

/* ==========================================================
   Update Theme Button
========================================================== */

function updateThemeButton(theme) {

    const buttons = document.querySelectorAll(".theme-toggle");

    buttons.forEach(button => {

        if (theme === DARK_THEME) {

            button.innerHTML =
                '<i class="fa-solid fa-sun"></i> Light Mode';

        } else {

            button.innerHTML =
                '<i class="fa-solid fa-moon"></i> Dark Mode';

        }

    });

}

/* ==========================================================
   Listen for System Theme Changes
========================================================== */

const mediaQuery = window.matchMedia(
    "(prefers-color-scheme: dark)"
);

mediaQuery.addEventListener("change", (event) => {

    if (!localStorage.getItem(THEME_KEY)) {

        applyTheme(
            event.matches
                ? DARK_THEME
                : LIGHT_THEME
        );

    }

});

/* ==========================================================
   Reset Theme
========================================================== */

function resetTheme() {

    localStorage.removeItem(THEME_KEY);

    initializeTheme();

}

/* ==========================================================
   Get Current Theme
========================================================== */

function getCurrentTheme() {

    return document.body.classList.contains(DARK_THEME)
        ? DARK_THEME
        : LIGHT_THEME;

}

/* ==========================================================
   Theme Information
========================================================== */

function isDarkMode() {

    return getCurrentTheme() === DARK_THEME;

}

console.log("Dark Mode Initialized");