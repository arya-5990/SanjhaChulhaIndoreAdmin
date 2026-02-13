import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { theme } from '../theme';

const Button = ({ title, onPress, style, textStyle, variant = "primary", disabled = false, ...props }) => {
    const getStyle = () => {
        switch (variant) {
            case "outline":
                return styles.outline;
            case "ghost":
                return styles.ghost;
            default:
                return styles.primary;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case "outline":
                return styles.textOutline;
            case "ghost":
                return styles.textGhost;
            default:
                return styles.textPrimary;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.base,
                getStyle(),
                disabled ? styles.disabled : null,
                style
            ]}
            onPress={!disabled ? onPress : null}
            {...props}
        >
            <Text style={[styles.textBase, getTextStyle(), textStyle]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    textBase: {
        ...theme.typography.body,
        fontWeight: '600',
    },
    primary: {
        backgroundColor: theme.colors.primary,
        borderWidth: 0,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    textPrimary: {
        color: theme.colors.white,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
    textOutline: {
        color: theme.colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    textGhost: {
        color: theme.colors.primary,
    },
    disabled: {
        backgroundColor: theme.colors.border,
        borderColor: theme.colors.border,
        elevation: 0,
        opacity: 0.7,
    }
});

export default Button;
