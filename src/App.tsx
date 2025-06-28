import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";
import StockListPage from "./pages/StockListPage";
import ReceivePage from "./pages/ReceivePage";
import OrdersPage from "./pages/OrdersPage";
import ReportPage from "./pages/ReportPage";

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/stock" element={<StockListPage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/reports" element={<ReportPage />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
