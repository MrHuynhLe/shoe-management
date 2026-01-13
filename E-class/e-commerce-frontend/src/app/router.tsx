import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'

import HomePage from '@/features/home/HomePage'
import Products from '@/features/product/Products'
import Login from '@/features/login/Login'

export const router = createBrowserRouter([
  {
    element: <MainLayout />, 
    children: [
      {
        index: true,
        element: <HomePage/>
      },
      {
        path: 'products',
        element: <Products />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  }
])
