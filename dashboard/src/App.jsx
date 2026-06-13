import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import "./css/style.css";
import "./charts/ChartjsConfig";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/categories/index";
import CategoryAdd from "./pages/categories/add";
import CategoryEdit from "./pages/categories/edit";
import CategoryFilters from "./pages/categoryFilters/index";
import CategoryFilterForm from "./pages/categoryFilters/CategoryFilterForm";
import FilterDefinitions from "./pages/filterDefinitions";
import Icons from "./pages/Icons";
import Genres from "./pages/Genres";
import GenreCreate from "./pages/GenreCreate";
import Platforms from "./pages/platforms";
import PlatformForm from "./pages/platforms/PlatformForm";
import Companies from "./pages/Companies";
import CompanyCreate from "./pages/CompanyCreate";
import Brands from "./pages/Brands";
import BrandForm from "./pages/BrandForm";
import Tags from "./pages/Tags";
import TagCreate from "./pages/TagCreate";
import Games from "./pages/games";
import GameForm from "./pages/games/GameForm";
import Products from "./pages/products";
import ProductForm from "./pages/products/ProductForm";
import {
  InsuranceCompanies,
  Insurances,
  Prices,
  ShippingMethods,
  Warranties,
  WarrantyCompanies,
} from "./pages/catalogEntities";
import {
  InsuranceCompanyForm,
  PriceForm,
  ShippingMethodForm,
  WarrantyCompanyForm,
} from "./pages/catalogEntities/forms";
import PolicyForm from "./pages/catalogEntities/PolicyForm";
import Articles from "./pages/articles";
import ArticleForm from "./pages/articles/ArticleForm";
import Sliders from "./pages/sliders";
import SliderForm from "./pages/sliders/SliderForm";
import AdminProfile from "./pages/AdminProfile";
import Approvals from "./pages/Approvals";
import ApprovalMessages from "./pages/ApprovalMessages";
import Users from "./pages/users";
import UserForm from "./pages/users/UserForm";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Auth from "./auth";

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
    document.querySelector("html").setAttribute("dir", "rtl");
  }, [location.pathname]);

  return (
    <Providers>
      <Toaster />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/"
          element={
            <Auth>
              <Dashboard />
            </Auth>
          }
        />
        <Route
          path="/profile"
          element={
            <Auth>
              <AdminProfile />
            </Auth>
          }
        />
        <Route
          path="/approvals"
          element={
            <Auth>
              <Approvals />
            </Auth>
          }
        />
        <Route
          path="/messages"
          element={
            <Auth>
              <ApprovalMessages />
            </Auth>
          }
        />
        <Route
          path="/users"
          element={
            <Auth>
              <Users />
            </Auth>
          }
        />
        <Route
          path="/users/edit/:id"
          element={
            <Auth>
              <UserForm />
            </Auth>
          }
        />
        <Route
          path="/categories"
          element={
            <Auth>
              <Categories />
            </Auth>
          }
        />
        <Route
          path="/categories/add"
          element={
            <Auth>
              <CategoryAdd />
            </Auth>
          }
        />
        <Route path="/categories/create" element={<Navigate to="/categories/add" replace />} />
        <Route
          path="/categories/edit/:id"
          element={
            <Auth>
              <CategoryEdit />
            </Auth>
          }
        />
        <Route
          path="/filter-definitions"
          element={
            <Auth>
              <FilterDefinitions />
            </Auth>
          }
        />
        <Route
          path="/category-filters"
          element={
            <Auth>
              <CategoryFilters />
            </Auth>
          }
        />
        <Route
          path="/category-filters/add"
          element={
            <Auth>
              <CategoryFilterForm />
            </Auth>
          }
        />
        <Route
          path="/category-filters/edit/:id"
          element={
            <Auth>
              <CategoryFilterForm mode="edit" />
            </Auth>
          }
        />
        <Route
          path="/icons"
          element={
            <Auth>
              <Icons />
            </Auth>
          }
        />
        <Route
          path="/genres"
          element={
            <Auth>
              <Genres />
            </Auth>
          }
        />
        <Route
          path="/genres/create"
          element={
            <Auth>
              <GenreCreate />
            </Auth>
          }
        />
        <Route
          path="/genres/edit/:id"
          element={
            <Auth>
              <GenreCreate mode="edit" />
            </Auth>
          }
        />
        <Route
          path="/platforms"
          element={
            <Auth>
              <Platforms />
            </Auth>
          }
        />
        <Route
          path="/platforms/create"
          element={
            <Auth>
              <PlatformForm />
            </Auth>
          }
        />
        <Route
          path="/platforms/edit/:id"
          element={
            <Auth>
              <PlatformForm mode="edit" />
            </Auth>
          }
        />
        <Route
          path="/companies"
          element={
            <Auth>
              <Companies />
            </Auth>
          }
        />
        <Route
          path="/companies/create"
          element={
            <Auth>
              <CompanyCreate />
            </Auth>
          }
        />
        <Route
          path="/companies/edit/:id"
          element={
            <Auth>
              <CompanyCreate mode="edit" />
            </Auth>
          }
        />
        <Route
          path="/brands"
          element={
            <Auth>
              <Brands />
            </Auth>
          }
        />
        <Route
          path="/brands/create"
          element={
            <Auth>
              <BrandForm />
            </Auth>
          }
        />
        <Route
          path="/brands/edit/:id"
          element={
            <Auth>
              <BrandForm mode="edit" />
            </Auth>
          }
        />
        <Route
          path="/tags"
          element={
            <Auth>
              <Tags />
            </Auth>
          }
        />
        <Route
          path="/tags/create"
          element={
            <Auth>
              <TagCreate />
            </Auth>
          }
        />
        <Route
          path="/tags/edit/:id"
          element={
            <Auth>
              <TagCreate mode="edit" />
            </Auth>
          }
        />
        <Route
          path="/games"
          element={
            <Auth>
              <Games />
            </Auth>
          }
        />
        <Route
          path="/games/create"
          element={
            <Auth>
              <GameForm />
            </Auth>
          }
        />
        <Route
          path="/games/edit/:id"
          element={
            <Auth>
              <GameForm mode="edit" />
            </Auth>
          }
        />
        <Route
          path="/products"
          element={
            <Auth>
              <Products />
            </Auth>
          }
        />
        <Route
          path="/products/create"
          element={
            <Auth>
              <ProductForm />
            </Auth>
          }
        />
        <Route
          path="/products/edit/:id"
          element={
            <Auth>
              <ProductForm mode="edit" />
            </Auth>
          }
        />
        <Route path="/warranty-companies" element={<Auth><WarrantyCompanies /></Auth>} />
        <Route path="/warranty-companies/create" element={<Auth><WarrantyCompanyForm /></Auth>} />
        <Route path="/warranty-companies/edit/:id" element={<Auth><WarrantyCompanyForm mode="edit" /></Auth>} />
        <Route path="/warranties" element={<Auth><Warranties /></Auth>} />
        <Route path="/warranties/create" element={<Auth><PolicyForm kind="warranty" /></Auth>} />
        <Route path="/warranties/edit/:id" element={<Auth><PolicyForm kind="warranty" mode="edit" /></Auth>} />
        <Route path="/insurance-companies" element={<Auth><InsuranceCompanies /></Auth>} />
        <Route path="/insurance-companies/create" element={<Auth><InsuranceCompanyForm /></Auth>} />
        <Route path="/insurance-companies/edit/:id" element={<Auth><InsuranceCompanyForm mode="edit" /></Auth>} />
        <Route path="/insurances" element={<Auth><Insurances /></Auth>} />
        <Route path="/insurances/create" element={<Auth><PolicyForm kind="insurance" /></Auth>} />
        <Route path="/insurances/edit/:id" element={<Auth><PolicyForm kind="insurance" mode="edit" /></Auth>} />
        <Route path="/prices" element={<Auth><Prices /></Auth>} />
        <Route path="/prices/create" element={<Auth><PriceForm /></Auth>} />
        <Route path="/prices/edit/:id" element={<Auth><PriceForm mode="edit" /></Auth>} />
        <Route path="/shipping-methods" element={<Auth><ShippingMethods /></Auth>} />
        <Route path="/shipping-methods/create" element={<Auth><ShippingMethodForm /></Auth>} />
        <Route path="/shipping-methods/edit/:id" element={<Auth><ShippingMethodForm mode="edit" /></Auth>} />
        <Route
          path="/articles"
          element={
            <Auth>
              <Articles />
            </Auth>
          }
        />
        <Route
          path="/articles/create"
          element={
            <Auth>
              <ArticleForm />
            </Auth>
          }
        />
        <Route
          path="/articles/edit/:id"
          element={
            <Auth>
              <ArticleForm mode="edit" />
            </Auth>
          }
        />
        <Route
          path="/sliders"
          element={
            <Auth>
              <Sliders />
            </Auth>
          }
        />
        <Route
          path="/sliders/create"
          element={
            <Auth>
              <SliderForm />
            </Auth>
          }
        />
        <Route
          path="/sliders/edit/:id"
          element={
            <Auth>
              <SliderForm mode="edit" />
            </Auth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Providers>
  );
}

export default App;


