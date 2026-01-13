import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = () => {
    const { userInfo, logout, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.wrapper}>
                <Text style={styles.title}>Welcome to FitnessPro!</Text>
                <Text style={styles.subtitle}>Hello, {userInfo?.name}</Text>

                <View style={styles.buttonContainer}>
                    <Button title="Logout" onPress={logout} color="red" />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    wrapper: {
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 30,
    },
    buttonContainer: {
        marginTop: 20,
    }
});

export default HomeScreen;
