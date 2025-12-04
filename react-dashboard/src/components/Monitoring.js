import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Monitoring() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [replicaStatus, setReplicaStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      // Load Prometheus metrics
      const metricsResponse = await fetch(`${API_URL}/metrics`);
      const metricsText = await metricsResponse.text();
      
      // Parse metrics (simplified - in production use a proper parser)
      const parsedMetrics = {};
      metricsText.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
          const parts = line.split(' ');
          if (parts.length >= 2) {
            const name = parts[0];
            const value = parseFloat(parts[1]);
            if (!isNaN(value)) {
              parsedMetrics[name] = value;
            }
          }
        }
      });

      // Load replica status
      const replicaResponse = await axios.get(
        `${API_URL}/replica_status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMetrics(parsedMetrics);
      setReplicaStatus(replicaResponse.data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Monitoring Dashboard
        </h1>
        <button
          onClick={loadMetrics}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>

      {/* Replication Status */}
      {replicaStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Replication Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Master Entries</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {replicaStatus.master_entries}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Replica Entries</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {replicaStatus.replica_entries}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sync Status</p>
              <p
                className={`text-2xl font-bold ${
                  replicaStatus.sync_status === 'synced'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}
              >
                {replicaStatus.sync_status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          LDAP Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics && Object.entries(metrics).map(([key, value]) => (
            <div key={key} className="border rounded p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-mono">
                {key}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {typeof value === 'number' ? value.toFixed(2) : value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Grafana Integration Note */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          For detailed visualizations, access Grafana at{' '}
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
          >
            http://localhost:3001
          </a>
          {' '}(admin/admin)
        </p>
      </div>
    </div>
  );
}

export default Monitoring;

