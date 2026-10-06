import type { ReactNode } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import { Layout } from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";
import DamagePage from "./pages/DamagesPage";
import ExpressPage from "./pages/ExpressPage";
import { LoginPage } from "./pages/Login";
import { LogoutPage } from "./pages/Logout";
import InsightsPage from "./pages/InsightsPage";
import OrdersPage from "./pages/OrdersPage";
import { ProductPage } from "./pages/ProductPage";
import ReceivePage from "./pages/ReceivePage";
import { RegisterPage } from "./pages/RegisterPage";
import ReportPage from "./pages/ReportPage";
import { SalesTrendReport } from "./pages/SalesTrend";
import StockListPage from "./pages/StockListPage";
import StockMovementsPage from "./pages/StockMovementsPage";
import StockHealthDashboard from "./pages/StockScope";
import UsersPage from "./pages/UsersPage";
import getAuthUser from "./lib/auth";

function App() {
  //dynamic page title
  useDocumentTitle();
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
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
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/stock" element={<StockListPage />} />
          <Route path="/products" element={<StockListPage />} />
          <Route path="/stock-movements" element={<StockMovementsPage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/reports" element={<ReportPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/damages" element={<DamagePage />} />
          <Route path="/express" element={<ExpressPage />} />
          <Route path="/salestrend" element={<SalesTrendReport />} />
          <Route path="/stock-scope" element={<StockHealthDashboard />} />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            }
          />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/product/:itemCode" element={<ProductPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function AdminRoute({ children }: { children: ReactNode }) {
  const user = getAuthUser();
  if (!user) return <Navigate to="/login" replace />;
  return user.isAdmin ? children : <Navigate to="/" replace />;
}

export function PublicRoute({ children }: { children: ReactNode }) {
  const isLoggedIn = Boolean(localStorage.getItem("x-auth-token"));
  return isLoggedIn ? <Navigate to="/" replace /> : children;
}
