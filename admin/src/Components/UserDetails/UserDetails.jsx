import React, { useEffect, useState } from 'react';
import './UserDetails.css';

const UserDetails = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/allusers');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (email) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/deleteuser/${email}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      const data = await response.json();
      if (data.success) {
        setUsers(users.filter(user => user.email !== email));
        alert('User deleted successfully');
      } else {
        throw new Error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="user-details loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-details error">
        <div className="error-icon">!</div>
        <p>Error: {error}</p>
        <button onClick={fetchUsers} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className='user-details'>
      <div className="header-section">
        <h1>User Management</h1>
        <div className="controls">
          <button onClick={fetchUsers} className="refresh-btn">
            Refresh
          </button>
          <div className="user-count">{users.length} users found</div>
        </div>
      </div>
      
      <div className="table-container">
        {users.length === 0 ? (
          <div className="no-users">
            <p>No users found</p>
            <button onClick={fetchUsers} className="refresh-btn">
              Refresh
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Password (Hashed)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td className='password-cell'>{user.password}</td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteUser(user.email)}
                    >
                      <span className="icon">🗑️</span> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserDetails;