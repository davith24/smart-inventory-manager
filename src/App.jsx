import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import BusinessManagement from "./pages/client/BusinessManagement";
import CategoryManagement from "./pages/client/CategoryManagement";
import SignInPage from "./pages/auth/SignInPage";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminUserEdit from "./pages/admin/AdminUserEdit";
import CartPage from "./pages/customer/CartPage";
// import ZTestPage from "./pages/ZTestPage";
import AdminSubscriptionPlanManagementPage from "./pages/admin/AdminSubscriptionPlanManagement";
import SubscriptionPlan from "./pages/SubscriptionPlanPage";
import DashboardPage from "./pages/admin/AdminDashboard";
import AdminRoleManagement from "./pages/admin/AdminRoleManagement";
import AdminReport from "./pages/admin/AdminReport";
import AdminAnalysis from "./pages/admin/AdminAnalysis";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminBusinessList from "./pages/admin/AdminBusinessList";
import Dashboard from "./pages/client/Dashboard";
import TelegramManagement from "./pages/client/TelegramManagement";
import ItemManagement from "./pages/client/ItemManagement";
import StoreToken from "./api/StoreToken";
import ItemDetailPage from "./pages/customer/ItemDetailPage";
import MenuPage from "./pages/customer/MenuPage";
import { CartProvider } from "./contexts/CartContext"; // Cart Context
import QRCodeGenerator from "./pages/customer/QRCodePage"


const App = () => {
  return (
    <>
      <ToastContainer />
      <StoreToken />
      <Router>
        <CartProvider>
          {" "}
          {/* <- Wrap here */}
          <Routes>
            {/* General  */}
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/subscription-plan" element={<SubscriptionPlan />} />
            <Route path="/menu/:id" element={<MenuPage />} />
            <Route path="/item/:id" element={<ItemDetailPage />} />
            <Route path="/cart" element={<CartPage />} /> {/* Added CartPage */}
           
            <Route path="/QRCodePage" element={<QRCodeGenerator/>} />
            {/* Client */}
            <Route path="/client/dashboard" element={<Dashboard />} />
            <Route
              path="/client/telegram-management"
              element={<TelegramManagement />}
            />
            <Route
              path="/client/category-management"
              element={<CategoryManagement />}
            />
            <Route
              path="/client/business-management"
              element={<BusinessManagement />}
            />
            <Route
              path="/client/item-management"
              element={<ItemManagement />}
            />
            {/* Admin */}
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route
              path="/admin/user-management"
              element={<AdminUserManagement />}
            />
            <Route path="/admin/users/:id" element={<AdminUserEdit />} />
            <Route
              path="/admin/role-management"
              element={<AdminRoleManagement />}
            />
            <Route
              path="/admin/subscription-plan-management"
              element={<AdminSubscriptionPlanManagementPage />}
            />
            <Route
              path="/admin/business-lists"
              element={<AdminBusinessList />}
            />
            <Route path="/admin/reports" element={<AdminReport />} />
            <Route path="/admin/analysis" element={<AdminAnalysis />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            {/* <Route path="/test" element={<ZTestPage />} /> */}
          </Routes>
        </CartProvider>
      </Router>
    </>
  );
};

export default App;
