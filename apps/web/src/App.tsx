import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './components/Login.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import { AppStateProvider } from './contexts/AppStateContext.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import ClientKBPage from './pages/ClientKBPage.tsx'
import ClientsPage from './pages/ClientsPage.tsx'
import HomePage from './pages/HomePage.tsx'
import AdminPage from './pages/AdminPage.tsx'
import PromptsPage from './pages/PromptsPage.tsx'
import PracticesPage from './pages/PracticesPage.tsx'
import PracticeTemplatesPage from './pages/PracticeTemplatesPage.tsx'

function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ClientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/:clientId"
              element={
                <ProtectedRoute>
                  <ClientKBPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="prompts" replace />} />
              <Route path="prompts" element={<PromptsPage />} />
              <Route path="practices" element={<PracticesPage />} />
              <Route path="practice-templates" element={<PracticeTemplatesPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </AppStateProvider>
    </BrowserRouter>
  )
}

export default App
