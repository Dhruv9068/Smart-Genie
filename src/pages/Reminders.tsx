import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Mail, Plus, Check, X, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { emailService } from '../services/emailjs';
import { firebaseService } from '../services/firebase';
import toast, { Toaster } from 'react-hot-toast';

interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  email: string;
  isCompleted: boolean;
  schemeId?: string;
}

export const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dueDate: '',
    email: '',
  });
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    loadReminders();
  }, [user]);

  const loadReminders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userReminders = await firebaseService.getUserReminders(user.id);
      setReminders(userReminders);
    } catch (error) {
      console.error('Failed to load reminders:', error);
      toast.error('Failed to load reminders.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.dueDate || !newReminder.email) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      
      const reminder: Reminder = {
        id: Date.now().toString(),
        title: newReminder.title,
        description: newReminder.description,
        dueDate: newReminder.dueDate,
        email: newReminder.email,
        isCompleted: false,
        schemeId: undefined,
      };

      // Add to Firebase
      await firebaseService.addReminder({
        ...reminder,
        userId: user?.id,
      });

      // Send initial email notification
      const success = await emailService.sendReminderEmail(
        reminder.email,
        user?.name || 'User',
        reminder.title,
        reminder.dueDate,
        reminder.description
      );

      if (success) {
        toast.success('Reminder created and email sent!');
      } else {
        toast.success('Reminder created! (Email sending failed)');
      }

      setReminders(prev => [...prev, reminder]);
      setNewReminder({ title: '', description: '', dueDate: '', email: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add reminder:', error);
      toast.error('Failed to create reminder.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (reminderId: string) => {
    try {
      setReminders(prev =>
        prev.map(reminder =>
          reminder.id === reminderId
            ? { ...reminder, isCompleted: !reminder.isCompleted }
            : reminder
        )
      );
      toast.success('Reminder updated!');
    } catch (error) {
      console.error('Failed to update reminder:', error);
      toast.error('Failed to update reminder.');
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
      toast.success('Reminder deleted!');
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      toast.error('Failed to delete reminder.');
    }
  };

  const upcomingReminders = reminders.filter(r => !r.isCompleted && new Date(r.dueDate) > new Date());
  const completedReminders = reminders.filter(r => r.isCompleted);
  const overdueReminders = reminders.filter(r => !r.isCompleted && new Date(r.dueDate) <= new Date());

  if (loading && reminders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading reminders..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white pt-20">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Smart Reminders
            <Bell className="inline-block ml-2 h-8 w-8 text-orange-500" />
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Never miss important deadlines for benefit applications and document submissions.
            Set up automated email reminders and track your progress.
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{upcomingReminders.length}</p>
                  <p className="text-sm text-gray-600">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overdueReminders.length}</p>
                  <p className="text-sm text-gray-600">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedReminders.length}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reminders List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Reminder Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Your Reminders</h2>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                variant="primary"
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Reminder</span>
              </Button>
            </div>

            {/* Add Reminder Form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Create New Reminder</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      label="Reminder Title *"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Submit housing application documents"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newReminder.description}
                        onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Additional details about this reminder..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        rows={3}
                      />
                    </div>
                    <Input
                      label="Due Date *"
                      type="datetime-local"
                      value={newReminder.dueDate}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                    <Input
                      label="Email Address *"
                      type="email"
                      value={newReminder.email}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Where to send reminder emails"
                    />
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleAddReminder}
                        loading={loading}
                        disabled={!newReminder.title || !newReminder.dueDate || !newReminder.email}
                      >
                        Create Reminder
                      </Button>
                      <Button
                        onClick={() => setShowAddForm(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Overdue Reminders */}
            {overdueReminders.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-red-600 mb-4">⚠️ Overdue Reminders</h3>
                <div className="space-y-3">
                  {overdueReminders.map((reminder, index) => (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ReminderCard
                        reminder={reminder}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteReminder}
                        variant="overdue"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Reminders */}
            {upcomingReminders.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">📅 Upcoming Reminders</h3>
                <div className="space-y-3">
                  {upcomingReminders.map((reminder, index) => (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ReminderCard
                        reminder={reminder}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteReminder}
                        variant="upcoming"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Reminders */}
            {completedReminders.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-green-600 mb-4">✅ Completed</h3>
                <div className="space-y-3">
                  {completedReminders.map((reminder, index) => (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ReminderCard
                        reminder={reminder}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteReminder}
                        variant="completed"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {reminders.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first reminder to stay on top of important deadlines.
                  </p>
                  <Button onClick={() => setShowAddForm(true)}>
                    Create Reminder
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Automatic Reminders</p>
                    <p className="text-xs text-gray-600">Get email notifications 7 days, 3 days, and 1 day before deadlines</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Calendar Integration</p>
                    <p className="text-xs text-gray-600">Add reminders to your calendar for better planning</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Bell className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Smart Alerts</p>
                    <p className="text-xs text-gray-600">Intelligent timing based on application complexity</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-900 mb-2">💡 Pro Tips</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Set multiple reminders for complex applications</li>
                  <li>• Include document preparation time in your schedule</li>
                  <li>• Use descriptive titles for easy identification</li>
                  <li>• Check your email regularly for updates</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reminder Card Component
const ReminderCard: React.FC<{
  reminder: Reminder;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  variant: 'upcoming' | 'overdue' | 'completed';
}> = ({ reminder, onToggleComplete, onDelete, variant }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'overdue':
        return 'border-red-200 bg-red-50';
      case 'completed':
        return 'border-green-200 bg-green-50 opacity-75';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <Card className={getVariantStyles()}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onToggleComplete(reminder.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  reminder.isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {reminder.isCompleted && <Check className="h-3 w-3" />}
              </button>
              <h4 className={`font-medium ${reminder.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {reminder.title}
              </h4>
            </div>
            {reminder.description && (
              <p className="text-sm text-gray-600 mt-2 ml-8">
                {reminder.description}
              </p>
            )}
            <div className="flex items-center space-x-4 mt-2 ml-8">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{new Date(reminder.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Mail className="h-4 w-4" />
                <span>{reminder.email}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onDelete(reminder.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};