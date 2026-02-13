import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Plus, Search, Edit2, Trash2, ArrowLeft, X, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { theme } from '../theme';
import Input from '../components/Input';
import Button from '../components/Button';

export default function MenuScreen() {
    const navigation = useNavigation();
    const [menuItems, setMenuItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        type: 'Veg', // Veg or Non-Veg
        image: null
    });

    const db = getFirestore();

    useEffect(() => {
        // Fetch Menu Items Real-time
        const unsubscribe = onSnapshot(collection(db, "menu"), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMenuItems(items);
        });

        return () => unsubscribe();
    }, []);

    const filteredItems = menuItems.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setNewItem({ ...newItem, image: result.assets[0].uri });
        }
    };

    const uploadToCloudinary = async (uri) => {
        try {
            const data = new FormData();
            data.append('file', {
                uri: uri,
                type: 'image/jpeg',
                name: 'upload.jpg',
            });
            data.append('upload_preset', 'sanjha_chulha_preset'); // You need to create an unsigned preset in Cloudinary
            data.append('cloud_name', 'dpvab3v9f');

            const response = await fetch("https://api.cloudinary.com/v1_1/dpvab3v9f/image/upload", {
                method: "post",
                body: data
            });

            const result = await response.json();
            if (result.secure_url) {
                return result.secure_url;
            } else {
                console.error("Cloudinary Upload Error:", result);
                throw new Error("Failed to upload image to Cloudinary");
            }
        } catch (error) {
            console.error("Image upload failed", error);
            throw error;
        }
    };

    const handleAddItem = async () => {
        if (!newItem.title || !newItem.price || !newItem.category) {
            Alert.alert("Error", "Please fill all required fields");
            return;
        }

        setSubmitting(true);
        try {
            let imageUrl = null;
            if (newItem.image) {
                // IMPORTANT: You need an 'unsigned' upload preset in Cloudinary settings 
                // Settings > Upload > Upload presets > Add upload preset > Signing Mode: Unsigned
                // Name it: sanjha_chulha_preset
                imageUrl = await uploadToCloudinary(newItem.image);
            }

            await addDoc(collection(db, "menu"), {
                title: newItem.title,
                description: newItem.description,
                price: newItem.price,
                category: newItem.category,
                type: newItem.type,
                imageUrl: imageUrl,
                createdAt: new Date()
            });

            setModalVisible(false);
            setNewItem({ title: '', description: '', price: '', category: '', type: 'Veg', image: null });
            Alert.alert("Success", "Menu item added successfully");
        } catch (error) {
            Alert.alert("Error", "Failed to add item: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Item",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: 'destructive', onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "menu", id));
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete item");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemCard}>
            {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            )}
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.title}</Text>
                <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.itemCategory}>{item.category} • {item.type}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
            <View style={styles.actions}>
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
                onPress={() => setModalVisible(true)}
            >
                <Plus size={24} color={theme.colors.white} />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Menu Item</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {newItem.image ? (
                                    <Image source={{ uri: newItem.image }} style={styles.pickedImage} />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Upload size={32} color={theme.colors.textLight} />
                                        <Text style={styles.imageText}>Select Image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <Input
                                label="Food Title"
                                placeholder="e.g. Butter Chicken"
                                value={newItem.title}
                                onChangeText={(text) => setNewItem({ ...newItem, title: text })}
                            />

                            <Input
                                label="Description"
                                placeholder="Short description..."
                                value={newItem.description}
                                onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                                multiline
                                numberOfLines={3}
                                inputStyle={{ height: 80, textAlignVertical: 'top', paddingTop: 10 }}
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Input
                                        label="Price (₹)"
                                        placeholder="450"
                                        value={newItem.price}
                                        onChangeText={(text) => setNewItem({ ...newItem, price: text })}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Input
                                        label="Category"
                                        placeholder="Main Course"
                                        value={newItem.category}
                                        onChangeText={(text) => setNewItem({ ...newItem, category: text })}
                                    />
                                </View>
                            </View>

                            <Text style={styles.label}>Type</Text>
                            <View style={styles.typeContainer}>
                                <TouchableOpacity
                                    style={[styles.typeButton, newItem.type === 'Veg' && styles.activeType]}
                                    onPress={() => setNewItem({ ...newItem, type: 'Veg' })}
                                >
                                    <Text style={[styles.typeText, newItem.type === 'Veg' && styles.activeTypeText]}>Veg</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeButton, newItem.type === 'Non-Veg' && styles.activeType]}
                                    onPress={() => setNewItem({ ...newItem, type: 'Non-Veg' })}
                                >
                                    <Text style={[styles.typeText, newItem.type === 'Non-Veg' && styles.activeTypeText]}>Non-Veg</Text>
                                </TouchableOpacity>
                            </View>

                            <Button
                                title={submitting ? "Adding..." : "Add Item"}
                                onPress={handleAddItem}
                                disabled={submitting}
                                style={{ marginTop: 20 }}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        paddingBottom: 80,
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
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: theme.colors.background,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: '600',
        color: theme.colors.text,
    },
    itemDesc: {
        fontSize: 12,
        color: theme.colors.textLight,
        marginVertical: 2,
    },
    itemCategory: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.textLight,
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: theme.spacing.lg,
        height: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    modalTitle: {
        fontSize: theme.typography.h2.fontSize,
        fontWeight: '700',
        color: theme.colors.text,
    },
    imagePicker: {
        height: 150,
        backgroundColor: '#F0F2F5',
        borderRadius: 12,
        marginBottom: theme.spacing.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E1E4E8',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    imageText: {
        marginTop: 8,
        color: theme.colors.textLight,
        fontSize: 14,
    },
    pickedImage: {
        width: '100%',
        height: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        ...theme.typography.caption,
        marginBottom: theme.spacing.xs,
        color: theme.colors.text,
        fontWeight: '600',
    },
    typeContainer: {
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 8,
    },
    activeType: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    typeText: {
        color: theme.colors.text,
        fontWeight: '600',
    },
    activeTypeText: {
        color: 'white',
    }
});
