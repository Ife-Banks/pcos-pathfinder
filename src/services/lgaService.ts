import apiClient from '@/services/apiClient';

export const lgaAPI = {
  listStates: async (countryId?: string) => {
    const params = countryId ? { country: countryId } : {};
    const res = await apiClient.get('/centers/states/', { params });
    return res.data;
  },

  listLgas: async () => {
    const res = await apiClient.get('/centers/lga/');
    return res.data;
  },

  getLga: async (id: string) => {
    const res = await apiClient.get(`/centers/lga/${id}/`);
    return res.data;
  },

  createCustomLga: async (data: { name: string; state_id: string; is_lcda?: boolean }) => {
    const res = await apiClient.post('/centers/lga/custom/', data);
    return res.data;
  },

  createFacilityDirect: async (data: {
    facility_type: string;
    name: string;
    code: string;
    state_id: string;
    lga_id?: string;
    lga_custom_name?: string;
    address?: string;
    phone?: string;
    email?: string;
    admin_full_name: string;
    admin_email: string;
  }) => {
    const res = await apiClient.post('/centers/admin/facilities/create/', data);
    return res.data;
  },

  createLgaAccount: async (data: {
    full_name: string;
    email: string;
    lga_id: string;
    state_id: string;
  }) => {
    const res = await apiClient.post('/centers/lga/accounts/', data);
    return res.data;
  },

  listLgaAccounts: async (params?: { search?: string; lga?: string }) => {
    const res = await apiClient.get('/centers/lga/accounts/', { params });
    return res.data;
  },

  getLgaDashboard: async () => {
    const res = await apiClient.get('/centers/lga/dashboard/');
    return res.data;
  },

  uploadFacilitiesCsv: async (formData: FormData) => {
    const res = await apiClient.post('/centers/admin/facilities/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  createPhc: async (data: {
    name: string;
    code: string;
    address: string;
    phone: string;
    email?: string;
    admin_full_name: string;
    admin_email: string;
    latitude?: number;
    longitude?: number;
  }) => {
    const res = await apiClient.post('/centers/lga/phcs/', data);
    return res.data;
  },

  listPhcs: async () => {
    const res = await apiClient.get('/centers/lga/phcs/list/');
    return res.data;
  },
};