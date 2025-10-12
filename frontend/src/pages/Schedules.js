import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { API } from '@/App';
import { Clock, Plus, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Schedules = ({ user }) => {
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    course_id: '',
    day_of_week: 1,
    start_time: '',
    end_time: '',
    room: ''
  });

  const daysOfWeek = [
    { value: 0, label: 'Lundi' },
    { value: 1, label: 'Mardi' },
    { value: 2, label: 'Mercredi' },
    { value: 3, label: 'Jeudi' },
    { value: 4, label: 'Vendredi' },
    { value: 5, label: 'Samedi' },
    { value: 6, label: 'Dimanche' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesRes, coursesRes] = await Promise.all([
        axios.get(`${API}/schedules`),
        axios.get(`${API}/courses`)
      ]);
      
      setSchedules(schedulesRes.data);
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
      await axios.post(`${API}/schedules`, formData);
      toast.success('Horaire ajouté avec succès!');
      setDialogOpen(false);
      setFormData({
        course_id: '',
        day_of_week: 1,
        start_time: '',
        end_time: '',
        room: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'ajout");
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course?.name || 'N/A';
  };

  const getCourseCode = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course?.code || '';
  };

  const getDayLabel = (dayIndex) => {
    return daysOfWeek[dayIndex]?.label || 'N/A';
  };

  const groupByDay = () => {
    const grouped = {};
    daysOfWeek.forEach(day => {
      grouped[day.value] = schedules.filter(s => s.day_of_week === day.value);
    });
    return grouped;
  };

  const getDayColor = (dayIndex) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-yellow-500 to-orange-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500'
    ];
    return colors[dayIndex] || colors[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const groupedSchedules = groupByDay();

  return (
    <div className="space-y-6 animate-fade-in" data-testid="schedules-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Emploi du Temps
          </h1>
          <p className="text-base text-gray-600">Planning hebdomadaire des cours</p>
        </div>
        {user.role === 'admin' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600" data-testid="add-schedule-button">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="schedule-dialog">
              <DialogHeader>
                <DialogTitle>Nouvel Horaire</DialogTitle>
                <DialogDescription>Ajouter un horaire au planning</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="schedule-form">
                <div className="space-y-2">
                  <Label htmlFor="course">Cours</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                    data-testid="schedule-course-select"
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
                  <Label htmlFor="day">Jour de la semaine</Label>
                  <Select
                    value={formData.day_of_week.toString()}
                    onValueChange={(value) => setFormData({ ...formData, day_of_week: parseInt(value) })}
                    data-testid="schedule-day-select"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()}>{day.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Heure de début</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                      data-testid="schedule-starttime-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Heure de fin</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                      data-testid="schedule-endtime-input"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="room">Salle</Label>
                  <Input
                    id="room"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="A101"
                    required
                    data-testid="schedule-room-input"
                  />
                </div>
                
                <Button type="submit" className="w-full" data-testid="submit-schedule-button">
                  Ajouter l'horaire
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Weekly Schedule View */}
      <div className="space-y-4">
        {daysOfWeek.map((day) => {
          const daySchedules = groupedSchedules[day.value] || [];
          
          return (
            <Card key={day.value} className="border-0 shadow-lg" data-testid="day-schedule-card">
              <CardHeader className={`bg-gradient-to-r ${getDayColor(day.value)} text-white`}>
                <CardTitle className="text-xl">{day.label}</CardTitle>
                <CardDescription className="text-white/80">
                  {daySchedules.length} cours programmé(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {daySchedules.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Aucun cours ce jour</p>
                ) : (
                  <div className="space-y-3">
                    {daySchedules
                      .sort((a, b) => a.start_time.localeCompare(b.start_time))
                      .map((schedule) => (
                        <div
                          key={schedule.id}
                          className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-md transition-shadow"
                          data-testid="schedule-item"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {getCourseName(schedule.course_id)}
                              </h4>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {getCourseCode(schedule.course_id)}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end space-x-2 text-sm font-medium text-gray-700">
                                <Clock className="w-4 h-4" />
                                <span>{schedule.start_time} - {schedule.end_time}</span>
                              </div>
                              <div className="flex items-center justify-end space-x-2 text-sm text-gray-500 mt-1">
                                <MapPin className="w-4 h-4" />
                                <span>Salle {schedule.room}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {schedules.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun horaire programmé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Schedules;
