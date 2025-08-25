import React from 'react'
import './Sidebar.css'
import add_product_icon from '../Assets/Product_Cart.svg'
import list_product_icon from '../Assets/Product_list_icon.svg'
import user_details_icon from '../Assets/user_icon.png'
import order_details_icon from '../Assets/order_details_icon.png'
import { Link } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to='/addproduct' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={add_product_icon} alt="Add Product" />
          <p>Add Product</p>
        </div>
      </Link>
      <Link to='/listproduct' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={list_product_icon} alt="Product List" />
          <p>Product List</p>
        </div>
      </Link>
      <Link to='/userdetails' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={user_details_icon} alt="User Details" />
          <p>User Details</p>
        </div>
      </Link>
      <Link to='/admin/orders' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={order_details_icon} alt="Order Details" />
          <p>Order Details</p>
        </div>
      </Link>
    </div>
  )
}

export default Sidebar