import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardPage from "../pages/DashboardPage";
import FoodCategoryManagementPage from "../pages/FoodCategoryManagementPage";
import KitchenQueuePage from "../pages/KitchenQueuePage";
import LoginPage from "../pages/LoginPage";
import OrdersPage from "../pages/OrdersPage";
import UserManagementPage from "../pages/UserManagementPage";
import IngredientCategoryManagementPage from "../pages/IngredientCategoryManagementPage";
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

export default function AppRouter() {
  return (
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
        <Route path="food-categories" element={<FoodCategoryManagementPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="kitchen-queue" element={<KitchenQueuePage />} />
        <Route
            path="ingredient-categories" element={<IngredientCategoryManagementPage />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
