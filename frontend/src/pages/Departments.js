import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import axios from 'axios';
import { API } from '@/App';
import { Plus, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const Departments = ({ user }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API}/departments`);
      setDepartments(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des départements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/departments`, formData);
      toast.success('Département créé avec succès!');
      setDialogOpen(false);
      setFormData({ name: '', code: '', description: '' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
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
    <div className="space-y-6 animate-fade-in" data-testid="departments-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Départements
          </h1>
          <p className="text-base text-gray-600">Gérer les départements de l'institut</p>
        </div>
        {user.role === 'admin' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600" data-testid="add-department-button">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="department-dialog">
              <DialogHeader>
                <DialogTitle>Nouveau Département</DialogTitle>
                <DialogDescription>Créer un nouveau département</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="department-form">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="department-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    data-testid="department-code-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="department-description-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-department-button">
                  Créer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className="border-0 shadow-lg card-hover" data-testid="department-card">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <CardDescription className="font-mono text-sm">{dept.code}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{dept.description || 'Aucune description'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Departments;
