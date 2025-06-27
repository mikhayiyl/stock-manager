import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          {/* Add more routes like <Route path="/stock" element={<StockListPage />} /> */}
        </Routes>
      </Layout>
    </>
  );
}

export default App;
