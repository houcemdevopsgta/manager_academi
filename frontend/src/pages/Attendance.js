import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { API } from '@/App';
import { ClipboardCheck, Plus, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Attendance = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let attendanceRes;
      
      if (user.role === 'student') {
        const studentsRes = await axios.get(`${API}/students`);
        const myStudent = studentsRes.data.find(s => s.user_id === user.id);
        if (myStudent) {
          attendanceRes = await axios.get(`${API}/attendance?student_id=${myStudent.id}`);
        } else {
          attendanceRes = { data: [] };
        }
      } else {
        attendanceRes = await axios.get(`${API}/attendance`);
      }
      
      const [studentsRes, coursesRes] = await Promise.all([
        axios.get(`${API}/students`),
        axios.get(`${API}/courses`)
      ]);
      
      setAttendance(attendanceRes.data);
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/attendance`, formData);
      toast.success('Présence enregistrée!');
      setDialogOpen(false);
      setFormData({
        student_id: '',
        course_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        notes: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'enregistrement");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Présent
          </Badge>
        );
      case 'absent':
        return (
          <Badge className="bg-red-500">
            <XCircle className="w-3 h-3 mr-1" />
            Absent
          </Badge>
        );
      case 'late':
        return (
          <Badge className="bg-yellow-500">
            <Clock className="w-3 h-3 mr-1" />
            Retard
          </Badge>
        );
      case 'excused':
        return (
          <Badge className="bg-blue-500">
            <AlertCircle className="w-3 h-3 mr-1" />
            Excusé
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStudentNumber = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student?.student_number || 'N/A';
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course?.name || 'N/A';
  };

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    return ((presentCount / attendance.length) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="attendance-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Présences
          </h1>
          <p className="text-base text-gray-600">Suivi des présences et absences</p>
        </div>
        {(user.role === 'admin' || user.role === 'teacher') && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600" data-testid="add-attendance-button">
                <Plus className="w-4 h-4 mr-2" />
                Marquer
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="attendance-dialog">
              <DialogHeader>
                <DialogTitle>Marquer la Présence</DialogTitle>
                <DialogDescription>Enregistrer la présence d'un étudiant</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="attendance-form">
                <div className="space-y-2">
                  <Label htmlFor="student">Étudiant</Label>
                  <Select
                    value={formData.student_id}
                    onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                    data-testid="attendance-student-select"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          Étudiant #{student.student_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="course">Cours</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                    data-testid="attendance-course-select"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    data-testid="attendance-date-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    data-testid="attendance-status-select"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Présent</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Retard</SelectItem>
                      <SelectItem value="excused">Excusé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Justificatif, remarques..."
                    data-testid="attendance-notes-input"
                  />
                </div>
                
                <Button type="submit" className="w-full" data-testid="submit-attendance-button">
                  Enregistrer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Attendance Rate for Students */}
      {user.role === 'student' && attendance.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white" data-testid="attendance-rate-card">
          <CardHeader>
            <CardTitle className="text-white">Taux de Présence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk' }}>
              {calculateAttendanceRate()}%
            </div>
            <p className="text-white/80">Basé sur {attendance.length} séance(s)</p>
          </CardContent>
        </Card>
      )}

      {/* Attendance Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attendance.map((record) => (
          <Card key={record.id} className="border-0 shadow-lg card-hover" data-testid="attendance-record">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{getCourseName(record.course_id)}</CardTitle>
                  {user.role !== 'student' && (
                    <CardDescription className="text-sm">
                      Étudiant #{getStudentNumber(record.student_id)}
                    </CardDescription>
                  )}
                </div>
                {getStatusBadge(record.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">Date:</span>
                <p className="font-medium">{new Date(record.date).toLocaleDateString('fr-FR')}</p>
              </div>
              
              {record.notes && (
                <div className="text-sm pt-2 border-t">
                  <span className="text-gray-500">Notes:</span>
                  <p className="text-gray-700">{record.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {attendance.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun enregistrement de présence</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Attendance;
