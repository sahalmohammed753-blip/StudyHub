/* ==========================================
   STUDYHUB DASHBOARD
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (typeof requireLogin === "function") {
        requireLogin();
    }
    loadStatistics();
    displayNotes();
    attachSearch();
});
/* ==========================================
   STATISTICS
========================================== */

function loadStatistics() {

    const stats = dashboardStats();

    setText("totalNotes", stats.notes);
    setText("totalUsers", stats.users);
    setText("totalBookmarks", stats.bookmarks);
    setText("totalDownloads", stats.downloads);

}

function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}

/* ==========================================
   DISPLAY NOTES
========================================== */

function displayNotes(notes = getNotes()) {

    const container = document.getElementById("notesContainer");

    if (!container) return;

    container.innerHTML = "";

    if (notes.length === 0) {

        container.innerHTML =
        "<p>No notes available.</p>";

        return;

    }

    notes.forEach(note => {

        container.innerHTML += `

        <div class="note-card">

            <h3>${note.title}</h3>

            <p><strong>Subject:</strong> ${note.subject}</p>

            <p><strong>Department:</strong> ${note.department}</p>

            <p><strong>Semester:</strong> ${note.semester}</p>

            <p><strong>Teacher:</strong> ${note.teacher}</p>

            <p>${note.description}</p>

            <div class="note-actions">

                <button onclick="viewNote(${note.id})">
                    View
                </button>

                <button onclick="bookmark(${note.id})">
                    Bookmark
                </button>

                <button onclick="download(${note.id})">
                    Download
                </button>

                <button onclick="deleteMyNote(${note.id})">
                    Delete
                </button>

            </div>

        </div>

        `;

    });

}

/* ==========================================
   SEARCH
========================================== */

function attachSearch() {

    const input = document.getElementById("searchInput");

    if (!input) return;

    input.addEventListener("keyup", function () {

        const keyword = this.value.trim();

        if (keyword === "") {

            displayNotes(getNotes());

        } else {

            displayNotes(searchNotes(keyword));

        }

    });

}

/* ==========================================
   FILTERS
========================================== */

function filterDepartment(select) {

    displayNotes(

        filterByDepartment(select.value)

    );

}

function filterSemester(select) {

    displayNotes(

        filterBySemester(select.value)

    );

}

function filterSubject(select) {

    displayNotes(

        filterBySubject(select.value)

    );

}

/* ==========================================
   VIEW
========================================== */

function viewNote(id) {

    addRecent(id);

    const note = getNote(id);

    if (!note) return;

    alert(

`${note.title}

Subject : ${note.subject}

Teacher : ${note.teacher}

${note.description}`

    );

}

/* ==========================================
   BOOKMARK
========================================== */

function bookmark(id) {

    bookmarkNote(id);

    alert("Bookmarked!");

    loadStatistics();

}

/* ==========================================
   DOWNLOAD
========================================== */

function download(id) {

    const note = getNote(id);

    if (!note) return;

    downloadNote(id);

    window.open(note.file, "_blank");

    loadStatistics();

}

/* ==========================================
   DELETE
========================================== */

function deleteMyNote(id) {

    if (!confirm("Delete this note?"))
        return;

    deleteNote(id);

    displayNotes();

    loadStatistics();

}

/* ==========================================
   LOGOUT
========================================== */

function logoutUser() {

    logout();

}

/* ==========================================
   REFRESH
========================================== */

function refreshDashboard() {

    displayNotes();

    loadStatistics();

}

/* ==========================================
   RECENT NOTES
========================================== */

function loadRecentNotes() {

    const recent = getRecent();

    console.log(recent);

}

/* ==========================================
   BOOKMARK LIST
========================================== */

function loadBookmarks() {

    const bookmarks = getBookmarks();

    console.log(bookmarks);

}

/* ==========================================
   DOWNLOAD HISTORY
========================================== */

function loadDownloads() {

    const downloads = getDownloads();

    console.log(downloads);

}