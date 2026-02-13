import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Plus, Search, Edit2, Trash2, ArrowLeft } from 'lucide-react-native';
import { theme } from '../theme';
import Input from '../components/Input';

// Mock data
const INITIAL_MENU = [
    { id: '1', name: 'Butter Chicken', category: 'Main Course', price: '₹450', type: 'Non-Veg' },
    { id: '2', name: 'Dal Makhani', category: 'Main Course', price: '₹350', type: 'Veg' },
    { id: '3', name: 'Tandoori Roti', category: 'Breads', price: '₹40', type: 'Veg' },
    { id: '4', name: 'Paneer Tikka', category: 'Starters', price: '₹320', type: 'Veg' },
];

export default function MenuScreen() {
    const navigation = useNavigation();
    const [menuItems, setMenuItems] = useState(INITIAL_MENU);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Item",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: 'destructive', onPress: () => {
                        setMenuItems(prev => prev.filter(item => item.id !== id));
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category} • {item.type}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Edit", `Edit ${item.name}`)}>
                    <Edit2 size={20} color={theme.colors.textLight} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
                    <Trash2 size={20} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Menu</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchContainer}>
                <Input
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={{ marginBottom: 0 }}
                />
            </View>

            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No items found</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => Alert.alert("Add Item", "Open Add Item Modal")}
            >
                <Plus size={24} color={theme.colors.white} />
            </TouchableOpacity>
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
    searchContainer: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.white,
    },
    listContent: {
        padding: theme.spacing.md,
        paddingBottom: 80, // Space for FAB
    },
    itemCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: '600',
        color: theme.colors.text,
    },
    itemCategory: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.textLight,
        marginTop: 2,
    },
    itemPrice: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: '700',
        color: theme.colors.primary,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: theme.spacing.sm,
        marginLeft: theme.spacing.sm,
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing.lg,
        right: theme.spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
    emptyText: {
        color: theme.colors.textLight,
    }
});
