import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const createUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      role: 'user', // default role
      totalPhotos: 0
    });
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    // Create user document if it doesn't exist
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        role: 'user',
        totalPhotos: 0
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Firestore functions
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

export const updateUserPhotoCount = async (userId, increment = 1) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentCount = userDoc.data().totalPhotos || 0;
      await setDoc(userRef, {
        totalPhotos: currentCount + increment
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error updating photo count:', error);
  }
};

// Storage functions
export const uploadPhoto = async (file, userId, metadata = {}) => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, `photos/${fileName}`);
    
    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file, {
      customMetadata: metadata
    });
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload progress:', progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadURL,
            path: fileName,
            size: file.size
          });
        }
      );
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

export const deletePhoto = async (photoPath) => {
  try {
    const storageRef = ref(storage, `photos/${photoPath}`);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

// Photo metadata functions
export const savePhotoMetadata = async (photoData) => {
  try {
    const photoRef = doc(collection(db, 'photos'));
    await setDoc(photoRef, {
      ...photoData,
      createdAt: serverTimestamp()
    });
    return photoRef.id;
  } catch (error) {
    console.error('Error saving photo metadata:', error);
    throw error;
  }
};

export const getUserPhotos = async (userId, limitCount = 20) => {
  try {
    const photosQuery = query(
      collection(db, 'photos'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(photosQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user photos:', error);
    throw error;
  }
};

export const deletePhotoMetadata = async (photoId) => {
  try {
    await deleteDoc(doc(db, 'photos', photoId));
  } catch (error) {
    console.error('Error deleting photo metadata:', error);
    throw error;
  }
};

// Admin functions
export const getUsageStats = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const photosSnapshot = await getDocs(collection(db, 'photos'));
    
    const totalUsers = usersSnapshot.size;
    const totalPhotos = photosSnapshot.size;
    
    // Calculate storage used (approximate)
    let totalStorage = 0;
    photosSnapshot.forEach(doc => {
      totalStorage += doc.data().size || 0;
    });
    
    return {
      totalUsers,
      totalPhotos,
      totalStorage,
      averagePhotosPerUser: totalUsers > 0 ? (totalPhotos / totalUsers).toFixed(2) : 0
    };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    throw error;
  }
};

// Export auth state listener
export { onAuthStateChanged };