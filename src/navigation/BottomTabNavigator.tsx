import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, Platform } from 'react-native';
import { Compass, Crown } from 'lucide-react-native';
import ExploreScreen from '../screens/ExploreScreen';
import PremiumScreen from '../screens/PremiumScreen';
import { Colors } from '../constants/theme';

const Tab = createBottomTabNavigator();

const GlassTabBarBackground = () => (
  <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
);

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      id="main"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: GlassTabBarBackground,
        tabBarActiveTintColor: Colors.purple,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Explore') {
            return <Compass color={color} size={focused ? 28 : 24} />;
          } else if (route.name === 'Premium') {
            return <Crown color={color} size={focused ? 28 : 24} />;
          }
        },
      })}
    >
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Premium" component={PremiumScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 65,
    borderRadius: 35,
    backgroundColor: 'rgba(25, 25, 25, 0.5)',
    borderTopWidth: 0,
    elevation: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
