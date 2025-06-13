import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  type?: 'toggle' | 'input' | 'button';
  value?: boolean | string;
  onValueChange?: (value: boolean | string) => void;
  onPress?: () => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  disabled?: boolean;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  icon,
  type = 'button',
  value,
  onValueChange,
  onPress,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  disabled = false,
}) => {
  const { theme } = useTheme();

  const renderContent = () => {
    switch (type) {
      case 'toggle':
        return (
          <Switch
            value={value as boolean}
            onValueChange={(newValue) => onValueChange?.(newValue)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={Platform.OS === 'ios' ? '#fff' : theme.colors.background}
            disabled={disabled}
            style={styles.switch}
          />
        );
      case 'input':
        return (
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.cardBackground,
              },
            ]}
            value={value as string}
            onChangeText={(text) => onValueChange?.(text)}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            editable={!disabled}
          />
        );
      default:
        return (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.chevron}
          />
        );
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.cardBackground,
        },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || type === 'input'}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={22}
              color={theme.colors.primary}
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          {description && (
            <Text
              style={[styles.description, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {description}
            </Text>
          )}
        </View>
        {renderContent()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginVertical: 6,
    overflow: 'hidden',
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
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
  switch: {
    transform: Platform.OS === 'ios' ? [{ scale: 0.8 }] : [],
  },
  chevron: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
}); 