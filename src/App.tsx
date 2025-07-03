import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";
import OrdersPage from "./pages/OrdersPage";
import ReceivePage from "./pages/ReceivePage";
import ReportPage from "./pages/ReportPage";
import StockListPage from "./pages/StockListPage";
import { ProductExceptionsReport } from "./pages/ProductsAlert";
import { SalesTrendReport } from "./pages/SalesTrend";
import { ProductPage } from "./pages/ProductPage";
import { LogoutPage } from "./pages/Logout";
import { LoginPage } from "./pages/Login";

function App() {
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
          <Route path="/alert" element={<ProductExceptionsReport />} />
          <Route path="/salestrend" element={<SalesTrendReport />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
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

import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export function PublicRoute({ children }: { children: ReactNode }) {
  const isLoggedIn = Boolean(localStorage.getItem("x-auth-token"));
  return isLoggedIn ? <Navigate to="/" replace /> : children;
}
