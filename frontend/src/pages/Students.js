import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { API } from '@/App';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const Students = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState({});
  const [departments, setDepartments] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, usersRes, deptsRes] = await Promise.all([
        axios.get(`${API}/students`),
        axios.get(`${API}/auth/me`).then(async (res) => {
          // This is a workaround to get all users - in production, you'd have a proper endpoint
          return {};
        }),
        axios.get(`${API}/departments`)
      ]);
      
      setStudents(studentsRes.data);
      
      // Create department lookup
      const deptMap = {};
      deptsRes.data.forEach(dept => {
        deptMap[dept.id] = dept;
      });
      setDepartments(deptMap);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await axios.patch(`${API}/students/${studentId}/status?status=${newStatus}`);
      toast.success('Statut mis à jour!');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approuvé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredStudents = students.filter(student => {
    if (filter === 'all') return true;
    return student.enrollment_status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="students-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Étudiants
          </h1>
          <p className="text-base text-gray-600">Gérer les inscriptions des étudiants</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filtrer par statut:</span>
            <Select value={filter} onValueChange={setFilter} data-testid="student-filter">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvés</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="border-0 shadow-lg card-hover" data-testid="student-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      {student.student_number.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Étudiant #{student.student_number}</CardTitle>
                    <p className="text-sm text-gray-500">{departments[student.department_id]?.name || 'N/A'}</p>
                  </div>
                </div>
                {getStatusBadge(student.enrollment_status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Année:</span>
                  <p className="font-medium">{student.academic_year}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date de naissance:</span>
                  <p className="font-medium">{student.date_of_birth}</p>
                </div>
              </div>
              
              {student.address && (
                <div className="text-sm">
                  <span className="text-gray-500">Adresse:</span>
                  <p className="font-medium">{student.address}</p>
                </div>
              )}
              
              {user.role === 'admin' && student.enrollment_status === 'pending' && (
                <div className="flex space-x-2 pt-3 border-t">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => handleStatusChange(student.id, 'approved')}
                    data-testid="approve-student-button"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleStatusChange(student.id, 'rejected')}
                    data-testid="reject-student-button"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Rejeter
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun étudiant trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Students;
