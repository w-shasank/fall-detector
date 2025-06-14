import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useWebSocket } from '../contexts/WebSocketContext';
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

  const renderSettingItem = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    description?: string,
    value?: boolean,
    onToggle?: () => void,
    onPress?: () => void,
    isInput?: boolean,
    inputValue?: string,
    onInputChange?: (value: string) => void,
    placeholder?: string,
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad',
    disabled?: boolean
  ) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { backgroundColor: theme.colors.cardBackground },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || isInput}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
        <Ionicons name={icon} size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      {isInput ? (
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, backgroundColor: theme.colors.background },
          ]}
          value={inputValue}
          onChangeText={onInputChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType={keyboardType}
          editable={!disabled}
        />
      ) : value !== undefined ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.background}
          disabled={disabled}
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );

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
        {renderSettingItem(
          'server',
          'Server URL',
          'WebSocket server address',
          undefined,
          undefined,
          undefined,
          true,
          serverUrl,
          setServerUrl,
          'ws://server:port'
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.primary },
              (isTestingConnection || !validateUrl(serverUrl)) && styles.disabled,
            ]}
            onPress={testConnection}
            disabled={isTestingConnection || !validateUrl(serverUrl)}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>Test</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.secondary },
              (isSaving || !validateUrl(serverUrl)) && styles.disabled,
            ]}
            onPress={saveUrl}
            disabled={isSaving || !validateUrl(serverUrl)}
          >
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
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
        {renderSettingItem(
          'person',
          'Name',
          undefined,
          undefined,
          undefined,
          undefined,
          true,
          userProfile.name,
          (value) => setUserProfile({ ...userProfile, name: value }),
          'Enter your name'
        )}
        {renderSettingItem(
          'calendar',
          'Age',
          undefined,
          undefined,
          undefined,
          undefined,
          true,
          userProfile.age.toString(),
          (value) => setUserProfile({ ...userProfile, age: parseInt(value) || 0 }),
          'Enter your age',
          'numeric'
        )}
        {renderSettingItem(
          'scale',
          'Weight (kg)',
          undefined,
          undefined,
          undefined,
          undefined,
          true,
          userProfile.weight.toString(),
          (value) => setUserProfile({ ...userProfile, weight: parseFloat(value) || 0 }),
          'Enter your weight',
          'numeric'
        )}
        {renderSettingItem(
          'resize',
          'Height (cm)',
          undefined,
          undefined,
          undefined,
          undefined,
          true,
          userProfile.height.toString(),
          (value) => setUserProfile({ ...userProfile, height: parseFloat(value) || 0 }),
          'Enter your height',
          'numeric'
        )}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={saveUserProfile}
        >
          <Ionicons name="save" size={20} color="#fff" />
          <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Preferences
        </Text>
        {renderSettingItem(
          'moon',
          'Dark Mode',
          'Toggle dark/light theme',
          settings.darkMode,
          toggleTheme
        )}
        {renderSettingItem(
          'volume-high',
          'Sound Alerts',
          'Enable/disable sound notifications',
          settings.soundEnabled,
          toggleSound
        )}
        {renderSettingItem(
          'notifications',
          'Vibration Alerts',
          'Enable/disable vibration notifications',
          settings.vibrationEnabled,
          toggleVibration
        )}
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          About
        </Text>
        {renderSettingItem(
          'information-circle',
          'App Version',
          Constants.expoConfig?.version || '1.0.0',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          true
        )}
        {renderSettingItem(
          'server',
          'Current Server',
          settings.serverUrl,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          true
        )}
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    opacity: 0.8,
  },
  input: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    minWidth: 120,
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  disabled: {
    opacity: 0.5,
  },
}); 