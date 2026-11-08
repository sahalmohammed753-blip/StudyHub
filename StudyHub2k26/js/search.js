/* ==========================================================
   StudyHub
   search.js
   Notes Search, Filter & Display
========================================================== */

"use strict";

/* ==========================================================
   Global Variables
========================================================== */

let allNotes = [];
let filteredNotes = [];

/* ==========================================================
   Initialize
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadNotes();

    initializeSearch();

});

/* ==========================================================
   Load Notes
========================================================== */

function loadNotes() {

    allNotes = JSON.parse(localStorage.getItem("notes")) || [];

    filteredNotes = [...allNotes];

    displayNotes(filteredNotes);

    updateStatistics();

}

/* ==========================================================
   Initialize Search
========================================================== */

function initializeSearch() {

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {

        searchInput.addEventListener("keyup", searchNotes);

    }

}

/* ==========================================================
   Search Notes
========================================================== */

function searchNotes() {

    const keyword = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    filteredNotes = allNotes.filter(note => {

        return (

            note.title?.toLowerCase().includes(keyword) ||

            note.subject?.toLowerCase().includes(keyword) ||

            note.department?.toLowerCase().includes(keyword) ||

            note.description?.toLowerCase().includes(keyword)

        );

    });

    displayNotes(filteredNotes);

    updateStatistics();

}

/* ==========================================================
   Apply Filters
========================================================== */

function applyFilters() {

    const department = document.getElementById("departmentFilter").value;

    const semester = document.getElementById("semesterFilter").value;

    const sort = document.getElementById("sortFilter").value;

    filteredNotes = [...allNotes];

    if (department !== "") {

        filteredNotes = filteredNotes.filter(

            note => note.department === department

        );

    }

    if (semester !== "") {

        filteredNotes = filteredNotes.filter(

            note => note.semester == semester

        );

    }

    sortNotes(sort);

}

/* ==========================================================
   Sort Notes
========================================================== */

function sortNotes(type) {

    switch (type) {

        case "title":

            filteredNotes.sort((a, b) =>

                a.title.localeCompare(b.title)

            );

            break;

        case "downloads":

            filteredNotes.sort((a, b) =>

                (b.downloads || 0) -

                (a.downloads || 0)

            );

            break;

        case "latest":

        default:

            filteredNotes.sort((a, b) =>

                new Date(b.date || 0) -

                new Date(a.date || 0)

            );

    }

    displayNotes(filteredNotes);

    updateStatistics();

}

/* ==========================================================
   Display Notes
========================================================== */

function displayNotes(notes) {

    const container = document.getElementById("notesContainer");

    if (!container) return;

    container.innerHTML = "";

    if (notes.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-folder-open fa-3x"></i>

                <h3>No Notes Found</h3>

                <p>Try changing your search or filters.</p>

            </div>

        `;

        return;

    }

    notes.forEach((note, index) => {

        container.innerHTML += `

        <div class="note-card">

            <h3>${note.title}</h3>

            <p><strong>Subject:</strong> ${note.subject}</p>

            <p><strong>Department:</strong> ${note.department}</p>

            <p><strong>Semester:</strong> ${note.semester}</p>

            <p>${note.description}</p>

            <div class="note-actions">

                <button
                    onclick="downloadNote(${index})"
                    class="btn btn-primary">

                    <i class="fa-solid fa-download"></i>

                    Download

                </button>

                <button
                    onclick="bookmarkNote(${index})"
                    class="btn btn-outline">

                    <i class="fa-solid fa-bookmark"></i>

                    Bookmark

                </button>

            </div>

        </div>

        `;

    });

}

/* ==========================================================
   Download Note
========================================================== */

function downloadNote(index) {

    const note = filteredNotes[index];

    if (!note) return;

    note.downloads = (note.downloads || 0) + 1;

    localStorage.setItem(

        "notes",

        JSON.stringify(allNotes)

    );

    alert("Downloading: " + note.title);

    updateStatistics();

}

/* ==========================================================
   Bookmark Note
========================================================== */

function bookmarkNote(index) {

    const note = filteredNotes[index];

    let bookmarks = JSON.parse(

        localStorage.getItem("bookmarks")

    ) || [];

    const exists = bookmarks.find(

        item => item.title === note.title

    );

    if (exists) {

        alert("Already Bookmarked");

        return;

    }

    bookmarks.push(note);

    localStorage.setItem(

        "bookmarks",

        JSON.stringify(bookmarks)

    );

    alert("Bookmarked Successfully");

    loadBookmarks();

}

/* ==========================================================
   Load Bookmarks
========================================================== */

function loadBookmarks() {

    const container = document.getElementById("bookmarkContainer");

    if (!container) return;

    const bookmarks = JSON.parse(

        localStorage.getItem("bookmarks")

    ) || [];

    container.innerHTML = "";

    if (bookmarks.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>No Bookmarks Yet</h3>

            </div>

        `;

        return;

    }

    bookmarks.forEach(note => {

        container.innerHTML += `

        <div class="note-card">

            <h3>${note.title}</h3>

            <p>${note.subject}</p>

        </div>

        `;

    });

}

/* ==========================================================
   Statistics
========================================================== */

function updateStatistics() {

    const totalNotes = document.getElementById("libraryNotes");

    const totalDownloads = document.getElementById("libraryDownloads");

    const totalBookmarks = document.getElementById("libraryBookmarks");

    const contributors = document.getElementById("libraryContributors");

    if (totalNotes)

        totalNotes.textContent = allNotes.length;

    if (totalDownloads) {

        const count = allNotes.reduce(

            (sum, note) => sum + (note.downloads || 0),

            0

        );

        totalDownloads.textContent = count;

    }

    if (totalBookmarks) {

        const bookmarks = JSON.parse(

            localStorage.getItem("bookmarks")

        ) || [];

        totalBookmarks.textContent = bookmarks.length;

    }

    if (contributors) {

        const unique = new Set(

            allNotes.map(

                note => note.author || "Unknown"

            )

        );

        contributors.textContent = unique.size;

    }

}

/* ==========================================================
   Clear Filters
========================================================== */

function clearFilters() {

    document.getElementById("searchInput").value = "";

    document.getElementById("departmentFilter").value = "";

    document.getElementById("semesterFilter").value = "";

    document.getElementById("sortFilter").value = "latest";

    filteredNotes = [...allNotes];

    displayNotes(filteredNotes);

    updateStatistics();

}

/* ==========================================================
   Refresh Notes
========================================================== */

function refreshNotes() {

    loadNotes();

    loadBookmarks();

}

/* ==========================================================
   Auto Load Bookmarks
========================================================== */

loadBookmarks();