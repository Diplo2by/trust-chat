import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import SignUp from "@/components/SignUp";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ChatComponent from "./components/ChatComponent";
import InternetCheckModal from "./components/InternetCheckModal";

const AppContent: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-emerald-700 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <InternetCheckModal />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!session ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/signup"
            element={!session ? <SignUp /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={session ? <ChatComponent /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={session ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </Router></>

  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;