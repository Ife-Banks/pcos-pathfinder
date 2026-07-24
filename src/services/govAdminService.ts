// Gov Admin Portal — govAdminService.ts
import apiClient from '@/services/apiClient';

export interface GovFacility {
  id: string;
  code: string;
  name: string;
  tier: string;
  address: string;
  phone: string;
  email: string;
  state: string;
  lga: string;
  zone: string;
  status: string;
  facility_type: string;
  admin_user: string;
  admin_email: string;
  admin_user_id: string | null;
  created_at: string;
}

export interface GovFacilityListResponse {
  results: GovFacility[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GovAdminAccount {
  id: string;
  email: string;
  full_name: string;
  role: string;
  scope: string;
  state_name: string | null;
  lga_name: string | null;
  facility_name: string | null;
  created_by_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface GovAdminListResponse {
  results: GovAdminAccount[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ⚠️ TODO: wire up when LGA staff endpoint is added to backend
export interface GovStaffMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  facility_name: string;
  facility_id: string;
  facility_code: string;
  employee_id: string;
  is_active: boolean;
  date_joined: string;
}

export const govAdminAPI = {
  // ── Auth ────────────────────────────────────────────────────────────────────

  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login/', credentials);
    return res.data;
  },

  logout: async () => {
    const refresh = localStorage.getItem('refresh_token');
    const res = await apiClient.post('/auth/logout/', { refresh });
    return res.data;
  },

  // ── Facilities (scoped to admin level) ─────────────────────────────────────

  getGovFacilities: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    tier?: string;
  }): Promise<{ data: GovFacilityListResponse }> => {
    const res = await apiClient.get('/centers/admin/hierarchy/facilities/list/', {
      params,
    });
    return res.data;
  },

  createGovFacility: async (data: {
    name: string;
    code: string;
    state: string;
    lga: string;
    tier?: string;
    address?: string;
    phone?: string;
    email?: string;
  }): Promise<{ data: GovFacility }> => {
    const res = await apiClient.post('/centers/admin/hierarchy/facilities/', data);
    return res.data;
  },

  getGovFacilityDetail: async (facilityId: string): Promise<{ data: GovFacility }> => {
    const res = await apiClient.get(`/centers/admin/hierarchy/facilities/${facilityId}/`);
    return res.data;
  },

  updateGovFacility: async (
    facilityId: string,
    data: Record<string, unknown>
  ): Promise<{ data: GovFacility }> => {
    const res = await apiClient.patch(
      `/centers/admin/hierarchy/facilities/${facilityId}/`,
      data
    );
    return res.data;
  },

  deleteGovFacility: async (facilityId: string): Promise<void> => {
    await apiClient.delete(`/centers/admin/hierarchy/facilities/${facilityId}/`);
  },

  // ── Admin Management ────────────────────────────────────────────────────────

  getGovAdmins: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<{ data: GovAdminListResponse }> => {
    const res = await apiClient.get('/centers/admin/hierarchy/admins/list/', { params });
    return res.data;
  },

  createGovAdmin: async (data: {
    full_name: string;
    email: string;
    role: 'facility_admin' | 'sth_admin' | 'stth_admin';
    state_id: string;
    lga_id: string;
    facility_id?: string;
  }): Promise<{ data: GovAdminAccount & { temp_password?: string } }> => {
    const res = await apiClient.post('/centers/admin/hierarchy/admins/', data);
    return res.data;
  },

  deactivateGovAdmin: async (
    adminId: string,
    isActive: boolean
  ): Promise<{ data: GovAdminAccount }> => {
    const res = await apiClient.patch(`/centers/admin/hierarchy/admins/${adminId}/`, {
      is_active: isActive,
    });
    return res.data;
  },

  deleteGovAdmin: async (adminId: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/centers/admin/hierarchy/admins/${adminId}/`);
    return res.data;
  },

  // ── Staff ───────────────────────────────────────────────────────────────────

  getGovStaff: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    facility_id?: string;
    role?: string;
  }): Promise<{ data: { results: GovStaffMember[]; count: number } }> => {
    const res = await apiClient.get('/centers/admin/hierarchy/staff/', { params });
    return res.data;
  },
};
