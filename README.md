# NoFall - Fall Detection System

A mobile app that monitors device sensors to detect falls and send alerts in real-time.

## Features

- Real-time accelerometer and gyroscope monitoring
- Fall detection with configurable sensitivity
- Movement tracking (moving/stationary)
- WebSocket server integration for remote monitoring
- Audio and haptic alerts
- User profile and emergency contact storage

## Installation

```bash
npm install
npm start
```

Run on device:
```bash
npm run android  # Android
npm run ios      # iOS
```

## Usage

**Monitor Screen**: View live sensor data and connection status

**Settings Screen**: Configure server URL, alerts, and user profile

## Fall Detection

The app detects falls using:
- Sudden acceleration changes (>20 m/s²)
- Rapid orientation changes (>300 deg/s)
- Impact detection (>15 m/s²)
- Post-impact movement analysis

## Configuration

Set WebSocket server URL in Settings (default: `ws://localhost:8080`)

## License

MIT
