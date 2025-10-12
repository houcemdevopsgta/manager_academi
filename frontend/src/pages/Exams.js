import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { API } from '@/App';
import { Calendar as CalendarIcon, Plus, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Exams = ({ user }) => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    course_id: '',
    name: '',
    exam_date: '',
    start_time: '',
    duration_minutes: 120,
    room: '',
    max_score: 100
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, coursesRes] = await Promise.all([
        axios.get(`${API}/exams`),
        axios.get(`${API}/courses`)
      ]);
      
      setExams(examsRes.data);
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
      await axios.post(`${API}/exams`, formData);
      toast.success('Examen créé avec succès!');
      setDialogOpen(false);
      setFormData({
        course_id: '',
        name: '',
        exam_date: '',
        start_time: '',
        duration_minutes: 120,
        room: '',
        max_score: 100
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course?.name || 'N/A';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="exams-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Examens
          </h1>
          <p className="text-base text-gray-600">Planning des examens</p>
        </div>
        {(user.role === 'admin' || user.role === 'teacher') && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600" data-testid="add-exam-button">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" data-testid="exam-dialog">
              <DialogHeader>
                <DialogTitle>Nouvel Examen</DialogTitle>
                <DialogDescription>Planifier un nouvel examen</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="exam-form">
                <div className="space-y-2">
                  <Label htmlFor="course">Cours</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                    data-testid="exam-course-select"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un cours" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'examen</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Examen Final, Partiel, QCM..."
                    required
                    data-testid="exam-name-input"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exam_date">Date</Label>
                    <Input
                      id="exam_date"
                      type="date"
                      value={formData.exam_date}
                      onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                      required
                      data-testid="exam-date-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Heure de début</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                      data-testid="exam-time-input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      required
                      data-testid="exam-duration-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room">Salle</Label>
                    <Input
                      id="room"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      placeholder="A101"
                      required
                      data-testid="exam-room-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_score">Note max</Label>
                    <Input
                      id="max_score"
                      type="number"
                      value={formData.max_score}
                      onChange={(e) => setFormData({ ...formData, max_score: parseFloat(e.target.value) })}
                      required
                      data-testid="exam-maxscore-input"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" data-testid="submit-exam-button">
                  Créer l'examen
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exams.map((exam) => (
          <Card key={exam.id} className="border-0 shadow-lg card-hover" data-testid="exam-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{exam.name}</CardTitle>
                  <CardDescription className="text-sm">{getCourseName(exam.course_id)}</CardDescription>
                </div>
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500 text-xs">Date</p>
                    <p className="font-medium">{exam.exam_date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500 text-xs">Heure</p>
                    <p className="font-medium">{exam.start_time}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500 text-xs">Salle</p>
                    <p className="font-medium">{exam.room}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500 text-xs">Durée</p>
                  <p className="font-medium">{exam.duration_minutes} min</p>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-500">Note maximale: <span className="font-bold text-gray-900">{exam.max_score}</span></p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {exams.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun examen planifié</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Exams;
