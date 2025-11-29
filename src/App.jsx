import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import DirectoriesPage from './pages/DirectoriesPage';
import DirectoryModelsPage from './pages/DirectoryModelsPage';
import ModelDetailPage from './pages/ModelDetailPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<DirectoriesPage />} />
            <Route path="directory/:id" element={<DirectoryModelsPage />} />
            <Route path="directory/:id/model/:modelId" element={<ModelDetailPage />} />
            <Route path="directory/:id/model/:modelId/:section" element={<ModelDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
