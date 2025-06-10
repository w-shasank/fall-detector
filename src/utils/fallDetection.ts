import { SensorData, Vector3D } from '../types';

// Constants for fall detection
const FALL_DETECTION = {
  // Accelerometer thresholds
  ACCELERATION_THRESHOLD: 20, // m/s² - Sudden acceleration threshold
  IMPACT_THRESHOLD: 15,      // m/s² - Impact detection threshold
  POST_IMPACT_THRESHOLD: 5,  // m/s² - Post-impact threshold
  
  // Gyroscope thresholds
  ORIENTATION_CHANGE_THRESHOLD: 300, // deg/s - Sudden orientation change
  ROTATION_THRESHOLD: 200,          // deg/s - Rotation threshold
  
  // Time windows (in milliseconds)
  IMPACT_WINDOW: 500,    // Window to detect impact
  RECOVERY_WINDOW: 2000, // Window to detect recovery
  
  // Movement detection
  MOVEMENT_THRESHOLD: 0.5,    // Threshold for movement detection
  MOVEMENT_WINDOW: 1000,      // Window for movement averaging
  SMOOTHING_FACTOR: 0.3,      // EMA smoothing factor
};

// Types for detection results
export interface DetectionResult {
  isFall: boolean;
  confidence: number;
  status: 'normal' | 'potential_fall' | 'fall_detected' | 'recovery';
  movementStatus: 'moving' | 'stationary';
  details: {
    accelerationMagnitude: number;
    orientationChange: number;
    impactDetected: boolean;
    recoveryDetected: boolean;
  };
}

// Data processing utilities
export class SensorDataProcessor {
  private accelerationHistory: number[] = [];
  private gyroscopeHistory: number[] = [];
  private lastUpdateTime: number = 0;

  // Calculate vector magnitude
  private calculateMagnitude(vector: Vector3D): number {
    return Math.sqrt(
      Math.pow(vector.x, 2) +
      Math.pow(vector.y, 2) +
      Math.pow(vector.z, 2)
    );
  }

  // Calculate moving average
  private calculateMovingAverage(values: number[], window: number): number {
    if (values.length === 0) return 0;
    const recentValues = values.slice(-window);
    return recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
  }

  // Calculate Exponential Moving Average (EMA)
  private calculateEMA(current: number, previous: number, factor: number): number {
    return (current * factor) + (previous * (1 - factor));
  }

  // Detect sudden changes in sensor values
  private detectSuddenChange(
    current: number,
    previous: number,
    threshold: number
  ): boolean {
    return Math.abs(current - previous) > threshold;
  }

  // Update sensor history
  private updateHistory(data: SensorData) {
    const currentTime = data.timestamp || Date.now();
    const timeDiff = currentTime - this.lastUpdateTime;

    if (timeDiff > 0) {
      const accMagnitude = this.calculateMagnitude(data.accelerometer);
      const gyroMagnitude = this.calculateMagnitude(data.gyroscope);

      this.accelerationHistory.push(accMagnitude);
      this.gyroscopeHistory.push(gyroMagnitude);

      // Keep history within window
      const maxHistoryLength = Math.max(
        FALL_DETECTION.IMPACT_WINDOW,
        FALL_DETECTION.MOVEMENT_WINDOW
      );
      if (this.accelerationHistory.length > maxHistoryLength) {
        this.accelerationHistory.shift();
      }
      if (this.gyroscopeHistory.length > maxHistoryLength) {
        this.gyroscopeHistory.shift();
      }

      this.lastUpdateTime = currentTime;
    }
  }

  // Detect movement status
  private detectMovement(data: SensorData): 'moving' | 'stationary' {
    const accMagnitude = this.calculateMagnitude(data.accelerometer);
    const gyroMagnitude = this.calculateMagnitude(data.gyroscope);
    
    const totalMagnitude = this.calculateEMA(
      accMagnitude + gyroMagnitude,
      this.calculateMovingAverage(this.accelerationHistory, FALL_DETECTION.MOVEMENT_WINDOW),
      FALL_DETECTION.SMOOTHING_FACTOR
    );

    return totalMagnitude > FALL_DETECTION.MOVEMENT_THRESHOLD ? 'moving' : 'stationary';
  }

  // Main fall detection algorithm
  public detectFall(data: SensorData): DetectionResult {
    this.updateHistory(data);

    const accMagnitude = this.calculateMagnitude(data.accelerometer);
    const gyroMagnitude = this.calculateMagnitude(data.gyroscope);

    // Calculate sudden changes
    const suddenAcceleration = this.detectSuddenChange(
      accMagnitude,
      this.calculateMovingAverage(this.accelerationHistory, 5),
      FALL_DETECTION.ACCELERATION_THRESHOLD
    );

    const suddenOrientation = this.detectSuddenChange(
      gyroMagnitude,
      this.calculateMovingAverage(this.gyroscopeHistory, 5),
      FALL_DETECTION.ORIENTATION_CHANGE_THRESHOLD
    );

    // Impact detection
    const impactDetected = accMagnitude > FALL_DETECTION.IMPACT_THRESHOLD;
    
    // Post-impact detection
    const postImpact = accMagnitude < FALL_DETECTION.POST_IMPACT_THRESHOLD &&
                      this.accelerationHistory.length > 0;

    // Calculate confidence score (0-1)
    let confidence = 0;
    if (suddenAcceleration) confidence += 0.3;
    if (suddenOrientation) confidence += 0.3;
    if (impactDetected) confidence += 0.4;

    // Determine detection status
    let status: DetectionResult['status'] = 'normal';
    if (confidence > 0.7) {
      status = 'fall_detected';
    } else if (confidence > 0.4) {
      status = 'potential_fall';
    } else if (postImpact) {
      status = 'recovery';
    }

    return {
      isFall: status === 'fall_detected',
      confidence,
      status,
      movementStatus: this.detectMovement(data),
      details: {
        accelerationMagnitude: accMagnitude,
        orientationChange: gyroMagnitude,
        impactDetected,
        recoveryDetected: postImpact,
      },
    };
  }
}

// TODO: Research-based algorithm integration points:
// 1. Machine learning model for fall detection
//    - Train on real fall data
//    - Consider user-specific patterns
//    - Implement adaptive thresholds
//
// 2. Advanced signal processing
//    - Wavelet transform for feature extraction
//    - Kalman filtering for noise reduction
//    - Pattern recognition for fall signatures
//
// 3. Context-aware detection
//    - Activity recognition
//    - Environmental factors
//    - User profile and history
//
// 4. Multi-sensor fusion
//    - Combine with other sensors (e.g., barometer)
//    - Implement sensor redundancy
//    - Cross-validation of detection 