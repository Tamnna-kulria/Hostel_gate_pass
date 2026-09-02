const API_BASE_URL = "https://hostel-gate-pass-7ogt.onrender.com/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export function registerUser(formData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(formData)
  });
}

export function loginUser(formData) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(formData)
  });
}

export function getAuthToken() {
  return localStorage.getItem("token");
}

export function getLoggedInUser() {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  return JSON.parse(user);
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getAuditLogs() {
  const token = getAuthToken();

  return apiRequest("/audit-logs", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function getMyStudentProfile() {
  const token = getAuthToken();

  return apiRequest("/student-profiles/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}



export function createGatePassRequest(formData) {
  const token = getAuthToken();

  return apiRequest("/gate-passes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });
}

export function getMyGatePassRequests() {
  const token = getAuthToken();

  return apiRequest("/gate-passes/my", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function getAllGatePassRequests() {
  const token = getAuthToken();

  return apiRequest("/gate-passes", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function wardenApproveGatePass(requestId, wardenRemark) {
  const token = getAuthToken();

  return apiRequest(`/gate-passes/${requestId}/warden-approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ wardenRemark })
  });
}

export function rejectGatePassRequest(requestId, rejectReason) {
  const token = getAuthToken();

  return apiRequest(`/gate-passes/${requestId}/reject`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ rejectReason })
  });
}

export function verifyQrToken(qrToken) {
  const token = getAuthToken();

  return apiRequest(`/gate-passes/verify-qr/${qrToken}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function markStudentExit(qrToken) {
  const token = getAuthToken();

  return apiRequest(`/gate-passes/verify-qr/${qrToken}/exit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function markStudentReturn(qrToken) {
  const token = getAuthToken();

  return apiRequest(`/gate-passes/verify-qr/${qrToken}/return`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function getDashboardReport() {
  const token = getAuthToken();

  return apiRequest("/reports/dashboard", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function verifyParentOtp(requestId, otp) {
  return apiRequest(`/gate-passes/${requestId}/verify-parent-otp`, {
    method: "POST",
    body: JSON.stringify({ otp })
  });
}

export function parentApproveGatePass(requestId) {
  return apiRequest(`/gate-passes/${requestId}/parent-approve`, {
    method: "POST"
  });
}

export function sendParentOtp(requestId) {
  const token = getAuthToken();

  return apiRequest(`/gate-passes/${requestId}/send-parent-otp`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function getParentApprovalRequest(parentToken) {
  return apiRequest(`/gate-passes/parent/${parentToken}`);
}

export function verifyParentOtpByToken(parentToken, otp) {
  return apiRequest(`/gate-passes/parent/${parentToken}/verify-otp`, {
    method: "POST",
    body: JSON.stringify({ otp })
  });
}

export function parentApproveByToken(parentToken) {
  return apiRequest(`/gate-passes/parent/${parentToken}/approve`, {
    method: "POST"
  });
}

export function parentRejectByToken(parentToken, rejectReason) {
  return apiRequest(`/gate-passes/parent/${parentToken}/reject`, {
    method: "POST",
    body: JSON.stringify({ rejectReason })
  });
}

export function getAllStudentProfiles() {
  const token = getAuthToken();

  return apiRequest("/student-profiles", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function createStudentProfile(formData) {
  const token = getAuthToken();

  return apiRequest("/student-profiles", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });
}

export function updateStudentProfile(profileId, formData) {
  const token = getAuthToken();

  return apiRequest(`/student-profiles/${profileId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });
}

export async function askAssistant(question) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ question })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Assistant failed");
  }

  return data;
}