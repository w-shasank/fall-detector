import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

// Alert configuration
const ALERT_CONFIG = {
  // Visual alert
  COUNTDOWN_DURATION: 30, // seconds
  COUNTDOWN_INTERVAL: 1000, // milliseconds
  ALERT_COLORS: {
    background: '#FF3B30',
    text: '#FFFFFF',
    button: '#FFFFFF',
    buttonText: '#FF3B30',
  },

  // Audio alert
  SOUND_FILE: require('../assets/sounds/alert.mp3'),
  SOUND_LOOP: true,
  SOUND_VOLUME: 1.0,

  // Vibration patterns
  VIBRATION_PATTERNS: {
    fall: [0, 500, 200, 500], // [wait, vibrate, wait, vibrate]
    warning: [0, 200, 100, 200], // [wait, vibrate, wait, vibrate]
    success: [0, 100], // [wait, vibrate]
  },
};

// Alert types
export type AlertType = 'fall' | 'warning' | 'success';

// Alert state interface
export interface AlertState {
  isActive: boolean;
  type: AlertType;
  countdown: number;
  message: string;
}

// Alert system class
export class AlertSystem {
  private sound: Audio.Sound | null = null;
  private countdownInterval: NodeJS.Timeout | null = null;
  private settings: ReturnType<typeof useSettings>;
  private onAlertStateChange: ((state: AlertState) => void) | null = null;
  private currentState: AlertState = {
    isActive: false,
    type: 'success',
    countdown: 0,
    message: '',
  };

  constructor(
    settings: ReturnType<typeof useSettings>,
    onAlertStateChange?: (state: AlertState) => void
  ) {
    this.settings = settings;
    this.onAlertStateChange = onAlertStateChange || null;
  }

  // Initialize the alert system
  public async initialize(): Promise<void> {
    try {
      // Load sound
      const { sound } = await Audio.Sound.createAsync(
        ALERT_CONFIG.SOUND_FILE,
        {
          isLooping: ALERT_CONFIG.SOUND_LOOP,
          volume: ALERT_CONFIG.SOUND_VOLUME,
        }
      );
      this.sound = sound;
    } catch (error) {
      console.error('Failed to initialize alert system:', error);
    }
  }

  // Clean up resources
  public async cleanup(): Promise<void> {
    await this.stopAllAlerts();
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  // Trigger visual alert
  private async triggerVisualAlert(
    type: AlertType,
    message: string,
    countdown: number
  ): Promise<void> {
    this.currentState = {
      isActive: true,
      type,
      countdown,
      message,
    };

    if (this.onAlertStateChange) {
      this.onAlertStateChange(this.currentState);
    }

    // Start countdown
    this.countdownInterval = setInterval(() => {
      this.currentState = {
        ...this.currentState,
        countdown: Math.max(0, this.currentState.countdown - 1),
      };

      if (this.onAlertStateChange) {
        this.onAlertStateChange(this.currentState);
      }
    }, ALERT_CONFIG.COUNTDOWN_INTERVAL);
  }

  // Trigger audio alert
  private async triggerAudioAlert(): Promise<void> {
    if (!this.settings.settings.soundEnabled || !this.sound) return;

    try {
      await this.sound.setPositionAsync(0);
      await this.sound.playAsync();
    } catch (error) {
      console.error('Failed to play alert sound:', error);
    }
  }

  // Trigger vibration alert
  private async triggerVibrationAlert(type: AlertType): Promise<void> {
    if (!this.settings.settings.vibrationEnabled) return;

    try {
      const pattern = ALERT_CONFIG.VIBRATION_PATTERNS[type];
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, pattern[2]);
    } catch (error) {
      console.error('Failed to trigger vibration:', error);
    }
  }

  // Stop all active alerts
  private async stopAllAlerts(): Promise<void> {
    // Stop countdown
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    // Stop sound
    if (this.sound) {
      try {
        await this.sound.stopAsync();
      } catch (error) {
        console.error('Failed to stop alert sound:', error);
      }
    }

    // Stop vibration - no need to explicitly cancel as it's a one-time feedback
    // The vibration will stop automatically after the pattern completes

    // Update alert state
    this.currentState = {
      isActive: false,
      type: 'success',
      countdown: 0,
      message: '',
    };

    if (this.onAlertStateChange) {
      this.onAlertStateChange(this.currentState);
    }
  }

  // Trigger a fall alert
  public async triggerFallAlert(): Promise<void> {
    await this.triggerAlert('fall', 'Fall Detected! Are you OK?');
  }

  // Trigger a warning alert
  public async triggerWarningAlert(message: string): Promise<void> {
    await this.triggerAlert('warning', message);
  }

  // Trigger a success alert
  public async triggerSuccessAlert(message: string): Promise<void> {
    await this.triggerAlert('success', message);
  }

  // Main alert trigger method
  private async triggerAlert(type: AlertType, message: string): Promise<void> {
    // Stop any existing alerts
    await this.stopAllAlerts();

    // Trigger new alerts
    await Promise.all([
      this.triggerVisualAlert(type, message, ALERT_CONFIG.COUNTDOWN_DURATION),
      this.triggerAudioAlert(),
      this.triggerVibrationAlert(type),
    ]);

    // Auto-dismiss after countdown
    setTimeout(() => {
      if (this.currentState.isActive) {
        this.dismissAlert();
      }
    }, ALERT_CONFIG.COUNTDOWN_DURATION * 1000);
  }

  // Dismiss the current alert
  public async dismissAlert(): Promise<void> {
    await this.stopAllAlerts();
  }

  // Handle "I'm OK" response
  public async handleImOkResponse(): Promise<void> {
    await this.triggerSuccessAlert("Glad you're OK!");
  }
}

// Alert modal component props
export interface AlertModalProps {
  visible: boolean;
  type: AlertType;
  message: string;
  countdown: number;
  onDismiss: () => void;
  onImOk: () => void;
}

// Example usage:
/*
const alertSystem = new AlertSystem(settings, (state) => {
  // Update UI based on alert state
  setAlertState(state);
});

// Initialize
await alertSystem.initialize();

// Trigger fall alert
await alertSystem.triggerFallAlert();

// Handle "I'm OK"
await alertSystem.handleImOkResponse();

// Cleanup
await alertSystem.cleanup();
*/ 