import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";
import OrdersPage from "./pages/OrdersPage";
import ReceivePage from "./pages/ReceivePage";
import ReportPage from "./pages/ReportPage";
import StockListPage from "./pages/StockListPage";
import { ProductExceptionsReport } from "./pages/ProductsAlert";

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
        </Routes>
      </Layout>
    </>
  );
}

export default App;
