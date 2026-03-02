"use client";
import useSettingsStore from '@/stores/settingsStore';
import React, { useEffect } from 'react'

const StateMiddleware = () => {
    const { initializeSettings, isInitialized, isLoading } = useSettingsStore();

    useEffect(() => {
        // Initialize settings when app loads
        if (!isInitialized) {
            initializeSettings();
        }
    }, [initializeSettings, isInitialized]);
    return (
        <span></span>
    )
}

export default StateMiddleware