import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './MyPurchases.css';
import { ShopContext } from '../../Context/ShopContext';
import { useContext } from 'react';

const MyPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { all_product } = useContext(ShopContext);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await axios.get('http://localhost:5000/mypurchases', {
        headers: { 'auth-token': token }
      });

      if (response.data.success) {
        const sortedPurchases = response.data.purchases.sort((a, b) => 
          new Date(b.orderDate) - new Date(a.orderDate)
        );
        setPurchases(sortedPurchases);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error loading purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
    
    // Set up polling to refresh purchases every 30 seconds
    const intervalId = setInterval(fetchPurchases, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleDeletePurchase = async (purchaseId) => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/deletepurchase/${purchaseId}`,
        { headers: { 'auth-token': token } }
      );

      if (response.data.success) {
        toast.success('Purchase deleted successfully');
        setPurchases(purchases.filter(p => p._id !== purchaseId));
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error(error.response?.data?.error || 'Failed to delete purchase');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className="loading">Loading your purchases...</div>;

  return (
    <div className="my-purchases-container">
      <h2>My Purchases</h2>
      
      {purchases.length === 0 ? (
        <div className="no-purchases">
          <p>You haven't made any purchases yet.</p>
          <a href="/" className="shop-now-btn">Shop Now</a>
        </div>
      ) : (
        <div className="purchases-table-container">
          <table className="purchases-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Product ID</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <React.Fragment key={purchase._id}>
                  {purchase.products.map((product, index) => (
                    <tr key={`${purchase._id}-${index}`}>
                      {index === 0 && (
                        <>
                          <td rowSpan={purchase.products.length}>
                            #{purchase._id.slice(-6).toUpperCase()}
                          </td>
                        </>
                      )}
                      <td>
                        <div className="product-cell">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="product-image" 
                          />
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td>{product.productId}</td>
                      <td>{product.quantity}</td>
                      <td>₹{product.price}</td>
                      {index === 0 && (
                        <>
                          <td rowSpan={purchase.products.length}>
                            <span className={`status-badge ${purchase.status.toLowerCase()}`}>
                              {purchase.status}
                            </span>
                          </td>
                          <td rowSpan={purchase.products.length}>
                            {formatDate(purchase.orderDate)}
                          </td>
                          <td rowSpan={purchase.products.length}>
                            <button 
                              onClick={() => handleDeletePurchase(purchase._id)}
                              className="delete-btn"
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyPurchases;