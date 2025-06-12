import React, { Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import { MonitoringScreen } from './src/screens/MonitoringScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Lock screen orientation to portrait
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

const Tab = createBottomTabNavigator();

const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <SettingsProvider>
            <WebSocketProvider>
              <Suspense fallback={<LoadingFallback />}>
                <StatusBar style="auto" />
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
                        tabBarLabelStyle: {
                          fontSize: 12,
                          fontWeight: '500',
                        },
                        tabBarStyle: {
                          height: Platform.OS === 'ios' ? 88 : 60,
                          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                          paddingTop: 8,
                          backgroundColor: '#fff',
                          borderTopWidth: 1,
                          borderTopColor: '#e0e0e0',
                          elevation: 0,
                          shadowOpacity: 0,
                        },
                        tabBarAccessibilityLabel: `${route.name} tab`,
                        tabBarTestID: `${route.name}-tab`,
                        headerShown: false,
                      })}
                    >
                      <Tab.Screen 
                        name="Monitor" 
                        component={MonitoringScreen}
                        options={{
                          tabBarLabel: 'Monitor',
                          tabBarAccessibilityLabel: 'Monitor sensor data and fall detection',
                        }}
                      />
                      <Tab.Screen 
                        name="Settings" 
                        component={SettingsScreen}
                        options={{
                          tabBarLabel: 'Settings',
                          tabBarAccessibilityLabel: 'Configure app settings and user profile',
                        }}
                      />
                    </Tab.Navigator>
                  </NavigationContainer>
                </SafeAreaView>
              </Suspense>
            </WebSocketProvider>
          </SettingsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
