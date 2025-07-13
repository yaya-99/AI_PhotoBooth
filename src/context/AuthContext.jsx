import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
  auth, 
  createUser, 
  signIn, 
  signInWithGoogle,
  getUserData 
} from '../utils/firebase';

// Create auth context
const AuthContext = createContext({});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Fetch additional user data from Firestore
          const data = await getUserData(user.uid);
          setUserData(data);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up function
  const signUp = async (email, password, displayName) => {
    setError(null);
    try {
      const user = await createUser(email, password, displayName);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in function
  const signInEmail = async (email, password) => {
    setError(null);
    try {
      const user = await signIn(email, password);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Google sign in
  const signInGoogle = async () => {
    setError(null);
    try {
      const user = await signInWithGoogle();
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out function
  const signOut = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return userData?.role === 'admin';
  };

  // Context value
  const value = {
    user,
    userData,
    loading,
    error,
    signUp,
    signInEmail,
    signInGoogle,
    signOut,
    isAdmin,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};AuthContext.jsx