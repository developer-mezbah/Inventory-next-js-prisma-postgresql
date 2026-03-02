"use client";
import { useState, useEffect } from "react";
import { FiSettings, FiShield, FiPercent, FiTag } from "react-icons/fi";
import { toast } from "react-toastify";
import useSettingsStore from "@/stores/settingsStore";

export default function FormSettings() {
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    
    // Get settings from store
    const { 
        settings, 
        toggleFormSetting, 
        updateFormSettings,
        resetFormSettings,
        saveSettings,
        isLoading: storeLoading,
        error: storeError,
        clearError
    } = useSettingsStore();

    // Local state for form settings (for change tracking)
    const [localSettings, setLocalSettings] = useState({
        warranty: true,
        tax: true,
        discount: true,
    });

    // Update local settings when store settings change
    useEffect(() => {
        if (settings?.formSettings) {
            setLocalSettings(settings.formSettings);
        }
    }, [settings?.formSettings]);

    // Track changes
    useEffect(() => {
        if (settings?.formSettings) {
            const hasUnsavedChanges =
                JSON.stringify(localSettings) !== JSON.stringify(settings.formSettings);
            setHasChanges(hasUnsavedChanges);
        }
    }, [localSettings, settings?.formSettings]);

    // Show error toast if store has error
    useEffect(() => {
        if (storeError) {
            toast.error(storeError);
            clearError();
        }
    }, [storeError, clearError]);

    const toggle = (key) => {
        setLocalSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);

        try {
            // First update the store
            updateFormSettings(localSettings);
            
            // Then save to database
            const result = await saveSettings();
            
            if (result.success) {
                toast.success('Settings saved successfully!');
                setHasChanges(false);
            } else {
                // Revert local settings if save failed
                setLocalSettings(settings.formSettings);
                toast.error(result.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.message || 'Failed to save settings');
            // Revert local settings on error
            setLocalSettings(settings.formSettings);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setLocalSettings(settings.formSettings);
        setHasChanges(false);
        toast.success('Changes reverted');
    };

    const handleResetToDefaults = () => {
        resetFormSettings();
        setLocalSettings({
            warranty: true,
            tax: true,
            discount: true,
        });
        toast.success('Reset to default settings');
    };

    const ToggleSwitch = ({ enabled, onClick, disabled = false }) => {
        return (
            <button
                onClick={onClick}
                disabled={disabled || storeLoading || isSaving}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-in-out active:scale-95
          ${enabled
                        ? "bg-indigo-600 shadow-lg shadow-indigo-500/30"
                        : "bg-gray-300"}
          ${(disabled || storeLoading || isSaving) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
            >
                <span
                    className={`absolute inset-0 rounded-full transition-opacity duration-300 ${enabled ? "opacity-100 bg-indigo-400/20 blur-md" : "opacity-0"
                        }`}
                ></span>
                <span
                    className={`relative inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out
            ${enabled ? "translate-x-6" : "translate-x-1"}`}
                />
            </button>
        );
    };

    if (storeLoading && !settings?.formSettings) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
                        <div className="space-y-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                            <div>
                                                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-48"></div>
                                            </div>
                                        </div>
                                        <div className="w-12 h-7 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <FiSettings className="text-2xl text-indigo-600" />
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Sale & Purchase Form Settings
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                            Unsaved changes
                        </span>
                    )}
                </div>
            </div>

            <div className="max-w-3xl space-y-5">
                {/* Warranty */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border flex items-center justify-between hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <FiShield className="text-indigo-600 text-lg" />
                        </div>
                        <div>
                            <h2 className="font-medium text-gray-800">Show Warranty</h2>
                            <p className="text-sm text-gray-500">
                                Display warranty field in forms
                            </p>
                        </div>
                    </div>
                    <ToggleSwitch
                        enabled={localSettings.warranty}
                        onClick={() => toggle("warranty")}
                    />
                </div>

                {/* Tax */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border flex items-center justify-between hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <FiPercent className="text-indigo-600 text-lg" />
                        </div>
                        <div>
                            <h2 className="font-medium text-gray-800">Show Tax</h2>
                            <p className="text-sm text-gray-500">
                                Display tax calculation in forms
                            </p>
                        </div>
                    </div>
                    <ToggleSwitch
                        enabled={localSettings.tax}
                        onClick={() => toggle("tax")}
                    />
                </div>

                {/* Discount */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border flex items-center justify-between hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <FiTag className="text-indigo-600 text-lg" />
                        </div>
                        <div>
                            <h2 className="font-medium text-gray-800">Show Discount</h2>
                            <p className="text-sm text-gray-500">
                                Allow discount field in forms
                            </p>
                        </div>
                    </div>
                    <ToggleSwitch
                        enabled={localSettings.discount}
                        onClick={() => toggle("discount")}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="max-w-3xl mt-8 flex justify-end gap-3">
                <button
                    onClick={handleResetToDefaults}
                    disabled={isSaving}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50"
                >
                    Reset to Defaults
                </button>
                {hasChanges && (
                    <button
                        onClick={handleReset}
                        disabled={isSaving}
                        className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-xl shadow-sm border transition-all duration-300 active:scale-95 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                )}
                <button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl shadow-sm transition-all duration-300 active:scale-95 
            ${(isSaving || !hasChanges) ? "opacity-50 cursor-not-allowed" : ""}
          `}
                >
                    {isSaving ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                        </span>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>
        </div>
    );
}