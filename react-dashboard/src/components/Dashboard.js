import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    faculty: 0,
    staff: 0,
    replicaStatus: 'unknown'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
    
    // Set up WebSocket connection
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('ldap_update', (data) => {
      setRecentActivity(prev => [data, ...prev].slice(0, 10));
      fetchStats(); // Refresh stats on update
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Get total users
      const allUsers = await axios.post(
        `${API_URL}/search`,
        { filter: '(objectClass=person)' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const students = await axios.post(
        `${API_URL}/search`,
        { filter: '(objectClass=studentEntry)' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const faculty = await axios.post(
        `${API_URL}/search`,
        { filter: '(objectClass=facultyMember)' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const staff = await axios.post(
        `${API_URL}/search`,
        { filter: '(objectClass=staffEntry)' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Get replica status
      const replicaStatus = await axios.get(
        `${API_URL}/replica_status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStats({
        totalUsers: allUsers.data.count,
        students: students.data.count,
        faculty: faculty.data.count,
        staff: staff.data.count,
        replicaStatus: replicaStatus.data.sync_status
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/audit_logs?limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecentActivity(response.data.logs);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Dashboard
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.totalUsers}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Students
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.students}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Faculty
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.faculty}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Staff
          </h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.staff}
          </p>
        </div>
      </div>

      {/* Replica Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Replication Status
        </h3>
        <div className="flex items-center">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              stats.replicaStatus === 'synced'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}
          >
            {stats.replicaStatus}
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Target</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 dark:text-gray-400">
                    No recent activity
                  </td>
                </tr>
              ) : (
                recentActivity.map((activity, index) => (
                  <tr key={index}>
                    <td>{new Date(activity.timestamp).toLocaleString()}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          activity.action === 'add'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : activity.action === 'delete'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {activity.action}
                      </span>
                    </td>
                    <td className="text-sm">{activity.actor_dn || 'N/A'}</td>
                    <td className="text-sm">{activity.target_dn || 'N/A'}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          activity.status === 'success'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

