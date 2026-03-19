const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-mshm-backend.onrender.com/api/v1';

export const fmcAPI = {
  // FMC1 - Authentication
  login: async (credentials: { email: string; password: string }) => {
    const res = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  verify2FA: async (code: string, accessToken: string) => {
    const res = await fetch(`${BASE_URL}/auth/2fa/verify/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  refreshToken: async (refreshToken: string) => {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getMe: async (accessToken: string) => {
    const res = await fetch(`${BASE_URL}/auth/me/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  changePassword: async (passwords: { old_password: string; new_password: string }) => {
    const res = await fetch(`${BASE_URL}/auth/me/change-password/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(passwords),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  logout: async (refreshToken: string, accessToken: string) => {
    const res = await fetch(`${BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // FMC2 - Case Queue
  getCases: async (filters?: {
    status?: string;
    condition?: string;
    severity?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.condition) params.append('condition', filters.condition);
    if (filters?.severity) params.append('severity', filters.severity);
    
    const res = await fetch(`${BASE_URL}/centers/fmc/cases/?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // FMC3 - Patient Detail
  getCase: async (caseId: string) => {
    const res = await fetch(`${BASE_URL}/centers/fmc/cases/${caseId}/`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  updateCase: async (caseId: string, updates: { status?: string; fmc_notes?: string }) => {
    const res = await fetch(`${BASE_URL}/centers/fmc/cases/${caseId}/`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  assignClinician: async (caseId: string, clinicianId: string) => {
    const res = await fetch(`${BASE_URL}/centers/fmc/cases/${caseId}/assign/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ clinician_id: clinicianId }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  dischargeCase: async (caseId: string, dischargeData: { closing_score: number; notes: string }) => {
    const res = await fetch(`${BASE_URL}/centers/fmc/cases/${caseId}/discharge/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(dischargeData),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // FMC4 - Clinician Management
  getClinicians: async () => {
    const res = await fetch(`${BASE_URL}/centers/fmc/clinicians/`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  createClinician: async (clinicianData: {
    full_name: string;
    email: string;
    specialization: string;
    license_number: string;
    years_of_experience: number;
    bio?: string;
  }) => {
    const res = await fetch(`${BASE_URL}/centers/fmc/clinicians/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(clinicianData),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  updateClinician: async (clinicianId: string, updates: {
    specialization?: string;
    years_of_experience?: number;
  }) => {
    const res = await fetch(`${BASE_URL}/centers/fmc/clinicians/${clinicianId}/`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  verifyClinician: async (clinicianId: string) => {
    const res = await fetch(`${BASE_URL}/centers/fmc/clinicians/${clinicianId}/verify/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // FMC5 - Diagnostics
  requestDiagnostics: async (request: {
    patient_id: string;
    tests: string[];
    urgency: 'routine' | 'urgent';
    custom_note?: string;
  }) => {
    const res = await fetch(`${BASE_URL}/fmc/request-diagnostics/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(request),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getDiagnosticsStatus: async (patientId: string) => {
    const res = await fetch(`${BASE_URL}/fmc/diagnostics-status/${patientId}/`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // FMC6 - Analytics
  getAnalytics: async (range: string = '30d', startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ range });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const res = await fetch(`${BASE_URL}/fmc/analytics/?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // FMC7 - Alerts
  getAlerts: async () => {
    const res = await fetch(`${BASE_URL}/fmc/alerts/`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  markAlertRead: async (alertId: string) => {
    const res = await fetch(`${BASE_URL}/fmc/alerts/${alertId}/`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ is_read: true }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // FMC8 - Discharge
  fullDischarge: async (patientId: string, dischargeData: {
    condition_confirmed: string;
    diagnostic_basis: string;
    treatment_summary: string;
    follow_up_plan: string;
    closing_score: number;
    discharge_letter: string;
  }) => {
    const res = await fetch(`${BASE_URL}/fmc/discharge/${patientId}/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(dischargeData),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // FMC9 - Settings & Management
  getFMCProfile: async () => {
    const res = await fetch(`${BASE_URL}/centers/fmc/profile/`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  updateFMCProfile: async (updates: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    notify_on_severe?: boolean;
    notify_on_very_severe?: boolean;
  }) => {
    const res = await fetch(`${BASE_URL}/centers/fmc/profile/`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // Staff Management (FMC Admin only)
  getStaff: async () => {
    const res = await fetch(`${BASE_URL}/centers/fmc/staff/`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  createStaff: async (staffData: {
    full_name: string;
    email: string;
    staff_role: string;
    employee_id?: string;
  }) => {
    const res = await fetch(`${BASE_URL}/centers/fmc/staff/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(staffData),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  updateStaff: async (staffId: string, updates: {
    staff_role?: string;
    employee_id?: string;
  }) => {
    const res = await fetch(`${BASE_URL}/centers/fmc/staff/${staffId}/`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  deactivateStaff: async (staffId: string) => {
    const res = await fetch(`${BASE_URL}/centers/fmc/staff/${staffId}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // Assignment
  autoAssign: async () => {
    const res = await fetch(`${BASE_URL}/fmc/auto-assign/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // Network
  getPHCs: async () => {
    const res = await fetch(`${BASE_URL}/centers/phc/`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // Reports
  generateReport: async (patientId: string, view: string = 'clinician') => {
    const res = await fetch(`${BASE_URL}/reports/generate/?patient_id=${patientId}&view=${view}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  exportFHIR: async (patientId: string) => {
    const res = await fetch(`${BASE_URL}/fhir/export/${patientId}/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
};
