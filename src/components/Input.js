import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme';

const Input = ({ label, style, error, onFocus, onBlur, ...props }) => {
    const [focused, setFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    focused ? styles.inputFocused : null,
                    error ? styles.inputError : null
                ]}
                onFocus={() => {
                    setFocused(true);
                    onFocus && onFocus();
                }}
                onBlur={() => {
                    setFocused(false);
                    onBlur && onBlur();
                }}
                placeholderTextColor={theme.colors.textLight}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    label: {
        ...theme.typography.caption,
        marginBottom: theme.spacing.xs,
        color: theme.colors.text,
        fontWeight: '600',
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text,
        backgroundColor: theme.colors.white,
    },
    inputFocused: {
        borderColor: theme.colors.primary,
        borderWidth: 1.5,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        ...theme.typography.caption,
        color: theme.colors.error,
        marginTop: theme.spacing.xs,
    },
});

export default Input;
