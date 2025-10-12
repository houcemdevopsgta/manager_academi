import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar } from 'lucide-react';

const Profile = ({ user }) => {
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
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
        return 'Administrateur';
      case 'teacher':
        return 'Enseignant';
      case 'student':
        return 'Étudiant';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto" data-testid="profile-page">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Mon Profil
        </h1>
        <p className="text-base text-gray-600">Informations personnelles</p>
      </div>

      {/* Profile Header Card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardContent className="-mt-16 relative">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
              <AvatarFallback className={`${getRoleBadgeColor(user?.role)} text-white text-3xl font-bold`}>
                {getInitials(user?.first_name, user?.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 md:mt-0 md:mb-4 flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk' }}>
                {user?.first_name} {user?.last_name}
              </h2>
              <Badge className={`${getRoleBadgeColor(user?.role)} mt-2`}>
                {getRoleLabel(user?.role)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg card-hover">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span>Email</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700">{user?.email}</p>
          </CardContent>
        </Card>

        {user?.phone && (
          <Card className="border-0 shadow-lg card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span>Téléphone</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-700">{user?.phone}</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-lg card-hover">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <span>Rôle</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700">{getRoleLabel(user?.role)}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg card-hover">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span>Membre depuis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Status */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Statut du Compte</CardTitle>
          <CardDescription>Informations sur votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 font-medium">Compte actif</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
