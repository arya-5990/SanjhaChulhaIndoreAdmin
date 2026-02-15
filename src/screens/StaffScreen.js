import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Plus, Trash2, ArrowLeft, X, User, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { theme } from '../theme';
import Input from '../components/Input';
import Button from '../components/Button';

export default function StaffScreen() {
    const navigation = useNavigation();
    const [staffList, setStaffList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newStaff, setNewStaff] = useState({
        staffName: '',
        staffDesignation: '',
        staffDescription: '',
        staffImage: null
    });

    const db = getFirestore();

    useEffect(() => {
        // Fetch Staff Items Real-time
        const q = query(collection(db, "Staff"), orderBy("staffId", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStaffList(items);
        });

        return () => unsubscribe();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square aspect ratio for staff profiles
            quality: 0.8,
        });

        if (!result.canceled) {
            setNewStaff({ ...newStaff, staffImage: result.assets[0].uri });
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
            const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            data.append('upload_preset', uploadPreset);
            data.append('cloud_name', cloudName);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
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

    const getNextStaffId = async () => {
        // Simple increment logic by checking the last added ID
        // Note: For high concurrency, use a distributed counter or Firestore transaction
        const q = query(collection(db, "Staff"), orderBy("staffId", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const lastId = querySnapshot.docs[0].data().staffId;
            return (parseInt(lastId) + 1).toString();
        }
        return "1";
    }

    const handleAddStaff = async () => {
        if (!newStaff.staffName || !newStaff.staffDesignation || !newStaff.staffDescription) {
            Alert.alert("Error", "Please fill all required fields");
            return;
        }

        setSubmitting(true);
        try {
            let imageUrl = null;
            if (newStaff.staffImage) {
                imageUrl = await uploadToCloudinary(newStaff.staffImage);
            }

            const nextId = await getNextStaffId();

            await addDoc(collection(db, "Staff"), {
                staffId: parseInt(nextId),
                staffName: newStaff.staffName,
                staffDesignation: newStaff.staffDesignation,
                staffDescription: newStaff.staffDescription,
                staffImage: imageUrl,
                createdAt: new Date()
            });

            setModalVisible(false);
            setNewStaff({ staffName: '', staffDesignation: '', staffDescription: '', staffImage: null });
            Alert.alert("Success", "Staff member added successfully");
        } catch (error) {
            Alert.alert("Error", "Failed to add staff: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Staff",
            "Are you sure you want to remove this staff member?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: 'destructive', onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "Staff", id));
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete staff member");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            {item.staffImage ? (
                <Image source={{ uri: item.staffImage }} style={styles.staffImage} />
            ) : (
                <View style={styles.iconContainer}>
                    <User color={theme.colors.primary} size={24} />
                </View>
            )}
            <View style={styles.info}>
                <Text style={styles.name}>{item.staffName}</Text>
                <Text style={styles.role}>{item.staffDesignation}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.staffDescription}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <Trash2 color={theme.colors.error} size={20} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Staff Management</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={staffList}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No staff members found</Text>
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
                            <Text style={styles.modalTitle}>Add New Staff</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {newStaff.staffImage ? (
                                    <Image source={{ uri: newStaff.staffImage }} style={styles.pickedImage} />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Upload size={32} color={theme.colors.textLight} />
                                        <Text style={styles.imageText}>Select Staff Image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <Input
                                label="Staff Name"
                                placeholder="e.g. Rahul Kumar"
                                value={newStaff.staffName}
                                onChangeText={(text) => setNewStaff({ ...newStaff, staffName: text })}
                            />

                            <Input
                                label="Designation"
                                placeholder="e.g. Head Chef"
                                value={newStaff.staffDesignation}
                                onChangeText={(text) => setNewStaff({ ...newStaff, staffDesignation: text })}
                            />

                            <Input
                                label="Description"
                                placeholder="Brief about the staff member..."
                                value={newStaff.staffDescription}
                                onChangeText={(text) => setNewStaff({ ...newStaff, staffDescription: text })}
                                multiline
                                numberOfLines={3}
                                inputStyle={{ height: 80, textAlignVertical: 'top', paddingTop: 10 }}
                            />

                            <Button
                                title={submitting ? "Adding..." : "Add Staff"}
                                onPress={handleAddStaff}
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
    listContent: {
        padding: theme.spacing.md,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    staffImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: theme.spacing.md,
        backgroundColor: theme.colors.background,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: '600',
        color: theme.colors.text,
    },
    role: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.primary,
        fontWeight: '500',
        marginTop: 2,
    },
    description: {
        fontSize: 12,
        color: theme.colors.textLight,
        marginTop: 2,
    },
    deleteButton: {
        padding: theme.spacing.sm,
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
});
