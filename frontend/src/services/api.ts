// Base API configuration - Update this to your Django backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper to get auth token from localStorage
const getAuthToken = () => localStorage.getItem('auth_token');

// Generic fetch wrapper with auth headers
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.detail || 'Request failed');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
      '/auth/login/',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  logout: () =>
    apiFetch<void>('/auth/logout/', { method: 'POST' }),

  getCurrentUser: () =>
    apiFetch<{ id: string; email: string; name: string; role: string }>('/auth/me/'),
};

// Students API
export const studentsApi = {
  getAll: (params?: { search?: string; status?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    const query = searchParams.toString();
    return apiFetch<{ results: Student[]; count: number }>(
      `/students/${query ? `?${query}` : ''}`
    );
  },

  getById: (id: string) =>
    apiFetch<Student>(`/students/${id}/`),

  getByStudentId: (studentId: string) =>
    apiFetch<Student>(`/students/by-student-id/${studentId}/`),

  getByRecordId: (recordId: string) =>
    apiFetch<Student>(`/students/by-record-id/${recordId}/`),

  checkIn: (data: CheckInFormData) =>
    apiFetch<Student>('/students/checkin/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  checkOut: (studentId: string) =>
    apiFetch<Student>(`/students/${studentId}/checkout/`, {
      method: 'POST',
    }),
};

// File upload helper (for photos)
export const uploadApi = {
  uploadPhoto: async (file: File | Blob, type: 'student' | 'device'): Promise<string> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/upload/`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  },

  // Convert base64 to blob for upload
  base64ToBlob: (base64: string): Blob => {
    const parts = base64.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(parts[1]);
    const arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      arr[i] = bstr.charCodeAt(i);
    }
    return new Blob([arr], { type: mime });
  },
};

// Types for API
interface Student {
  id: string;
  studentId: string;
  name: string;
  className: string;
  photo: string;
  devicePhotos: string[];
  deviceDescription: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'checked-in' | 'checked-out';
  recordId: string;
}

interface CheckInFormData {
  studentId: string;
  studentName: string;
  className: string;
  studentPhoto: string;
  devicePhotos: string[];
  deviceDescription: string;
}

export type { Student, CheckInFormData };
