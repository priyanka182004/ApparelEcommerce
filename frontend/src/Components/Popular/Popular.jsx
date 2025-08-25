import React, { useEffect, useState } from 'react';
import './Popular.css';
import Item from '../Item/Item';

const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/popularinwomen')  // ✅ Make sure backend is running!
      .then((response) => response.json())         // ✅ Use () to call .json()
      .then((data) => {
        console.log("Data fetched:", data);        // Debug log to see the result
        setPopularProducts(data);                  // ✅ Now safe to use .map
      })
      .catch((error) => {
        console.error("Error fetching popular products:", error);
        setPopularProducts([]); // Fallback to empty array on error
      });
  }, []);

  return (
    <div className='popular'>
      <h1>POPULAR IN WOMEN</h1>
      <hr />
      <div className="popular-item">
        {Array.isArray(popularProducts) ? (
          popularProducts.map((item, i) => (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        ) : (
          <p>Data not in expected format</p>
        )}
      </div>
    </div>
  );
};

export default Popular;
