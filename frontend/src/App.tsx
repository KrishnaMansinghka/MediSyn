import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MediCareApp from "./medicare/MediCareApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/medicare" replace />} />
          <Route path="/medicare/*" element={<MediCareApp />} />
          {/* Redirect common direct routes to medicare app */}
          <Route path="/login" element={<Navigate to="/medicare/login" replace />} />
          <Route path="/dashboard" element={<Navigate to="/medicare/doctor-dashboard" replace />} />
          <Route path="/patient-portal" element={<Navigate to="/medicare/patient-dashboard" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
