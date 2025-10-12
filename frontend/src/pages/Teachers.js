import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { API } from '@/App';
import { Users } from 'lucide-react';
import { toast } from 'sonner';

const Teachers = ({ user }) => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachersRes, deptsRes] = await Promise.all([
        axios.get(`${API}/teachers`),
        axios.get(`${API}/departments`)
      ]);
      
      setTeachers(teachersRes.data);
      
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="teachers-page">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Enseignants
        </h1>
        <p className="text-base text-gray-600">Liste des enseignants de l'institut</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="border-0 shadow-lg card-hover" data-testid="teacher-card">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {teacher.employee_number.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">Enseignant #{teacher.employee_number}</CardTitle>
                  <p className="text-sm text-gray-500">{departments[teacher.department_id]?.name || 'N/A'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {teacher.specialization && (
                <div>
                  <span className="text-sm text-gray-500">Spécialisation:</span>
                  <p className="font-medium text-sm">{teacher.specialization}</p>
                </div>
              )}
              
              {teacher.qualification && (
                <div>
                  <span className="text-sm text-gray-500">Qualification:</span>
                  <Badge variant="secondary" className="mt-1">{teacher.qualification}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {teachers.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun enseignant trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Teachers;
