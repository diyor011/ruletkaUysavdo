import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import PrivateRoute from './components/PrivateRoute.jsx'
import LoginPage from './pages/login.jsx'



const router = createBrowserRouter([

  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <App /> {/* App.js ichida sening Dashboard UIing bor */}
      </PrivateRoute>
    ),
  },
])

createRoot(document.getElementById('root')).render(
<Provider store={store}>
<RouterProvider router={router}/>
</Provider>
)
