import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { db } from '../firebase/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface AppContextType {
  isPremium: boolean;
  deviceId: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    const initDevice = async () => {
      let id = await AsyncStorage.getItem('device_id');
      if (!id) {
        id = Device.osBuildId || Math.random().toString(36).substring(7);
        await AsyncStorage.setItem('device_id', id);
      }
      setDeviceId(id);

      // Listen for premium status from Firestore
      const unsub = onSnapshot(doc(db, 'approved_devices', id), (doc) => {
        if (doc.exists()) {
          setIsPremium(doc.data().isPremium);
        }
      });

      return () => unsub();
    };

    initDevice();
  }, []);

  return (
    <AppContext.Provider value={{ isPremium, deviceId }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
