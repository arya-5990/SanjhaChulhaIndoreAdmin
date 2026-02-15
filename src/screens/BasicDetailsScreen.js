import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Save, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Clock, Plus, Trash2 } from 'lucide-react-native';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { theme } from '../theme';
import Input from '../components/Input';
import Button from '../components/Button';

export default function BasicDetailsScreen() {
    const navigation = useNavigation();
    const [submitting, setSubmitting] = useState(false);
    const [details, setDetails] = useState({
        address: '',
        phones: [''],
        emails: [''],

        // Social Media
        isInstagramEnabled: false,
        instagramUrl: '',
        isFacebookEnabled: false,
        facebookUrl: '',
        isTwitterEnabled: false,
        twitterUrl: '',

        // Working Hours
        monFriOpen: '',
        monFriClose: '',
        satSunOpen: '',
        satSunClose: ''
    });

    const db = getFirestore();

    useEffect(() => {
        fetchDetails();
    }, []);

    const fetchDetails = async () => {
        try {
            const docRef = doc(db, "basic_details", "info");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setDetails({
                    ...data,
                    phones: data.phones && data.phones.length > 0 ? data.phones : [''],
                    emails: data.emails && data.emails.length > 0 ? data.emails : ['']
                });
            }
        } catch (error) {
            console.error("Error fetching details:", error);
        }
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            // Filter out empty entries before saving
            const cleanedDetails = {
                ...details,
                address: details.address ? details.address.trim() : '',
                phones: details.phones.filter(p => p.trim() !== ''),
                emails: details.emails.filter(e => e.trim() !== '')
            };

            await setDoc(doc(db, "basic_details", "info"), cleanedDetails);
            Alert.alert("Success", "Details updated successfully");
        } catch (error) {
            Alert.alert("Error", "Failed to update details");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const addField = (field) => {
        setDetails({ ...details, [field]: [...details[field], ''] });
    };

    const removeField = (field, index) => {
        const updatedList = details[field].filter((_, i) => i !== index);
        setDetails({ ...details, [field]: updatedList });
    };

    const updateField = (field, index, value) => {
        const updatedList = [...details[field]];
        updatedList[index] = value;
        setDetails({ ...details, [field]: updatedList });
    };

    const SocialMediaToggle = ({ label, icon: Icon, isEnabled, onToggle, url, onUrlChange, placeholder }) => (
        <View style={styles.socialRow}>
            <View style={styles.socialHeader}>
                <View style={styles.socialLabelContainer}>
                    <Icon size={20} color={theme.colors.primary} />
                    <Text style={styles.socialLabel}>{label}</Text>
                </View>
                <Switch
                    trackColor={{ false: "#767577", true: theme.colors.primary }}
                    thumbColor={isEnabled ? "#f4f3f4" : "#f4f3f4"}
                    onValueChange={onToggle}
                    value={isEnabled}
                />
            </View>
            {isEnabled && (
                <Input
                    placeholder={placeholder}
                    value={url}
                    onChangeText={onUrlChange}
                    style={{ marginTop: 10 }}
                />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Basic Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    {/* 1. Contact Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. Contact Information</Text>

                        <Input
                            label="Address"
                            value={details.address}
                            onChangeText={(text) => setDetails({ ...details, address: text })}
                            multiline
                            numberOfLines={3}
                            inputStyle={{ height: 60, textAlignVertical: 'top', paddingTop: 10 }}
                            icon={<MapPin size={20} color={theme.colors.textLight} />}
                        />

                        {/* Phones */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={styles.subTitle}>Phone Numbers</Text>
                            {details.phones.map((phone, index) => (
                                <View key={index} style={styles.dynamicRow}>
                                    <View style={{ flex: 1 }}>
                                        <Input
                                            placeholder="Phone Number"
                                            value={phone}
                                            onChangeText={(text) => updateField('phones', index, text)}
                                            icon={<Phone size={20} color={theme.colors.textLight} />}
                                            keyboardType="phone-pad"
                                            style={{ marginBottom: 0 }}
                                        />
                                    </View>
                                    {details.phones.length > 1 && (
                                        <TouchableOpacity onPress={() => removeField('phones', index)} style={styles.removeButton}>
                                            <Trash2 size={20} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                            <TouchableOpacity onPress={() => addField('phones')} style={styles.addButton}>
                                <Plus size={16} color={theme.colors.primary} />
                                <Text style={styles.addButtonText}>Add Another Phone</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Emails */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={styles.subTitle}>Email Addresses</Text>
                            {details.emails.map((email, index) => (
                                <View key={index} style={styles.dynamicRow}>
                                    <View style={{ flex: 1 }}>
                                        <Input
                                            placeholder="Email Address"
                                            value={email}
                                            onChangeText={(text) => updateField('emails', index, text)}
                                            icon={<Mail size={20} color={theme.colors.textLight} />}
                                            keyboardType="email-address"
                                            style={{ marginBottom: 0 }}
                                        />
                                    </View>
                                    {details.emails.length > 1 && (
                                        <TouchableOpacity onPress={() => removeField('emails', index)} style={styles.removeButton}>
                                            <Trash2 size={20} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                            <TouchableOpacity onPress={() => addField('emails')} style={styles.addButton}>
                                <Plus size={16} color={theme.colors.primary} />
                                <Text style={styles.addButtonText}>Add Another Email</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Social Media Sub-section */}
                        <Text style={[styles.subTitle, { marginTop: 10 }]}>Social Media</Text>

                        <SocialMediaToggle
                            label="Instagram"
                            icon={Instagram}
                            isEnabled={details.isInstagramEnabled}
                            onToggle={(val) => setDetails({ ...details, isInstagramEnabled: val })}
                            url={details.instagramUrl}
                            onUrlChange={(text) => setDetails({ ...details, instagramUrl: text })}
                            placeholder="https://instagram.com/..."
                        />

                        <SocialMediaToggle
                            label="Facebook"
                            icon={Facebook}
                            isEnabled={details.isFacebookEnabled}
                            onToggle={(val) => setDetails({ ...details, isFacebookEnabled: val })}
                            url={details.facebookUrl}
                            onUrlChange={(text) => setDetails({ ...details, facebookUrl: text })}
                            placeholder="https://facebook.com/..."
                        />

                        <SocialMediaToggle
                            label="X (Twitter)"
                            icon={Twitter}
                            isEnabled={details.isTwitterEnabled}
                            onToggle={(val) => setDetails({ ...details, isTwitterEnabled: val })}
                            url={details.twitterUrl}
                            onUrlChange={(text) => setDetails({ ...details, twitterUrl: text })}
                            placeholder="https://x.com/..."
                        />
                    </View>

                    {/* 2. Working Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. Working Details</Text>

                        {/* Mon - Fri */}
                        <Text style={styles.dayLabel}>Mon - Fri</Text>
                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Input
                                    label="Opening Hour"
                                    placeholder="09:00 AM"
                                    value={details.monFriOpen}
                                    onChangeText={(text) => setDetails({ ...details, monFriOpen: text })}
                                    icon={<Clock size={16} color={theme.colors.textLight} />}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <Input
                                    label="Closing Hour"
                                    placeholder="10:00 PM"
                                    value={details.monFriClose}
                                    onChangeText={(text) => setDetails({ ...details, monFriClose: text })}
                                    icon={<Clock size={16} color={theme.colors.textLight} />}
                                />
                            </View>
                        </View>

                        {/* Sat - Sun */}
                        <Text style={styles.dayLabel}>Sat - Sun</Text>
                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Input
                                    label="Opening Hour"
                                    placeholder="10:00 AM"
                                    value={details.satSunOpen}
                                    onChangeText={(text) => setDetails({ ...details, satSunOpen: text })}
                                    icon={<Clock size={16} color={theme.colors.textLight} />}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <Input
                                    label="Closing Hour"
                                    placeholder="11:00 PM"
                                    value={details.satSunClose}
                                    onChangeText={(text) => setDetails({ ...details, satSunClose: text })}
                                    icon={<Clock size={16} color={theme.colors.textLight} />}
                                />
                            </View>
                        </View>
                    </View>

                    <Button
                        title={submitting ? "Saving..." : "Save Changes"}
                        onPress={handleSave}
                        disabled={submitting}
                        icon={<Save size={20} color="white" />}
                        style={{ marginBottom: 40 }}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
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
    content: {
        padding: theme.spacing.lg,
    },
    section: {
        marginBottom: theme.spacing.xl,
        backgroundColor: theme.colors.white,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: theme.typography.h3.fontSize,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    subTitle: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    socialRow: {
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
    },
    socialHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    socialLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    socialLabel: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text,
        fontWeight: '500',
    },
    dayLabel: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: '600',
        color: theme.colors.primary,
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
    },
    halfInput: {
        flex: 1,
    },
    dynamicRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    removeButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        marginBottom: 8,
    },
    addButtonText: {
        color: theme.colors.primary,
        marginLeft: 8,
        fontWeight: '600',
    }
});
