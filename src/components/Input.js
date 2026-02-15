import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme';

const Input = ({ label, style, inputStyle, error, onFocus, onBlur, icon, ...props }) => {
    const [focused, setFocused] = useState(false);

    return (
        <View style={[styles.outerContainer, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                focused ? styles.inputFocused : null,
                error ? styles.inputError : null,
                inputStyle
            ]}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={[styles.input, icon ? styles.inputWithIcon : null]}
                    onFocus={() => {
                        setFocused(true);
                        if (onFocus) onFocus();
                    }}
                    onBlur={() => {
                        setFocused(false);
                        if (onBlur) onBlur();
                    }}
                    placeholderTextColor={theme.colors.textLight}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        marginBottom: theme.spacing.md,
    },
    label: {
        ...theme.typography.caption,
        marginBottom: theme.spacing.xs,
        color: theme.colors.text,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.white,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        height: 48,
        paddingHorizontal: theme.spacing.md,
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text,
    },
    inputWithIcon: {
        paddingLeft: theme.spacing.sm,
    },
    iconContainer: {
        paddingLeft: theme.spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
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
