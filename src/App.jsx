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

const App = () => {
  return (
    <>
      <ToastContainer />
      <StoreToken />
      <Router>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/customers-management"
            element={<CustomerManagement />}
          />
          <Route
            path="/categories-management"
            element={<CategoryManagement />}
          />
          <Route path="/products-management" element={<ProductManagement />} />
          <Route path="/sales-management" element={<SalesManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
