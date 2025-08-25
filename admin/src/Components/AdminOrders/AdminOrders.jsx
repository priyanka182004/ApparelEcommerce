import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAddressId, setExpandedAddressId] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await axios.get('http://localhost:5000/admin/orders', {
        headers: { 'auth-token': token }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await axios.put(
        `http://localhost:5000/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { 'auth-token': token } }
      );

      if (response.data.success) {
        toast.success('Order status updated successfully');
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await axios.delete(
        `http://localhost:5000/admin/orders/${orderId}`,
        { headers: { 'auth-token': token } }
      );

      if (response.data.success) {
        toast.success('Order deleted successfully');
        setOrders(orders.filter(order => order._id !== orderId));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(error.response?.data?.error || 'Failed to delete order');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleAddress = (orderId) => {
    if (expandedAddressId === orderId) {
      setExpandedAddressId(null);
    } else {
      setExpandedAddressId(orderId);
    }
  };

  if (loading) return <div className="admin-loading">Loading orders...</div>;

  return (
    <div className="admin-orders-container">
      <h2>Order Management</h2>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="order-id">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="customer-name">{order.name}</td>
                  <td className="address-cell">
                    <div 
                      className="address-dropdown"
                      onClick={() => toggleAddress(order._id)}
                    >
                      <span className="address-preview">
                        {order.address.substring(0, 15)}...
                      </span>
                      {expandedAddressId === order._id && (
                        <div className="address-dropdown-content">
                          <div className="address-details">
                            <p><strong>Address:</strong> {order.address}</p>
                            <p><strong>City:</strong> {order.city}</p>
                            <p><strong>State:</strong> {order.state}</p>
                            <p><strong>Pincode:</strong> {order.pincode}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="amount">₹{order.totalAmount.toLocaleString()}</td>
                  <td className="payment-method">{order.paymentMethod}</td>
                  <td className="order-date">{formatDate(order.date)}</td>
                  <td className="status-cell">
                    <select
                      value={order.status || 'pending'}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`status-select ${order.status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => handleDeleteOrder(order._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;