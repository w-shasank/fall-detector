import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
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
            thumbColor={theme.colors.background}
            disabled={disabled}
          />
        );
      case 'input':
        return (
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background,
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
            size={24}
            color={theme.colors.textSecondary}
          />
        );
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
      disabled={disabled || type === 'input'}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={24}
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
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    minWidth: 120,
  },
}); 