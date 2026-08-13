import React, { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Spin } from "antd";
import DashboardLayout from "../layouts/DashboardLayout";
import ErrorBoundary from "../components/ErrorBoundary";
import { useAuth } from "../features/auth/AuthContext";

// Lazy-loaded pages for optimized production bundle splitting
const LoginPage = lazy(() => import("../pages/LoginPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const FoodCategoryManagementPage = lazy(() => import("../pages/FoodCategoryManagementPage"));
const FoodManagementPage = lazy(() => import("../pages/FoodManagementPage"));
const KitchenQueuePage = lazy(() => import("../pages/KitchenQueuePage"));
const OrdersPage = lazy(() => import("../pages/OrdersPage"));
const StaffManagementPage = lazy(() => import("../pages/StaffManagementPage"));
const SupplierDetailPage = lazy(() => import("../pages/SupplierDetailPage"));
const SupplierManagementPage = lazy(() => import("../pages/SupplierManagementPage"));
const UserManagementPage = lazy(() => import("../pages/UserManagementPage"));
const MenuSchedulePage = lazy(() => import("../features/menuSchedules/pages/MenuSchedulePage"));
const MenuScheduleDetailPage = lazy(() => import("../features/menuSchedules/pages/MenuScheduleDetailPage"));
const IngredientCategoryManagementPage = lazy(() => import("../pages/IngredientCategoryManagementPage"));
const IngredientManagementPage = lazy(() => import("../pages/IngredientManagementPage"));
const InventoryTransactionHistoryPage = lazy(() => import("../pages/InventoryTransactionHistoryPage"));
const KitchenFoodManagementPage = lazy(() => import("../pages/KitchenFoodManagementPage"));
const ActivityLogPage = lazy(() => import("../pages/ActivityLogPage"));
const RevenueReportPage = lazy(() => import("../pages/RevenueReportPage"));
const PeakHourReportPage = lazy(() => import("../pages/PeakHourReportPage"));
const OrderStatisticsReportPage = lazy(() => import("../pages/OrderStatisticsReportPage"));
const PopularFoodReportPage = lazy(() => import("../pages/PopularFoodReportPage"));
const RatingsPage = lazy(() => import("../features/ratings/pages/RatingsPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));

function PageLoader() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <Spin size="large" tip="Loading..." />
    </div>
  );
}

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
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
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
            <Route path="foods" element={<FoodManagementPage />} />
            <Route path="food-categories" element={<FoodCategoryManagementPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="kitchen-foods" element={<KitchenFoodManagementPage />} />
            <Route path="kitchen-queue" element={<KitchenQueuePage />} />
            <Route path="menu-schedules" element={<MenuSchedulePage />} />
            <Route
              path="menu-schedules/:id"
              element={<MenuScheduleDetailPage />}
            />
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
            <Route path="reports/revenue" element={<RevenueReportPage />} />
            <Route path="reports/peak-hour" element={<PeakHourReportPage />} />
            <Route
              path="reports/order-statistics"
              element={<OrderStatisticsReportPage />}
            />
            <Route
              path="/reports/popular-food"
              element={<PopularFoodReportPage />}
            />
            <Route path="activity-logs" element={<ActivityLogPage />} />
            <Route path="ratings" element={<RatingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
