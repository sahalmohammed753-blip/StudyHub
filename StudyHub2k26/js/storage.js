/* ============================================
   STUDYHUB STORAGE MANAGER
   storage.js
============================================ */

const STORAGE = {

    USERS: "studyhub_users",
    CURRENT_USER: "studyhub_current_user",
    NOTES: "studyhub_notes",
    BOOKMARKS: "studyhub_bookmarks",
    DOWNLOADS: "studyhub_downloads",
    RECENT: "studyhub_recent",
    SETTINGS: "studyhub_settings"

};

/* ============================================
   INITIALIZE DATABASE
============================================ */

function initializeDatabase() {

    if (!localStorage.getItem(STORAGE.USERS))
        localStorage.setItem(STORAGE.USERS, JSON.stringify([]));

    if (!localStorage.getItem(STORAGE.NOTES))
        localStorage.setItem(STORAGE.NOTES, JSON.stringify([]));

    if (!localStorage.getItem(STORAGE.BOOKMARKS))
        localStorage.setItem(STORAGE.BOOKMARKS, JSON.stringify([]));

    if (!localStorage.getItem(STORAGE.DOWNLOADS))
        localStorage.setItem(STORAGE.DOWNLOADS, JSON.stringify([]));

    if (!localStorage.getItem(STORAGE.RECENT))
        localStorage.setItem(STORAGE.RECENT, JSON.stringify([]));

    if (!localStorage.getItem(STORAGE.SETTINGS)) {

        localStorage.setItem(STORAGE.SETTINGS,

        JSON.stringify({

            darkMode:false,
            language:"English"

        }));

    }

}

initializeDatabase();

/* ============================================
   COMMON FUNCTIONS
============================================ */

function read(key){

    return JSON.parse(localStorage.getItem(key));

}

function write(key,data){

    localStorage.setItem(key,JSON.stringify(data));

}

/* ============================================
   NOTES
============================================ */

function getNotes(){

    return read(STORAGE.NOTES);

}

function saveNote(note){

    let notes=getNotes();

    note.id=Date.now();

    note.uploadedOn=new Date().toLocaleDateString();

    notes.push(note);

    write(STORAGE.NOTES,notes);

}

function deleteNote(id){

    let notes=getNotes();

    notes=notes.filter(note=>note.id!=id);

    write(STORAGE.NOTES,notes);

}

function updateNote(updated){

    let notes=getNotes();

    notes=notes.map(note=>{

        if(note.id==updated.id){

            return updated;

        }

        return note;

    });

    write(STORAGE.NOTES,notes);

}

function getNote(id){

    return getNotes().find(note=>note.id==id);

}

/* ============================================
   SEARCH
============================================ */

function searchNotes(keyword){

    keyword=keyword.toLowerCase();

    return getNotes().filter(note=>

        note.title.toLowerCase().includes(keyword) ||

        note.subject.toLowerCase().includes(keyword) ||

        note.department.toLowerCase().includes(keyword) ||

        note.teacher.toLowerCase().includes(keyword)

    );

}

/* ============================================
   FILTERS
============================================ */

function filterByDepartment(department){

    return getNotes().filter(

        note=>note.department===department

    );

}

function filterBySemester(semester){

    return getNotes().filter(

        note=>note.semester===semester

    );

}

function filterBySubject(subject){

    return getNotes().filter(

        note=>note.subject===subject

    );

}

/* ============================================
   BOOKMARKS
============================================ */

function getBookmarks(){

    return read(STORAGE.BOOKMARKS);

}

function bookmarkNote(id){

    let list=getBookmarks();

    if(!list.includes(id)){

        list.push(id);

    }

    write(STORAGE.BOOKMARKS,list);

}

function removeBookmark(id){

    let list=getBookmarks();

    list=list.filter(item=>item!=id);

    write(STORAGE.BOOKMARKS,list);

}

/* ============================================
   DOWNLOADS
============================================ */

function getDownloads(){

    return read(STORAGE.DOWNLOADS);

}

function downloadNote(id){

    let list=getDownloads();

    list.push({

        noteId:id,

        date:new Date().toLocaleString()

    });

    write(STORAGE.DOWNLOADS,list);

}

/* ============================================
   RECENTLY VIEWED
============================================ */

function getRecent(){

    return read(STORAGE.RECENT);

}

function addRecent(id){

    let list=getRecent();

    list.unshift(id);

    list=[...new Set(list)];

    list=list.slice(0,10);

    write(STORAGE.RECENT,list);

}

/* ============================================
   SETTINGS
============================================ */

function getSettings(){

    return read(STORAGE.SETTINGS);

}

function saveSettings(settings){

    write(STORAGE.SETTINGS,settings);

}

function enableDarkMode(){

    let settings=getSettings();

    settings.darkMode=true;

    saveSettings(settings);

}

function disableDarkMode(){

    let settings=getSettings();

    settings.darkMode=false;

    saveSettings(settings);

}

/* ============================================
   COUNTERS
============================================ */

function totalUsers(){

    return read(STORAGE.USERS).length;

}

function totalNotes(){

    return getNotes().length;

}

function totalBookmarks(){

    return getBookmarks().length;

}

function totalDownloads(){

    return getDownloads().length;

}

/* ============================================
   DASHBOARD
============================================ */

function dashboardStats(){

    return{

        users:totalUsers(),

        notes:totalNotes(),

        bookmarks:totalBookmarks(),

        downloads:totalDownloads()

    };

}

/* ============================================
   SAMPLE DATA
============================================ */

function loadSampleNotes(){

    if(getNotes().length>0) return;

    const sample=[

        {

            title:"Java Programming",

            subject:"Programming",

            semester:"3",

            department:"CSE",

            teacher:"Prof. John",

            description:"Complete Java Notes",

            file:"assets/pdfs/java.pdf"

        },

        {

            title:"Database Management System",

            subject:"DBMS",

            semester:"4",

            department:"CSE",

            teacher:"Prof. Smith",

            description:"Complete DBMS Notes",

            file:"assets/pdfs/dbms.pdf"

        },

        {

            title:"Computer Networks",

            subject:"CN",

            semester:"5",

            department:"CSE",

            teacher:"Prof. David",

            description:"Networking Notes",

            file:"assets/pdfs/cn.pdf"

        }

    ];

    sample.forEach(note=>saveNote(note));

}

loadSampleNotes();

/* ============================================
   RESET DATABASE
============================================ */

function resetDatabase(){

    if(confirm("Reset complete StudyHub database?")){

        localStorage.clear();

        initializeDatabase();

        loadSampleNotes();

        alert("Database Reset Successfully");

        location.reload();

    }

}

/* ============================================
   EXPORT DATABASE
============================================ */

function exportDatabase(){

    const data={

        users:read(STORAGE.USERS),

        notes:getNotes(),

        bookmarks:getBookmarks(),

        downloads:getDownloads(),

        settings:getSettings()

    };

    const blob=new Blob(

        [JSON.stringify(data,null,4)],

        {type:"application/json"}

    );

    const url=URL.createObjectURL(blob);

    const a=document.createElement("a");

    a.href=url;

    a.download="StudyHubDatabase.json";

    a.click();

}

/* ============================================
   IMPORT DATABASE
============================================ */

function importDatabase(json){

    write(STORAGE.USERS,json.users||[]);

    write(STORAGE.NOTES,json.notes||[]);

    write(STORAGE.BOOKMARKS,json.bookmarks||[]);

    write(STORAGE.DOWNLOADS,json.downloads||[]);

    write(STORAGE.SETTINGS,json.settings||{

        darkMode:false,

        language:"English"

    });

}