import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";
import { LoginPage } from "./pages/Login";
import { LogoutPage } from "./pages/Logout";
import OrdersPage from "./pages/OrdersPage";
import { ProductPage } from "./pages/ProductPage";
import ReceivePage from "./pages/ReceivePage";
import ReportPage from "./pages/ReportPage";
import { SalesTrendReport } from "./pages/SalesTrend";
import StockListPage from "./pages/StockListPage";

function App() {
  //dynamic page title
  useDocumentTitle();
  return (
    <>
      <Toaster richColors position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/stock" element={<StockListPage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/reports" element={<ReportPage />} />
          <Route path="/damages" element={<DamagePage />} />
          <Route path="/express" element={<ExpressPage />} />
          <Route path="/salestrend" element={<SalesTrendReport />} />
          <Route path="/stock-scope" element={<StockHealthDashboard />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/product/:itemCode" element={<ProductPage />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import DamagePage from "./pages/DamagesPage";
import ExpressPage from "./pages/ExpressPage";
import { RegisterPage } from "./pages/RegisterPage";
import StockHealthDashboard from "./pages/StockScope";

export function PublicRoute({ children }: { children: ReactNode }) {
  const isLoggedIn = Boolean(localStorage.getItem("x-auth-token"));
  return isLoggedIn ? <Navigate to="/" replace /> : children;
}
