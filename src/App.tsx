import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import TrackDrug from "./pages/TrackDrug";
import QRTrack from "./pages/QRTrack";
import Manufacturing from "./pages/Manufacturing";
import Distribution from "./pages/Distribution";
import Sales from "./pages/Sales";
import Customer from "./pages/Customer";
import Pharmacy from "./pages/Pharmacy";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import { isAuthenticated, getCurrentUser } from "./utils/auth";

const queryClient = new QueryClient();

const App = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = () => {
      setIsAuth(isAuthenticated());
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuth(true);
  };

  const handleLogout = () => {
    setIsAuth(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ChainTrackr...</p>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthPage onSuccess={handleAuthSuccess} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            <Navigation onLogout={handleLogout} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/track" element={<TrackDrug />} />
              <Route path="/qr-track" element={<QRTrack />} />
                <Route path="/manufacturing" element={<Manufacturing />} />
  <Route path="/distribution" element={<Distribution />} />
  <Route path="/sales" element={<Sales />} />
  <Route path="/customer" element={<Customer />} />
  <Route path="/pharmacy" element={<Pharmacy />} />
  <Route path="/about" element={<About />} />
  <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
