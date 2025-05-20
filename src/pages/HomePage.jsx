import React from "react";
import { Typography, Button, Container, Box } from "@mui/material";
import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <>
      <Navbar />
      <Box sx={{ mt: 4 }}>
        <HeroSection />
      </Box>
      <Footer />
    </>
  );
};

export default HomePage;
