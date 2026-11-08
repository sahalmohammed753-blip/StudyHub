"use strict";

/* ==========================================
   STUDYHUB PROFILE
   profile.js
========================================== */

const CURRENT_USER_KEY = "studyhub_current_user";
const USERS_KEY = "studyhub_users";

let currentUser = null;


/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadProfile();

    if (!currentUser) return;

    loadStatistics();
    loadUploadedNotes();
    loadBookmarks();
    loadDownloadHistory();

    initializeProfileForm();
    initializeProfilePhoto();

});

async function loadProfile() {
    const token = localStorage.getItem("studyhub_token");

    if (!token) {
        alert("Please login to continue.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/profile",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load profile.");
        }

        // Store the latest MongoDB profile in browser storage
        localStorage.setItem(
            "studyhub_current_user",
            JSON.stringify(data.user)
        );

        const currentUser = data.user;

        // Update profile information
        document.getElementById("displayName").textContent =
            currentUser.name || "Student";

        document.getElementById("displayRole").textContent =
            currentUser.role || "Student";

        document.getElementById("displayCollege").textContent =
            currentUser.college || "Not provided";

        document.getElementById("displayDepartment").textContent =
            currentUser.department || "Not provided";

        document.getElementById("infoName").textContent =
            currentUser.name || "Not provided";

        document.getElementById("infoEmail").textContent =
            currentUser.email || "Not provided";

        document.getElementById("infoPhone").textContent =
            currentUser.phone || "Not provided";

        document.getElementById("infoCollege").textContent =
            currentUser.college || "Not provided";

        document.getElementById("infoDepartment").textContent =
            currentUser.department || "Not provided";

        document.getElementById("infoSemester").textContent =
            currentUser.semester
                ? `Semester ${currentUser.semester}`
                : "Not provided";

        // Fill edit form
        document.getElementById("fullName").value =
            currentUser.name || "";

        document.getElementById("email").value =
            currentUser.email || "";

        document.getElementById("phone").value =
            currentUser.phone || "";

        document.getElementById("college").value =
            currentUser.college || "";

        document.getElementById("department").value =
            currentUser.department || "";

        document.getElementById("semester").value =
            currentUser.semester || "";

        // Update username in sidebar
        const username = document.getElementById("username");

        if (username) {
            username.textContent = currentUser.name || "Student";
        }

        // Update profile images if available
        if (currentUser.profilePhoto) {
            const profileImage = document.getElementById("profileImage");
            const profileAvatar = document.getElementById("profileAvatar");

            if (profileImage) {
                profileImage.src = currentUser.profilePhoto;
            }

            if (profileAvatar) {
                profileAvatar.src = currentUser.profilePhoto;
            }
        }

    } catch (error) {
        console.error("Profile Loading Error:", error);
        alert(error.message || "Failed to load profile.");
    }
}
/* ==========================================
   HELPERS
========================================== */

function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {

        element.textContent = value;

    }

}


function setValue(id, value) {

    const element = document.getElementById(id);

    if (element) {

        element.value = value;

    }

}


function getStoredArray(key) {

    try {

        return JSON.parse(
            localStorage.getItem(key)
        ) || [];

    } catch (error) {

        console.error(
            `Error reading ${key}:`,
            error
        );

        return [];

    }

}


/* ==========================================
   STATISTICS
========================================== */

function loadStatistics() {

    const notes =
        getStoredArray("studyhub_notes");

    const bookmarks =
        currentUser.bookmarks || [];

    const downloads =
        currentUser.downloads || [];


    const uploadedNotes =
        getUserUploadedNotes(notes);


    /* Notes Uploaded */

    setText(
        "notesCount",
        uploadedNotes.length
    );


    /* Downloads */

    setText(
        "downloadsCount",
        downloads.length
    );


    /* Bookmarks */

    setText(
        "bookmarkCount",
        bookmarks.length
    );


    /* Rating */

    const rating =
        uploadedNotes.length > 0
            ? (uploadedNotes.length * 5).toFixed(1)
            : "0.0";

    setText(
        "ratingCount",
        rating
    );

}


/* ==========================================
   GET USER UPLOADED NOTES
========================================== */

function getUserUploadedNotes(notes) {

    if (!currentUser) return [];

    return notes.filter(note => {

        const author =
            note.author ||
            note.uploadedBy ||
            note.uploader ||
            "";

        const authorEmail =
            note.authorEmail ||
            note.email ||
            "";

        const userNames = [

            currentUser.name,

            currentUser.fullName,

            currentUser.username

        ]
        .filter(Boolean)
        .map(
            value => value.toLowerCase()
        );


        const authorName =
            String(author).toLowerCase();


        const email =
            String(authorEmail).toLowerCase();


        return (

            userNames.includes(authorName) ||

            email ===
            String(currentUser.email)
                .toLowerCase()

        );

    });

}


/* ==========================================
   PROFILE FORM
========================================== */

function initializeProfileForm() {

    const form =
        document.getElementById("profileForm");

    if (!form) return;


    form.addEventListener(
        "submit",
        saveProfile
    );

}


async function saveProfile
(event) {
    if (event) {
        event.preventDefault();
    }

    const token = localStorage.getItem("studyhub_token");

    if (!token) {
        alert("Please login to continue.");
        window.location.href = "login.html";
        return;
    }

    const profileData = {
        name: document.getElementById("fullName").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        college: document.getElementById("college").value.trim(),
        department: document.getElementById("department").value,
        semester: document.getElementById("semester").value
    };

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/profile",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Profile update failed.");
        }

        localStorage.setItem(
            "studyhub_current_user",
            JSON.stringify(data.user)
        );

        alert("Profile updated successfully!");

        await loadProfile();

    } catch (error) {
        console.error("Profile Update Error:", error);
        alert(error.message || "Unable to update profile.");
    }
}


/* ==========================================
   UPDATE USERS LIST
========================================== */

function updateUsersList() {

    let users =
        getStoredArray(USERS_KEY);


    const index =
        users.findIndex(
            user =>
                user.id === currentUser.id ||
                user.email === currentUser.email
        );


    if (index !== -1) {

        users[index] = currentUser;

    } else {

        users.push(currentUser);

    }


    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

}


/* ==========================================
   UPLOADED NOTES
========================================== */

function loadUploadedNotes() {

    const container =
        document.getElementById("uploadedNotes");

    if (!container) return;


    const notes =
        getStoredArray("studyhub_notes");


    const userNotes =
        getUserUploadedNotes(notes);


    if (userNotes.length === 0) {

        container.innerHTML = `
            <div class="profile-empty">
                <i class="fa-solid fa-file-circle-plus"></i>
                <h3>No uploaded notes yet</h3>
                <p>Your uploaded notes will appear here.</p>
            </div>
        `;

        return;
    }


    container.innerHTML = userNotes.map(
        (note, index) => {

            const title =
                note.title ||
                "Untitled Note";

            const subject =
                note.subject ||
                "General";

            return `
                <div class="uploaded-note-item">

                    <div class="uploaded-note-icon">
                        <i class="fa-solid fa-file-lines"></i>
                    </div>

                    <div class="uploaded-note-info">

                        <h4>
                            ${escapeHTML(title)}
                        </h4>

                        <span>
                            ${escapeHTML(subject)}
                        </span>

                    </div>

                    <button
                        class="delete-note-btn"
                        onclick="deleteNote(${index})"
                        title="Delete note"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>
            `;

        }
    ).join("");

}


/* ==========================================
   DELETE NOTE
========================================== */

function deleteNote(index) {

    if (!confirm(
        "Are you sure you want to delete this note?"
    )) {

        return;

    }


    const notes =
        getStoredArray("studyhub_notes");


    const userNotes =
        getUserUploadedNotes(notes);


    const noteToDelete =
        userNotes[index];


    if (!noteToDelete) return;


    const updatedNotes =
        notes.filter(
            note => note !== noteToDelete
        );


    localStorage.setItem(
        "studyhub_notes",
        JSON.stringify(updatedNotes)
    );


    loadStatistics();

    loadUploadedNotes();


    alert("Note deleted successfully.");

}


/* ==========================================
   BOOKMARKS
========================================== */

function loadBookmarks() {

    const container =
        document.getElementById("bookmarkList");

    if (!container) return;


    const bookmarks =
        currentUser.bookmarks || [];


    if (bookmarks.length === 0) {

        container.innerHTML = `
            <div class="profile-empty">
                <i class="fa-regular fa-bookmark"></i>
                <h3>No bookmarks yet</h3>
                <p>Notes you bookmark will appear here.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        bookmarks.map(bookmark => {

            const title =
                typeof bookmark === "string"
                    ? bookmark
                    : bookmark.title || "Saved Note";


            return `
                <div class="bookmark-item">

                    <div>
                        <i class="fa-solid fa-bookmark"></i>
                    </div>

                    <span>
                        ${escapeHTML(title)}
                    </span>

                </div>
            `;

        }).join("");

}


/* ==========================================
   DOWNLOAD HISTORY
========================================== */

function loadDownloadHistory() {

    const container =
        document.getElementById("downloadHistory");

    if (!container) return;


    const downloads =
        currentUser.downloads || [];


    if (downloads.length === 0) {

        container.innerHTML = `
            <div class="profile-empty">
                <i class="fa-solid fa-download"></i>
                <h3>No download history</h3>
                <p>Your downloaded notes will appear here.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        downloads.map(download => {

            const title =
                typeof download === "string"
                    ? download
                    : download.title ||
                      "Downloaded Note";


            return `
                <div class="download-item">

                    <i class="fa-solid fa-file-arrow-down"></i>

                    <span>
                        ${escapeHTML(title)}
                    </span>

                </div>
            `;

        }).join("");

}


/* ==========================================
   PROFILE PHOTO
========================================== */

function initializeProfilePhoto() {

    const changeButton =
        document.getElementById("changePhotoBtn");

    const profileImage =
        document.getElementById("profileImage");


    if (!changeButton) return;


    let fileInput =
        document.getElementById("profilePhotoInput");


    if (!fileInput) {

        fileInput =
            document.createElement("input");

        fileInput.type = "file";

        fileInput.id =
            "profilePhotoInput";

        fileInput.accept =
            "image/*";

        fileInput.style.display =
            "none";

        document.body.appendChild(
            fileInput
        );

    }


    changeButton.addEventListener(
        "click",
        () => fileInput.click()
    );


    if (profileImage) {

        profileImage.addEventListener(
            "click",
            () => fileInput.click()
        );

    }


    fileInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];

            if (file) {

                changeProfilePhoto(file);

            }

        }
    );

}


/* ==========================================
   CHANGE PROFILE PHOTO
========================================== */

function changeProfilePhoto(file) {

    if (!file.type.startsWith("image/")) {

        alert("Please select an image.");

        return;
    }


    if (file.size > 2 * 1024 * 1024) {

        alert(
            "Image size must be less than 2MB."
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload = event => {

        currentUser.photo =
            event.target.result;


        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(currentUser)
        );


        updateUsersList();


        const image =
            document.getElementById(
                "profileImage"
            );


        if (image) {

            image.src =
                currentUser.photo;

        }

    };


    reader.readAsDataURL(file);

}


/* ==========================================
   CHANGE PASSWORD
========================================== */

function changePassword() {

    if (!currentUser) return;


    const newPassword =
        prompt(
            "Enter your new password:"
        );


    if (!newPassword) return;


    if (newPassword.length < 6) {

        alert(
            "Password must contain at least 6 characters."
        );

        return;
    }


    currentUser.password =
        newPassword;


    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(currentUser)
    );


    updateUsersList();


    alert(
        "Password changed successfully."
    );

}


/* ==========================================
   DELETE ACCOUNT
========================================== */

function deleteAccount() {

    if (!currentUser) return;


    const confirmation =
        confirm(
            "Are you sure you want to permanently delete your account?"
        );


    if (!confirmation) return;


    let users =
        getStoredArray(USERS_KEY);


    users =
        users.filter(
            user =>
                user.id !== currentUser.id
        );


    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );


    localStorage.removeItem(
        CURRENT_USER_KEY
    );


    alert(
        "Your account has been deleted."
    );


    window.location.href =
        "index.html";

}


/* ==========================================
   REFRESH PROFILE
========================================== */

function refreshProfile() {

    loadProfile();

    if (!currentUser) return;

    loadStatistics();

    loadUploadedNotes();

    loadBookmarks();

    loadDownloadHistory();

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}