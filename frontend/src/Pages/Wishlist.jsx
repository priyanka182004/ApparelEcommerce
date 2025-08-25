import React, { useContext } from 'react';
import { ShopContext } from '../Context/ShopContext';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlistItems, all_product, addToCart, removeFromWishlist } = useContext(ShopContext);

  const wishlistProducts = all_product.filter(p => wishlistItems.includes(p.id));

  return (
    <div className="wishlist-page">
      <h2>Your Wishlist</h2>
      {wishlistProducts.length === 0 ? (
        <p>No items in your wishlist.</p>
      ) : (
        <div className="wishlist-grid">
          {wishlistProducts.map((product) => (
            <div className="wishlist-card" key={product.id}>
              <img src={product.image} alt={product.name} />
              <h4>{product.name}</h4>
              <p>₹{product.new_price}</p>
              <button onClick={() => addToCart(product.id)}>Add to Cart</button>
              <button onClick={() => removeFromWishlist(product.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
