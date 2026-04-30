import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/i18n/I18nContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";
import Layout from "@/components/Layout/Layout";
import Home from "@/pages/Home/Home";
import Products from "@/pages/Products/Products";
import ProductDetail from "@/pages/Products/ProductDetail";
import MenuPage from "@/pages/Menu/Menu";
import Catering from "@/pages/Catering/Catering";
import Resellers from "@/pages/Resellers/Resellers";
import Blog from "@/pages/Blog/Blog";
import BlogPost from "@/pages/Blog/BlogPost";
import Cart from "@/pages/Cart/Cart";
import CheckoutSuccess from "@/pages/Cart/CheckoutSuccess";
import AdminLogin from "@/pages/Admin/AdminLogin";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import RequireAuth from "@/pages/Admin/RequireAuth";
import LoginPage from "@/pages/Account/LoginPage";
import RegisterPage from "@/pages/Account/RegisterPage";
import AccountPage from "@/pages/Account/AccountPage";
import RequireCustomer from "@/pages/Account/RequireCustomer";
import OrderDetailPage from "@/pages/Account/OrderDetailPage";

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <CustomerAuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/catering" element={<Catering />} />
              <Route path="/resellers" element={<Resellers />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/account"
                element={
                  <RequireCustomer>
                    <AccountPage />
                  </RequireCustomer>
                }
              />
              <Route
                path="/account/orders/:sessionId"
                element={
                  <RequireCustomer>
                    <OrderDetailPage />
                  </RequireCustomer>
                }
              />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminDashboard />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </CartProvider>
        </CustomerAuthProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
