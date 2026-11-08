"use strict";

const NOTES_API = "http://localhost:5000/api/notes";
const SERVER_URL = "http://localhost:5000";

const BOOKMARK_KEY = "studyhub_library_bookmarks_v2";
const DOWNLOAD_KEY = "studyhub_library_downloads_v2";

let libraryNotes = [];
let filteredLibraryNotes = [];

/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    if (typeof requireLogin === "function") {
        requireLogin();
    }

    updateUserName();
    bindLibraryEvents();
    loadLibrary();
});

/* =========================================================
   STORAGE HELPERS
========================================================= */

function getBookmarks() {
    try {
        return JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || [];
    } catch {
        return [];
    }
}

function saveBookmarks(bookmarks) {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
}

function getDownloadHistory() {
    try {
        return JSON.parse(localStorage.getItem(DOWNLOAD_KEY)) || [];
    } catch {
        return [];
    }
}

function saveDownloadHistory(history) {
    localStorage.setItem(DOWNLOAD_KEY, JSON.stringify(history));
}

/* =========================================================
   USER NAME
========================================================= */

function updateUserName() {
    const user = typeof getCurrentUser === "function"
        ? getCurrentUser()
        : null;

    const username = document.getElementById("username");

    if (username) {
        username.textContent = user?.name || "Student";
    }
}

/* =========================================================
   LOAD NOTES FROM MONGODB
========================================================= */

async function loadLibrary() {
    const container = document.getElementById("notesContainer");

    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <h3>Loading notes...</h3>
                <p>Please wait while we fetch the library.</p>
            </div>
        `;
    }

    const token = localStorage.getItem("studyhub_token");

    if (!token) {
        if (typeof logout === "function") {
            logout();
        }
        return;
    }

    try {
        const response = await fetch(NOTES_API, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load notes.");
        }

        // Supports either { notes: [...] } or { data: [...] }
        libraryNotes = Array.isArray(data)
            ? data
            : data.notes || data.data || [];

        filteredLibraryNotes = [...libraryNotes];

        applyLibraryFilters();
        renderBookmarks();
        renderDownloads();
        updateLibraryStats();

    } catch (error) {
        console.error("Notes Library Error:", error);

        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h3>Unable to load notes</h3>
                    <p>${escapeHTML(error.message)}</p>
                    <p>Check whether your backend server is running.</p>
                </div>
            `;
        }
    }
}

/* =========================================================
   EVENT LISTENERS
========================================================= */

function bindLibraryEvents() {
    const search = document.getElementById("searchInput");
    const department = document.getElementById("departmentFilter");
    const semester = document.getElementById("semesterFilter");
    const sort = document.getElementById("sortFilter");
    const clear = document.getElementById("clearFilters");
    const refresh = document.getElementById("refreshNotes");

    if (search) {
        search.addEventListener("input", applyLibraryFilters);
    }

    if (department) {
        department.addEventListener("change", applyLibraryFilters);
    }

    if (semester) {
        semester.addEventListener("change", applyLibraryFilters);
    }

    if (sort) {
        sort.addEventListener("change", applyLibraryFilters);
    }

    if (clear) {
        clear.addEventListener("click", () => {
            if (search) search.value = "";
            if (department) department.value = "";
            if (semester) semester.value = "";
            if (sort) sort.value = "latest";

            applyLibraryFilters();
        });
    }

    if (refresh) {
        refresh.addEventListener("click", loadLibrary);
    }

    document.querySelectorAll("[data-category]").forEach(button => {
        button.addEventListener("click", () => {
            const searchInput = document.getElementById("searchInput");

            if (searchInput) {
                searchInput.value = button.dataset.category;
            }

            applyLibraryFilters();

            document.getElementById("library")?.scrollIntoView({
                behavior: "smooth"
            });
        });
    });

    // Handle buttons inside dynamically created note cards.
    document.addEventListener("click", event => {
        const button = event.target.closest("[data-note-action]");

        if (!button) return;

        const id = button.dataset.noteId;
        const action = button.dataset.noteAction;

        if (action === "bookmark") {
            toggleBookmark(id);
        } else if (action === "download") {
            downloadLibraryNote(id);
        } else if (action === "view") {
            viewLibraryNote(id);
        } else if (action === "remove-bookmark") {
            toggleBookmark(id);
        }
    });
}

/* =========================================================
   SEARCH AND FILTER
========================================================= */

function applyLibraryFilters() {
    const keyword = (
        document.getElementById("searchInput")?.value || ""
    ).toLowerCase().trim();

    const department =
        document.getElementById("departmentFilter")?.value || "";

    const semester =
        document.getElementById("semesterFilter")?.value || "";

    const sort =
        document.getElementById("sortFilter")?.value || "latest";

    filteredLibraryNotes = libraryNotes.filter(note => {
        const searchableText = [
            note.title,
            note.subject,
            note.department,
            note.description,
            note.teacher,
            note.author,
            note.uploadedBy?.name,
            note.uploadedByEmail,
            note.fileName
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesKeyword =
            !keyword || searchableText.includes(keyword);

        const matchesDepartment =
            !department || note.department === department;

        const matchesSemester =
            !semester || String(note.semester) === semester;

        return matchesKeyword && matchesDepartment && matchesSemester;
    });

    sortLibrary(sort);
    renderLibrary();
    updateLibraryStats();
}

/* =========================================================
   SORT NOTES
========================================================= */

function sortLibrary(type) {
    filteredLibraryNotes.sort((a, b) => {
        if (type === "title") {
            return String(a.title || "").localeCompare(
                String(b.title || "")
            );
        }

        if (type === "downloads") {
            return (Number(b.downloads) || 0) -
                   (Number(a.downloads) || 0);
        }

        return new Date(b.createdAt || 0) -
               new Date(a.createdAt || 0);
    });
}

/* =========================================================
   RENDER NOTES
========================================================= */

function renderLibrary() {
    const container = document.getElementById("notesContainer");
    const count = document.getElementById("resultCount");

    if (!container) return;

    if (count) {
        count.textContent = filteredLibraryNotes.length;
    }

    if (!filteredLibraryNotes.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-folder-open"></i>
                <h3>No notes found</h3>
                <p>Try another keyword or reset your filters.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredLibraryNotes
        .map(note => createNoteCard(note))
        .join("");
}

/* =========================================================
   CREATE NOTE CARD
========================================================= */

function createNoteCard(note) {
    const id = escapeHTML(note._id || "");
    const fileType = getFileType(note);

    let iconClass = "fa-file-lines";

    if (fileType === "pdf") {
        iconClass = "fa-file-pdf";
    } else if (fileType === "word") {
        iconClass = "fa-file-word";
    } else if (fileType === "ppt") {
        iconClass = "fa-file-powerpoint";
    }

    const saved = isBookmarked(note);
    const downloads = Number(note.downloads) || 0;

    const author =
        note.teacher ||
        note.uploadedBy?.name ||
        note.uploadedByEmail ||
        "StudyHub Member";

    const date = formatDate(note.createdAt);

    return `
        <article class="note-card">

            <div class="note-card-head">
                <div class="file-icon file-${fileType}">
                    <i class="fa-solid ${iconClass}"></i>
                </div>

                <button
                    class="bookmark-btn ${saved ? "saved" : ""}"
                    data-note-action="bookmark"
                    data-note-id="${id}"
                    title="${saved ? "Remove bookmark" : "Bookmark note"}"
                    type="button"
                >
                    <i class="fa-${saved ? "solid" : "regular"} fa-bookmark"></i>
                </button>
            </div>

            <h3>${escapeHTML(note.title || "Untitled Note")}</h3>

            <p class="note-description">
                ${escapeHTML(
                    note.description || "No description available."
                )}
            </p>

            <div class="note-tags">
                ${note.subject ? `
                    <span class="note-tag">
                        ${escapeHTML(note.subject)}
                    </span>
                ` : ""}

                ${note.department ? `
                    <span class="note-tag">
                        ${escapeHTML(note.department)}
                    </span>
                ` : ""}

                ${note.semester ? `
                    <span class="note-tag">
                        Semester ${escapeHTML(note.semester)}
                    </span>
                ` : ""}
            </div>

            <div class="note-meta">
                <div class="note-meta-item">
                    <span>Uploaded by</span>
                    <strong>${escapeHTML(author)}</strong>
                </div>

                <div class="note-meta-item">
                    <span>Downloads</span>
                    <strong>${downloads}</strong>
                </div>

                <div class="note-meta-item">
                    <span>File</span>
                    <strong>${escapeHTML(note.fileName || "Resource file")}</strong>
                </div>

                <div class="note-meta-item">
                    <span>Added</span>
                    <strong>${escapeHTML(date || "Recently")}</strong>
                </div>
            </div>

            <div class="note-actions">
                <button
                    class="btn btn-primary"
                    data-note-action="download"
                    data-note-id="${id}"
                    type="button"
                >
                    <i class="fa-solid fa-download"></i>
                    Download
                </button>

                <button
                    class="btn btn-outline"
                    data-note-action="view"
                    data-note-id="${id}"
                    type="button"
                >
                    <i class="fa-solid fa-eye"></i>
                    View
                </button>
            </div>

        </article>
    `;
}

/* =========================================================
   BOOKMARKS
========================================================= */

function isBookmarked(note) {
    return getBookmarks().includes(String(note._id));
}

function toggleBookmark(id) {
    const noteId = String(id);
    let bookmarks = getBookmarks();

    if (bookmarks.includes(noteId)) {
        bookmarks = bookmarks.filter(item => item !== noteId);
    } else {
        bookmarks.push(noteId);
    }

    saveBookmarks(bookmarks);

    renderLibrary();
    renderBookmarks();
    updateLibraryStats();
}

function renderBookmarks() {
    const container = document.getElementById("bookmarkContainer");

    if (!container) return;

    const bookmarkIds = getBookmarks();

    const notes = bookmarkIds
        .map(id => libraryNotes.find(note => String(note._id) === id))
        .filter(Boolean);

    if (!notes.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-bookmark"></i>
                <h3>No bookmarks yet</h3>
                <p>Bookmark important notes and they will appear here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = notes.slice(0, 6).map(note => `
        <article class="note-card">
            <div class="note-card-head">
                <div class="file-icon file-other">
                    <i class="fa-solid fa-bookmark"></i>
                </div>
            </div>

            <h3>${escapeHTML(note.title || "Untitled Note")}</h3>

            <p class="note-description">
                ${escapeHTML(note.description || "Saved study resource.")}
            </p>

            <div class="note-tags">
                ${note.subject ? `
                    <span class="note-tag">${escapeHTML(note.subject)}</span>
                ` : ""}
                ${note.department ? `
                    <span class="note-tag">${escapeHTML(note.department)}</span>
                ` : ""}
            </div>

            <div class="note-actions">
                <button
                    class="btn btn-primary"
                    data-note-action="view"
                    data-note-id="${escapeHTML(note._id)}"
                    type="button"
                >
                    <i class="fa-solid fa-eye"></i> Open
                </button>

                <button
                    class="btn btn-outline"
                    data-note-action="remove-bookmark"
                    data-note-id="${escapeHTML(note._id)}"
                    type="button"
                >
                    Remove
                </button>
            </div>
        </article>
    `).join("");
}

/* =========================================================
   DOWNLOAD HISTORY
========================================================= */

function renderDownloads() {
    const tbody = document.getElementById("downloadHistory");

    if (!tbody) return;

    const history = getDownloadHistory().slice().reverse().slice(0, 10);

    if (!history.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div style="text-align:center; padding:20px; color:#94a3b8;">
                        No downloads yet.
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = history.map(item => {
        const note = libraryNotes.find(
            n => String(n._id) === String(item.noteId)
        );

        return `
            <tr>
                <td>
                    <div class="table-note">
                        <i class="fa-solid fa-file-lines"></i>
                        ${escapeHTML(note?.title || item.title || "Study Resource")}
                    </div>
                </td>

                <td>${escapeHTML(note?.subject || item.subject || "—")}</td>
                <td>${escapeHTML(note?.department || item.department || "—")}</td>
                <td>${escapeHTML(item.date || "—")}</td>

                <td>
                    <span class="status-pill">
                        <i class="fa-solid fa-check"></i>
                        Downloaded
                    </span>
                </td>
            </tr>
        `;
    }).join("");
}

/* =========================================================
   LIBRARY STATISTICS
========================================================= */

function updateLibraryStats() {
    const notesElement = document.getElementById("libraryNotes");
    const downloadsElement = document.getElementById("libraryDownloads");
    const bookmarksElement = document.getElementById("libraryBookmarks");
    const contributorsElement = document.getElementById("libraryContributors");

    if (notesElement) {
        notesElement.textContent = libraryNotes.length;
    }

    if (downloadsElement) {
        const totalDownloads = libraryNotes.reduce(
            (total, note) => total + (Number(note.downloads) || 0),
            0
        );

        downloadsElement.textContent = totalDownloads;
    }

    if (bookmarksElement) {
        bookmarksElement.textContent = getBookmarks().length;
    }

    if (contributorsElement) {
        const contributors = new Set(
            libraryNotes
                .map(note =>
                    note.teacher ||
                    note.uploadedBy?.name ||
                    note.uploadedByEmail ||
                    note.uploadedBy
                )
                .filter(Boolean)
                .map(String)
        );

        contributorsElement.textContent = contributors.size;
    }
}

/* =========================================================
   FILE URL
========================================================= */

function getNoteFileURL(note) {
    if (!note.filePath) return "";

    const path = String(note.filePath);

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    return SERVER_URL + (path.startsWith("/") ? path : `/${path}`);
}

/* =========================================================
   DOWNLOAD NOTE - MONGODB INTEGRATION
========================================================= */

async function downloadLibraryNote(id) {

    const note = libraryNotes.find(
        item => String(item._id) === String(id)
    );

    if (!note) return;

    const token = localStorage.getItem("studyhub_token");

    if (!token) {
        alert("Please login to download notes.");
        return;
    }

    try {

        // Request download from backend
        const response = await fetch(
            `${NOTES_API}/${encodeURIComponent(id)}/download`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            throw new Error(
                errorData.message || "Unable to download this note."
            );
        }

        // Convert server response into a downloadable file
        const blob = await response.blob();

        const fileURL = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = fileURL;
        link.download = note.fileName || "StudyHub-Note";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(fileURL);

        // Update local download count immediately
        note.downloads = Number(note.downloads || 0) + 1;

        // Save download history
        const history = getDownloadHistory();

        history.push({
            noteId: String(note._id),
            title: note.title,
            subject: note.subject,
            department: note.department,
            date: new Date().toLocaleString()
        });

        saveDownloadHistory(history);

        renderDownloads();

        alert("Note downloaded successfully!");

    } catch (error) {

        console.error("Download Error:", error);

        alert(error.message || "Download failed. Please try again.");

    }
}

/* =========================================================
   VIEW NOTE
========================================================= */

function viewLibraryNote(id) {
    const note = libraryNotes.find(
        item => String(item._id) === String(id)
    );

    if (!note) return;

    const fileURL = getNoteFileURL(note);

    if (!fileURL) {
        alert("A viewable file is not attached to this note.");
        return;
    }

    window.open(fileURL, "_blank", "noopener");
}

/* =========================================================
   FILE TYPE
========================================================= */

function getFileType(note) {
    const type = String(note.fileType || "").toLowerCase();
    const name = String(note.fileName || "").toLowerCase();

    if (type.includes("pdf") || name.endsWith(".pdf")) {
        return "pdf";
    }

    if (
        type.includes("word") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx")
    ) {
        return "word";
    }

    if (
        type.includes("powerpoint") ||
        name.endsWith(".ppt") ||
        name.endsWith(".pptx")
    ) {
        return "ppt";
    }

    return "other";
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString();
}

/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {
    if (typeof logout === "function") {
        logout();
    } else {
        localStorage.removeItem("studyhub_token");
        localStorage.removeItem("studyhub_current_user");
        window.location.href = "login.html";
    }
}