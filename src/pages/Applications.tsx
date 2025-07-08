import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Applications: React.FC = () => {
  const [applications] = useState([
    {
      id: '1',
      title: 'Student Financial Aid Program',
      submittedDate: '2024-01-15',
      status: 'approved',
      amount: '$5,000',
      nextDeadline: '2024-02-15',
      documents: ['Application Form', 'Income Certificate', 'Bank Statement'],
    },
    {
      id: '2',
      title: 'Small Business Grant',
      submittedDate: '2024-01-10',
      status: 'pending',
      amount: '$15,000',
      nextDeadline: '2024-01-25',
      documents: ['Business Plan', 'Financial Statements', 'Tax Returns'],
    },
    {
      id: '3',
      title: 'Housing Subsidy Program',
      submittedDate: '2024-01-05',
      status: 'under_review',
      amount: '$8,000',
      nextDeadline: '2024-02-01',
      documents: ['Housing Application', 'Income Proof', 'Property Documents'],
    },
    {
      id: '4',
      title: 'Healthcare Access Program',
      submittedDate: '2023-12-20',
      status: 'rejected',
      amount: '$2,500',
      nextDeadline: null,
      documents: ['Medical Records', 'Insurance Forms'],
      rejectionReason: 'Income exceeds eligibility threshold',
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'under_review':
        return <Eye className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'under_review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending Review';
      case 'under_review':
        return 'Under Review';
      default:
        return 'Unknown';
    }
  };

  const stats = {
    total: applications.length,
    approved: applications.filter(app => app.status === 'approved').length,
    pending: applications.filter(app => app.status === 'pending' || app.status === 'under_review').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-cream-50 bg-grid-pattern bg-grid pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full shadow-lg border-2 border-orange-200 flex items-center justify-center">
            <img src="/Logo.png" alt="SchemeGenie" className="w-10 h-10 p-1" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            My Applications
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track the status of all your benefit applications in one place
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
              <div className="text-sm text-blue-700">Total Applications</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.approved}</div>
              <div className="text-sm text-green-700">Approved</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pending}</div>
              <div className="text-sm text-yellow-700">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-50 to-red-100">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{stats.rejected}</div>
              <div className="text-sm text-red-700">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {applications.map((application, index) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{application.title}</h3>
                        <p className="text-sm text-gray-600">
                          Submitted on {new Date(application.submittedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-2 ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span>{getStatusText(application.status)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Application Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Amount: <span className="font-medium text-gray-900">{application.amount}</span></div>
                        {application.nextDeadline && (
                          <div>Next Deadline: <span className="font-medium text-gray-900">{new Date(application.nextDeadline).toLocaleDateString()}</span></div>
                        )}
                        {application.rejectionReason && (
                          <div className="text-red-600">Reason: {application.rejectionReason}</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                      <div className="space-y-1">
                        {application.documents.map((doc, docIndex) => (
                          <div key={docIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download PDF</span>
                      </Button>
                      {application.status === 'rejected' && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                        >
                          Reapply
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {applications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-4">
                Start by using our AI assistant to find and apply for schemes automatically.
              </p>
              <Button
                onClick={() => window.location.href = '/auto-forms'}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                Start First Application
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};