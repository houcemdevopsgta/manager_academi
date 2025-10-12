import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { API } from '@/App';
import { Users, BookOpen, Calendar, TrendingUp, Bell } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, notifsRes] = await Promise.all([
        axios.get(`${API}/stats/dashboard`),
        axios.get(`${API}/notifications`)
      ]);
      setStats(statsRes.data);
      setNotifications(notifsRes.data.slice(0, 5));
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getStatsCards = () => {
    if (user.role === 'admin') {
      return [
        {
          title: 'Étudiants',
          value: stats.total_students || 0,
          description: `${stats.pending_students || 0} en attente`,
          icon: Users,
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: 'Enseignants',
          value: stats.total_teachers || 0,
          description: 'Actifs',
          icon: Users,
          color: 'from-purple-500 to-pink-500'
        },
        {
          title: 'Cours',
          value: stats.total_courses || 0,
          description: 'Cours disponibles',
          icon: BookOpen,
          color: 'from-green-500 to-emerald-500'
        },
        {
          title: 'Examens',
          value: stats.total_exams || 0,
          description: 'Total des examens',
          icon: Calendar,
          color: 'from-orange-500 to-red-500'
        }
      ];
    } else if (user.role === 'teacher') {
      return [
        {
          title: 'Mes Cours',
          value: stats.my_courses || 0,
          description: 'Cours assignés',
          icon: BookOpen,
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: 'Étudiants',
          value: stats.total_students || 0,
          description: 'Total inscrits',
          icon: Users,
          color: 'from-purple-500 to-pink-500'
        },
        {
          title: 'Examens',
          value: stats.upcoming_exams || 0,
          description: 'À venir',
          icon: Calendar,
          color: 'from-green-500 to-emerald-500'
        }
      ];
    } else {
      return [
        {
          title: 'Mes Cours',
          value: stats.enrolled_courses || 0,
          description: 'Cours inscrits',
          icon: BookOpen,
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: 'Examens',
          value: stats.upcoming_exams || 0,
          description: 'À venir',
          icon: Calendar,
          color: 'from-purple-500 to-pink-500'
        },
        {
          title: 'Moyenne',
          value: `${stats.average_grade || 0}%`,
          description: 'Moyenne générale',
          icon: TrendingUp,
          color: 'from-green-500 to-emerald-500'
        }
      ];
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
    <div className="space-y-6 animate-fade-in" data-testid="dashboard-page">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Bienvenue, {user.first_name}!
        </h1>
        <p className="text-base text-gray-600">Voici un aperçu de vos activités</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getStatsCards().map((stat, index) => (
          <Card
            key={index}
            className="border-0 shadow-lg card-hover overflow-hidden"
            data-testid={`stat-card-${index}`}
          >
            <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Space Grotesk' }}>
                {stat.value}
              </div>
              <p className="text-xs sm:text-sm text-gray-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Notifications */}
      <Card className="border-0 shadow-lg" data-testid="notifications-section">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications récentes</span>
              </CardTitle>
              <CardDescription>Dernières mises à jour et annonces</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucune notification</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition-shadow"
                  data-testid="notification-item"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{notif.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
