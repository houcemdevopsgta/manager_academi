import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { API } from '@/App';
import { BookOpen, Plus, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';

const Courses = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department_id: '',
    credits: 3,
    semester: 1,
    description: '',
    teacher_id: '',
    max_students: 50
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, deptsRes, teachersRes] = await Promise.all([
        axios.get(`${API}/courses`),
        axios.get(`${API}/departments`),
        axios.get(`${API}/teachers`)
      ]);
      
      setCourses(coursesRes.data);
      setDepartments(deptsRes.data);
      setTeachers(teachersRes.data);
      
      // Get student info if user is student
      if (user.role === 'student') {
        const studentsRes = await axios.get(`${API}/students`);
        const myStudent = studentsRes.data.find(s => s.user_id === user.id);
        setStudent(myStudent);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/courses`, formData);
      toast.success('Cours créé avec succès!');
      setDialogOpen(false);
      setFormData({
        name: '',
        code: '',
        department_id: '',
        credits: 3,
        semester: 1,
        description: '',
        teacher_id: '',
        max_students: 50
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    }
  };

  const handleEnroll = async () => {
    if (!student || !selectedCourse) return;
    
    try {
      await axios.post(`${API}/enrollments`, {
        student_id: student.id,
        course_id: selectedCourse.id
      });
      toast.success('Inscription au cours envoyée!');
      setEnrollDialogOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'inscription");
    }
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || 'N/A';
  };

  const getTeacherInfo = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.employee_number || 'Non assigné';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="courses-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Cours
          </h1>
          <p className="text-base text-gray-600">Catalogue des cours disponibles</p>
        </div>
        {(user.role === 'admin' || user.role === 'teacher') && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600" data-testid="add-course-button">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" data-testid="course-dialog">
              <DialogHeader>
                <DialogTitle>Nouveau Cours</DialogTitle>
                <DialogDescription>Créer un nouveau cours</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="course-form">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du cours</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="course-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                      data-testid="course-code-input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Département</Label>
                    <Select
                      value={formData.department_id}
                      onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                      data-testid="course-department-select"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher">Enseignant</Label>
                    <Select
                      value={formData.teacher_id}
                      onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                      data-testid="course-teacher-select"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            Enseignant #{teacher.employee_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credits">Crédits</Label>
                    <Input
                      id="credits"
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                      required
                      data-testid="course-credits-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semestre</Label>
                    <Input
                      id="semester"
                      type="number"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                      required
                      data-testid="course-semester-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_students">Cap. max</Label>
                    <Input
                      id="max_students"
                      type="number"
                      value={formData.max_students}
                      onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                      required
                      data-testid="course-maxstudents-input"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    data-testid="course-description-input"
                  />
                </div>
                
                <Button type="submit" className="w-full" data-testid="submit-course-button">
                  Créer le cours
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="border-0 shadow-lg card-hover" data-testid="course-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription className="font-mono text-sm">{course.code}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{course.description || 'Aucune description'}</p>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Département:</span>
                  <p className="font-medium text-xs">{getDepartmentName(course.department_id)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Enseignant:</span>
                  <p className="font-medium text-xs">{getTeacherInfo(course.teacher_id)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex space-x-2">
                  <Badge variant="secondary">{course.credits} crédits</Badge>
                  <Badge variant="outline">S{course.semester}</Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <UsersIcon className="w-4 h-4 mr-1" />
                  {course.max_students}
                </div>
              </div>
              
              {user.role === 'student' && student && (
                <Button
                  className="w-full mt-2"
                  size="sm"
                  onClick={() => {
                    setSelectedCourse(course);
                    setEnrollDialogOpen(true);
                  }}
                  data-testid="enroll-course-button"
                >
                  S'inscrire
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enroll Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent data-testid="enroll-dialog">
          <DialogHeader>
            <DialogTitle>Inscription au cours</DialogTitle>
            <DialogDescription>
              Confirmer l'inscription au cours: {selectedCourse?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Votre demande d'inscription sera soumise pour approbation.
            </p>
            <div className="flex space-x-2">
              <Button onClick={handleEnroll} className="flex-1" data-testid="confirm-enroll-button">
                Confirmer
              </Button>
              <Button variant="outline" onClick={() => setEnrollDialogOpen(false)} className="flex-1">
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Courses;
