import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { SettingsCard } from '../components/SettingsCard';
import { URL_VALIDATION } from '../constants/config';
import Constants from 'expo-constants';

export const SettingsScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateWebSocketUrl, updateUserProfile, toggleSound, toggleVibration } = useSettings();
  const { isConnected, isConnecting, reconnect } = useWebSocket();

  // Form state
  const [serverUrl, setServerUrl] = useState(settings.serverUrl);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(settings.userProfile);

  // URL validation
  const validateUrl = (url: string): boolean => {
    if (!url) return false;
    if (!url.startsWith(URL_VALIDATION.PROTOCOL)) return false;
    if (url.length > URL_VALIDATION.MAX_LENGTH) return false;
    return URL_VALIDATION.PATTERN.test(url);
  };

  // Test connection
  const testConnection = async () => {
    if (!validateUrl(serverUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid WebSocket URL');
      return;
    }

    setIsTestingConnection(true);
    try {
      // Create a temporary WebSocket connection
      const ws = new WebSocket(serverUrl);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('Connection timeout - server did not respond'));
        }, 10000); // Increased to 10 seconds

        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve(true);
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          reject(new Error('Connection failed - server may be unreachable'));
        };

        ws.onclose = (event) => {
          if (event.code !== 1000) { // 1000 is normal closure
            clearTimeout(timeout);
            reject(new Error(`Connection closed: ${event.reason || 'Unknown reason'}`));
          }
        };
      });

      Alert.alert('Success', 'Connection test successful');
    } catch (error) {
      Alert.alert(
        'Connection Test Failed',
        error instanceof Error ? error.message : 'Failed to connect to the server'
      );
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Save URL
  const saveUrl = async () => {
    if (!validateUrl(serverUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid WebSocket URL');
      return;
    }

    setIsSaving(true);
    try {
      await updateWebSocketUrl(serverUrl);
      Alert.alert('Success', 'Server URL updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save server URL');
    } finally {
      setIsSaving(false);
    }
  };

  // Save user profile
  const saveUserProfile = async () => {
    try {
      await updateUserProfile(userProfile);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Server Configuration */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Server Configuration
        </Text>
        <SettingsCard
          title="Server URL"
          description="WebSocket server address"
          icon="server"
          type="input"
          value={serverUrl}
          onValueChange={(value) => setServerUrl(value as string)}
          placeholder="ws://server:port"
        />
        <View style={styles.buttonRow}>
          <SettingsCard
            title="Test Connection"
            icon="checkmark-circle"
            type="button"
            onPress={testConnection}
            disabled={isTestingConnection || !validateUrl(serverUrl)}
          />
          <SettingsCard
            title="Save URL"
            icon="save"
            type="button"
            onPress={saveUrl}
            disabled={isSaving || !validateUrl(serverUrl)}
          />
        </View>
        <View style={styles.connectionStatus}>
          <Ionicons
            name={isConnected ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={isConnected ? theme.colors.success : theme.colors.error}
          />
          <Text style={[styles.statusText, { color: theme.colors.text }]}>
            {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>

      {/* User Profile */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          User Profile
        </Text>
        <SettingsCard
          title="Name"
          type="input"
          value={userProfile.name}
          onValueChange={(value) => setUserProfile({ ...userProfile, name: value as string })}
          placeholder="Enter your name"
        />
        <SettingsCard
          title="Age"
          type="input"
          value={userProfile.age.toString()}
          onValueChange={(value) => setUserProfile({ ...userProfile, age: parseInt(value as string) || 0 })}
          placeholder="Enter your age"
          keyboardType="numeric"
        />
        <SettingsCard
          title="Weight (kg)"
          type="input"
          value={userProfile.weight.toString()}
          onValueChange={(value) => setUserProfile({ ...userProfile, weight: parseFloat(value as string) || 0 })}
          placeholder="Enter your weight"
          keyboardType="numeric"
        />
        <SettingsCard
          title="Height (cm)"
          type="input"
          value={userProfile.height.toString()}
          onValueChange={(value) => setUserProfile({ ...userProfile, height: parseFloat(value as string) || 0 })}
          placeholder="Enter your height"
          keyboardType="numeric"
        />
        <SettingsCard
          title="Save Profile"
          icon="save"
          type="button"
          onPress={saveUserProfile}
        />
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          App Preferences
        </Text>
        <SettingsCard
          title="Dark Mode"
          description="Toggle dark/light theme"
          icon="moon"
          type="toggle"
          value={settings.darkMode}
          onValueChange={async () => {
            try {
              await toggleTheme();
            } catch (error) {
              Alert.alert('Error', 'Failed to update theme');
            }
          }}
        />
        <SettingsCard
          title="Sound Alerts"
          description="Enable/disable sound notifications"
          icon="volume-high"
          type="toggle"
          value={settings.soundEnabled}
          onValueChange={toggleSound}
        />
        <SettingsCard
          title="Vibration Alerts"
          description="Enable/disable vibration notifications"
          icon="notifications"
          type="toggle"
          value={settings.vibrationEnabled}
          onValueChange={toggleVibration}
        />
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          About
        </Text>
        <SettingsCard
          title="App Version"
          description={Constants.expoConfig?.version || '1.0.0'}
          icon="information-circle"
          type="button"
          disabled
        />
        <SettingsCard
          title="Current Server"
          description={settings.serverUrl}
          icon="server"
          type="button"
          disabled
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
  },
}); 