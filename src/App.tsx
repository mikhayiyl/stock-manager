import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";
import OrdersPage from "./pages/OrdersPage";
import ReceivePage from "./pages/ReceivePage";
import ReportPage from "./pages/ReportPage";
import StockListPage from "./pages/StockListPage";
import apiClient from "./services/api-client";

function App() {
  apiClient
    .post("/auth", {
      email: "user1@email.com",
      password: "123456",
    })
    .then((res) => localStorage.setItem("x-auth-token", res.data))
    .catch((error) => console.log(error.message));
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
