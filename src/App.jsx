import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import Calculators from './pages/Calculators';
import Contact from './pages/Contact';
import Recipes from './pages/Recipes';



const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/calculators',
    element: <Calculators />,
  },
  {
    path: '/Contact',
    element: <Contact />,
  },
  {
    path: '/Recipes',
    element: <Recipes />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;