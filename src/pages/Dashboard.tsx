import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Globe, 
  TrendingUp, 
  Award, 
  MessageSquare,
  FileText,
  Calendar,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 500237,
    activeSchemes: 10847,
    successfulApplications: 234156,
    countriesServed: 52,
    languagesSupported: 20,
    aiInteractions: 1247893,
  });
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading dashboard data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const recentActivity = [
    {
      id: 1,
      type: 'application',
      title: 'New application submitted for Student Aid Program',
      country: 'Kenya',
      time: '2 minutes ago',
    },
    {
      id: 2,
      type: 'chat',
      title: 'AI Assistant helped user with farmer subsidy eligibility',
      country: 'India',
      time: '5 minutes ago',
    },
    {
      id: 3,
      type: 'scheme',
      title: 'New women entrepreneur grant added',
      country: 'Brazil',
      time: '15 minutes ago',
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Deadline reminder sent for housing program',
      country: 'Nigeria',
      time: '23 minutes ago',
    },
  ];

  const topCountriesByUsage = [
    { country: 'India', users: 127853, percentage: 25.5 },
    { country: 'United States', users: 95421, percentage: 19.1 },
    { country: 'Brazil', users: 78234, percentage: 15.6 },
    { country: 'Nigeria', users: 67891, percentage: 13.6 },
    { country: 'Kenya', users: 45123, percentage: 9.0 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            SchemeGenie Dashboard
            <BarChart3 className="inline-block ml-2 h-8 w-8 text-blue-500" />
          </h1>
          <p className="text-xl text-gray-600">
            Global impact and platform analytics for benefit scheme discovery
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Total Users',
              value: stats.totalUsers.toLocaleString(),
              icon: Users,
              color: 'text-blue-600 bg-blue-50',
              change: '+12.3%',
            },
            {
              title: 'Active Schemes',
              value: stats.activeSchemes.toLocaleString(),
              icon: FileText,
              color: 'text-green-600 bg-green-50',
              change: '+8.7%',
            },
            {
              title: 'Successful Applications',
              value: stats.successfulApplications.toLocaleString(),
              icon: Award,
              color: 'text-purple-600 bg-purple-50',
              change: '+15.2%',
            },
            {
              title: 'Countries Served',
              value: stats.countriesServed.toString(),
              icon: Globe,
              color: 'text-orange-600 bg-orange-50',
              change: '+2',
            },
            {
              title: 'Languages Supported',
              value: stats.languagesSupported.toString(),
              icon: MessageSquare,
              color: 'text-red-600 bg-red-50',
              change: '+1',
            },
            {
              title: 'AI Interactions',
              value: stats.aiInteractions.toLocaleString(),
              icon: TrendingUp,
              color: 'text-yellow-600 bg-yellow-50',
              change: '+23.4%',
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      <p className="text-sm text-green-600 mt-1">{metric.change} this month</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${metric.color} flex items-center justify-center`}>
                      <metric.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'application' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'chat' ? 'bg-green-100 text-green-600' :
                    activity.type === 'scheme' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {activity.type === 'application' ? <FileText className="h-4 w-4" /> :
                     activity.type === 'chat' ? <MessageSquare className="h-4 w-4" /> :
                     activity.type === 'scheme' ? <Award className="h-4 w-4" /> :
                     <Calendar className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.country}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Top Countries */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Top Countries by Usage</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {topCountriesByUsage.map((country, index) => (
                <motion.div
                  key={country.country}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{country.country}</p>
                      <p className="text-sm text-gray-600">{country.users.toLocaleString()} users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{country.percentage}%</p>
                    <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Global Impact Section */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Global Impact
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                SchemeGenie has helped connect citizens with life-changing opportunities worldwide
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">$2.1B</p>
                  <p className="text-sm text-gray-600">Benefits Secured</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">87%</p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">24/7</p>
                  <p className="text-sm text-gray-600">AI Availability</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">4.8⭐</p>
                  <p className="text-sm text-gray-600">User Rating</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};