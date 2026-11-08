document.addEventListener("DOMContentLoaded", () => {

    // ==============================
    // ELEMENTS
    // ==============================

    const subjectSearch = document.getElementById("subjectSearch");
    const departmentFilter = document.getElementById("departmentFilter");
    const semesterFilter = document.getElementById("semesterFilter");

    const clearFilters = document.getElementById("clearFilters");
    const refreshSubjects = document.getElementById("refreshSubjects");
    const emptyReset = document.getElementById("emptyReset");

    const subjectsGrid = document.getElementById("subjectsGrid");
    const emptyState = document.getElementById("emptyState");
    const resultCount = document.getElementById("resultCount");

    const totalSubjects = document.getElementById("totalSubjects");
    const totalResources = document.getElementById("totalResources");
    const totalDepartments = document.getElementById("totalDepartments");


    // ==============================
    // SUBJECT DATA
    // ==============================

    const subjects = [

        {
            name: "Programming in C",
            code: "CS101",
            department: "CSE",
            semester: "1",
            icon: "fa-code",
            description:
                "Programming fundamentals, problem solving, functions, arrays and pointers.",
            resourceKeywords: [
                "programming",
                "c",
                "cs101"
            ]
        },

        {
            name: "Data Structures",
            code: "CS201",
            department: "CSE",
            semester: "3",
            icon: "fa-diagram-project",
            description:
                "Learn arrays, linked lists, stacks, queues, trees and graph structures.",
            resourceKeywords: [
                "data structures",
                "dsa",
                "data structure"
            ]
        },

        {
            name: "Database Management Systems",
            code: "CS301",
            department: "CSE",
            semester: "4",
            icon: "fa-database",
            description:
                "Relational databases, SQL, normalization, transactions and database design.",
            resourceKeywords: [
                "database",
                "dbms",
                "sql"
            ]
        },

        {
            name: "Operating Systems",
            code: "CS302",
            department: "CSE",
            semester: "4",
            icon: "fa-desktop",
            description:
                "Processes, memory management, scheduling, file systems and security.",
            resourceKeywords: [
                "operating systems",
                "os",
                "operating system"
            ]
        },

        {
            name: "Computer Networks",
            code: "CS401",
            department: "CSE",
            semester: "5",
            icon: "fa-network-wired",
            description:
                "Networking concepts, protocols, addressing, routing and network security.",
            resourceKeywords: [
                "computer networks",
                "network",
                "networks"
            ]
        },

        {
            name: "Web Technology",
            code: "CS402",
            department: "CSE",
            semester: "5",
            icon: "fa-globe",
            description:
                "Build modern web applications using HTML, CSS, JavaScript and related tools.",
            resourceKeywords: [
                "web technology",
                "web development",
                "html",
                "css",
                "javascript"
            ]
        },

        {
            name: "Software Engineering",
            code: "ISE301",
            department: "ISE",
            semester: "4",
            icon: "fa-sitemap",
            description:
                "Software life cycle, requirements, design, testing and project management.",
            resourceKeywords: [
                "software engineering",
                "software"
            ]
        },

        {
            name: "Artificial Intelligence",
            code: "AI401",
            department: "AIML",
            semester: "5",
            icon: "fa-brain",
            description:
                "Intelligent agents, search, reasoning, knowledge representation and learning.",
            resourceKeywords: [
                "artificial intelligence",
                "ai"
            ]
        },

        {
            name: "Machine Learning",
            code: "AI402",
            department: "AIML",
            semester: "6",
            icon: "fa-robot",
            description:
                "Supervised and unsupervised learning, models, evaluation and applications.",
            resourceKeywords: [
                "machine learning",
                "ml"
            ]
        },

        {
            name: "Digital Electronics",
            code: "EC201",
            department: "ECE",
            semester: "3",
            icon: "fa-microchip",
            description:
                "Digital logic, Boolean algebra, combinational and sequential circuits.",
            resourceKeywords: [
                "digital electronics",
                "digital"
            ]
        },

        {
            name: "Signals and Systems",
            code: "EC301",
            department: "ECE",
            semester: "4",
            icon: "fa-wave-square",
            description:
                "Continuous and discrete signals, systems, transforms and signal analysis.",
            resourceKeywords: [
                "signals",
                "signals and systems"
            ]
        },

        {
            name: "Electrical Machines",
            code: "EE301",
            department: "EEE",
            semester: "4",
            icon: "fa-bolt",
            description:
                "Transformers, DC machines, induction machines and electrical drives.",
            resourceKeywords: [
                "electrical machines",
                "machines"
            ]
        },

        {
            name: "Engineering Mechanics",
            code: "ME101",
            department: "Mechanical",
            semester: "1",
            icon: "fa-gears",
            description:
                "Forces, equilibrium, friction, motion and basic engineering mechanics.",
            resourceKeywords: [
                "engineering mechanics",
                "mechanics"
            ]
        },

        {
            name: "Engineering Drawing",
            code: "CV101",
            department: "Civil",
            semester: "1",
            icon: "fa-ruler-combined",
            description:
                "Technical drawing, projections, dimensioning and engineering graphics.",
            resourceKeywords: [
                "engineering drawing",
                "drawing"
            ]
        }

    ];


    // ==============================
    // NOTES DATA
    // ==============================

    let allNotes = [];


    // ==============================
    // LOAD NOTES
    // ==============================

    function loadNotes() {

        try {

            if (typeof getNotes === "function") {

                allNotes = getNotes() || [];

            } else {

                allNotes = JSON.parse(
                    localStorage.getItem("studyhub_notes") || "[]"
                );

            }

        } catch (error) {

            console.error("Could not load notes:", error);

            allNotes = [];

        }

    }


    // ==============================
    // NORMALIZE TEXT
    // ==============================

    function normalize(value) {

        return String(value || "")
            .trim()
            .toLowerCase();

    }


    // ==============================
    // FIND SUBJECT RESOURCES
    // ==============================

    function getSubjectResources(subject) {

        const subjectName = normalize(subject.name);

        return allNotes.filter(note => {

            const fields = [

                note.title,
                note.subject,
                note.description,
                note.fileName

            ].map(normalize);


            return (

                fields.some(field =>
                    field.includes(subjectName)
                )

                ||

                subject.resourceKeywords.some(keyword =>

                    fields.some(field =>
                        field.includes(normalize(keyword))
                    )

                )

            );

        });

    }


    // ==============================
    // GET FILTERED SUBJECTS
    // ==============================

    function getFilteredSubjects() {

        const search = normalize(subjectSearch.value);

        const department =
            departmentFilter.value;

        const semester =
            semesterFilter.value;


        return subjects.filter(subject => {

            const matchesSearch =

                !search ||

                normalize(subject.name).includes(search) ||

                normalize(subject.code).includes(search) ||

                normalize(subject.department).includes(search) ||

                normalize(subject.description).includes(search);


            const matchesDepartment =

                !department ||

                subject.department === department;


            const matchesSemester =

                !semester ||

                subject.semester === semester;


            return (

                matchesSearch &&

                matchesDepartment &&

                matchesSemester

            );

        });

    }


    // ==============================
    // RENDER SUBJECTS
    // ==============================

    function renderSubjects() {

        const filteredSubjects =
            getFilteredSubjects();


        subjectsGrid.innerHTML = "";


        resultCount.textContent =
            filteredSubjects.length;


        // No results

        if (filteredSubjects.length === 0) {

            subjectsGrid.classList.add("hidden");

            emptyState.classList.remove("hidden");

            return;

        }


        // Results available

        subjectsGrid.classList.remove("hidden");

        emptyState.classList.add("hidden");


        filteredSubjects.forEach(subject => {

            subjectsGrid.appendChild(
                createSubjectCard(subject)
            );

        });

    }


    // ==============================
    // CREATE SUBJECT CARD
    // ==============================

    function createSubjectCard(subject) {

        const card =
            document.createElement("article");


        card.className =
            "subject-card";


        const resources =
            getSubjectResources(subject);


        card.innerHTML = `

            <div class="subject-top">

                <div class="subject-icon">

                    <i class="fa-solid ${subject.icon}"></i>

                </div>

                <span class="subject-code">

                    ${escapeHTML(subject.code)}

                </span>

            </div>


            <h3>

                ${escapeHTML(subject.name)}

            </h3>


            <p class="subject-description">

                ${escapeHTML(subject.description)}

            </p>


            <div class="subject-meta">

                <span class="meta-pill">

                    ${escapeHTML(subject.department)}

                </span>

                <span class="meta-pill">

                    Semester ${escapeHTML(subject.semester)}

                </span>

            </div>


            <div class="subject-footer">

                <span class="resource-count">

                    <i class="fa-solid fa-file-lines"></i>

                    ${resources.length}

                    resource${resources.length === 1 ? "" : "s"}

                </span>


                <a

                    class="view-notes"

                    href="notes.html?subject=${encodeURIComponent(subject.name)}"

                >

                    View Notes

                    <i class="fa-solid fa-arrow-right"></i>

                </a>

            </div>

        `;


        return card;

    }


    // ==============================
    // UPDATE STATISTICS
    // ==============================

    function updateStats() {

        totalSubjects.textContent =
            subjects.length;


        totalResources.textContent =
            allNotes.length;


        const departments =
            new Set(
                subjects.map(subject =>
                    subject.department
                )
            );


        totalDepartments.textContent =
            departments.size;

    }


    // ==============================
    // RESET FILTERS
    // ==============================

    function resetFilters() {

        subjectSearch.value = "";

        departmentFilter.value = "";

        semesterFilter.value = "";


        renderSubjects();

    }


    // ==============================
    // ESCAPE HTML
    // ==============================

    function escapeHTML(value) {

        return String(value ?? "")

            .replace(/&/g, "&amp;")

            .replace(/</g, "&lt;")

            .replace(/>/g, "&gt;")

            .replace(/"/g, "&quot;")

            .replace(/'/g, "&#039;");

    }


    // ==============================
    // SEARCH
    // ==============================

    subjectSearch.addEventListener(
        "input",
        renderSubjects
    );


    // ==============================
    // DEPARTMENT FILTER
    // ==============================

    departmentFilter.addEventListener(
        "change",
        renderSubjects
    );


    // ==============================
    // SEMESTER FILTER
    // ==============================

    semesterFilter.addEventListener(
        "change",
        renderSubjects
    );


    // ==============================
    // RESET BUTTON
    // ==============================

    clearFilters.addEventListener(
        "click",
        resetFilters
    );


    emptyReset.addEventListener(
        "click",
        resetFilters
    );


    // ==============================
    // REFRESH BUTTON
    // ==============================

    refreshSubjects.addEventListener(
        "click",
        () => {

            loadNotes();

            updateStats();

            renderSubjects();

        }
    );


    // ==============================
    // LOAD USER NAME
    // ==============================

    try {

        if (
            typeof getCurrentUser === "function"
        ) {

            const user =
                getCurrentUser();


            if (user) {

                const username =
                    document.getElementById("username");


                if (username) {

                    username.textContent =

                        user.name ||

                        user.username ||

                        user.fullName ||

                        user.email ||

                        "Student";

                }

            }

        }

    } catch (error) {

        console.warn(
            "User display could not be updated:",
            error
        );

    }


    // ==============================
    // INITIALIZE PAGE
    // ==============================

    loadNotes();

    updateStats();

    renderSubjects();

});