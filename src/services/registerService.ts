import apiClient from './apiClient';

export interface RegisterPatientData {
  full_name: string;
  email?: string;
  phone?: string;
  age?: number;
  condition?: string;
  severity?: string;
  notes?: string;
}

export interface RegisterPatientResponse {
  patient_id: string;
  patient_email: string;
  patient_name: string;
  facility_name: string;
  facility_type: string;
  temp_password: string;
  phone: string;
}

export const registerAPI = {
  // Register patient at any facility
  registerPatient: async (
    facility: string, 
    data: RegisterPatientData
  ): Promise<{ data: RegisterPatientResponse }> => {
    const res = await apiClient.post(`/centers/${facility}/walk-in/`, data);
    return res.data;
  },

  // For HMO - Enroll new member
  enrollMember: async (data: {
    full_name: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    plan_type?: string;
  }): Promise<{ data: RegisterPatientResponse }> => {
    const res = await apiClient.post('/centers/hmo/enroll/', data);
    return res.data;
  },
};

export default registerAPI;