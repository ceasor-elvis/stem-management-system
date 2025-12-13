import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { StudentCard } from '@/components/cards/StudentCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/contexts/StudentContext';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  Users, 
  UserCheck, 
  UserMinus, 
  Search,
  Filter,
  LayoutGrid,
  List
} from 'lucide-react';

type ViewMode = 'cards' | 'table';
type FilterStatus = 'all' | 'checked-in' | 'checked-out';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { students, fetchStudents, loading, error } = useStudents();

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);
  
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not authenticated or not admin/staff
  if (!isAuthenticated || !user || !['admin', 'staff'].includes(user.role)) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in as Admin or Staff to access this page.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </Layout>
    );
  }

  const filteredStudents = students.filter(student => {
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchesSearch = student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.className.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: students.length,
    checkedIn: students.filter(s => s.status === 'checked-in').length,
    checkedOut: students.filter(s => s.status === 'checked-out').length
  };

  return (
    <Layout>
      <div className="container py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage student records and check-ins</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-2xl shadow-card p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-card rounded-2xl shadow-card p-4 text-center">
            <UserCheck className="h-6 w-6 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{stats.checkedIn}</p>
            <p className="text-xs text-muted-foreground">Checked In</p>
          </div>
          <div className="bg-card rounded-2xl shadow-card p-4 text-center">
            <UserMinus className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.checkedOut}</p>
            <p className="text-xs text-muted-foreground">Checked Out</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, ID, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
            </select>
            
            {/* View Toggle */}
            <div className="flex rounded-xl border border-input overflow-hidden">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2.5 ${viewMode === 'cards' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2.5 ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} records
          </p>
        </div>

        {/* Card View */}
        {viewMode === 'cards' && (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredStudents.map(student => (
              <StudentCard 
                key={student.studentId} 
                student={student}
                linkTo={`/record/${student.recordId}`}
              />
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium text-sm">Student</th>
                    <th className="text-left p-4 font-medium text-sm hidden md:table-cell">Class</th>
                    <th className="text-left p-4 font-medium text-sm hidden sm:table-cell">Check-In</th>
                    <th className="text-left p-4 font-medium text-sm hidden lg:table-cell">Check-Out</th>
                    <th className="text-left p-4 font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr 
                      key={student.studentId} 
                      className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => navigate(`/record/${student.recordId}`)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={student.studentPhoto} 
                            alt={student.studentName}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{student.studentName}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{student.className}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm">{student.className}</td>
                      <td className="p-4 hidden sm:table-cell text-sm">
                        {format(new Date(student.checkInTime), 'MMM d, h:mm a')}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm">
                        {student.checkOutTime 
                          ? format(new Date(student.checkOutTime), 'MMM d, h:mm a')
                          : '-'
                        }
                      </td>
                      <td className="p-4">
                        <StatusBadge status={student.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No students found matching your criteria</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
