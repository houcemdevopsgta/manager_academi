import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { API } from '@/App';
import { Users as UsersIcon, UserPlus, Edit, Trash2, UserCheck, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const Users = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createProfileDialog, setCreateProfileDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileType, setProfileType] = useState('');
  const [profileData, setProfileData] = useState({
    student_number: '',
    employee_number: '',
    department_id: '',
    academic_year: new Date().getFullYear().toString(),
    date_of_birth: '',
    address: '',
    emergency_contact: '',
    specialization: '',
    qualification: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get all users from the backend - we need to implement this endpoint
      const usersRes = await axios.get(`${API}/users`);
      const studentsRes = await axios.get(`${API}/students`);
      const teachersRes = await axios.get(`${API}/teachers`);
      const deptsRes = await axios.get(`${API}/departments`);
      
      setUsers(usersRes.data);
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500';
      case 'teacher':
        return 'bg-blue-500';
      case 'student':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'teacher':
        return 'Enseignant';
      case 'student':
        return 'Étudiant';
      default:
        return role;
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const hasProfile = (userId, role) => {
    if (role === 'student') {
      return students.some(s => s.user_id === userId);
    } else if (role === 'teacher') {
      return teachers.some(t => t.user_id === userId);
    }
    return true; // Admin doesn't need profile
  };

  const handleCreateProfile = async (userId, role) => {
    setSelectedUser(users.find(u => u.id === userId));
    setProfileType(role);
    setCreateProfileDialog(true);
  };

  const submitProfile = async () => {
    try {
      if (profileType === 'student') {
        await axios.post(`${API}/students`, {
          user_id: selectedUser.id,
          student_number: profileData.student_number,
          department_id: profileData.department_id,
          academic_year: profileData.academic_year,
          date_of_birth: profileData.date_of_birth,
          address: profileData.address,
          emergency_contact: profileData.emergency_contact
        });
        toast.success('Profil étudiant créé avec succès!');
      } else if (profileType === 'teacher') {
        await axios.post(`${API}/teachers`, {
          user_id: selectedUser.id,
          employee_number: profileData.employee_number,
          department_id: profileData.department_id,
          specialization: profileData.specialization,
          qualification: profileData.qualification
        });
        toast.success('Profil enseignant créé avec succès!');
      }
      
      setCreateProfileDialog(false);
      setProfileData({
        student_number: '',
        employee_number: '',
        department_id: '',
        academic_year: new Date().getFullYear().toString(),
        date_of_birth: '',
        address: '',
        emergency_contact: '',
        specialization: '',
        qualification: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création du profil');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(`${API}/users/${userId}/status`, {
        is_active: !currentStatus
      });
      toast.success('Statut utilisateur mis à jour!');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
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
    <div className="space-y-6 animate-fade-in" data-testid="users-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Gestion des Utilisateurs
          </h1>
          <p className="text-base text-gray-600">Gérer tous les utilisateurs de la plateforme</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <UsersIcon className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Administrateurs</p>
                <p className="text-2xl font-bold text-red-600">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Enseignants</p>
                <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'teacher').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Étudiants</p>
                <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'student').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {users.map((u) => {
          const userHasProfile = hasProfile(u.id, u.role);
          
          return (
            <Card key={u.id} className="border-0 shadow-lg card-hover" data-testid="user-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={`${getRoleBadgeColor(u.role)} text-white font-semibold`}>
                        {getInitials(u.first_name, u.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {u.first_name} {u.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-500">{u.email}</p>
                      {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getRoleBadgeColor(u.role)}>
                      {getRoleLabel(u.role)}
                    </Badge>
                    {u.is_active ? (
                      <Badge className="bg-green-500">Actif</Badge>
                    ) : (
                      <Badge className="bg-gray-500">Inactif</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Profil complet:</span>
                  {userHasProfile ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Oui
                    </span>
                  ) : (
                    <span className="flex items-center text-orange-600">
                      <XCircle className="w-4 h-4 mr-1" />
                      Non
                    </span>
                  )}
                </div>

                {!userHasProfile && u.role !== 'admin' && (
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
                    onClick={() => handleCreateProfile(u.id, u.role)}
                    data-testid="create-profile-button"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer le profil {u.role === 'student' ? 'étudiant' : 'enseignant'}
                  </Button>
                )}

                <div className="flex space-x-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant={u.is_active ? "destructive" : "default"}
                    className="flex-1"
                    onClick={() => toggleUserStatus(u.id, u.is_active)}
                  >
                    {u.is_active ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Profile Dialog */}
      <Dialog open={createProfileDialog} onOpenChange={setCreateProfileDialog}>
        <DialogContent className="max-w-2xl" data-testid="create-profile-dialog">
          <DialogHeader>
            <DialogTitle>
              Créer un profil {profileType === 'student' ? 'étudiant' : 'enseignant'}
            </DialogTitle>
            <DialogDescription>
              Pour: {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4" data-testid="profile-form">
            {profileType === 'student' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student_number">Numéro d'étudiant *</Label>
                    <Input
                      id="student_number"
                      value={profileData.student_number}
                      onChange={(e) => setProfileData({ ...profileData, student_number: e.target.value })}
                      placeholder="20240001"
                      required
                      data-testid="student-number-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academic_year">Année académique *</Label>
                    <Input
                      id="academic_year"
                      value={profileData.academic_year}
                      onChange={(e) => setProfileData({ ...profileData, academic_year: e.target.value })}
                      required
                      data-testid="academic-year-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Département *</Label>
                  <Select
                    value={profileData.department_id}
                    onValueChange={(value) => setProfileData({ ...profileData, department_id: value })}
                    data-testid="department-select"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un département" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date de naissance</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profileData.date_of_birth}
                    onChange={(e) => setProfileData({ ...profileData, date_of_birth: e.target.value })}
                    data-testid="dob-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    data-testid="address-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Contact d'urgence</Label>
                  <Input
                    id="emergency_contact"
                    value={profileData.emergency_contact}
                    onChange={(e) => setProfileData({ ...profileData, emergency_contact: e.target.value })}
                    placeholder="+216 XX XXX XXX"
                    data-testid="emergency-contact-input"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_number">Numéro d'employé *</Label>
                    <Input
                      id="employee_number"
                      value={profileData.employee_number}
                      onChange={(e) => setProfileData({ ...profileData, employee_number: e.target.value })}
                      placeholder="EMP20240001"
                      required
                      data-testid="employee-number-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department_teacher">Département *</Label>
                    <Select
                      value={profileData.department_id}
                      onValueChange={(value) => setProfileData({ ...profileData, department_id: value })}
                      data-testid="teacher-department-select"
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Spécialisation</Label>
                  <Input
                    id="specialization"
                    value={profileData.specialization}
                    onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                    placeholder="Ex: Mathématiques, Informatique..."
                    data-testid="specialization-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={profileData.qualification}
                    onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                    placeholder="Ex: Doctorat, Master..."
                    data-testid="qualification-input"
                  />
                </div>
              </>
            )}

            <Button 
              onClick={submitProfile} 
              className="w-full"
              data-testid="submit-profile-button"
            >
              Créer le profil
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {users.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Users;
