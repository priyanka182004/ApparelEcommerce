import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from '../Assets/cross_icon.png';

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = async () => {
    await fetch('http://localhost:5000/allproducts')
      .then((res) => res.json())
      .then((data) => { setAllProducts(data); });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const removeProduct = async (id) => {
    await fetch('http://localhost:5000/removeproduct', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id }),
    });
    fetchInfo(); // refresh after deleting
  };

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Product</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>

      <div className="listproduct-allproducts">
        <hr />
        {allproducts.length > 0 ? (
          allproducts.map((product, index) => (
            <div key={index}>
              <div className="listproduct-format-main listproduct-format">
                <img
                  src={product.image ? product.image : "https://via.placeholder.com/100"}
                  alt={product.name}
                  className="listproduct-product-icon"
                />
                <p>{product.name}</p>
                <p>${product.old_price}</p>
                <p>${product.new_price}</p>
                <p>{product.category}</p>
                <img
                  src={cross_icon}
                  alt="Remove"
                  className="listproduct-remove-icon"
                  onClick={() => removeProduct(product.id)}
                />
              </div>
              <hr />
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default ListProduct;
