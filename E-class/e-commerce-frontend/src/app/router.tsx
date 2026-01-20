import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AdminLayout from '@/layouts/AdminLayout'
import Home from '@/features/home/Home'
import ProductPage from '@/features/product/ProductPage'
import Login from '@/features/login/Login'
import DashboardPage from '@/layouts/Dashboard'
import UserManagementPage from '@/features/admin/UserManagement'
import ProductManagementPage from '@/features/admin/ProductManagement'
import RegisterPage from '@/features/login/RegisterPage'
import CustomerManagementPage from '@/features/admin/CustomerManagement'
import EmployeeManagementPage from '@/features/admin/EmployeeManagement'
import InventoryManagementPage from '@/features/admin/InventoryManagement'
import OrderManagementPage from '@/features/admin/OrderManagement'
import RevenueStatisticPage from '@/features/admin/RevenueStatistic'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'products',
        element: <ProductPage />
      }
    ]
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'users',
        element: <UserManagementPage />
      },
      {
        path: 'products',
        element: <ProductManagementPage />
      },
      {
        path: 'employees',
        element: <EmployeeManagementPage />
      },
      {
        path: 'customers',
        element: <CustomerManagementPage />
      },
      {
        path: 'inventory',
        element: <InventoryManagementPage />
      },
      {
        path: 'orders',
        element: <OrderManagementPage />
      },
      {
        path: 'revenue',
        element: <RevenueStatisticPage />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <RegisterPage />
  }
])
