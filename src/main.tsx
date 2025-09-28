import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import ProblemList from './components/ProblemList'
import ProblemPage from './components/ProblemPage'
import GeneratePage from './components/GeneratePage'
import ReportPage from './components/ReportPage'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ProblemList /> },
      { path: 'p/:slug', element: <ProblemPage /> },
      { path: 'generate', element: <GeneratePage /> },
      { path: 'report', element: <ReportPage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
