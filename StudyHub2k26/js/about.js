/* =========================================================
   STUDYHUB - ABOUT PAGE
   ========================================================= */


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadUser();

    loadPlatformStats();

    setupMobileMenu();

});


/* =========================================================
   LOAD USER
   ========================================================= */

function loadUser() {

    let user = null;


    try {

        if (
            typeof getCurrentUser === "function"
        ) {

            user = getCurrentUser();

        }

    } catch (error) {

        console.warn(
            "Could not load current user.",
            error
        );

    }


    if (!user) {
        return;
    }


    const username =
        document.getElementById("username");


    const userAvatar =
        document.getElementById("userAvatar");


    const name =
        user.name ||
        user.username ||
        user.email ||
        "Student";


    if (username) {

        username.textContent = name;

    }


    if (userAvatar) {

        userAvatar.textContent =
            name
                .charAt(0)
                .toUpperCase();

    }

}


/* =========================================================
   PLATFORM STATISTICS
   ========================================================= */

function loadPlatformStats() {

    let notes = [];
    let bookmarks = [];
    let downloads = [];


    try {

        /*
         * Use StudyHub's existing storage system
         * when available.
         */

        if (
            typeof getNotes === "function"
        ) {

            notes = getNotes() || [];

        } else {

            notes =
                JSON.parse(
                    localStorage.getItem(
                        "studyhub_notes"
                    )
                ) || [];

        }


        bookmarks =
            JSON.parse(
                localStorage.getItem(
                    "studyhub_bookmarks"
                )
            ) || [];


        downloads =
            JSON.parse(
                localStorage.getItem(
                    "studyhub_downloads"
                )
            ) || [];

    } catch (error) {

        console.warn(
            "Could not load platform statistics.",
            error
        );

    }


    /*
     * Subjects
     */

    const subjects =
        new Set();


    notes.forEach(note => {

        if (note.subject) {

            subjects.add(
                note.subject
            );

        }

    });


    /*
     * Teachers
     *
     * This count can later be connected
     * to Firebase/teacher database.
     */

    let teachers = 10;


    /*
     * Users
     */

    let users = 1;


    try {

        const storedUsers =
            JSON.parse(
                localStorage.getItem(
                    "studyhub_users"
                )
            );


        if (
            Array.isArray(storedUsers) &&
            storedUsers.length > 0
        ) {

            users =
                storedUsers.length;

        }

    } catch (error) {

        console.warn(
            "Could not load user statistics."
        );

    }


    /*
     * Display statistics
     */

    animateNumber(
        "aboutNotes",
        notes.length
    );


    animateNumber(
        "aboutSubjects",
        subjects.size
    );


    animateNumber(
        "aboutTeachers",
        teachers
    );


    animateNumber(
        "aboutUsers",
        users
    );

}


/* =========================================================
   NUMBER ANIMATION
   ========================================================= */

function animateNumber(
    elementId,
    target
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    target =
        Number(target) || 0;


    if (target === 0) {

        element.textContent = "0";

        return;

    }


    let current = 0;


    const duration = 700;


    const steps = 30;


    const increment =
        target / steps;


    const interval =
        duration / steps;


    const timer =
        setInterval(() => {

            current += increment;


            if (current >= target) {

                current = target;

                clearInterval(timer);

            }


            element.textContent =
                Math.floor(current);

        }, interval);

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu() {

    const menuBtn =
        document.getElementById(
            "mobileMenuBtn"
        );


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (!menuBtn || !sidebar) {
        return;
    }


    menuBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );


    /*
     * Close sidebar after clicking
     * a navigation link on mobile.
     */

    const navLinks =
        sidebar.querySelectorAll(
            ".nav-link"
        );


    navLinks.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                sidebar.classList.remove(
                    "open"
                );

            }
        );

    });

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {

    try {

        if (
            typeof window.logout ===
            "function"
        ) {

            window.logout();

            return;

        }


        if (
            typeof window.logoutUserFromAuth ===
            "function"
        ) {

            window.logoutUserFromAuth();

            return;

        }

    } catch (error) {

        console.warn(
            "Logout function unavailable.",
            error
        );

    }


    /*
     * Fallback
     */

    window.location.href =
        "login.html";

}