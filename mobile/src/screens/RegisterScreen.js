import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await register(name, email, password);
        } catch (e) {
            Alert.alert('Registration Failed', e.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.wrapper}>
                <Text style={styles.title}>Create Account</Text>

                <TextInput
                    style={styles.input}
                    value={name}
                    placeholder="Full Name"
                    onChangeText={text => setName(text)}
                />

                <TextInput
                    style={styles.input}
                    value={email}
                    placeholder="Enter email"
                    onChangeText={text => setEmail(text)}
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    value={password}
                    placeholder="Enter password"
                    onChangeText={text => setPassword(text)}
                    secureTextEntry
                />

                <Button title="Register" onPress={handleRegister} />

                <View style={styles.loginRow}>
                    <Text>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.link}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    wrapper: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    loginRow: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'center',
    },
    link: {
        color: 'blue',
    },
});

export default RegisterScreen;
