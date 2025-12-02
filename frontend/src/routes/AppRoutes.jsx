import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import OrdersPage from '../pages/orders/OrdersPage'
import InventoryPage from '../pages/inventory/InventoryPage'
import PurchaseOrdersPage from '../pages/purchaseOrders/PurchaseOrdersPage'
import AnalyticsPage from '../pages/analytics/AnalyticsPage'
import TablesPage from '../pages/tables/TablesPage'
import ReservationsPage from '../pages/reservations/ReservationsPage'
import RecipesPage from '../pages/recipes/RecipesPage'
import MenuItemsPage from '../pages/menuItems/MenuItemsPage'
import CategoriesPage from '../pages/categories/CategoriesPage'
import SuppliersPage from '../pages/suppliers/SuppliersPage'
import NotFoundPage from '../pages/errors/NotFoundPage'

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="inventory" element={<InventoryPage />} />
      <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="tables" element={<TablesPage />} />
      <Route path="reservations" element={<ReservationsPage />} />
      <Route path="recipes" element={<RecipesPage />} />
      <Route path="menu-items" element={<MenuItemsPage />} />
      <Route path="categories" element={<CategoriesPage />} />
      <Route path="suppliers" element={<SuppliersPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)

export default AppRoutes
