import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import StoreToken from "./api/StoreToken";
import NotFoundPage from "./pages/NotFoundPage";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/auth/SignUpPage";
import SignInPage from "./pages/auth/SignInPage";
import Dashboard from "./pages/Dashboard";
import CategoryManagement from "./pages/CategoryManagement";
import ProductManagement from "./pages/ProductManagement";
import SalesManagement from "./pages/SalesManagement";
import CustomerManagement from "./pages/CustomerManagement";
import Settings from "./pages/Settings";
import StockStatement from "./pages/StockStatement";
import StockAlerts from "./pages/stockAlerts";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <>
      <ToastContainer />
      <StoreToken />
      <Router>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/customers-management"
              element={<CustomerManagement />}
            />
            <Route
              path="/categories-management"
              element={<CategoryManagement />}
            />
            <Route
              path="/products-management"
              element={<ProductManagement />}
            />
            <Route path="/sales-management" element={<SalesManagement />} />
            <Route path="/stock-statement" element={<StockStatement />} />
            <Route path="/stock-alerts" element={<StockAlerts />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="*" element={<NotFoundPage />} />
          {/* <Route path="/" element={<HomePage />} /> */}
        </Routes>
      </Router>
    </>
  );
};

export default App;
