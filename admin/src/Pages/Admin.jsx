import React from "react";
import "./CSS/Admin.css";
import Sidebar from "../Components/Sidebar/Sidebar";
import AddProduct from "../Components/AddProduct/AddProduct";
import { Route, Routes } from "react-router-dom";
import ListProduct from "../Components/ListProduct/ListProduct";
import UserDetails from "../Components/UserDetails/UserDetails";
import AdminOrders from "../Components/AdminOrders/AdminOrders";

const Admin = () => {

  return (
    <div className="admin">
      <Sidebar />
      <Routes>
        <Route path="/addproduct" element={<AddProduct />} />
        <Route path="/listproduct" element={<ListProduct />} />
         <Route path="/userdetails" element={<UserDetails />} />
         <Route path="/admin/orders" element={<AdminOrders />} />
      </Routes>
    </div>
  );
};

export default Admin;
