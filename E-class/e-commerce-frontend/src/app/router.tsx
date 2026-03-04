import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";

import Home from "@/features/home/Home";
import ProductPage from "@/features/product/ProductPage";
import ProductDetailPage from "@/features/product/ProductDetailPage";
import CartPage from "@/features/cart/CartPage";
import AccountPage from "@/layouts/Account";
import MyOrdersPage from "@/features/cart/MyOrdersPage";

import Login from "@/features/login/Login";
import RegisterPage from "@/features/login/RegisterPage";

import DashboardPage from "@/layouts/Dashboard";
import UserManagementPage from "@/features/admin/UserManagement";
import ProductManagementPage from "@/features/admin/ProductManagement";
import CustomerManagementPage from "@/features/admin/CustomerManagement";
import EmployeeManagementPage from "@/features/admin/EmployeeManagement";
import InventoryManagementPage from "@/features/admin/InventoryManagement";
import OrderManagementPage from "@/features/admin/OrderManagement";
import RevenueStatisticPage from "@/features/admin/RevenueStatistic";
import BrandManagementPage from "@/features/admin/BrandManagement";
import CategoryManagementPage from "@/features/admin/CategoryManagement";
import ColorManagementPage from "@/features/admin/ColorManagement";
import SizeManagementPage from "@/features/admin/SizeManagement";
import MaterialManagementPage from "@/features/admin/MaterialManagement";

// Guards
import { RequireAuth, RequirePerm } from "@/app/auth/guards";

// 403 page
import Forbidden from "@/features/login/Forbidden";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <ProductPage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "account", element: <AccountPage /> },
      { path: "my-orders", element: <MyOrdersPage /> },
    ],
  },

  { path: "/login", element: <Login /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/403", element: <Forbidden /> },

  {
    path: "/admin",
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      // ✅ Dashboard: chỉ cần đăng nhập là vào được (tránh bị 403 khi mới setup)
      { index: true, element: <DashboardPage /> },

      // Users
      {
        path: "users",
        element: (
          <RequirePerm anyPerms={["USER_READ"]}>
            <UserManagementPage />
          </RequirePerm>
        ),
      },

      // Products
      {
        path: "products",
        element: (
          <RequirePerm
            anyPerms={[
              "PRODUCT_READ",
              "PRODUCT_CREATE",
              "PRODUCT_UPDATE",
              "PRODUCT_DELETE",
            ]}
          >
            <ProductManagementPage />
          </RequirePerm>
        ),
      },

      // Brands
      {
        path: "brands",
        element: (
          <RequirePerm anyPerms={["BRAND_READ", "PRODUCT_READ"]}>
            <BrandManagementPage />
          </RequirePerm>
        ),
      },

      // Categories
      {
        path: "categories",
        element: (
          <RequirePerm anyPerms={["CATEGORY_READ", "PRODUCT_READ"]}>
            <CategoryManagementPage />
          </RequirePerm>
        ),
      },

      // Attributes group
      {
        path: "attributes",
        children: [
          {
            path: "colors",
            element: (
              <RequirePerm anyPerms={["COLOR_READ", "ATTRIBUTE_READ", "PRODUCT_READ"]}>
                <ColorManagementPage />
              </RequirePerm>
            ),
          },
          {
            path: "sizes",
            element: (
              <RequirePerm anyPerms={["SIZE_READ", "ATTRIBUTE_READ", "PRODUCT_READ"]}>
                <SizeManagementPage />
              </RequirePerm>
            ),
          },
          {
            path: "materials",
            element: (
              <RequirePerm anyPerms={["MATERIAL_READ", "ATTRIBUTE_READ", "PRODUCT_READ"]}>
                <MaterialManagementPage />
              </RequirePerm>
            ),
          },
        ],
      },

      // Employees
      {
        path: "employees",
        element: (
          <RequirePerm anyPerms={["EMPLOYEE_READ"]}>
            <EmployeeManagementPage />
          </RequirePerm>
        ),
      },

      // Customers
      {
        path: "customers",
        element: (
          <RequirePerm anyPerms={["CUSTOMER_READ"]}>
            <CustomerManagementPage />
          </RequirePerm>
        ),
      },

      // Inventory
      {
        path: "inventory",
        element: (
          <RequirePerm anyPerms={["INVENTORY_READ", "PRODUCT_READ"]}>
            <InventoryManagementPage />
          </RequirePerm>
        ),
      },

      // Orders
      {
        path: "orders",
        element: (
          <RequirePerm
            anyPerms={[
              "ORDER_READ",
              "ORDER_CREATE",
              "ORDER_UPDATE_STATUS",
              "ORDER_CANCEL",
            ]}
          >
            <OrderManagementPage />
          </RequirePerm>
        ),
      },

      // Revenue
      {
        path: "revenue",
        element: (
          <RequirePerm anyPerms={["REVENUE_READ"]}>
            <RevenueStatisticPage />
          </RequirePerm>
        ),
      },
    ],
  },
]);