const BASE_URL = 'http://localhost:8080/api/v1';

// ── Token Management ──────────────────────
function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function saveToken(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearToken() {
  localStorage.clear();
}

// ── Auth Check ────────────────────────────
function checkAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'skillsphere-auth.html';
    return false;
  }
  return true;
}

// ── API Call Helper ───────────────────────
async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    };

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Token expired
    if (response.status === 401) {
      clearToken();
      window.location.href = 'skillsphere-auth.html';
      return null;
    }

    return await response.json();

  } catch (err) {
    console.error('API Error:', err);
    return null;
  }
}

// ── Auth API Calls ────────────────────────
async function loginApi(email, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return await response.json();
}

async function registerApi(data) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// ── Assessment API Calls ──────────────────
async function startAssessmentApi(domainCode, difficulty, questionCount) {
  return await apiCall('/assessments/start', 'POST', {
    domainCode,
    difficulty,
    questionCount
  });
}

async function submitAnswerApi(uuid, questionId, selectedOption, timeTakenSecs) {
  return await apiCall(`/assessments/${uuid}/answer`, 'POST', {
    questionId,
    selectedOption,
    isSkipped: false,
    timeTakenSecs
  });
}

async function completeAssessmentApi(uuid) {
  return await apiCall(`/assessments/${uuid}/complete`, 'POST');
}

async function getAssessmentHistoryApi() {
  return await apiCall('/assessments/history', 'GET');
}

// ── Certificate API Calls ─────────────────
async function issueCertificateApi(assessmentUuid) {
  return await apiCall(`/certificates/issue/${assessmentUuid}`, 'POST');
}

async function getMyCertificatesApi() {
  return await apiCall('/certificates/my', 'GET');
}

async function verifyCertificateApi(certId) {
  const response = await fetch(`${BASE_URL}/certificates/verify/${certId}`);
  return await response.json();
}

// ── User API Calls ────────────────────────
async function getMyProfileApi() {
  return await apiCall('/users/me', 'GET');
}

async function updateProfileApi(data) {
  return await apiCall('/users/me', 'PATCH', data);
}

async function getLeaderboardApi(limit = 50) {
  return await apiCall(`/users/leaderboard?limit=${limit}`, 'GET');
}

// ── Discussion API Calls ──────────────────
async function getPublicRoomsApi(domain = '') {
  const query = domain ? `?domain=${domain}` : '';
  return await apiCall(`/rooms/public${query}`, 'GET');
}

async function createRoomApi(data) {
  return await apiCall('/rooms', 'POST', data);
}

async function joinRoomApi(roomCode) {
  return await apiCall(`/rooms/${roomCode}/join`, 'POST');
}

async function sendMessageApi(roomCode, content) {
  return await apiCall(`/rooms/${roomCode}/message`, 'POST', { content });
}

async function endRoomApi(roomCode) {
  return await apiCall(`/rooms/${roomCode}/end`, 'POST');
}