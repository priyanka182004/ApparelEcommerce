import React, { useState, useContext, useEffect, useCallback } from 'react';
import './Payment.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ShopContext } from '../../Context/ShopContext';
import gpayLogo from '../Assets/gpay.png';
import phonepeLogo from '../Assets/phonepe.png';
import paytmLogo from '../Assets/paytm.png';

const Payment = () => {
  const { cartItems, all_product: products } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'UPI',
  });

  const [upiApp, setUpiApp] = useState('');
  const [showUpiForm, setShowUpiForm] = useState(true);
  const [upiDetails, setUpiDetails] = useState({
    upiId: '',
    payerName: '',
    phoneNumber: '',
  });

  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate subtotal, tax, and total amount
  const calculatePriceDetails = useCallback(() => {
    if (!Array.isArray(products) || !cartItems) return;

    const calculatedSubtotal = products.reduce((acc, product) => {
      const quantity = cartItems[product.id]?.quantity || 0;  // Ensure safe access to quantity
      return acc + (product.new_price || 0) * quantity;
    }, 0);

    const calculatedTax = Math.round(calculatedSubtotal * 0.1);  // Assuming 10% tax rate
    const calculatedTotal = calculatedSubtotal + calculatedTax;

    setSubtotal(calculatedSubtotal);
    setTax(calculatedTax);
    setTotalAmount(calculatedTotal);
  }, [products, cartItems]);

  // Recalculate price details when cartItems or products change
  useEffect(() => {
    calculatePriceDetails();
  }, [calculatePriceDetails]);

  useEffect(() => {
    setShowUpiForm(formData.paymentMethod === 'UPI');
  }, [formData.paymentMethod]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'paymentMethod') {
      setUpiApp('');
      setUpiDetails({ upiId: '', payerName: '', phoneNumber: '' });
    }
  };

  const handleUpiAppSelect = (e) => {
    setUpiApp(e.target.value);
  };

  const handleUpiDetailChange = (e) => {
    const { name, value } = e.target;
    setUpiDetails((prev) => ({ ...prev, [name]: value }));
  };

const handlePaymentSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form data
  if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.pincode) {
    toast.error('Please fill all address fields');
    return;
  }

  try {
    // First create the order
    const orderResponse = await axios.post('http://localhost:5000/createorder', {
      ...formData,
      totalAmount,
      date: new Date().toISOString()
    });

    if (!orderResponse.data.success) {
      throw new Error('Failed to create order');
    }

    // Prepare products for purchase
    const purchaseProducts = Object.entries(cartItems)
      .filter(([_, item]) => item.quantity > 0)
      .map(([productId, item]) => {
        const product = products.find(p => p.id === Number(productId));
        return {
          productId: product.id,
          quantity: item.quantity,
          price: product.new_price
        };
      });

    // Then create the purchase
    const purchaseResponse = await axios.post('http://localhost:5000/createpurchase', {
      products: purchaseProducts,
      totalAmount,
      orderId: orderResponse.data.orderId
    }, {
      headers: {
        'auth-token': localStorage.getItem('auth-token')
      }
    });

    if (purchaseResponse.data.success) {
      toast.success('Order placed successfully!');
      // Redirect to My Purchases after 2 seconds
      setTimeout(() => {
        window.location.href = '/my-purchases';
      }, 2000);
    }
  } catch (error) {
    console.error('Payment error:', error);
    toast.error(error.response?.data?.error || 'Payment failed. Please try again.');
  }
};
  return (
    <div className="payment-container">
      <h2>Checkout - Payment Details</h2>

      <form onSubmit={handlePaymentSubmit} className="payment-form">
        <h3>Billing Address</h3>
        {['name', 'address', 'city', 'state', 'pincode'].map((field) => (
          <div className="payment-form-group" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              type="text"
              name={field}
              required
              value={formData[field]}
              onChange={handleChange}
            />
          </div>
        ))}

        <h3>Payment Method</h3>
        <div className="payment-method">
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="UPI"
              checked={formData.paymentMethod === 'UPI'}
              onChange={handleChange}
            />
            UPI
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={formData.paymentMethod === 'COD'}
              onChange={handleChange}
            />
            Cash on Delivery
          </label>
        </div>

        {formData.paymentMethod === 'UPI' && (
          <>
            <h4>Select UPI App</h4>
            <div className="upi-options">
              {[{ name: 'Google Pay', value: 'Google Pay', logo: gpayLogo }, { name: 'PhonePe', value: 'PhonePe', logo: phonepeLogo }, { name: 'Paytm', value: 'Paytm', logo: paytmLogo }]
                .map((app) => (
                  <label key={app.name} className="upi-option-label">
                    <input
                      type="radio"
                      name="upiApp"
                      value={app.value}
                      checked={upiApp === app.value}
                      onChange={handleUpiAppSelect}
                    />
                    <img src={app.logo} alt={app.name} className="upi-logo" />
                    {app.name}
                  </label>
                ))}
            </div>

            {showUpiForm && (
              <>
                <div className="payment-form-group">
                  <label>Payer Name</label>
                  <input
                    type="text"
                    name="payerName"
                    placeholder="Full name"
                    value={upiDetails.payerName}
                    onChange={handleUpiDetailChange}
                    required
                  />
                </div>
                <div className="payment-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="10-digit mobile number"
                    value={upiDetails.phoneNumber}
                    onChange={handleUpiDetailChange}
                    required
                  />
                </div>
                <div className="payment-form-group">
                  <label>UPI ID</label>
                  <input
                    type="text"
                    name="upiId"
                    placeholder="example@upi"
                    value={upiDetails.upiId}
                    onChange={handleUpiDetailChange}
                    required
                  />
                </div>
              </>
            )}
          </>
        )}

        <h3>Price Details</h3>
        <div className="price-details">
          <div className="price-item">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="price-item">
            <span>Tax</span>
            <span>₹{tax}</span>
          </div>
          <div className="price-item total-price">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          {formData.paymentMethod === 'COD'
            ? 'Place Order'
            : `Pay Now (₹${totalAmount})`}
        </button>
      </form>
    </div>
  );
};

export default Payment;
