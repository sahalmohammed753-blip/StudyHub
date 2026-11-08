/* =========================================================
   STUDYHUB - TEACHERS PAGE
   ========================================================= */


/* =========================================================
   TEACHER DATA
   ========================================================= */

const teachers = [

    {
        id: 1,
        name: "Dr. Arun Kumar",
        role: "Professor",
        department: "Computer Science",
        experience: 12,
        email: "arun.kumar@studyhub.edu",
        subjects: [
            "Data Structures",
            "Algorithms"
        ]
    },

    {
        id: 2,
        name: "Prof. Priya Menon",
        role: "Assistant Professor",
        department: "Computer Science",
        experience: 8,
        email: "priya.menon@studyhub.edu",
        subjects: [
            "Database Management",
            "Web Technology"
        ]
    },

    {
        id: 3,
        name: "Dr. Rahul Sharma",
        role: "Associate Professor",
        department: "Artificial Intelligence",
        experience: 10,
        email: "rahul.sharma@studyhub.edu",
        subjects: [
            "Artificial Intelligence",
            "Machine Learning"
        ]
    },

    {
        id: 4,
        name: "Prof. Sneha Nair",
        role: "Assistant Professor",
        department: "Information Science",
        experience: 6,
        email: "sneha.nair@studyhub.edu",
        subjects: [
            "Software Engineering",
            "Computer Networks"
        ]
    },

    {
        id: 5,
        name: "Dr. Vivek Rao",
        role: "Professor",
        department: "Computer Science",
        experience: 15,
        email: "vivek.rao@studyhub.edu",
        subjects: [
            "Operating Systems",
            "Computer Architecture"
        ]
    },

    {
        id: 6,
        name: "Prof. Anjali Thomas",
        role: "Assistant Professor",
        department: "Electronics",
        experience: 7,
        email: "anjali.thomas@studyhub.edu",
        subjects: [
            "Digital Electronics",
            "Signals and Systems"
        ]
    },

    {
        id: 7,
        name: "Dr. Mohammed Faisal",
        role: "Associate Professor",
        department: "Artificial Intelligence",
        experience: 11,
        email: "mohammed.faisal@studyhub.edu",
        subjects: [
            "Deep Learning",
            "Computer Vision"
        ]
    },

    {
        id: 8,
        name: "Prof. Kavya Shetty",
        role: "Assistant Professor",
        department: "Information Science",
        experience: 5,
        email: "kavya.shetty@studyhub.edu",
        subjects: [
            "Cloud Computing",
            "Software Testing"
        ]
    },

    {
        id: 9,
        name: "Dr. Suresh Bhat",
        role: "Professor",
        department: "Mechanical Engineering",
        experience: 18,
        email: "suresh.bhat@studyhub.edu",
        subjects: [
            "Engineering Mechanics",
            "Thermodynamics"
        ]
    },

    {
        id: 10,
        name: "Prof. Neha Joseph",
        role: "Assistant Professor",
        department: "Computer Science",
        experience: 4,
        email: "neha.joseph@studyhub.edu",
        subjects: [
            "Programming in C",
            "Java Programming"
        ]
    }

];


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const teachersGrid =
    document.getElementById("teachersGrid");

const emptyState =
    document.getElementById("emptyState");

const teacherSearch =
    document.getElementById("teacherSearch");

const departmentFilter =
    document.getElementById("departmentFilter");

const resetFilters =
    document.getElementById("resetFilters");

const resultCount =
    document.getElementById("resultCount");


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    populateDepartments();

    updateStats();

    renderTeachers(teachers);

    loadUser();

    setupMobileMenu();

});


/* =========================================================
   LOAD USER
   ========================================================= */

function loadUser() {

    let user = null;

    try {

        if (typeof getCurrentUser === "function") {
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
   POPULATE DEPARTMENTS
   ========================================================= */

function populateDepartments() {

    const departments = [
        ...new Set(
            teachers.map(
                teacher => teacher.department
            )
        )
    ];


    departments.sort();


    departments.forEach(department => {

        const option =
            document.createElement("option");

        option.value = department;

        option.textContent = department;

        departmentFilter.appendChild(option);

    });

}


/* =========================================================
   UPDATE STATISTICS
   ========================================================= */

function updateStats() {

    const totalTeachers =
        teachers.length;


    const departments =
        new Set(
            teachers.map(
                teacher => teacher.department
            )
        );


    const subjects =
        new Set();


    teachers.forEach(teacher => {

        teacher.subjects.forEach(subject => {

            subjects.add(subject);

        });

    });


    const experienced =
        teachers.filter(
            teacher => teacher.experience >= 10
        ).length;


    document.getElementById(
        "totalTeachers"
    ).textContent = totalTeachers;


    document.getElementById(
        "totalDepartments"
    ).textContent = departments.size;


    document.getElementById(
        "totalSubjects"
    ).textContent = subjects.size;


    document.getElementById(
        "experiencedTeachers"
    ).textContent = experienced;

}


/* =========================================================
   FILTER TEACHERS
   ========================================================= */

function filterTeachers() {

    const search =
        teacherSearch.value
            .trim()
            .toLowerCase();


    const department =
        departmentFilter.value;


    const filtered =
        teachers.filter(teacher => {

            const searchableText = [

                teacher.name,

                teacher.role,

                teacher.department,

                teacher.email,

                ...teacher.subjects

            ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !search ||
                searchableText.includes(search);


            const matchesDepartment =
                department === "all" ||
                teacher.department === department;


            return (
                matchesSearch &&
                matchesDepartment
            );

        });


    renderTeachers(filtered);

}


/* =========================================================
   RENDER TEACHERS
   ========================================================= */

function renderTeachers(data) {

    teachersGrid.innerHTML = "";


    resultCount.textContent =
        `${data.length} ${
            data.length === 1
                ? "teacher"
                : "teachers"
        }`;


    if (data.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    data.forEach(teacher => {

        teachersGrid.appendChild(
            createTeacherCard(teacher)
        );

    });

}


/* =========================================================
   CREATE TEACHER CARD
   ========================================================= */

function createTeacherCard(teacher) {

    const card =
        document.createElement("article");


    card.className = "teacher-card";


    const initials =
        getInitials(teacher.name);


    const subjectTags =
        teacher.subjects
            .map(subject => {

                return `
                    <span class="subject-tag">
                        ${escapeHTML(subject)}
                    </span>
                `;

            })
            .join("");


    card.innerHTML = `

        <div class="teacher-top">

            <div class="teacher-profile">

                <div class="teacher-avatar">
                    ${initials}
                </div>

                <div>

                    <h3 class="teacher-name">
                        ${escapeHTML(teacher.name)}
                    </h3>

                    <span class="teacher-role">
                        ${escapeHTML(teacher.role)}
                    </span>

                </div>

            </div>


            <span class="teacher-status">
                Faculty
            </span>

        </div>


        <div class="teacher-department">

            <i class="fa-solid fa-building-columns"></i>

            ${escapeHTML(teacher.department)}

        </div>


        <div class="teacher-divider"></div>


        <div class="teacher-details">

            <div class="detail-row">

                <i class="fa-solid fa-clock"></i>

                <span>
                    Experience:
                    <strong>
                        ${teacher.experience} years
                    </strong>
                </span>

            </div>


            <div class="detail-row">

                <i class="fa-solid fa-book-open"></i>

                <span>
                    Subjects handled
                </span>

            </div>


            <div class="subject-list">

                ${subjectTags}

            </div>


            <div class="detail-row">

                <i class="fa-solid fa-envelope"></i>

                <span>
                    ${escapeHTML(teacher.email)}
                </span>

            </div>

        </div>


        <div class="teacher-actions">

            <button
                class="teacher-btn primary"
                onclick="viewTeacherSubjects(${teacher.id})"
            >

                <i class="fa-solid fa-book"></i>

                View Subjects

            </button>


            <a
                href="mailto:${escapeHTML(teacher.email)}"
                class="teacher-btn secondary"
            >

                <i class="fa-solid fa-paper-plane"></i>

                Email

            </a>

        </div>

    `;


    return card;

}


/* =========================================================
   VIEW TEACHER SUBJECTS
   ========================================================= */

function viewTeacherSubjects(id) {

    const teacher =
        teachers.find(
            item => item.id === id
        );


    if (!teacher) {
        return;
    }


    const subjects =
        teacher.subjects.join(", ");


    alert(
        `${teacher.name}\n\nSubjects:\n${subjects}`
    );

}


/* =========================================================
   RESET FILTERS
   ========================================================= */

function resetTeacherFilters() {

    teacherSearch.value = "";

    departmentFilter.value = "all";

    renderTeachers(teachers);

}


if (resetFilters) {

    resetFilters.addEventListener(
        "click",
        resetTeacherFilters
    );

}


/* =========================================================
   SEARCH EVENTS
   ========================================================= */

if (teacherSearch) {

    teacherSearch.addEventListener(
        "input",
        filterTeachers
    );

}


if (departmentFilter) {

    departmentFilter.addEventListener(
        "change",
        filterTeachers
    );

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
        document.querySelector(".sidebar");


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
       Fallback:
       Redirect to login page.
    */

    window.location.href =
        "login.html";

}


/* =========================================================
   INITIALS
   ========================================================= */

function getInitials(name) {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word =>
                word
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}