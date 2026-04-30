import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import CartDrawer from "@/components/CartDrawer/CartDrawer";

export default function Layout() {
  return (
    <>
      <Header />
      <main className="page-enter">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
