import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { Routes, Route } from 'react-router-dom';
import LatestCollection from "./Components/Hero"
import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Footer from './Components/Footer/Footer';
import men_banner from './Components/Assets/banner_mens.png';
import women_banner from './Components/Assets/banner_women.png';
import kid_banner from './Components/Assets/banner_kids.png';
import Company from "./Pages/Company";
import ProductsPage from "./Pages/ProductsPage";
import Offices from "./Pages/Offices";
import About from "./Pages/About";
import Contact from "./Pages/Contact";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/latest-collection" element={<LatestCollection />} />
        <Route path='/' element={<Shop />} />
        <Route path='/men' element={<ShopCategory banner={men_banner} category="Men" />} />
        <Route path='/women' element={<ShopCategory banner={women_banner} category="Women" />} />
        <Route path='/kids' element={<ShopCategory banner={kid_banner} category="Kids" />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<LoginSignup />} />
        <Route path="/company" element={<Company />} />
  <Route path="/products" element={<ProductsPage />} />
  <Route path="/offices" element={<Offices />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
