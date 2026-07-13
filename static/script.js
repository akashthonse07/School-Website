const ADMIN_SESSION_KEY = 'schoolAdminAccess';

const entryShell = document.getElementById('entryShell');
const adminDashboard = document.getElementById('adminDashboard');
const roleButtons = document.querySelectorAll('[data-role-switch]');
const studentAccessPanel = document.getElementById('studentAccessPanel');
const adminAccessPanel = document.getElementById('adminAccessPanel');
const adminLoginSection = document.getElementById('adminLoginSection');
const adminSetupSection = document.getElementById('adminSetupSection');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminUsername = document.getElementById('adminUsername');
const adminPassword = document.getElementById('adminPassword');
const adminLoginMessage = document.getElementById('adminLoginMessage');
const adminSetupForm = document.getElementById('adminSetupForm');
const adminSetupUsername = document.getElementById('adminSetupUsername');
const adminSetupPassword = document.getElementById('adminSetupPassword');
const adminSetupConfirmPassword = document.getElementById('adminSetupConfirmPassword');
const adminSetupMessage = document.getElementById('adminSetupMessage');
const adminStatus = document.getElementById('adminStatus');
const studentForm = document.getElementById('studentForm');
const studentFormMessage = document.getElementById('studentFormMessage');
const studentRollNo = document.getElementById('studentRollNo');
const studentName = document.getElementById('studentName');
const studentClass = document.getElementById('studentClass');
const studentMaths = document.getElementById('studentMaths');
const studentScience = document.getElementById('studentScience');
const studentEnglish = document.getElementById('studentEnglish');
const studentKannada = document.getElementById('studentKannada');
const studentSocialScience = document.getElementById('studentSocialScience');
const studentHindi = document.getElementById('studentHindi');
const clearStudentFormBtn = document.getElementById('clearStudentFormBtn');
const logoutBtn = document.getElementById('logoutBtn');
const tableBody = document.querySelector('#studentTable tbody');
const studentCount = document.getElementById('studentCount');
const averageScore = document.getElementById('averageScore');
const topperName = document.getElementById('topperName');
const tableStatus = document.getElementById('tableStatus');
const studentLookupForm = document.getElementById('studentLookupForm');
const lookupRollNo = document.getElementById('lookupRollNo');
const lookupMessage = document.getElementById('lookupMessage');
const studentResult = document.getElementById('studentResult');
const resultName = document.getElementById('resultName');
const resultRoll = document.getElementById('resultRoll');
const resultClass = document.getElementById('resultClass');
const resultMaths = document.getElementById('resultMaths');
const resultScience = document.getElementById('resultScience');
const resultEnglish = document.getElementById('resultEnglish');
const resultKannada = document.getElementById('resultKannada');
const resultSocialScience = document.getElementById('resultSocialScience');
const resultHindi = document.getElementById('resultHindi');
const resultTotal = document.getElementById('resultTotal');
const resultPercentage = document.getElementById('resultPercentage');
const resultGrade = document.getElementById('resultGrade');
const viewEventPhotosBtn = document.getElementById('viewEventPhotosBtn');
const eventPhotoGallery = document.getElementById('eventPhotoGallery');
const photoCount = document.getElementById('photoCount');
const photoMessage = document.getElementById('photoMessage');
const photoGrid = document.getElementById('photoGrid');
const togglePhotoUploaderBtn = document.getElementById('togglePhotoUploaderBtn');
const eventPhotoForm = document.getElementById('eventPhotoForm');
const eventPhotoTitle = document.getElementById('eventPhotoTitle');
const eventPhotoFiles = document.getElementById('eventPhotoFiles');
const eventPhotoMessage = document.getElementById('eventPhotoMessage');

const subjectFields = [
    { key: 'maths', input: studentMaths, result: resultMaths },
    { key: 'science', input: studentScience, result: resultScience },
    { key: 'english', input: studentEnglish, result: resultEnglish },
    { key: 'kannada', input: studentKannada, result: resultKannada },
    { key: 'social_science', input: studentSocialScience, result: resultSocialScience },
    { key: 'hindi', input: studentHindi, result: resultHindi },
];
const subjectCount = subjectFields.length;
const tableColumnCount = 3 + subjectCount + 3;

let studentsCache = null;
let lastLookupRollNo = null;
let activeAccessRole = 'student';
let adminCredentialsConfigured = false;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function scoreTotal(student) {
    return subjectFields.reduce((total, field) => {
        return total + Number(student[field.key] ?? 0);
    }, 0);
}

function scorePercentage(student) {
    return (scoreTotal(student) / subjectCount).toFixed(2);
}

function gradeFromPercentage(percentage) {
    const score = Number(percentage);

    if (score >= 90) {
        return 'A+';
    }
    if (score >= 80) {
        return 'A';
    }
    if (score >= 70) {
        return 'B';
    }
    if (score >= 60) {
        return 'C';
    }
    if (score >= 50) {
        return 'D';
    }
    return 'F';
}

function setLookupMessage(message) {
    lookupMessage.textContent = message;
}

function setAdminLoginMessage(message) {
    adminLoginMessage.textContent = message;
}

function setAdminSetupMessage(message) {
    adminSetupMessage.textContent = message;
}

function setAdminStatus(message) {
    adminStatus.textContent = message;
}

function setStudentFormMessage(message) {
    studentFormMessage.textContent = message;
}

function setEventPhotoMessage(message) {
    eventPhotoMessage.textContent = message;
}

function setPhotoGalleryMessage(message) {
    photoMessage.textContent = message;
}

function formatPhotoTimestamp(timestamp) {
    if (!timestamp) {
        return 'Recently uploaded';
    }

    const parsedDate = new Date(timestamp);
    if (Number.isNaN(parsedDate.getTime())) {
        return timestamp;
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(parsedDate);
}

function resetEventPhotoUploader() {
    eventPhotoForm.hidden = true;
    eventPhotoForm.reset();
    togglePhotoUploaderBtn.textContent = 'Add photos';
    setEventPhotoMessage('');
}

function closeEventPhotoGallery() {
    eventPhotoGallery.hidden = true;
    photoGrid.innerHTML = '';
    photoCount.textContent = '0 photos';
    setPhotoGalleryMessage('');
}

function setAccessRole(role) {
    activeAccessRole = role === 'admin' ? 'admin' : 'student';

    const showStudentPanel = activeAccessRole === 'student';
    studentAccessPanel.hidden = !showStudentPanel;
    adminAccessPanel.hidden = showStudentPanel;

    roleButtons.forEach((button) => {
        const isActive = button.dataset.roleSwitch === activeAccessRole;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
}

function setAdminAuthMode(configured) {
    adminCredentialsConfigured = Boolean(configured);
    adminLoginSection.hidden = !adminCredentialsConfigured;
    adminSetupSection.hidden = adminCredentialsConfigured;

    if (adminCredentialsConfigured) {
        setAdminSetupMessage('');
    } else {
        setAdminLoginMessage('');
    }
}

function resetAdminMetrics() {
    studentCount.textContent = '0';
    averageScore.textContent = '0%';
    topperName.textContent = '-';
    tableStatus.textContent = '';
}

function hideStudentResult() {
    studentResult.hidden = true;
    resultName.textContent = '-';
    resultRoll.textContent = 'Roll No -';
    resultClass.textContent = 'Class -';
    subjectFields.forEach((field) => {
        field.result.textContent = '-';
    });
    resultTotal.textContent = '-';
    resultPercentage.textContent = '-';
    resultGrade.textContent = '-';
}

function renderStudentResult(student) {
    const total = scoreTotal(student);
    const percentage = scorePercentage(student);

    resultName.textContent = student.name;
    resultRoll.textContent = `Roll No ${student.roll_no}`;
    resultClass.textContent = `Class ${student['class']}`;
    subjectFields.forEach((field) => {
        field.result.textContent = student[field.key] ?? '-';
    });
    resultTotal.textContent = total;
    resultPercentage.textContent = `${percentage}%`;
    resultGrade.textContent = gradeFromPercentage(percentage);
    studentResult.hidden = false;
}

function renderAdminMetrics(students) {
    if (!students.length) {
        resetAdminMetrics();
        return;
    }

    const average = (
        students.reduce((sum, student) => sum + Number(scorePercentage(student)), 0) / students.length
    ).toFixed(2);

    const topper = students.reduce((best, student) => {
        const total = scoreTotal(student);
        if (!best || total > best.total) {
            return { student, total };
        }
        return best;
    }, null);

    studentCount.textContent = String(students.length);
    averageScore.textContent = `${average}%`;
    topperName.textContent = topper ? `${topper.student.name} (${scorePercentage(topper.student)}%)` : '-';
}

function renderAdminTable(students) {
    tableBody.innerHTML = '';

    if (!students.length) {
        tableBody.innerHTML = `<tr><td colspan="${tableColumnCount}" class="empty-state">No student records available.</td></tr>`;
        return;
    }

    students.forEach((student, index) => {
        const total = scoreTotal(student);
        const percentage = scorePercentage(student);
        const subjectCells = subjectFields
            .map((field) => `<td>${escapeHtml(student[field.key] ?? '-')}</td>`)
            .join('');

        const row = document.createElement('tr');
        row.style.setProperty('--row-index', index);
        row.innerHTML = `
            <td>${escapeHtml(student.roll_no)}</td>
            <td>${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student['class'])}</td>
            ${subjectCells}
            <td>${escapeHtml(total)}</td>
            <td>${escapeHtml(`${percentage}%`)}</td>
            <td>
                <button type="button" class="row-action" data-roll="${escapeHtml(student.roll_no)}">Edit</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function renderAdminData(students) {
    studentsCache = students;
    renderAdminMetrics(students);
    renderAdminTable(students);
    tableStatus.textContent = `Loaded ${students.length} student record${students.length === 1 ? '' : 's'}.`;
}

function showLandingPage(defaultRole = 'student') {
    entryShell.hidden = false;
    adminDashboard.hidden = true;
    resetEventPhotoUploader();
    closeEventPhotoGallery();
    setAccessRole(defaultRole);
}

function hideLandingPage() {
    entryShell.hidden = true;
}

function renderEventPhotoGallery(photos) {
    photoGrid.innerHTML = '';
    photoCount.textContent = `${photos.length} photo${photos.length === 1 ? '' : 's'}`;

    if (!photos.length) {
        photoGrid.innerHTML = '<div class="empty-state">No event photos have been added yet.</div>';
        setPhotoGalleryMessage('The gallery will appear here once the admin uploads school event photos.');
        return;
    }

    setPhotoGalleryMessage(`Showing ${photos.length} event photo${photos.length === 1 ? '' : 's'}.`);

    photos.forEach((photo, index) => {
        const title = photo.title || 'School event';
        const timestamp = formatPhotoTimestamp(photo.uploaded_at);
        const photoCard = document.createElement('figure');
        photoCard.className = 'gallery-item';
        photoCard.style.setProperty('--photo-index', index);
        photoCard.innerHTML = `
            <img src="${escapeHtml(photo.url || '')}" alt="${escapeHtml(`${title} photo ${index + 1}`)}" loading="lazy">
            <figcaption>
                <strong>${escapeHtml(title)}</strong>
                <span>${escapeHtml(timestamp)}</span>
            </figcaption>
        `;
        photoGrid.appendChild(photoCard);
    });
}

async function loadEventPhotos() {
    const response = await fetch('/api/event-photos');
    if (!response.ok) {
        throw new Error('Unable to load event photos.');
    }

    return response.json();
}

async function openEventPhotoGallery(options = {}) {
    const scroll = options.scroll !== false;
    eventPhotoGallery.hidden = false;

    try {
        const photos = await loadEventPhotos();
        renderEventPhotoGallery(photos);
    } catch (error) {
        console.error('Error loading event photos:', error);
        photoGrid.innerHTML = '<div class="empty-state">Could not load the event gallery right now.</div>';
        photoCount.textContent = '0 photos';
        setPhotoGalleryMessage('Could not load the event gallery right now.');
    }

    if (scroll) {
        eventPhotoGallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function toggleEventPhotoUploader() {
    const shouldOpen = eventPhotoForm.hidden;
    eventPhotoForm.hidden = !shouldOpen;
    togglePhotoUploaderBtn.textContent = shouldOpen ? 'Hide uploader' : 'Add photos';
    if (shouldOpen) {
        eventPhotoTitle.focus();
        setEventPhotoMessage('Choose one or more photos to upload.');
    } else {
        setEventPhotoMessage('');
        eventPhotoForm.reset();
    }
}

async function loadStudents(force = false) {
    if (studentsCache && !force) {
        return studentsCache;
    }

    const response = await fetch('/api/students');

    if (!response.ok) {
        throw new Error('Unable to load student data.');
    }

    studentsCache = await response.json();
    return studentsCache;
}

async function refreshAdminData(force = false) {
    const students = await loadStudents(force);
    renderAdminData(students);
}

function fillStudentForm(student) {
    studentRollNo.value = student.roll_no;
    studentName.value = student.name;
    studentClass.value = student['class'];
    subjectFields.forEach((field) => {
        field.input.value = student[field.key] ?? '';
    });
}

function clearStudentForm() {
    studentForm.reset();
    setStudentFormMessage('');
    setAdminStatus('');
    studentRollNo.focus();
}

async function lookupStudent(rollNo, options = {}) {
    const quiet = Boolean(options.quiet);

    try {
        const response = await fetch(`/api/students/${rollNo}`);

        if (response.status === 404) {
            hideStudentResult();
            if (!quiet) {
                setLookupMessage(`No record found for roll number ${rollNo}.`);
            }
            return null;
        }

        if (!response.ok) {
            throw new Error('Unable to load the result.');
        }

        const student = await response.json();
        renderStudentResult(student);
        lastLookupRollNo = Number(rollNo);

        if (!quiet) {
            setLookupMessage(`Result loaded for roll number ${rollNo}.`);
        }

        return student;
    } catch (error) {
        console.error('Error loading student result:', error);
        hideStudentResult();

        if (!quiet) {
            setLookupMessage('Could not load the result right now.');
        }

        return null;
    }
}

async function openAdminDashboard(options = {}) {
    const silent = Boolean(options.silent);
    const scroll = Boolean(options.scroll);
    hideLandingPage();
    adminDashboard.hidden = false;
    resetEventPhotoUploader();

    try {
        await refreshAdminData(true);
        setAdminStatus('Ready to manage student records.');

        if (!silent) {
            setAdminLoginMessage('Admin login successful.');
        }

        if (scroll) {
            adminDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        setAdminStatus('Could not load admin data.');
        if (!silent) {
            setAdminLoginMessage('Admin login succeeded, but the student list could not load.');
        }
    }
}

function closeAdminDashboard() {
    adminDashboard.hidden = true;
    studentsCache = null;
    tableBody.innerHTML = '';
    resetAdminMetrics();
    setAdminStatus('');
    resetEventPhotoUploader();
}

roleButtons.forEach((button) => {
    button.addEventListener('click', () => {
        setAccessRole(button.dataset.roleSwitch);
    });
});

adminLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = adminUsername.value.trim();
    const password = adminPassword.value.trim();

    if (!username || !password) {
        setAdminLoginMessage('Please enter both admin credentials.');
        return;
    }

    setAdminLoginMessage('Checking admin credentials...');

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            setAdminLoginMessage(data.message || 'Unable to log in.');
            return;
        }

        sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
        await openAdminDashboard({ silent: true, scroll: true });
        setAdminLoginMessage(data.message || 'Admin login successful.');
    } catch (error) {
        console.error('Admin login error:', error);
        setAdminLoginMessage('Could not connect to the server.');
    }
});

adminSetupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = adminSetupUsername.value.trim();
    const password = adminSetupPassword.value.trim();
    const confirmPassword = adminSetupConfirmPassword.value.trim();

    if (!username || !password || !confirmPassword) {
        setAdminSetupMessage('Please complete every credential field.');
        return;
    }

    if (password !== confirmPassword) {
        setAdminSetupMessage('Passwords do not match.');
        return;
    }

    setAdminSetupMessage('Saving credentials...');

    try {
        const response = await fetch('/api/admin/credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
                confirm_password: confirmPassword,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            setAdminSetupMessage(data.message || 'Unable to save credentials.');
            return;
        }

        setAdminAuthMode(true);
        sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
        adminSetupForm.reset();
        setAdminSetupMessage(data.message || 'Admin credentials saved successfully.');
        await openAdminDashboard({ silent: true, scroll: true });
    } catch (error) {
        console.error('Admin credential setup error:', error);
        setAdminSetupMessage('Could not connect to the server.');
    }
});

studentLookupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const rollNo = Number(lookupRollNo.value.trim());

    if (!Number.isInteger(rollNo) || rollNo <= 0) {
        setLookupMessage('Please enter a valid roll number.');
        hideStudentResult();
        return;
    }

    setLookupMessage('Searching result...');
    await lookupStudent(rollNo);
});

studentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
        roll_no: studentRollNo.value.trim(),
        name: studentName.value.trim(),
        class: studentClass.value.trim(),
    };

    subjectFields.forEach((field) => {
        payload[field.key] = field.input.value.trim();
    });

    if (
        !payload.roll_no ||
        !payload.name ||
        !payload.class ||
        subjectFields.some((field) => !payload[field.key])
    ) {
        setStudentFormMessage('Please complete every field before saving.');
        return;
    }

    setStudentFormMessage('Saving student record...');

    try {
        const response = await fetch('/api/admin/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            setStudentFormMessage(data.message || 'Unable to save the student record.');
            return;
        }

        renderAdminData(data.students || []);
        setAdminStatus(data.message || 'Student record saved.');
        setStudentFormMessage('Student record saved successfully.');
        studentForm.reset();

        if (lastLookupRollNo === Number(payload.roll_no)) {
            await lookupStudent(lastLookupRollNo, { quiet: true });
        }
    } catch (error) {
        console.error('Save student error:', error);
        setStudentFormMessage('Could not save the student record right now.');
    }
});

clearStudentFormBtn.addEventListener('click', clearStudentForm);

togglePhotoUploaderBtn.addEventListener('click', toggleEventPhotoUploader);

viewEventPhotosBtn.addEventListener('click', async () => {
    await openEventPhotoGallery({ scroll: true });
});

eventPhotoForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const files = Array.from(eventPhotoFiles.files || []);
    const title = eventPhotoTitle.value.trim();

    if (!files.length) {
        setEventPhotoMessage('Please choose at least one photo to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    files.forEach((file) => {
        formData.append('photos', file);
    });

    setEventPhotoMessage('Uploading photos...');

    try {
        const response = await fetch('/api/admin/event-photos', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            setEventPhotoMessage(data.message || 'Unable to upload the event photos.');
            return;
        }

        eventPhotoForm.reset();
        eventPhotoForm.hidden = true;
        togglePhotoUploaderBtn.textContent = 'Add photos';
        setEventPhotoMessage(data.message || 'Event photos uploaded successfully.');
        setAdminStatus(data.message || 'Event photos uploaded successfully.');
    } catch (error) {
        console.error('Event photo upload error:', error);
        setEventPhotoMessage('Could not upload the event photos right now.');
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
    } catch (error) {
        console.error('Admin logout error:', error);
    }

    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    adminLoginForm.reset();
    adminSetupForm.reset();
    setAdminLoginMessage('You have been signed out.');
    setAdminSetupMessage('');
    closeAdminDashboard();
    showLandingPage('student');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

tableBody.addEventListener('click', (event) => {
    const button = event.target.closest('.row-action');
    if (!button) {
        return;
    }

    const rollNo = Number(button.dataset.roll);
    const student = (studentsCache || []).find((entry) => Number(entry.roll_no) === rollNo);
    if (!student) {
        return;
    }

    fillStudentForm(student);
    setAdminStatus(`Editing roll number ${rollNo}.`);
    setStudentFormMessage('The form has been filled from the selected record.');
    studentForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

async function bootstrap() {
    hideStudentResult();
    resetAdminMetrics();
    closeAdminDashboard();
    showLandingPage('student');

    try {
        const response = await fetch('/api/admin/status');
        const data = await response.json();

        setAdminAuthMode(Boolean(data.configured));

        if (data.logged_in) {
            sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
            await openAdminDashboard({ silent: true });
            return;
        }
    } catch (error) {
        console.error('Admin status check failed:', error);
        if (sessionStorage.getItem(ADMIN_SESSION_KEY) === '1') {
            await openAdminDashboard({ silent: true });
        }
    }
}

bootstrap();
