import React, { useContext, useState } from 'react';
import './ProductDisplay.css';
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from '../../Context/ShopContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const ProductDisplay = (props) => {
  const { product } = props;
  const [selectedSize, setSelectedSize] = useState('');

  const {
    addToCart,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    cartItems
  } = useContext(ShopContext);

  // Guard clause to prevent errors if product is undefined
  if (!product) return <div className="productdisplay-loading">Loading product...</div>;

  const isInWishlist = wishlistItems.includes(product.id);
  const isInCart = cartItems[product.id]?.quantity > 0;  // Check if product is in the cart

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size!');
    } else {
      addToCart(product.id, selectedSize);  // Pass size with the cart item
    }
  };

  return (
    <div className='productdisplay'>
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={product.image} alt="" />
          <img src={product.image} alt="" />
          <img src={product.image} alt="" />
          <img src={product.image} alt="" />
        </div>
        <div className="productdisplay-img">
          <img className='productdisplay-main-img' src={product.image} alt="" />
        </div>
      </div>

      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-stars">
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_dull_icon} alt="star dull" />
          <p>(122)</p>
        </div>

        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">₹{product.old_price}</div>
          <div className="productdisplay-right-price-new">₹{product.new_price}</div>
        </div>

        <div className="productdisplay-right-description">
          A lightweight, usually knitted, pullover shirt, close-fitting and with
          a round neckline and short sleeves, worn as an undershirt or outer
          garment.
        </div>

        <div className="productdisplay-right-size">
          <h1>Select Size</h1>
          <div className="productdisplay-right-sizes">
            {["S", "M", "L", "XL", "XXL"].map((size) => (
              <div
                key={size}
                className={`size-box ${selectedSize === size ? "selected" : ""}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </div>
            ))}
          </div>
        </div>

        <div className="productdisplay-right-actions">
          <button 
            onClick={handleAddToCart}
            className={isInCart ? 'add-to-cart-button added' : 'add-to-cart-button'}
          >
            {isInCart ? (
              <span className="cart-badge">Added</span> // Red badge when added
            ) : (
              'ADD TO CART'
            )}
          </button>

          <span className="productdisplay-heart">
            {isInWishlist ? (
              <FaHeart
                style={{ color: 'red', fontSize: '24px', cursor: 'pointer' }}
                title="Remove from wishlist"
                onClick={() => removeFromWishlist(product.id)}
              />
            ) : (
              <FaRegHeart
                style={{ fontSize: '24px', cursor: 'pointer' }}
                title="Add to wishlist"
                onClick={() => addToWishlist(product.id)}
              />
            )}
          </span>
        </div>

        <p className='productdisplay-right-category'>
          <span>Category :</span> {product.category || "Uncategorized"}
        </p>
        <p className='productdisplay-right-category'>
          <span>Tags :</span> Modern, Latest
        </p>
      </div>
    </div>
  );
};

export default ProductDisplay;
