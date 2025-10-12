import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';
import { API } from '@/App';
import { FileText, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const Grades = ({ user }) => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    exam_id: '',
    score: 0,
    max_score: 100,
    comments: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let gradesRes;
      
      if (user.role === 'student') {
        // Get student's own grades
        const studentsRes = await axios.get(`${API}/students`);
        const myStudent = studentsRes.data.find(s => s.user_id === user.id);
        if (myStudent) {
          gradesRes = await axios.get(`${API}/grades?student_id=${myStudent.id}`);
        } else {
          gradesRes = { data: [] };
        }
      } else {
        gradesRes = await axios.get(`${API}/grades`);
      }
      
      const [studentsRes, coursesRes, examsRes] = await Promise.all([
        axios.get(`${API}/students`),
        axios.get(`${API}/courses`),
        axios.get(`${API}/exams`)
      ]);
      
      setGrades(gradesRes.data);
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
      setExams(examsRes.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/grades`, formData);
      toast.success('Note ajoutée avec succès!');
      setDialogOpen(false);
      setFormData({
        student_id: '',
        course_id: '',
        exam_id: '',
        score: 0,
        max_score: 100,
        comments: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'ajout");
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

  const getExamName = (examId) => {
    if (!examId) return 'Contrôle continu';
    const exam = exams.find(e => e.id === examId);
    return exam?.name || 'N/A';
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500';
    if (percentage >= 60) return 'from-blue-500 to-cyan-500';
    if (percentage >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.percentage, 0);
    return (sum / grades.length).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="grades-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Notes
          </h1>
          <p className="text-base text-gray-600">Gestion et consultation des notes</p>
        </div>
        {(user.role === 'admin' || user.role === 'teacher') && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600" data-testid="add-grade-button">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" data-testid="grade-dialog">
              <DialogHeader>
                <DialogTitle>Nouvelle Note</DialogTitle>
                <DialogDescription>Enregistrer une nouvelle note</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="grade-form">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student">Étudiant</Label>
                    <Select
                      value={formData.student_id}
                      onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                      data-testid="grade-student-select"
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
                      data-testid="grade-course-select"
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exam">Examen (optionnel)</Label>
                  <Select
                    value={formData.exam_id}
                    onValueChange={(value) => setFormData({ ...formData, exam_id: value })}
                    data-testid="grade-exam-select"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Contrôle continu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Contrôle continu</SelectItem>
                      {exams.map(exam => (
                        <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="score">Note obtenue</Label>
                    <Input
                      id="score"
                      type="number"
                      step="0.1"
                      value={formData.score}
                      onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) })}
                      required
                      data-testid="grade-score-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_score">Note maximale</Label>
                    <Input
                      id="max_score"
                      type="number"
                      step="0.1"
                      value={formData.max_score}
                      onChange={(e) => setFormData({ ...formData, max_score: parseFloat(e.target.value) })}
                      required
                      data-testid="grade-maxscore-input"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comments">Commentaires</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    rows={3}
                    data-testid="grade-comments-input"
                  />
                </div>
                
                <Button type="submit" className="w-full" data-testid="submit-grade-button">
                  Enregistrer la note
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Average Card for Students */}
      {user.role === 'student' && grades.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white" data-testid="average-card">
          <CardHeader>
            <CardTitle className="text-white">Moyenne Générale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk' }}>
              {calculateAverage()}%
            </div>
            <p className="text-white/80">Basé sur {grades.length} note(s)</p>
          </CardContent>
        </Card>
      )}

      {/* Grades List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {grades.map((grade) => (
          <Card key={grade.id} className="border-0 shadow-lg card-hover" data-testid="grade-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{getCourseName(grade.course_id)}</CardTitle>
                  <CardDescription className="text-sm">
                    {user.role !== 'student' && `Étudiant #${getStudentNumber(grade.student_id)} - `}
                    {getExamName(grade.exam_id)}
                  </CardDescription>
                </div>
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk' }}>
                    {grade.score}/{grade.max_score}
                  </p>
                  <p className="text-sm text-gray-500">Note obtenue</p>
                </div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${getGradeColor(grade.percentage)} bg-clip-text text-transparent`}>
                  {grade.percentage.toFixed(1)}%
                </div>
              </div>
              
              <Progress value={grade.percentage} className="h-2" />
              
              {grade.comments && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">{grade.comments}</p>
                </div>
              )}
              
              <div className="text-xs text-gray-400 pt-2 border-t">
                Noté le {new Date(grade.graded_at).toLocaleDateString('fr-FR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {grades.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucune note disponible</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Grades;
