import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import SignUp from "@/components/SignUp";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { supabase } from "./supabaseClient";
import { ShieldCheck } from "lucide-react";

const Dashboard: React.FC = () => {
  const { session } = useAuth();

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <Card className="w-full max-w-md shadow-2xl border-2 border-emerald-600">
        <CardHeader className="text-center bg-emerald-800 text-white py-6 flex flex-col items-center">
          <div className="flex items-center justify-center mb-2">
            <ShieldCheck className="mr-2 text-emerald-300" size={36} />
            <CardTitle className="text-3xl font-bold">
              Trust Chat
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="bg-white p-6 space-y-6 text-center">
          <h2 className="text-2xl text-emerald-700 mb-4">
            Welcome, {session?.user.email}
          </h2>
          <Button
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-emerald-700 hover:bg-emerald-600 text-white"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

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
          element={session ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={<Navigate to={session ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
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