import React from "react";
import { Outlet } from "react-router-dom";
import Footer from './../components/Footer';
import Abcd from "../Components/Abcd";


const MainLayout = () => {
  return (
    <>
      <Abcd/>
      <Outlet />
      <Footer />
    </>
  );
};

export default MainLayout;
