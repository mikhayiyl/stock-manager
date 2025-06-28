import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";
import StockListPage from "./pages/StockListPage";
import ReceivePage from "./pages/ReceivePage";

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/stock" element={<StockListPage />} />
          <Route path="/receive" element={<ReceivePage />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
