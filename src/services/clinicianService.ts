const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-mshm-backend.onrender.com/api/v1';

export const clinicianAPI = {
  // CL1 - Login & Registration
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

  register: async (credentials: { 
    full_name: string; 
    email: string; 
    password: string; 
    confirm_password: string; 
    role: string 
  }) => {
    const res = await fetch(`${BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...credentials, role: 'clinician' }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  verifyEmail: async (token: string) => {
    const res = await fetch(`${BASE_URL}/auth/verify-email/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  resendVerification: async (email: string) => {
    const res = await fetch(`${BASE_URL}/auth/resend-verification/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
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

  // CL2 - My Patients Dashboard
  getMyPatients: async (filters?: { tier?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.tier) params.append('tier', filters.tier);
    if (filters?.status) params.append('status', filters.status);
    
    const res = await fetch(`${BASE_URL}/clinician/my-patients/?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // CL3 - Patient Detail
  getPatient: async (patientId: string) => {
    const res = await fetch(`${BASE_URL}/clinician/patient/${patientId}/`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  saveTreatmentPlan: async (patientId: string, plan: any) => {
    const res = await fetch(`${BASE_URL}/clinician/treatment-plan/${patientId}/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(plan),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  updateTreatmentPlanStatus: async (planId: string, status: string) => {
    const res = await fetch(`${BASE_URL}/clinician/treatment-plan/${planId}/status/`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  generatePatientLetter: async (patientId: string) => {
    const res = await fetch(`${BASE_URL}/clinician/patient-letter/${patientId}/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // CL4 - Treatment Plan Builder
  createTreatmentPlan: async (plan: any) => {
    const res = await fetch(`${BASE_URL}/clinician/treatment-plan/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(plan),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // CL5 - Prescriptions
  addPrescription: async (prescription: any) => {
    const res = await fetch(`${BASE_URL}/clinician/prescription/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(prescription),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  updatePrescription: async (prescriptionId: string, updates: any) => {
    const res = await fetch(`${BASE_URL}/clinician/prescription/${prescriptionId}/`, {
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

  generatePrescriptionLetter: async (patientId: string) => {
    const res = await fetch(`${BASE_URL}/clinician/prescription-letter/${patientId}/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // CL6 - Communication
  sendMessage: async (patientId: string, message: any) => {
    const res = await fetch(`${BASE_URL}/clinician/message/${patientId}/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(message),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  bookAppointment: async (patientId: string, appointment: any) => {
    const res = await fetch(`${BASE_URL}/clinician/appointment/${patientId}/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(appointment),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  generateClinicalLetter: async (patientId: string, letter: any) => {
    const res = await fetch(`${BASE_URL}/clinician/letter/${patientId}/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(letter),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // CL7 - Analytics
  getAnalytics: async (range: string = '30d') => {
    const res = await fetch(`${BASE_URL}/clinician/analytics/?range=${range}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  // CL8 - Profile & Settings
  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/clinician/profile/`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  updateNotificationPreferences: async (preferences: any) => {
    const res = await fetch(`${BASE_URL}/clinician/notification-preferences/`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(preferences),
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

  // Timeline & Reports (Screens 36-37)
  getPatientTimeline: async (patientId: string, filters?: { range?: string; type?: string }) => {
    const params = new URLSearchParams();
    if (filters?.range) params.append('range', filters.range);
    if (filters?.type) params.append('type', filters.type);
    
    const res = await fetch(`${BASE_URL}/clinician/patient/${patientId}/timeline/?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  exportTimeline: async (patientId: string, format: string = 'csv') => {
    const res = await fetch(`${BASE_URL}/clinician/patient/${patientId}/timeline/export/?format=${format}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  generateReport: async (patientId: string, view: string = 'clinician') => {
    const res = await fetch(`${BASE_URL}/reports/generate/?patient_id=${patientId}&view=${view}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },

  getReport: async (reportId: string, view: string = 'clinician') => {
    const res = await fetch(`${BASE_URL}/reports/${reportId}/?view=${view}`, {
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
