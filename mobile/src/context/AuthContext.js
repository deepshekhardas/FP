import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    // Login
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, ...user } = response.data;

            setUserInfo(user);
            setUserToken(token);
            await SecureStore.setItemAsync('userToken', token);
            await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
        } catch (error) {
            console.error('Login failed', error);
            throw error; // Rethrow for UI to handle
        } finally {
            setIsLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        setIsLoading(true);
        try {
            setUserToken(null);
            setUserInfo(null);
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userInfo');
        } catch (e) {
            console.error('Logout error', e);
        } finally {
            setIsLoading(false);
        }
    };

    // Register
    const register = async (name, email, password) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/register', { name, email, password });
            const { token, ...user } = response.data;

            setUserInfo(user);
            setUserToken(token);
            await SecureStore.setItemAsync('userToken', token);
            await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
        } catch (error) {
            console.log('Registration error', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Check if logged in on app start
    const isLoggedIn = async () => {
        try {
            let token = await SecureStore.getItemAsync('userToken');
            let user = await SecureStore.getItemAsync('userInfo');

            if (token) {
                setUserToken(token);
                setUserInfo(JSON.parse(user));
            }
        } catch (e) {
            console.log('Is logged in error', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, register, isLoading, userToken, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
};
