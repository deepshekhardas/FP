import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await login(email, password);
        } catch (e) {
            Alert.alert('Login Failed', e.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.wrapper}>
                <Text style={styles.title}>FitnessPro Login</Text>

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

                <Button title="Login" onPress={handleLogin} />

                <View style={styles.registerRow}>
                    <Text>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.link}>Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    registerRow: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'center',
    },
    link: {
        color: 'blue',
    },
});

export default LoginScreen;
