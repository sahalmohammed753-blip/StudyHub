
/* ==========================================
   STUDYHUB - BACKEND NOTE UPLOAD
========================================== */

const NOTES_API = "http://localhost:5000/api/notes";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
];

document.addEventListener("DOMContentLoaded", () => {

    if (typeof requireLogin === "function") {
        requireLogin();
    }

    const form = document.getElementById("uploadForm");

    if (form) {
        form.addEventListener("submit", uploadNote);
    }

    const fileInput = document.getElementById("noteFile");

    if (fileInput) {
        fileInput.addEventListener("change", previewFile);
    }

    setupDragAndDrop();
    loadRecentUploads();

});

/* ==========================================
   FILE PREVIEW
========================================== */

function previewFile() {

    const fileInput = document.getElementById("noteFile");
    const preview = document.getElementById("filePreview");

    if (!fileInput || !preview) return;

    const file = fileInput.files[0];

    if (!file) {
        preview.innerHTML = "";
        return;
    }

    preview.textContent =
        `Selected File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

}

/* ==========================================
   FILE VALIDATION
========================================== */

function validateFile(file) {

    if (!file) {
        alert("Please select a file.");
        return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        alert("Only PDF, DOC, DOCX, PPT and PPTX files are allowed.");
        return false;
    }

    if (file.size > MAX_FILE_SIZE) {
        alert("Maximum file size is 20 MB.");
        return false;
    }

    return true;
}

/* ==========================================
   UPLOAD NOTE TO BACKEND
========================================== */

function uploadNote(event) {

    event.preventDefault();

    const currentUser = getCurrentUser();

    const token = localStorage.getItem("studyhub_token");

    if (!currentUser || !token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const title = document.getElementById("title").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const department = document.getElementById("department").value;
    const semester = document.getElementById("semester").value;
    const description = document.getElementById("description").value.trim();
    const file = document.getElementById("noteFile").files[0];

    if (!title || !subject || !department || !semester || !description) {
        alert("Please fill in all fields.");
        return;
    }

    if (!validateFile(file)) return;

    const formData = new FormData();

    formData.append("title", title);
    formData.append("subject", subject);
    formData.append("department", department);
    formData.append("semester", semester);
    formData.append("description", description);
    formData.append("noteFile", file);

    const request = new XMLHttpRequest();

    const progress = document.getElementById("uploadProgress");
    const progressText = document.getElementById("progressText");
    const submitButton = document.querySelector("#uploadForm button[type='submit']");

    if (submitButton) submitButton.disabled = true;

    if (progress) progress.value = 0;
    if (progressText) progressText.textContent = "0%";

    request.open("POST", `${NOTES_API}/upload`);

    request.setRequestHeader(
        "Authorization",
        `Bearer ${token}`
    );

    request.upload.addEventListener("progress", (event) => {

        if (event.lengthComputable) {

            const percentage = Math.round(
                (event.loaded / event.total) * 100
            );

            if (progress) progress.value = percentage;

            if (progressText) {
                progressText.textContent = `${percentage}%`;
            }

        }

    });

    request.onload = async () => {

        let data;

        try {
            data = JSON.parse(request.responseText);
        } catch {
            data = {};
        }

        if (request.status >= 200 && request.status < 300) {

            alert(data.message || "Note uploaded successfully!");

            document.getElementById("uploadForm").reset();

            const preview = document.getElementById("filePreview");
            if (preview) preview.innerHTML = "";

            if (progress) progress.value = 0;
            if (progressText) progressText.textContent = "0%";

            await loadRecentUploads();

        } else {

            alert(data.message || "Upload failed. Please try again.");

        }

        if (submitButton) submitButton.disabled = false;

    };

    request.onerror = () => {

        alert("Unable to connect to the server. Please check your backend.");

        if (submitButton) submitButton.disabled = false;

    };

    request.send(formData);

}

/* ==========================================
   LOAD MY UPLOADS FROM MONGODB
========================================== */

async function loadRecentUploads() {

    const body = document.getElementById("recentUploads");

    if (!body) return;

    const token = localStorage.getItem("studyhub_token");

    if (!token) return;

    try {

        const response = await fetch(`${NOTES_API}/my`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load uploads.");
        }

        const notes = data.notes || [];

        if (notes.length === 0) {

            body.innerHTML = `
                <tr>
                    <td colspan="5">You haven't uploaded any notes yet.</td>
                </tr>
            `;

            return;
        }

        body.innerHTML = notes.slice(0, 5).map(note => `

            <tr>
                <td>
                    <div class="table-note">
                        <span class="table-note-icon">
                            <i class="fa-solid fa-file-lines"></i>
                        </span>

                        <div>
                            <strong>${escapeTable(note.title)}</strong>
                            <small>${new Date(note.createdAt).toLocaleDateString()}</small>
                        </div>
                    </div>
                </td>

                <td>${escapeTable(note.subject)}</td>

                <td>
                    <span class="table-tag">
                        ${escapeTable(note.department)}
                    </span>
                </td>

                <td>Semester ${escapeTable(note.semester)}</td>

                <td>
                    <span class="status-pill">
                        <i class="fa-solid fa-circle-check"></i>
                        Uploaded
                    </span>
                </td>
            </tr>

        `).join("");

    } catch (error) {

        console.error("Recent Uploads Error:", error);
        body.innerHTML = `
            <tr>
                <td colspan="5">Unable to load recent uploads.</td>
            </tr>
        `;

    }

}

/* ==========================================
   HTML ESCAPING
========================================== */

function escapeTable(value) {

    return String(value ?? "").replace(/[&<>'"]/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[char]));

}

/* ==========================================
   DRAG AND DROP
========================================== */

function setupDragAndDrop() {

    const dropArea = document.getElementById("dropArea");
    const fileInput = document.getElementById("noteFile");

    if (!dropArea || !fileInput) return;

    ["dragenter", "dragover"].forEach(eventName => {

        dropArea.addEventListener(eventName, event => {
            event.preventDefault();
            dropArea.classList.add("active");
        });

    });

    ["dragleave", "drop"].forEach(eventName => {

        dropArea.addEventListener(eventName, event => {
            event.preventDefault();
            dropArea.classList.remove("active");
        });

    });

    dropArea.addEventListener("drop", event => {

        const files = event.dataTransfer.files;

        if (!files.length) return;

        fileInput.files = files;

        previewFile();

    });

}

/* ==========================================
   CLEAR FORM
========================================== */

function clearUploadForm() {

    const form = document.getElementById("uploadForm");

    if (form) form.reset();

    const preview = document.getElementById("filePreview");

    if (preview) preview.innerHTML = "";

}

/* ==========================================
   CANCEL UPLOAD
========================================== */

function cancelUpload() {

    if (confirm("Cancel this upload?")) {
        clearUploadForm();
    }

}

/* ==========================================
   LOGOUT
========================================== */

function logoutUser() {

    logout();

}
