import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check, X, Calendar, User, Clock } from 'lucide-react-native';
import { theme } from '../theme';

// Mock data
const INITIAL_BOOKINGS = [
    { id: '1', name: 'Rohan Sharma', date: '2023-11-20', time: '19:30', guests: 4, status: 'Pending' },
    { id: '2', name: 'Amit Singh', date: '2023-11-21', time: '20:00', guests: 2, status: 'Confirmed' },
    { id: '3', name: 'Neelam Gupta', date: '2023-11-22', time: '13:00', guests: 6, status: 'Cancelled' },
];

export default function ReservationsScreen() {
    const navigation = useNavigation();
    const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

    const handleStatusChange = (id, newStatus) => {
        setBookings(prev => prev.map(booking =>
            booking.id === id ? { ...booking, status: newStatus } : booking
        ));
    };

    const renderBooking = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.guestName}>{item.name}</Text>
                    <Text style={styles.status}>{item.status}</Text>
                </View>
                <View style={styles.infoIcons}>
                    <Calendar size={16} color={theme.colors.textLight} />
                    <Text style={styles.infoText}>{item.date}</Text>
                    <Clock size={16} color={theme.colors.textLight} style={{ marginLeft: 8 }} />
                    <Text style={styles.infoText}>{item.time}</Text>
                    <User size={16} color={theme.colors.textLight} style={{ marginLeft: 8 }} />
                    <Text style={styles.infoText}>{item.guests}</Text>
                </View>
            </View>

            {item.status === 'Pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleStatusChange(item.id, 'Confirmed')}
                    >
                        <Check size={16} color={theme.colors.white} />
                        <Text style={styles.actionText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleStatusChange(item.id, 'Cancelled')}
                    >
                        <X size={16} color={theme.colors.white} />
                        <Text style={styles.actionText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Reservations</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={bookings}
                renderItem={renderBooking}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No bookings found</Text>
                    </View>
                }
            />
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        padding: theme.spacing.sm,
    },
    title: {
        fontSize: theme.typography.h3.fontSize,
        fontWeight: '700',
        color: theme.colors.text,
    },
    listContent: {
        padding: theme.spacing.md,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardHeader: {
        marginBottom: theme.spacing.sm,
    },
    guestName: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: '600',
        color: theme.colors.text,
    },
    status: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.textLight,
        marginBottom: 4,
    },
    infoIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    infoText: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.textLight,
        marginLeft: 4,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: theme.spacing.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginLeft: theme.spacing.sm,
    },
    approveButton: {
        backgroundColor: theme.colors.success,
    },
    rejectButton: {
        backgroundColor: theme.colors.error,
    },
    actionText: {
        color: theme.colors.white,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
    emptyText: {
        color: theme.colors.textLight,
    }
});
