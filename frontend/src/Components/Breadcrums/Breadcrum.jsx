import React from 'react';
import './Breadcrum.css';
import arrow_icon from '../Assets/breadcrum_arrow.png';

const Breadcrum = ({ product }) => {
  // Safety check if product is undefined or loading
  if (!product) {
    return <div className="breadcrum">HOME <img src={arrow_icon} alt="arrow" /> SHOP</div>;
  }

  return (
    <div className='breadcrum'>
      HOME <img src={arrow_icon} alt="arrow" /> 
      SHOP <img src={arrow_icon} alt="arrow" /> 
      {product.category || "Category"} <img src={arrow_icon} alt="arrow" /> 
      {product.name || "Product"}
    </div>
  );
};

export default Breadcrum;
