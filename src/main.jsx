import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home.jsx'
import { AuthLayout, Login } from './components/index.js'


import AddPost from "./pages/AddPost";
import Signup from './pages/Signup'
import EditPost from "./pages/EditPost";

import Post from "./pages/Post";

import AllPosts from "./pages/AllPost";
import Dashboard from './pages/Dashboard.jsx'
import ManagePosts from './pages/ManagePosts.jsx'
import SavedPosts from './pages/SavedPosts.jsx'
import ProfileSettings from './pages/ProfileSettings.jsx'
import AccountSettings from './pages/AccountSettings.jsx'
import Search from './pages/Search.jsx'
import AuthorProfile from './pages/AuthorProfile.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
        {
            path: "/",
            element: <Home />,
        },
        {
            path: "/posts",
            element: <AllPosts />,
        },
        {
            path: "/all-posts",
            element: <Navigate to="/posts" replace />,
        },
        {
            path: "/search",
            element: <Search />,
        },
        {
            path: "/authors/:id",
            element: <AuthorProfile />,
        },
        {
            path: "/login",
            element: (
                <AuthLayout authentication={false}>
                    <Login />
                </AuthLayout>
            ),
        },
        {
            path: "/signup",
            element: (
                <AuthLayout authentication={false}>
                    <Signup />
                </AuthLayout>
            ),
        },
        {
            path: "/dashboard",
            element: (
                <AuthLayout authentication>
                    <Dashboard />
                </AuthLayout>
            ),
        },
        {
            path: "/dashboard/posts",
            element: (
                <AuthLayout authentication>
                    <ManagePosts />
                </AuthLayout>
            ),
        },
        {
            path: "/dashboard/posts/new",
            element: (
                <AuthLayout authentication>
                    <AddPost />
                </AuthLayout>
            ),
        },
        {
            path: "/dashboard/posts/:slug/edit",
            element: (
                <AuthLayout authentication>
                    <EditPost />
                </AuthLayout>
            ),
        },
        {
            path: "/dashboard/saved",
            element: (
                <AuthLayout authentication>
                    <SavedPosts />
                </AuthLayout>
            ),
        },
        {
            path: "/dashboard/profile",
            element: (
                <AuthLayout authentication>
                    <ProfileSettings />
                </AuthLayout>
            ),
        },
        {
            path: "/dashboard/account",
            element: (
                <AuthLayout authentication>
                    <AccountSettings />
                </AuthLayout>
            ),
        },
        {
            path: "/add-post",
            element: <Navigate to="/dashboard/posts/new" replace />,
        },
        {
            path: "/edit-post/:slug",
            element: <Navigate to="/dashboard/posts/:slug/edit" replace />,
        },
        {
            path: "/post/:slug",
            element: <Post />,
        },
    ],
},
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
    <RouterProvider router={router}/>
    </Provider>
  </React.StrictMode>,
)
