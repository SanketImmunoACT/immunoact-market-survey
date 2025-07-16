import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import SurveyForm from './components/SurveyForm'
import Dashboard from './components/Dashboard'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route path="/" element={<SurveyForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Layout>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'text-sm',
          }}
        />
      </div>
    </Router>
  )
}

export default App