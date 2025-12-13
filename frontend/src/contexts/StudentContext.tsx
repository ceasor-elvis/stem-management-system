import React, { createContext, useContext, useState, useCallback } from 'react';
import { Student, CheckInData } from '@/types';
import { studentsApi, uploadApi } from '@/services/api';

interface StudentContextType {
  students: Student[];
  loading: boolean;
  error: string | null;
  fetchStudents: (params?: { search?: string; status?: string }) => Promise<void>;
  addStudent: (data: CheckInData) => Promise<Student>;
  checkOutStudent: (studentId: string) => Promise<boolean>;
  getStudentByStudentId: (studentId: string) => Promise<Student | undefined>;
  getStudentByRecordId: (recordId: string) => Promise<Student | undefined>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

// Set to true to use mock data (for development without backend)
const USE_MOCK_DATA = false;

// Mock initial data (only used when USE_MOCK_DATA is true)
const initialStudents: Student[] = [
  {
    id: '1',
    studentId: 'STU001',
    name: 'Alex Johnson',
    className: 'Robotics 101',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    devicePhotos: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=200&h=200&fit=crop'
    ],
    deviceDescription: 'Silver MacBook Pro 14"',
    checkInTime: '2024-01-15T09:00:00',
    status: 'checked-in',
    recordId: 'REC001'
  },
  {
    id: '2',
    studentId: 'STU002',
    name: 'Sarah Chen',
    className: 'Python Programming',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    devicePhotos: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop'
    ],
    deviceDescription: 'Black Dell XPS 15',
    checkInTime: '2024-01-15T09:15:00',
    checkOutTime: '2024-01-15T16:30:00',
    status: 'checked-out',
    recordId: 'REC002'
  },
  {
    id: '3',
    studentId: 'STU003',
    name: 'Marcus Williams',
    className: 'AI Fundamentals',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    devicePhotos: [
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop'
    ],
    deviceDescription: 'HP Spectre x360 with blue case',
    checkInTime: '2024-01-15T08:45:00',
    status: 'checked-in',
    recordId: 'REC003'
  }
];

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>(USE_MOCK_DATA ? initialStudents : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecordId = () => {
    return `REC${String(Date.now()).slice(-6)}`;
  };

  const fetchStudents = useCallback(async (params?: { search?: string; status?: string }) => {
    if (USE_MOCK_DATA) {
      // Filter mock data
      let filtered = [...initialStudents];
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(search) ||
          s.studentId.toLowerCase().includes(search)
        );
      }
      if (params?.status && params.status !== 'all') {
        filtered = filtered.filter(s => s.status === params.status);
      }
      setStudents(filtered);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await studentsApi.getAll(params);
      setStudents(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, []);

  const addStudent = useCallback(async (data: CheckInData): Promise<Student> => {
    if (USE_MOCK_DATA) {
      const newStudent: Student = {
        id: String(Date.now()),
        studentId: data.studentId,
        name: data.studentName,
        className: data.className,
        photo: data.studentPhoto,
        devicePhotos: data.devicePhotos,
        deviceDescription: data.deviceDescription,
        checkInTime: new Date().toISOString(),
        status: 'checked-in',
        recordId: generateRecordId()
      };
      setStudents(prev => [...prev, newStudent]);
      return newStudent;
    }

    setLoading(true);
    setError(null);
    try {
      // Upload photos first if they're base64
      let studentPhotoUrl = data.studentPhoto;
      let devicePhotoUrls = [...data.devicePhotos];

      if (data.studentPhoto.startsWith('data:')) {
        const blob = uploadApi.base64ToBlob(data.studentPhoto);
        studentPhotoUrl = await uploadApi.uploadPhoto(blob, 'student');
      }

      devicePhotoUrls = await Promise.all(
        data.devicePhotos.map(async (photo) => {
          if (photo.startsWith('data:')) {
            const blob = uploadApi.base64ToBlob(photo);
            return uploadApi.uploadPhoto(blob, 'device');
          }
          return photo;
        })
      );

      const newStudent = await studentsApi.checkIn({
        studentId: data.studentId,
        studentName: data.studentName,
        className: data.className,
        studentPhoto: studentPhotoUrl,
        devicePhotos: devicePhotoUrls,
        deviceDescription: data.deviceDescription,
      });

      setStudents(prev => [...prev, newStudent]);
      return newStudent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in student');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkOutStudent = useCallback(async (studentId: string): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      let found = false;
      setStudents(prev => prev.map(student => {
        if (student.studentId === studentId && student.status === 'checked-in') {
          found = true;
          return {
            ...student,
            checkOutTime: new Date().toISOString(),
            status: 'checked-out' as const
          };
        }
        return student;
      }));
      return found;
    }

    setLoading(true);
    setError(null);
    try {
      const updated = await studentsApi.checkOut(studentId);
      setStudents(prev => prev.map(s => s.studentId === studentId ? updated : s));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check out student');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStudentByStudentId = useCallback(async (studentId: string): Promise<Student | undefined> => {
    if (USE_MOCK_DATA) {
      return students.find(s => s.studentId === studentId);
    }

    try {
      return await studentsApi.getByStudentId(studentId);
    } catch {
      return undefined;
    }
  }, [students]);

  const getStudentByRecordId = useCallback(async (recordId: string): Promise<Student | undefined> => {
    if (USE_MOCK_DATA) {
      return students.find(s => s.recordId === recordId);
    }

    try {
      return await studentsApi.getByRecordId(recordId);
    } catch {
      return undefined;
    }
  }, [students]);

  return (
    <StudentContext.Provider value={{ 
      students,
      loading,
      error,
      fetchStudents,
      addStudent, 
      checkOutStudent, 
      getStudentByStudentId,
      getStudentByRecordId 
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
}
