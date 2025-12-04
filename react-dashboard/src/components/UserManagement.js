import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function UserManagement() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    cn: '',
    sn: '',
    givenName: '',
    mail: '',
    userPassword: '',
    ou: 'Students',
    user_type: 'studentEntry',
    rollNumber: '',
    departmentCode: '',
    yearOfStudy: '',
    empID: '',
    specialization: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/search`,
        {
          filter: '(objectClass=person)',
          attributes: ['*']
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(response.data.results);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/add_user`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddModal(false);
      setFormData({
        cn: '',
        sn: '',
        givenName: '',
        mail: '',
        userPassword: '',
        ou: 'Students',
        user_type: 'studentEntry',
        rollNumber: '',
        departmentCode: '',
        yearOfStudy: '',
        empID: '',
        specialization: ''
      });
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Error adding user');
    }
  };

  const handleDeleteUser = async (dn) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/delete_user`,
        {
          data: { dn },
          headers: { Authorization: `Bearer ${token}` } }
      );
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Error deleting user');
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const dn = user.dn?.toLowerCase() || '';
    const cn = (Array.isArray(user.cn) ? user.cn[0] : user.cn)?.toLowerCase() || '';
    const mail = (Array.isArray(user.mail) ? user.mail[0] : user.mail)?.toLowerCase() || '';
    return dn.includes(searchLower) || cn.includes(searchLower) || mail.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Add User
          </button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>CN</th>
              <th>DN</th>
              <th>Email</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((userEntry, index) => (
              <tr key={index}>
                <td>{Array.isArray(userEntry.cn) ? userEntry.cn[0] : userEntry.cn}</td>
                <td className="text-xs font-mono">{userEntry.dn}</td>
                <td>{Array.isArray(userEntry.mail) ? userEntry.mail[0] : userEntry.mail}</td>
                <td>
                  {userEntry.objectClass?.includes('studentEntry') && 'Student'}
                  {userEntry.objectClass?.includes('facultyMember') && 'Faculty'}
                  {userEntry.objectClass?.includes('staffEntry') && 'Staff'}
                </td>
                <td>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(userEntry.dn)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Add User
            </h2>
            <form onSubmit={handleAddUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Common Name (CN)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cn}
                    onChange={(e) => setFormData({ ...formData, cn: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Surname
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sn}
                    onChange={(e) => setFormData({ ...formData, sn: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    User Type
                  </label>
                  <select
                    value={formData.user_type}
                    onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                  >
                    <option value="studentEntry">Student</option>
                    <option value="facultyMember">Faculty</option>
                    <option value="staffEntry">Staff</option>
                  </select>
                </div>
                {formData.user_type === 'studentEntry' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.rollNumber}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Department Code
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.departmentCode}
                        onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.userPassword}
                    onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-6 flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Add User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;

