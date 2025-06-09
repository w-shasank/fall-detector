import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { ALERT_CONFIG } from '../constants/config';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  onDismiss: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  dismissText?: string;
  isFallAlert?: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onDismiss,
  onConfirm,
  confirmText = 'OK',
  dismissText = 'Cancel',
  isFallAlert = false,
}) => {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const [countdown, setCountdown] = useState(ALERT_CONFIG.SOUND_DURATION / 1000);

  useEffect(() => {
    if (visible && isFallAlert) {
      if (settings.soundEnabled) {
        // Play alert sound
        // TODO: Implement sound playing
      }
      if (settings.vibrationEnabled) {
        Vibration.vibrate([...ALERT_CONFIG.VIBRATION_PATTERN], true);
      }

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        Vibration.cancel();
      };
    }
  }, [visible, isFallAlert, settings.soundEnabled, settings.vibrationEnabled]);

  const getIconName = () => {
    switch (type) {
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'success':
        return 'checkmark-circle';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={getIconName()}
              size={48}
              color={getIconColor()}
            />
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            {message}
          </Text>

          {isFallAlert && (
            <View style={styles.countdownContainer}>
              <Text style={[styles.countdown, { color: theme.colors.error }]}>
                {countdown}s
              </Text>
              <Text style={[styles.countdownLabel, { color: theme.colors.text }]}>
                until emergency contact notification
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {onConfirm && (
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}
              >
                <Text style={styles.buttonText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={onDismiss}
            >
              <Text style={styles.buttonText}>{dismissText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  countdown: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  countdownLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  dismissButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 