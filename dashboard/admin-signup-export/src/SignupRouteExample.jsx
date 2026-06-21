import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import ThemeProvider from "./utils/ThemeContext";
import Signup from "./pages/auth/signup";
import "./css/style.css";

const SignupRouteExample = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Providers>
          <Toaster />
          <Routes>
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Providers>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default SignupRouteExample;
