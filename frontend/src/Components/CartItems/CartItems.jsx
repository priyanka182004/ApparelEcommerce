import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';

const CartItems = () => {
  const {
    getTotalCartAmount,
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
  } = useContext(ShopContext);

  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    navigate('/payment');
  };

  return (
    <div className='cartitems'>
      {/* Header Row */}
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Size</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />

      {/* Product List */}
      {all_product.map((e) => {
        if (cartItems[e.id]?.quantity > 0) {
          return (
            <div key={e.id}>
              <div className="cartitems-format cartitems-format-main">
                <img src={e.image} alt="" className='carticon-product-icon' />
                <p>{e.name}</p>
                <p>₹{e.new_price}</p>

                {/* Size column */}
                <p>{cartItems[e.id]?.size || 'N/A'}</p>

                {/* Quantity control */}
                <div className="cartitems-quantity-controls">
                  <button onClick={() => removeFromCart(e.id)}>-</button>
                  <span>{cartItems[e.id]?.quantity}</span>
                  <button onClick={() => addToCart(e.id, cartItems[e.id]?.size)}>+</button>
                </div>

                {/* Total */}
                <p>₹{e.new_price * cartItems[e.id]?.quantity}</p>

                {/* Remove icon */}
                <img
                  className='cartitems-remove-icon'
                  src={remove_icon}
                  onClick={() => {
                    // Remove all quantity at once
                    const currentQty = cartItems[e.id]?.quantity || 0;
                    for (let i = 0; i < currentQty; i++) {
                      removeFromCart(e.id);
                    }
                  }}
                  alt="Remove"
                />
              </div>
              <hr />
            </div>
          );
        }
        return null;
      })}

      {/* Totals Section */}
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>₹{getTotalCartAmount()}</h3>
            </div>
          </div>
          <button onClick={handleProceedToCheckout}>PROCEED TO CHECKOUT</button>
        </div>
      </div>
    </div>
  );
};

export default CartItems;