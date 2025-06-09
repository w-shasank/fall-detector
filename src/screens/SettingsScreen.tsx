import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../contexts/SettingsContext';
import { useWebSocket } from '../contexts/WebSocketContext';

export const SettingsScreen = () => {
  const { websocketUrl, setWebsocketUrl, isLoading } = useSettings();
  const { isConnected, error, reconnect } = useWebSocket();
  const [newUrl, setNewUrl] = useState(websocketUrl);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveUrl = async () => {
    try {
      await setWebsocketUrl(newUrl);
      setIsEditing(false);
      Alert.alert('Success', 'WebSocket URL updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to save WebSocket URL');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WebSocket Configuration</Text>
          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={newUrl}
                onChangeText={setNewUrl}
                placeholder="Enter WebSocket URL"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setNewUrl(websocketUrl);
                    setIsEditing(false);
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveUrl}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.settingItem}>Server URL: {websocketUrl}</Text>
              <Text style={styles.connectionStatus}>
                Status: {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
              {error && <Text style={styles.errorText}>{error}</Text>}
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>Edit URL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.reconnectButton]}
                onPress={reconnect}
              >
                <Text style={styles.buttonText}>Reconnect</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Preferences</Text>
          <Text style={styles.settingItem}>Sound Alerts: Off</Text>
          <Text style={styles.settingItem}>Vibration: Off</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <Text style={styles.settingItem}>Current: Light</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  settingItem: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: '#34C759',
    flex: 1,
    marginLeft: 5,
  },
  reconnectButton: {
    backgroundColor: '#5856D6',
  },
  connectionStatus: {
    fontSize: 16,
    marginBottom: 8,
    color: '#007AFF',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#FF3B30',
  },
}); 