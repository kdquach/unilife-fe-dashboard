import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardPage from "../pages/DashboardPage";
import FoodCategoryManagementPage from "../pages/FoodCategoryManagementPage";
import KitchenQueuePage from "../pages/KitchenQueuePage";
import LoginPage from "../pages/LoginPage";
import OrdersPage from "../pages/OrdersPage";
import StaffManagementPage from "../pages/StaffManagementPage";
import SupplierDetailPage from "../pages/SupplierDetailPage";
import SupplierManagementPage from "../pages/SupplierManagementPage";
import UserManagementPage from "../pages/UserManagementPage";
import MenuSchedulePage from "../features/menuSchedules/pages/MenuSchedulePage";
import MenuScheduleDetailPage from "../features/menuSchedules/pages/MenuScheduleDetailPage";
import IngredientCategoryManagementPage from "../pages/IngredientCategoryManagementPage";
import IngredientManagementPage from "../pages/IngredientManagementPage";
import InventoryTransactionHistoryPage from "../pages/InventoryTransactionHistoryPage";
import KitchenFoodManagementPage from "../pages/KitchenFoodManagementPage";
import ActivityLogPage from "../pages/ActivityLogPage";
import { useAuth } from "../features/auth/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="staffs" element={<StaffManagementPage />} />
          <Route path="food-categories" element={<FoodCategoryManagementPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="kitchen-foods" element={<KitchenFoodManagementPage />} />
          <Route path="kitchen-queue" element={<KitchenQueuePage />} />
          <Route path="menu-schedules" element={<MenuSchedulePage />} />
          <Route path="menu-schedules/:id" element={<MenuScheduleDetailPage />} />
          <Route path="suppliers" element={<SupplierManagementPage />} />
          <Route path="suppliers/:id" element={<SupplierDetailPage />} />
          <Route path="ingredients" element={<IngredientManagementPage />} />
          <Route
            path="inventory-transactions"
            element={<InventoryTransactionHistoryPage />}
          />
          <Route
            path="ingredient-categories"
            element={<IngredientCategoryManagementPage />}
          />
          <Route path="activity-logs" element={<ActivityLogPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
