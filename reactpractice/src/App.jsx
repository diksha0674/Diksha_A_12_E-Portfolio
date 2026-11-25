import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import MainLayout from "./Layout/MainLayout";
import HomePage from "./Pages/HomePage";
import SignPage from "./Pages/SignPage";
import FeaturedPage from "./Pages/FeaturedPage";
import Popular from "./Pages/Popular";
import DownloadPage from "./Pages/DownloadPage";
import PopularPage from "./Pages/Popular";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signpage" element={<SignPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/featured" element={<FeaturedPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/popular" element={<Popular />} />
          <Route path="/featured" element={<HomePage />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
