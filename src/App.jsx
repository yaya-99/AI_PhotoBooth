import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Register from './components/Register';
import Photobooth from './pages/Photobooth';
import PhotoStripGallery from './components/PhotoStripGallery';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return currentUser ? children : <Navigate to="/login" />;
};

// Home/Landing Page Component
const Home = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Welcome to AI Photo Booth! 📸
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create amazing photo strips with AI-powered effects and filters
          </p>
          
          {currentUser ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 mb-6">
                Ready to create some memories, {currentUser.email}?
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="/photobooth"
                  className="px-8 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transform hover:scale-105 transition-all shadow-lg"
                >
                  Start Photo Session
                </a>
                <a
                  href="/gallery"
                  className="px-8 py-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transform hover:scale-105 transition-all shadow-lg"
                >
                  View My Strips
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 mb-6">
                Sign in to start creating your photo strips!
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="/login"
                  className="px-8 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transform hover:scale-105 transition-all shadow-lg"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="px-8 py-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transform hover:scale-105 transition-all shadow-lg"
                >
                  Sign Up
                </a>
              </div>
            </div>
          )}
        </div>
        
        {/* Feature Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-xl font-semibold mb-2">Multi-Photo Strips</h3>
            <p className="text-gray-600">
              Capture 3-4 photos in sequence just like a real photo booth
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">AI Effects</h3>
            <p className="text-gray-600">
              Apply AI-powered filters, backgrounds, and fun effects
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-all">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">Custom Themes</h3>
            <p className="text-gray-600">
              Choose from wedding, birthday, and classic themes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/photobooth"
              element={
                <ProtectedRoute>
                  <Photobooth />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gallery"
              element={
                <ProtectedRoute>
                  <GalleryPage />
                </ProtectedRoute>
              }
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Toast Notifications */}
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#4ade80',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Gallery Page Wrapper Component
const GalleryPage = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 py-8">
      <PhotoStripGallery userId={currentUser?.uid} />
    </div>
  );
};

export default App;