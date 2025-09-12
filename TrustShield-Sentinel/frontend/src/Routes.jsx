import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import InsiderThreatAnalyticsDashboard from './pages/insider-threat-analytics-dashboard';
import Investigation from './pages/insider-threat-analytics-dashboard/Investigation';
import Profile from './pages/insider-threat-analytics-dashboard/Profile';
import ActivityTimeline from './pages/insider-threat-analytics-dashboard/ActivityTimeline';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<InsiderThreatAnalyticsDashboard />} />
  <Route path="/insider-threat-analytics-dashboard" element={<InsiderThreatAnalyticsDashboard />} />
  <Route path="/investigation/:id" element={<Investigation />} />
  <Route path="/profile/:id" element={<Profile />} />
  <Route path="/timeline/:id" element={<ActivityTimeline />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
