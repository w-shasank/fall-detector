import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { SettingsCard } from '../components/SettingsCard';
import { validateUrl } from '../utils/validation';
import Constants from 'expo-constants';

export const SettingsScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateWebSocketUrl, updateUserProfile, toggleSound, toggleVibration } = useSettings();
  const { isConnected, connect, disconnect } = useWebSocket();
  const [serverUrl, setServerUrl] = React.useState(settings.serverUrl);
  const [isTestingConnection, setIsTestingConnection] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState(settings.userProfile);
  const insets = useSafeAreaInsets();

  const testConnection = async () => {
    if (!validateUrl(serverUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid WebSocket URL');
      return;
    }

    setIsTestingConnection(true);
    try {
      await connect();
      Alert.alert('Success', 'Connection test successful');
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setIsTestingConnection(false);
    }
  };

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
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + 16 }
      ]}
    >
      {/* Server Configuration */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Server
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
            size={18}
            color={isConnected ? theme.colors.success : theme.colors.error}
          />
          <Text style={[styles.statusText, { color: theme.colors.text }]}>
            {isTestingConnection ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>

      {/* User Profile */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Profile
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
          Preferences
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
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
    marginLeft: 4,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
  },
}); 