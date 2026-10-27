const ADMIN_SESSION_KEY = 'schoolAdminAccess';
const ADMIN_EMAIL = 'akashthonse8@gmail.com';
const ADMIN_PASSWORD = 'akash8217';

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
const adminBadge = document.getElementById('adminBadge');
const toggleAdminCredentialsBtn = document.getElementById('toggleAdminCredentialsBtn');
const adminCredentialsPanel = document.getElementById('adminCredentialsPanel');
const adminCredentialsForm = document.getElementById('adminCredentialsForm');
const adminCredentialsUsername = document.getElementById('adminCredentialsUsername');
const adminCredentialsPassword = document.getElementById('adminCredentialsPassword');
const adminCredentialsConfirmPassword = document.getElementById('adminCredentialsConfirmPassword');
const adminCredentialsMessage = document.getElementById('adminCredentialsMessage');
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
const eventPhotoButtons = document.querySelectorAll('[data-view-event-photos]');
const eventPhotoGallery = document.getElementById('eventPhotoGallery');
const photoCount = document.getElementById('photoCount');
const photoMessage = document.getElementById('photoMessage');
const photoGrid = document.getElementById('photoGrid');
const togglePhotoUploaderBtn = document.getElementById('togglePhotoUploaderBtn');
const eventPhotoForm = document.getElementById('eventPhotoForm');
const eventPhotoTitle = document.getElementById('eventPhotoTitle');
const eventPhotoFiles = document.getElementById('eventPhotoFiles');
const eventPhotoMessage = document.getElementById('eventPhotoMessage');
const syllabusButtons = document.querySelectorAll('[data-view-syllabus]');
const toggleSyllabusFormBtn = document.getElementById('toggleSyllabusFormBtn');
const syllabusForm = document.getElementById('syllabusForm');
const syllabusClass = document.getElementById('syllabusClass');
const syllabusMaths = document.getElementById('syllabusMaths');
const syllabusScience = document.getElementById('syllabusScience');
const syllabusEnglish = document.getElementById('syllabusEnglish');
const syllabusKannada = document.getElementById('syllabusKannada');
const syllabusSocialScience = document.getElementById('syllabusSocialScience');
const syllabusHindi = document.getElementById('syllabusHindi');
const syllabusMathsPdf = document.getElementById('syllabusMathsPdf');
const syllabusSciencePdf = document.getElementById('syllabusSciencePdf');
const syllabusEnglishPdf = document.getElementById('syllabusEnglishPdf');
const syllabusKannadaPdf = document.getElementById('syllabusKannadaPdf');
const syllabusSocialSciencePdf = document.getElementById('syllabusSocialSciencePdf');
const syllabusHindiPdf = document.getElementById('syllabusHindiPdf');
const syllabusFormMessage = document.getElementById('syllabusFormMessage');
const syllabusViewer = document.getElementById('syllabusViewer');
const syllabusCount = document.getElementById('syllabusCount');
const syllabusClassFilter = document.getElementById('syllabusClassFilter');
const syllabusMessage = document.getElementById('syllabusMessage');
const syllabusGrid = document.getElementById('syllabusGrid');

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
const syllabusFields = [
    { key: 'maths', label: 'Maths', input: syllabusMaths, pdfInput: syllabusMathsPdf },
    { key: 'science', label: 'Science', input: syllabusScience, pdfInput: syllabusSciencePdf },
    { key: 'english', label: 'English', input: syllabusEnglish, pdfInput: syllabusEnglishPdf },
    { key: 'kannada', label: 'Kannada', input: syllabusKannada, pdfInput: syllabusKannadaPdf },
    { key: 'social_science', label: 'Social Science', input: syllabusSocialScience, pdfInput: syllabusSocialSciencePdf },
    { key: 'hindi', label: 'Hindi', input: syllabusHindi, pdfInput: syllabusHindiPdf },
];

const SERVER_MODE = 'server';
const LOCAL_MODE = 'local';
const nativeFetch = window.fetch.bind(window);
const LOCAL_STORAGE_KEYS = {
    students: 'schoolPortalLocalStudents',
    eventPhotos: 'schoolPortalLocalEventPhotos',
    syllabus: 'schoolPortalLocalSyllabus',
};
const LOCAL_SEED_STUDENTS = [
    {
        roll_no: 103,
        name: 'Anjali',
        class: '10A',
        maths: 95,
        science: 92,
        english: 90,
        kannada: 94,
        social_science: 96,
        hindi: 91,
    },
    {
        roll_no: 104,
        name: 'Adithya',
        class: '7A',
        maths: 78,
        science: 67,
        english: 99,
        kannada: 84,
        social_science: 72,
        hindi: 76,
    },
    {
        roll_no: 105,
        name: 'Rajesh',
        class: '7A',
        maths: 63,
        science: 85,
        english: 65,
        kannada: 98,
        social_science: 65,
        hindi: 86,
    },
];
const LOCAL_SEED_EVENT_PHOTOS = [
    {
        id: '17b5fe69ba6547e9a486d47d5f38f4a1',
        title: 'School',
        original_filename: 'WhatsApp_Image_2026-06-26_at_1.11.24_AM.jpeg',
        stored_filename: '1f7c083ed9f148eea089d46d6656683b.jpeg',
        url: '/static/uploads/event-photos/1f7c083ed9f148eea089d46d6656683b.jpeg',
        uploaded_at: '2026-07-13T15:09:51+00:00',
        uploaded_by: 'Akash',
    },
];
let backendMode = SERVER_MODE;
const memoryStorage = new Map();

function cloneData(value) {
    return JSON.parse(JSON.stringify(value));
}

function jsonResponse(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

function readLocalJson(key) {
    try {
        const raw = window.localStorage.getItem(key);
        if (raw === null) {
            return memoryStorage.has(key) ? cloneData(memoryStorage.get(key)) : null;
        }
        return JSON.parse(raw);
    } catch (error) {
        return memoryStorage.has(key) ? cloneData(memoryStorage.get(key)) : null;
    }
}

function writeLocalJson(key, value) {
    const serialized = JSON.stringify(value);
    try {
        window.localStorage.setItem(key, serialized);
    } catch (error) {
        memoryStorage.set(key, cloneData(value));
    }
}

function normalizeLocalStudent(student) {
    return {
        roll_no: Number(student.roll_no),
        name: String(student.name || '').trim(),
        class: String(student.class || '').trim(),
        maths: Number(student.maths ?? 0),
        science: Number(student.science ?? 0),
        english: Number(student.english ?? 0),
        kannada: Number(student.kannada ?? 0),
        social_science: Number(student.social_science ?? 0),
        hindi: Number(student.hindi ?? 0),
    };
}

function sortLocalStudents(students) {
    return [...students].sort((left, right) => Number(left.roll_no) - Number(right.roll_no));
}

function getLocalStudents() {
    const stored = readLocalJson(LOCAL_STORAGE_KEYS.students);
    if (Array.isArray(stored)) {
        return sortLocalStudents(stored.map(normalizeLocalStudent));
    }

    const seed = sortLocalStudents(cloneData(LOCAL_SEED_STUDENTS).map(normalizeLocalStudent));
    writeLocalJson(LOCAL_STORAGE_KEYS.students, seed);
    return seed;
}

function saveLocalStudents(students) {
    const normalized = sortLocalStudents(students.map(normalizeLocalStudent));
    writeLocalJson(LOCAL_STORAGE_KEYS.students, normalized);
    return normalized;
}

function getLocalEventPhotos() {
    const stored = readLocalJson(LOCAL_STORAGE_KEYS.eventPhotos);
    if (Array.isArray(stored)) {
        return stored;
    }

    const seed = cloneData(LOCAL_SEED_EVENT_PHOTOS);
    writeLocalJson(LOCAL_STORAGE_KEYS.eventPhotos, seed);
    return seed;
}

function saveLocalEventPhotos(photos) {
    const nextPhotos = Array.isArray(photos) ? cloneData(photos) : [];
    writeLocalJson(LOCAL_STORAGE_KEYS.eventPhotos, nextPhotos);
    return nextPhotos;
}

function syllabusClassKey(className) {
    return String(className || '').trim().toLowerCase();
}

function normalizeLocalSyllabusEntry(entry) {
    const className = String(entry?.class || '').trim();
    if (!className) {
        return null;
    }

    const normalized = {
        class: className,
    };
    syllabusFields.forEach((field) => {
        normalized[field.key] = String(entry?.[field.key] || '').trim();
    });

    const pdfs = {};
    const rawPdfs = entry?.pdfs;
    if (rawPdfs && typeof rawPdfs === 'object') {
        syllabusFields.forEach((field) => {
            const rawPdf = rawPdfs[field.key];
            const url = String(rawPdf?.url || '').trim();
            if (!url) {
                return;
            }

            pdfs[field.key] = {
                original_filename: String(rawPdf.original_filename || `${field.label} syllabus.pdf`).trim(),
                url,
            };
        });
    }

    if (Object.keys(pdfs).length) {
        normalized.pdfs = pdfs;
    }
    return normalized;
}

function sortLocalSyllabus(syllabus) {
    return [...syllabus].sort((left, right) => {
        return syllabusClassKey(left.class).localeCompare(syllabusClassKey(right.class));
    });
}

function getLocalSyllabus() {
    const stored = readLocalJson(LOCAL_STORAGE_KEYS.syllabus);
    if (Array.isArray(stored)) {
        return sortLocalSyllabus(stored.map(normalizeLocalSyllabusEntry).filter(Boolean));
    }

    writeLocalJson(LOCAL_STORAGE_KEYS.syllabus, []);
    return [];
}

function saveLocalSyllabus(syllabus) {
    const normalized = sortLocalSyllabus(syllabus.map(normalizeLocalSyllabusEntry).filter(Boolean));
    writeLocalJson(LOCAL_STORAGE_KEYS.syllabus, normalized);
    return normalized;
}

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function getLocalAdminCredentials() {
    return {
        configured: true,
        username: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    };
}

function getLocalAdminStatus() {
    const credentials = getLocalAdminCredentials();
    const loggedIn = credentials.configured && sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';

    return {
        logged_in: loggedIn,
        configured: credentials.configured,
        username: loggedIn ? credentials.username : '',
    };
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('Unable to read file.'));
        reader.readAsDataURL(file);
    });
}

async function parseLocalPayload(request) {
    const contentType = request.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
        return request.json();
    }

    if (contentType.includes('multipart/form-data')) {
        return request.formData();
    }

    return {};
}

function readLocalPayloadValue(payload, key) {
    return payload instanceof FormData ? payload.get(key) : payload[key];
}

function isPdfAttachment(file) {
    if (!(file instanceof File) || file.size <= 0) {
        return false;
    }

    return file.type === 'application/pdf' || String(file.name || '').toLowerCase().endsWith('.pdf');
}

async function handleLocalApiRequest(input, init = {}) {
    const request = input instanceof Request ? input : new Request(input, init);
    const url = new URL(request.url, window.location.origin);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();

    if ((pathname === '/api/admin/status' || pathname === '/admin/status') && method === 'GET') {
        return jsonResponse(getLocalAdminStatus());
    }

    if ((pathname === '/api/students' || pathname === '/students') && method === 'GET') {
        return jsonResponse(getLocalStudents());
    }

    if (pathname.match(/^\/api\/students\/\d+$/) && method === 'GET') {
        const rollNo = Number(pathname.split('/').pop());
        const student = getLocalStudents().find((entry) => Number(entry.roll_no) === rollNo);
        if (!student) {
            return jsonResponse({ ok: false, message: 'Student not found.' }, 404);
        }
        return jsonResponse(student);
    }

    if (pathname === '/api/admin/login' && method === 'POST') {
        const payload = await parseLocalPayload(request);
        const username = String(payload.email || payload.username || '').trim();
        const email = normalizeEmail(username);
        const password = String(payload.password || '');
        const credentials = getLocalAdminCredentials();

        if (email !== normalizeEmail(credentials.username)) {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
            return jsonResponse({
                ok: true,
                role: 'student',
                message: 'Student portal opened. Admin access is only for the approved email.',
            });
        }

        if (password === credentials.password) {
            sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
            return jsonResponse({
                ok: true,
                role: 'admin',
                message: 'Admin login successful.',
                username: credentials.username,
            });
        }

        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        return jsonResponse({ ok: false, message: 'Invalid admin email or password.' }, 401);
    }

    if (pathname === '/api/admin/credentials' && method === 'POST') {
        return jsonResponse({ ok: false, message: 'Admin credentials are fixed for this portal.' }, 403);
    }

    if (pathname === '/api/admin/logout' && method === 'POST') {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        currentAdminUsername = '';
        return jsonResponse({ ok: true, message: 'Admin logged out.' });
    }

    if (pathname === '/api/event-photos' && method === 'GET') {
        return jsonResponse(getLocalEventPhotos());
    }

    if (pathname === '/api/syllabus' && method === 'GET') {
        return jsonResponse(getLocalSyllabus());
    }

    if (pathname === '/api/admin/syllabus' && method === 'POST') {
        if (sessionStorage.getItem(ADMIN_SESSION_KEY) !== '1') {
            return jsonResponse({ ok: false, message: 'Admin login required.' }, 403);
        }

        const payload = await parseLocalPayload(request);
        const syllabusEntry = {
            class: String(readLocalPayloadValue(payload, 'class') || '').trim(),
        };
        syllabusFields.forEach((field) => {
            const subjectSyllabus = String(readLocalPayloadValue(payload, field.key) || '').trim();
            if (subjectSyllabus) {
                syllabusEntry[field.key] = subjectSyllabus;
            }
        });

        if (!syllabusEntry.class) {
            return jsonResponse({ ok: false, message: 'Class is required.' }, 400);
        }

        const syllabus = getLocalSyllabus();
        const existingIndex = syllabus.findIndex((entry) => syllabusClassKey(entry.class) === syllabusClassKey(syllabusEntry.class));
        const existingPdfs = existingIndex === -1 ? {} : { ...(syllabus[existingIndex].pdfs || {}) };
        let hasNewAttachment = false;

        for (const field of syllabusFields) {
            const attachment = readLocalPayloadValue(payload, `${field.key}_pdf`);
            if (!(attachment instanceof File) || attachment.size <= 0) {
                continue;
            }

            if (!isPdfAttachment(attachment)) {
                return jsonResponse({ ok: false, message: `The ${field.label} attachment must be a PDF file.` }, 400);
            }

            existingPdfs[field.key] = {
                original_filename: attachment.name || `${field.label} syllabus.pdf`,
                url: await readFileAsDataUrl(attachment),
            };
            hasNewAttachment = true;
        }

        if (Object.keys(syllabusEntry).length === 1 && !hasNewAttachment) {
            return jsonResponse({ ok: false, message: 'Add at least one subject syllabus or PDF attachment before saving.' }, 400);
        }

        if (Object.keys(existingPdfs).length) {
            syllabusEntry.pdfs = existingPdfs;
        }

        if (existingIndex === -1) {
            syllabus.push(syllabusEntry);
        } else {
            syllabus[existingIndex] = syllabusEntry;
        }

        const nextSyllabus = saveLocalSyllabus(syllabus);
        return jsonResponse({
            ok: true,
            message: `Syllabus for class ${syllabusEntry.class} ${existingIndex === -1 ? 'added' : 'updated'} successfully.`,
            syllabus: nextSyllabus,
            entry: syllabusEntry,
        });
    }

    if (pathname === '/api/admin/event-photos' && method === 'POST') {
        if (sessionStorage.getItem(ADMIN_SESSION_KEY) !== '1') {
            return jsonResponse({ ok: false, message: 'Admin login required.' }, 403);
        }

        const formData = await request.formData();
        const title = String(formData.get('title') || '').trim() || 'School event';
        const files = formData
            .getAll('photos')
            .filter((file) => file instanceof File && file.size > 0);

        if (!files.length) {
            return jsonResponse({ ok: false, message: 'Please choose at least one photo to upload.' }, 400);
        }

        const uploadedAt = new Date().toISOString();
        const uploadedBy = currentAdminUsername || getLocalAdminCredentials().username || 'Admin';
        const existingPhotos = getLocalEventPhotos();
        const uploadedPhotos = [];

        for (const file of files) {
            if (!String(file.type || '').startsWith('image/')) {
                return jsonResponse({ ok: false, message: 'Only image files can be uploaded.' }, 400);
            }

            uploadedPhotos.push({
                id: (window.crypto && typeof window.crypto.randomUUID === 'function')
                    ? window.crypto.randomUUID().replace(/-/g, '')
                    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`,
                title,
                original_filename: file.name || 'photo',
                stored_filename: file.name || 'photo',
                url: await readFileAsDataUrl(file),
                uploaded_at: uploadedAt,
                uploaded_by: uploadedBy,
            });
        }

        let nextPhotos;
        try {
            nextPhotos = saveLocalEventPhotos([...uploadedPhotos, ...existingPhotos]);
        } catch (error) {
            return jsonResponse({ ok: false, message: 'Could not store the uploaded photos in this browser.' }, 507);
        }

        return jsonResponse({
            ok: true,
            message: `${uploadedPhotos.length} event photo${uploadedPhotos.length === 1 ? '' : 's'} uploaded successfully.`,
            photos: nextPhotos,
        });
    }

    const deletePhotoMatch = pathname.match(/^\/api\/admin\/event-photos\/([^/]+)$/);
    if (deletePhotoMatch && method === 'DELETE') {
        if (sessionStorage.getItem(ADMIN_SESSION_KEY) !== '1') {
            return jsonResponse({ ok: false, message: 'Admin login required.' }, 403);
        }

        const photoId = decodeURIComponent(deletePhotoMatch[1]);
        const photos = getLocalEventPhotos();
        const remainingPhotos = photos.filter((photo) => String(photo.id) !== photoId);

        if (remainingPhotos.length === photos.length) {
            return jsonResponse({ ok: false, message: 'Event photo not found.' }, 404);
        }

        saveLocalEventPhotos(remainingPhotos);
        return jsonResponse({
            ok: true,
            message: 'Event photo deleted successfully.',
            photos: remainingPhotos,
        });
    }

    if (pathname === '/api/admin/students' && method === 'POST') {
        if (sessionStorage.getItem(ADMIN_SESSION_KEY) !== '1') {
            return jsonResponse({ ok: false, message: 'Admin login required.' }, 403);
        }

        const payload = await parseLocalPayload(request);
        const student = {
            roll_no: Number(payload.roll_no),
            name: String(payload.name || '').trim(),
            class: String(payload.class || '').trim(),
            maths: Number(payload.maths),
            science: Number(payload.science),
            english: Number(payload.english),
            kannada: Number(payload.kannada),
            social_science: Number(payload.social_science),
            hindi: Number(payload.hindi),
        };

        if (!Number.isInteger(student.roll_no) || student.roll_no <= 0) {
            return jsonResponse({ ok: false, message: 'Roll number must be a positive integer.' }, 400);
        }

        if (!student.name || !student.class || subjectFields.some((field) => Number.isNaN(student[field.key]))) {
            return jsonResponse({ ok: false, message: 'Please complete every student field.' }, 400);
        }

        const students = getLocalStudents();
        const existingIndex = students.findIndex((entry) => Number(entry.roll_no) === student.roll_no);

        if (existingIndex === -1) {
            students.push(student);
        } else {
            students[existingIndex] = student;
        }

        const nextStudents = saveLocalStudents(students);
        return jsonResponse({
            ok: true,
            message: existingIndex === -1 ? 'Student added successfully.' : 'Student updated successfully.',
            student,
            students: nextStudents,
        });
    }

    const deleteStudentMatch = pathname.match(/^\/api\/admin\/students\/(\d+)$/);
    if (deleteStudentMatch && method === 'DELETE') {
        if (sessionStorage.getItem(ADMIN_SESSION_KEY) !== '1') {
            return jsonResponse({ ok: false, message: 'Admin login required.' }, 403);
        }

        const rollNo = Number(deleteStudentMatch[1]);
        const students = getLocalStudents();
        const remainingStudents = students.filter((student) => Number(student.roll_no) !== rollNo);

        if (remainingStudents.length === students.length) {
            return jsonResponse({ ok: false, message: 'Student not found.' }, 404);
        }

        const nextStudents = saveLocalStudents(remainingStudents);
        return jsonResponse({
            ok: true,
            message: `Student roll number ${rollNo} deleted successfully.`,
            students: nextStudents,
        });
    }

    return jsonResponse({ ok: false, message: 'Not found.' }, 404);
}

window.fetch = async function fetchWithLocalFallback(input, init) {
    const requestUrl = typeof input === 'string' ? input : input.url;
    const isApiRequest = typeof requestUrl === 'string' && requestUrl.includes('/api/');

    if (backendMode === LOCAL_MODE && isApiRequest) {
        return handleLocalApiRequest(input, init);
    }

    return nativeFetch(input, init);
};

let studentsCache = null;
let syllabusCache = [];
let lastLookupRollNo = null;
let activeAccessRole = 'student';
let currentAdminUsername = '';

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

function setAdminBadge(username = '') {
    if (!adminBadge) {
        return;
    }

    adminBadge.textContent = username ? `Signed in as ${username}` : 'Teacher signed in';
}

function setAdminCredentialsMessage(message) {
    if (!adminCredentialsMessage) {
        return;
    }

    adminCredentialsMessage.textContent = message;
}

function setStudentFormMessage(message) {
    studentFormMessage.textContent = message;
}

function setEventPhotoMessage(message) {
    if (!eventPhotoMessage) {
        return;
    }

    eventPhotoMessage.textContent = message;
}

function setSyllabusFormMessage(message) {
    if (!syllabusFormMessage) {
        return;
    }

    syllabusFormMessage.textContent = message;
}

function setPhotoGalleryMessage(message) {
    if (!photoMessage) {
        return;
    }

    photoMessage.textContent = message;
}

function setSyllabusMessage(message) {
    if (!syllabusMessage) {
        return;
    }

    syllabusMessage.textContent = message;
}

function setEventPhotoGalleryButtonsExpanded(isExpanded) {
    eventPhotoButtons.forEach((button) => {
        button.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });
}

function setSyllabusButtonsExpanded(isExpanded) {
    syllabusButtons.forEach((button) => {
        button.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });
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
    if (!eventPhotoForm || !togglePhotoUploaderBtn) {
        return;
    }

    eventPhotoForm.hidden = true;
    eventPhotoForm.reset();
    togglePhotoUploaderBtn.textContent = 'Add photos';
    togglePhotoUploaderBtn.setAttribute('aria-expanded', 'false');
    setEventPhotoMessage('');
}

function closeEventPhotoGallery() {
    if (!eventPhotoGallery || !photoGrid || !photoCount) {
        return;
    }

    eventPhotoGallery.hidden = true;
    photoGrid.innerHTML = '';
    photoCount.textContent = '0 photos';
    setPhotoGalleryMessage('');
    setEventPhotoGalleryButtonsExpanded(false);
}

function resetSyllabusForm() {
    if (!syllabusForm || !toggleSyllabusFormBtn) {
        return;
    }

    syllabusForm.hidden = true;
    syllabusForm.reset();
    toggleSyllabusFormBtn.textContent = 'Add syllabus';
    toggleSyllabusFormBtn.setAttribute('aria-expanded', 'false');
    setSyllabusFormMessage('');
}

function closeSyllabusViewer() {
    if (!syllabusViewer || !syllabusGrid || !syllabusCount) {
        return;
    }

    syllabusViewer.hidden = true;
    syllabusCache = [];
    syllabusGrid.innerHTML = '';
    syllabusCount.textContent = '0 classes';
    if (syllabusClassFilter) {
        syllabusClassFilter.innerHTML = '<option value="">Select a class</option>';
        syllabusClassFilter.value = '';
        syllabusClassFilter.disabled = true;
    }
    setSyllabusMessage('');
    setSyllabusButtonsExpanded(false);
}

function resetAdminCredentialsPanel() {
    if (adminCredentialsForm) {
        adminCredentialsForm.reset();
    }

    setAdminCredentialsMessage('');
    if (adminCredentialsPanel) {
        adminCredentialsPanel.hidden = true;
    }

    if (toggleAdminCredentialsBtn) {
        toggleAdminCredentialsBtn.textContent = 'Change credentials';
        toggleAdminCredentialsBtn.setAttribute('aria-expanded', 'false');
    }
}

function setAdminCredentialsPanelVisible(isVisible) {
    if (!adminCredentialsPanel || !toggleAdminCredentialsBtn) {
        return;
    }

    adminCredentialsPanel.hidden = !isVisible;
    toggleAdminCredentialsBtn.textContent = isVisible ? 'Hide credentials' : 'Change credentials';
    toggleAdminCredentialsBtn.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
}

function syncAdminIdentity(username = '') {
    currentAdminUsername = username ? String(username).trim() : '';
    setAdminBadge(currentAdminUsername);

    if (adminCredentialsUsername) {
        adminCredentialsUsername.value = currentAdminUsername;
    }
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

function setAdminAuthMode() {
    adminLoginSection.hidden = false;
    adminSetupSection.hidden = true;
    setAdminSetupMessage('');
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
                <div class="row-actions">
                    <button type="button" class="row-action" data-student-action="edit" data-roll="${escapeHtml(student.roll_no)}">Edit</button>
                    <button type="button" class="row-action is-danger" data-student-action="delete" data-roll="${escapeHtml(student.roll_no)}">Delete</button>
                </div>
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
    resetSyllabusForm();
    closeSyllabusViewer();
    setAccessRole(defaultRole);
}

function hideLandingPage() {
    entryShell.hidden = true;
}

function openStudentOnlyPanel(message = '') {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    closeAdminDashboard();
    showLandingPage('student');
    adminPassword.value = '';
    setAdminLoginMessage('');
    setLookupMessage(message || 'Student portal opened for this email.');
    studentAccessPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderEventPhotoGallery(photos) {
    if (!photoGrid || !photoCount) {
        return;
    }

    const canManagePhotos = !adminDashboard.hidden;
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
        const photoId = String(photo.id || '').trim();
        const deleteControl = canManagePhotos && photoId
            ? `
                <div class="gallery-item-actions">
                    <button type="button" class="row-action photo-delete-button" data-photo-action="delete" data-photo-id="${escapeHtml(photoId)}">Delete photo</button>
                </div>
            `
            : '';
        const photoCard = document.createElement('figure');
        photoCard.className = 'gallery-item';
        photoCard.style.setProperty('--photo-index', index);
        photoCard.innerHTML = `
            <img src="${escapeHtml(photo.url || '')}" alt="${escapeHtml(`${title} photo ${index + 1}`)}" loading="lazy">
            <figcaption>
                <strong>${escapeHtml(title)}</strong>
                <span>${escapeHtml(timestamp)}</span>
                ${deleteControl}
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
    if (!eventPhotoGallery || !photoGrid || !photoCount || !photoMessage) {
        return;
    }

    const scroll = options.scroll !== false;
    eventPhotoGallery.hidden = false;
    setEventPhotoGalleryButtonsExpanded(true);

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

function renderSyllabus(syllabus) {
    if (!syllabusGrid || !syllabusCount) {
        return;
    }

    const entries = Array.isArray(syllabus) ? syllabus : [];
    syllabusGrid.innerHTML = '';
    syllabusCount.textContent = `${entries.length} class${entries.length === 1 ? '' : 'es'}`;

    if (!entries.length) {
        syllabusGrid.innerHTML = '<div class="empty-state">No class syllabus has been added yet.</div>';
        setSyllabusMessage('The syllabus will appear here once the admin adds it.');
        return;
    }

    setSyllabusMessage(`Showing the syllabus for ${entries.length} class${entries.length === 1 ? '' : 'es'}.`);

    entries.forEach((entry, index) => {
        const subjects = syllabusFields.map((field) => {
            const pdf = entry?.pdfs?.[field.key];
            const pdfLink = pdf?.url
                ? `<a class="syllabus-pdf-link" href="${escapeHtml(pdf.url)}" target="_blank" rel="noopener" download="${escapeHtml(pdf.original_filename || `${field.label} syllabus.pdf`)}">Open ${escapeHtml(field.label)} PDF</a>`
                : '';

            return `
                <div class="syllabus-subject">
                    <strong>${escapeHtml(field.label)}</strong>
                    <p>${escapeHtml(entry?.[field.key] || 'Not added yet')}</p>
                    ${pdfLink}
                </div>
            `;
        }).join('');
        const card = document.createElement('article');
        card.className = 'syllabus-item';
        card.style.setProperty('--syllabus-index', index);
        card.innerHTML = `
            <p class="eyebrow">Class</p>
            <h4>${escapeHtml(entry?.class || 'Unnamed class')}</h4>
            <div class="syllabus-subjects">${subjects}</div>
        `;
        syllabusGrid.appendChild(card);
    });
}

function setSyllabusClassFilter(syllabus, preferredClass = '') {
    if (!syllabusClassFilter) {
        return;
    }

    const previousClass = preferredClass || syllabusClassFilter.value;
    const entries = Array.isArray(syllabus) ? syllabus : [];
    syllabusClassFilter.innerHTML = '<option value="">Select a class</option>';

    entries.forEach((entry) => {
        const className = String(entry?.class || '').trim();
        if (!className) {
            return;
        }

        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        syllabusClassFilter.appendChild(option);
    });

    syllabusClassFilter.disabled = entries.length === 0;
    const selectedEntry = entries.find((entry) => {
        return syllabusClassKey(entry?.class) === syllabusClassKey(previousClass);
    });
    syllabusClassFilter.value = selectedEntry ? selectedEntry.class : '';
}

function renderSelectedSyllabus() {
    if (!syllabusClassFilter) {
        renderSyllabus(syllabusCache);
        return;
    }

    const selectedClass = syllabusClassFilter.value;
    if (!selectedClass) {
        syllabusGrid.innerHTML = '<div class="empty-state">Select a class to view its syllabus.</div>';
        syllabusCount.textContent = '0 classes';
        setSyllabusMessage('Choose a class from the list above.');
        return;
    }

    const selectedSyllabus = syllabusCache.filter((entry) => {
        return syllabusClassKey(entry?.class) === syllabusClassKey(selectedClass);
    });
    renderSyllabus(selectedSyllabus);
}

async function loadSyllabus() {
    const response = await fetch('/api/syllabus');
    if (!response.ok) {
        throw new Error('Unable to load the syllabus.');
    }

    return response.json();
}

async function openSyllabusViewer(options = {}) {
    if (!syllabusViewer || !syllabusGrid || !syllabusCount || !syllabusMessage) {
        return;
    }

    const scroll = options.scroll !== false;
    syllabusViewer.hidden = false;
    setSyllabusButtonsExpanded(true);

    try {
        syllabusCache = await loadSyllabus();
        setSyllabusClassFilter(syllabusCache);
        renderSelectedSyllabus();
    } catch (error) {
        console.error('Error loading syllabus:', error);
        syllabusCache = [];
        setSyllabusClassFilter([]);
        syllabusGrid.innerHTML = '<div class="empty-state">Could not load the syllabus right now.</div>';
        syllabusCount.textContent = '0 classes';
        setSyllabusMessage('Could not load the syllabus right now.');
    }

    if (scroll) {
        syllabusViewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function toggleSyllabusForm() {
    if (!syllabusForm || !toggleSyllabusFormBtn || !syllabusClass) {
        return;
    }

    const shouldOpen = syllabusForm.hidden;
    syllabusForm.hidden = !shouldOpen;
    toggleSyllabusFormBtn.textContent = shouldOpen ? 'Hide form' : 'Add syllabus';
    toggleSyllabusFormBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');

    if (shouldOpen) {
        syllabusClass.focus();
        setSyllabusFormMessage('Add one or more subject syllabuses or PDFs. Saving an existing class keeps its other subjects.');
    } else {
        syllabusForm.reset();
        setSyllabusFormMessage('');
    }
}

function toggleEventPhotoUploader() {
    if (!eventPhotoForm || !togglePhotoUploaderBtn) {
        return;
    }

    const shouldOpen = eventPhotoForm.hidden;
    eventPhotoForm.hidden = !shouldOpen;
    togglePhotoUploaderBtn.textContent = shouldOpen ? 'Hide uploader' : 'Add photos';
    togglePhotoUploaderBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    if (shouldOpen) {
        eventPhotoTitle.focus();
        setEventPhotoMessage('Choose one or more photos to upload.');
    } else {
        setEventPhotoMessage('');
        eventPhotoForm.reset();
    }
}

async function deleteEventPhoto(photoId) {
    const response = await fetch(`/api/admin/event-photos/${encodeURIComponent(photoId)}`, {
        method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Unable to delete the event photo.');
    }

    setAdminStatus(data.message || 'Event photo deleted successfully.');
    await openEventPhotoGallery({ scroll: false });
    return data;
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

async function deleteStudentRecord(rollNo) {
    const response = await fetch(`/api/admin/students/${rollNo}`, {
        method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Unable to delete the student record.');
    }

    renderAdminData(data.students || []);

    const shouldClearForm = Number(studentRollNo.value.trim()) === Number(rollNo);
    if (shouldClearForm) {
        clearStudentForm();
    }

    const message = data.message || `Student roll number ${rollNo} deleted successfully.`;
    setAdminStatus(message);
    setStudentFormMessage(message);

    if (lastLookupRollNo === Number(rollNo)) {
        hideStudentResult();
        lastLookupRollNo = null;
    }

    return data;
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
    const username = typeof options.username === 'string' ? options.username.trim() : '';
    hideLandingPage();
    adminDashboard.hidden = false;
    resetEventPhotoUploader();
    closeEventPhotoGallery();
    resetSyllabusForm();
    closeSyllabusViewer();
    resetAdminCredentialsPanel();
    syncAdminIdentity(username || currentAdminUsername);

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
    closeEventPhotoGallery();
    resetSyllabusForm();
    closeSyllabusViewer();
    resetAdminCredentialsPanel();
    syncAdminIdentity('');
}

roleButtons.forEach((button) => {
    button.addEventListener('click', () => {
        setAccessRole(button.dataset.roleSwitch);
    });
});

adminLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = adminUsername.value.trim();
    const password = adminPassword.value.trim();

    if (!email) {
        setAdminLoginMessage('Please enter your email address.');
        return;
    }

    if (normalizeEmail(email) !== normalizeEmail(ADMIN_EMAIL)) {
        openStudentOnlyPanel('Student portal opened for this email.');
        return;
    }

    if (!password) {
        setAdminLoginMessage('Please enter the admin password.');
        return;
    }

    setAdminLoginMessage('Checking admin credentials...');

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, username: email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            setAdminLoginMessage(data.message || 'Unable to log in.');
            return;
        }

        if (data.role === 'student') {
            openStudentOnlyPanel(data.message);
            return;
        }

        sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
        await openAdminDashboard({ silent: true, scroll: true, username: data.username || email });
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
        syncAdminIdentity(data.username || username);
        setAdminSetupMessage(data.message || 'Admin credentials saved successfully.');
        await openAdminDashboard({ silent: true, scroll: true, username: data.username || username });
    } catch (error) {
        console.error('Admin credential setup error:', error);
        setAdminSetupMessage('Could not connect to the server.');
    }
});

if (toggleAdminCredentialsBtn) {
    toggleAdminCredentialsBtn.addEventListener('click', () => {
        const shouldOpen = adminCredentialsPanel ? adminCredentialsPanel.hidden : false;
        setAdminCredentialsPanelVisible(shouldOpen);

        if (shouldOpen && adminCredentialsUsername) {
            adminCredentialsUsername.focus();
        }
    });
}

if (adminCredentialsForm) {
    adminCredentialsForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = adminCredentialsUsername ? adminCredentialsUsername.value.trim() : '';
        const password = adminCredentialsPassword ? adminCredentialsPassword.value.trim() : '';
        const confirmPassword = adminCredentialsConfirmPassword ? adminCredentialsConfirmPassword.value.trim() : '';

        if (!username || !password || !confirmPassword) {
            setAdminCredentialsMessage('Please complete every credential field.');
            return;
        }

        if (password !== confirmPassword) {
            setAdminCredentialsMessage('Passwords do not match.');
            return;
        }

        setAdminCredentialsMessage('Saving credentials...');

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
                setAdminCredentialsMessage(data.message || 'Unable to save credentials.');
                return;
            }

            adminCredentialsForm.reset();
            syncAdminIdentity(data.username || username);
            setAdminCredentialsPanelVisible(true);
            setAdminCredentialsMessage(data.message || 'Admin credentials updated successfully.');
            setAdminStatus(data.message || 'Admin credentials updated successfully.');
        } catch (error) {
            console.error('Admin credential update error:', error);
            setAdminCredentialsMessage('Could not connect to the server.');
        }
    });
}

if (photoGrid) {
    photoGrid.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-photo-action="delete"]');
        if (!button) {
            return;
        }

        const photoId = String(button.dataset.photoId || '').trim();
        if (!photoId) {
            return;
        }

        const photoLabel = button.closest('.gallery-item')?.querySelector('strong')?.textContent?.trim() || 'this photo';
        const confirmed = window.confirm(`Delete ${photoLabel}?`);
        if (!confirmed) {
            return;
        }

        button.disabled = true;

        try {
            await deleteEventPhoto(photoId);
        } catch (error) {
            console.error('Delete event photo error:', error);
            setAdminStatus(error.message || 'Could not delete the event photo right now.');
        } finally {
            button.disabled = false;
        }
    });
}

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

if (togglePhotoUploaderBtn && eventPhotoForm) {
    togglePhotoUploaderBtn.addEventListener('click', toggleEventPhotoUploader);
}

if (eventPhotoButtons.length && eventPhotoGallery && photoGrid && photoCount && photoMessage) {
    eventPhotoButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            await openEventPhotoGallery({ scroll: true });
        });
    });
}

if (syllabusButtons.length && syllabusViewer && syllabusGrid && syllabusCount && syllabusMessage) {
    syllabusButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            await openSyllabusViewer({ scroll: true });
        });
    });
}

if (syllabusClassFilter) {
    syllabusClassFilter.addEventListener('change', renderSelectedSyllabus);
}

if (toggleSyllabusFormBtn && syllabusForm) {
    toggleSyllabusFormBtn.addEventListener('click', toggleSyllabusForm);
}

if (syllabusForm && syllabusClass && syllabusFormMessage) {
    syllabusForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const payload = {
            class: syllabusClass.value.trim(),
        };
        syllabusFields.forEach((field) => {
            payload[field.key] = field.input.value.trim();
        });

        if (!payload.class) {
            setSyllabusFormMessage('Please enter the class before saving.');
            return;
        }

        const hasSubjectContent = syllabusFields.some((field) => {
            return payload[field.key] || field.pdfInput?.files?.length;
        });
        if (!hasSubjectContent) {
            setSyllabusFormMessage('Add at least one subject syllabus or PDF attachment before saving.');
            return;
        }

        setSyllabusFormMessage('Saving syllabus...');

        const formData = new FormData();
        formData.append('class', payload.class);
        for (const field of syllabusFields) {
            formData.append(field.key, payload[field.key]);

            const attachment = field.pdfInput?.files?.[0];
            if (!attachment) {
                continue;
            }

            if (!isPdfAttachment(attachment)) {
                setSyllabusFormMessage(`The ${field.label} attachment must be a PDF file.`);
                return;
            }

            formData.append(`${field.key}_pdf`, attachment);
        }

        try {
            const response = await fetch('/api/admin/syllabus', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (!response.ok) {
                setSyllabusFormMessage(data.message || 'Unable to save the syllabus.');
                return;
            }

            syllabusForm.reset();
            syllabusForm.hidden = true;
            toggleSyllabusFormBtn.textContent = 'Add syllabus';
            toggleSyllabusFormBtn.setAttribute('aria-expanded', 'false');
            setSyllabusFormMessage(data.message || 'Syllabus saved successfully.');
            setAdminStatus(data.message || 'Syllabus saved successfully.');

            if (syllabusViewer && !syllabusViewer.hidden) {
                syllabusCache = Array.isArray(data.syllabus) ? data.syllabus : [];
                setSyllabusClassFilter(syllabusCache, data.entry?.class || payload.class);
                renderSelectedSyllabus();
            }
        } catch (error) {
            console.error('Save syllabus error:', error);
            setSyllabusFormMessage('Could not save the syllabus right now.');
        }
    });
}

if (eventPhotoForm && eventPhotoFiles && eventPhotoTitle && togglePhotoUploaderBtn) {
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
}

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

tableBody.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-student-action]');
    if (!button) {
        return;
    }

    const rollNo = Number(button.dataset.roll);
    const student = (studentsCache || []).find((entry) => Number(entry.roll_no) === rollNo);
    if (!student) {
        return;
    }

    const action = button.dataset.studentAction;

    if (action === 'delete') {
        const confirmed = window.confirm(`Delete student ${student.name} (roll number ${rollNo})?`);
        if (!confirmed) {
            return;
        }

        button.disabled = true;

        try {
            await deleteStudentRecord(rollNo);
        } catch (error) {
            console.error('Delete student error:', error);
            setAdminStatus(error.message || 'Could not delete the student right now.');
            setStudentFormMessage(error.message || 'Could not delete the student right now.');
        } finally {
            button.disabled = false;
        }
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

        backendMode = SERVER_MODE;
        setAdminAuthMode(Boolean(data.configured));

        if (data.logged_in) {
            sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
            await openAdminDashboard({ silent: true, username: data.username || '' });
            return;
        }
    } catch (error) {
        backendMode = LOCAL_MODE;
        console.warn('Admin status check failed, switching to local mode:', error);

        const localStatus = getLocalAdminStatus();
        setAdminAuthMode(Boolean(localStatus.configured));
        setAdminLoginMessage('Sign in with the approved admin email. Other emails continue with the student portal.');

        if (localStatus.logged_in || sessionStorage.getItem(ADMIN_SESSION_KEY) === '1') {
            await openAdminDashboard({
                silent: true,
                username: localStatus.username || getLocalAdminCredentials().username || '',
            });
        }
    }
}

bootstrap();
