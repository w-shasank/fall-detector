import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { MonitoringScreen } from './src/screens/MonitoringScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Lock screen orientation to portrait
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SettingsProvider>
          <WebSocketProvider>
            <NavigationContainer>
              <Tab.Navigator
                screenOptions={({ route }) => ({
                  tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Monitor') {
                      iconName = focused ? 'pulse' : 'pulse-outline';
                    } else if (route.name === 'Settings') {
                      iconName = focused ? 'settings' : 'settings-outline';
                    } else {
                      iconName = 'help-circle-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                  },
                  tabBarActiveTintColor: '#007AFF',
                  tabBarInactiveTintColor: 'gray',
                })}
              >
                <Tab.Screen 
                  name="Monitor" 
                  component={MonitoringScreen}
                  options={{
                    headerShown: false,
                  }}
                />
                <Tab.Screen 
                  name="Settings" 
                  component={SettingsScreen}
                  options={{
                    headerShown: false,
                  }}
                />
              </Tab.Navigator>
            </NavigationContainer>
          </WebSocketProvider>
        </SettingsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
