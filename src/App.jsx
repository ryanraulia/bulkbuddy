import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import MealPlan from './pages/MealPlan.jsx';
import Recipes from './pages/Recipes.jsx';
import Calculators from './pages/Calculators.jsx';
import Contact from './pages/Contact.jsx';
import Tips from './pages/Tips.jsx';
import Profile from './pages/Profile.jsx'; 
import SearchResults from './pages/SearchResults'; 
import Layout from './components/layout/Layout.jsx'; 
import AdminPage from './pages/Admin';


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mealplan" element={<MealPlan />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} /> 
          <Route path="/search" element={<SearchResults />} /> 
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;