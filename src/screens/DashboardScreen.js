import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Menu, Settings, LogOut, UtensilsCrossed } from 'lucide-react-native';
import { theme } from '../theme';
import Button from '../components/Button';

const DashboardCard = ({ title, icon, onPress, description, count }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
                {icon}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDesc}>{description}</Text>
            </View>
            {count !== undefined && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{count}</Text>
                </View>
            )}
        </View>
    </TouchableOpacity>
);

export default function DashboardScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome,</Text>
                    <Text style={styles.name}>Admin</Text>
                </View>
                {/* Logout disabled for no-login mode */}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Overview</Text>

                <View style={styles.grid}>
                    <DashboardCard
                        title="Menu Management"
                        description="Update items & prices"
                        icon={<UtensilsCrossed color="white" size={24} />}
                        onPress={() => navigation.navigate('Menu')}

                    />

                    <DashboardCard
                        title="Settings"
                        description="App configuration"
                        icon={<Settings color="white" size={24} />}
                        onPress={() => Alert.alert("Settings", "Change theme, password, etc.")}
                    />
                </View>
            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    greeting: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.textLight,
    },
    name: {
        fontSize: theme.typography.h3.fontSize,
        fontWeight: theme.typography.h3.fontWeight,
        color: theme.colors.text,
    },
    logoutButton: {
        padding: theme.spacing.sm,
    },
    content: {
        padding: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.typography.h2.fontSize,
        fontWeight: theme.typography.h2.fontWeight,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    grid: {
        gap: theme.spacing.md,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: theme.spacing.md,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.textLight,
    },
    badge: {
        backgroundColor: theme.colors.error, // Alert color for notifications
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: theme.spacing.sm,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    }
});
