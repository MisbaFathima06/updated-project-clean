import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import EmergencyModal from "@/components/emergency-modal";

import HomePage from "@/pages/home";
import ReportPage from "@/pages/report";
import StatusPage from "@/pages/status";
import PublicFeedPage from "@/pages/public-feed";
import AdminPage from "@/pages/admin";
import NgoPage from "@/pages/ngo";
import AnalyticsPage from "@/pages/analytics";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/report" component={ReportPage} />
        <Route path="/status" component={StatusPage} />
        <Route path="/community" component={PublicFeedPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/ngo" component={NgoPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route component={NotFound} />
      </Switch>
      <EmergencyModal />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
