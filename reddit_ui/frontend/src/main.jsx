import { StrictMode } from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import Login from './Login.jsx'
import Home from './Home.jsx'
import Dm from './Dm.jsx'
import Post from './Post.jsx'
import Replies from './Replies.jsx'
import Logs from './Logs.jsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom"

const router = createBrowserRouter([
  {path: "/", element: <Login/>},
  {path: "/Login", element: <Login/>},
  {path: "/Home", element: <Home/>},
  {path: "/Dm", element: <Dm/>},
  {path: "/Post", element: <Post/>},
  {path: "/Replies", element: <Replies/>},
  {path: "/Logs", element: <Logs/>}
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router = {router}/>
  </StrictMode>
)
