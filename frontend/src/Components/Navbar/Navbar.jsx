import React, { useContext, useRef, useState } from 'react';
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import nav_dropdown from '../Assets/nav_dropdown.png';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import heart_icon from '../Assets/heart_icon.png';
import user_icon from '../Assets/user_icon.png'; // Make sure to add this icon

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef();
  const dropdownRef = useRef();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const dropdown_toggle = () => {
    menuRef.current.classList.toggle('nav-menu-visible');
    dropdownRef.current.classList.toggle('open');
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    window.location.replace('/');
  };

  return (
    <div className='navbar'>
      <Link to='/' className="nav-logo" onClick={() => setMenu("shop")}>
        <img src={logo} alt="Shop Logo" />
        <p>SHOPPER</p>
      </Link>

      <img ref={dropdownRef} onClick={dropdown_toggle} className='nav-dropdown' src={nav_dropdown} alt="Menu" />

      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => setMenu("shop")}>
          <Link to='/'>Shop</Link>{menu === "shop" && <hr />}
        </li>
        <li onClick={() => setMenu("mens")}>
          <Link to='/mens'>Men</Link>{menu === "mens" && <hr />}
        </li>
        <li onClick={() => setMenu("womens")}>
          <Link to='/womens'>Women</Link>{menu === "womens" && <hr />}
        </li>
        <li onClick={() => setMenu("kids")}>
          <Link to='/kids'>Kids</Link>{menu === "kids" && <hr />}
        </li>
      </ul>

      <div className="nav-login-cart">
        {localStorage.getItem('auth-token') ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to='/login'><button>Login</button></Link>
        )}

        {/* Cart Icon with count */}
        <Link to='/cart' className="nav-icon-wrapper">
          <img src={cart_icon} alt="Cart" />
          {getTotalCartItems() > 0 && (
            <div className="nav-cart-count">{getTotalCartItems()}</div>
          )}
        </Link>

        <Link to='/wishlist' className="nav-icon-wrapper">
          <img src={heart_icon} alt="Wishlist" />
        </Link>

        {/* User Icon with Dropdown */}
        <div className="user-icon-wrapper" onClick={toggleUserDropdown}>
          <img src={user_icon} alt="User" className="user-icon" />
          {showUserDropdown && (
            <div className="user-dropdown">
              <Link to="/my-purchases" className="dropdown-item">My Purchases</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;