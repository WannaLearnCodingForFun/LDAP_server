import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function DirectoryTree() {
  const { token } = useAuth();
  const [tree, setTree] = useState({});
  const [expanded, setExpanded] = useState(new Set(['dc=college,dc=local']));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDirectoryTree();
  }, []);

  const loadDirectoryTree = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/search`,
        {
          base_dn: 'dc=college,dc=local',
          filter: '(objectClass=*)',
          attributes: ['objectClass', 'cn', 'ou', 'dc', 'dn']
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const treeData = buildTree(response.data.results);
      setTree(treeData);
    } catch (error) {
      console.error('Error loading directory tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (entries) => {
    const tree = {};
    
    entries.forEach(entry => {
      const dn = entry.dn;
      const parts = dn.split(',').reverse();
      let current = tree;
      
      parts.forEach((part, index) => {
        const key = part.trim();
        if (!current[key]) {
          current[key] = {
            dn: parts.slice(0, index + 1).reverse().join(','),
            children: {},
            entry: index === parts.length - 1 ? entry : null
          };
        }
        current = current[key].children;
      });
    });
    
    return tree;
  };

  const toggleExpand = (dn) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(dn)) {
        next.delete(dn);
      } else {
        next.add(dn);
      }
      return next;
    });
  };

  const renderTreeNode = (node, level = 0) => {
    const entries = Object.entries(node);
    
    return entries.map(([key, value]) => {
      const isExpanded = expanded.has(value.dn);
      const hasChildren = Object.keys(value.children).length > 0;
      
      return (
        <div key={value.dn} style={{ marginLeft: `${level * 20}px` }}>
          <div
            className="flex items-center py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            onClick={() => hasChildren && toggleExpand(value.dn)}
          >
            {hasChildren && (
              <span className="mr-2">{isExpanded ? '▼' : '▶'}</span>
            )}
            {!hasChildren && <span className="mr-2 w-4" />}
            <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
              {key}
            </span>
            {value.entry && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                ({value.entry.objectClass?.join(', ') || 'objectClass'})
              </span>
            )}
          </div>
          {isExpanded && hasChildren && (
            <div>{renderTreeNode(value.children, level + 1)}</div>
          )}
        </div>
      );
    });
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
          Directory Tree
        </h1>
        <button
          onClick={loadDirectoryTree}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="font-mono text-sm">
          {renderTreeNode(tree)}
        </div>
      </div>
    </div>
  );
}

export default DirectoryTree;

