import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './componets/Layout/Layout';
import Home from './componets/Home/Home';
import Profile from './componets/Profile/Profile';
import Login from './componets/Login/Login';
import Register from './componets/Register/Register';
import ProtectedRoute from './componets/ProtectedRoute/ProtectedRoute';
import Universities from './componets/Universities/Universities';
import UniversityDetails from './componets/UniversityDetails/UniversityDetails';

const router = createBrowserRouter([
  {
    path: '/', element: <Layout />, children: [
      { index: true, element: <Home /> },
      { path: 'home', element: <Home /> },
      { path: 'universities', element: <Universities /> },
      { path: 'universities/:id', element: <UniversityDetails /> },
      { path: 'profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
