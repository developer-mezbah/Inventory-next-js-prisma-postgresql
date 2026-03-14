"use client";
import { useState, useEffect } from "react";
import { FiPrinter, FiShoppingCart, FiShoppingBag, FiBox, FiPercent, FiShield, FiFileText } from "react-icons/fi";
import { toast } from "react-toastify";
import useSettingsStore from "@/stores/settingsStore";

export default function PrintSettings() {
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    
    // Get settings from store
    const { 
        settings, 
        updatePrintSettings,
        resetPrintSettings,
        saveSettings,
        isLoading: storeLoading,
        error: storeError,
        clearError
    } = useSettingsStore();

    // Local state for print settings (for change tracking)
    const [localSettings, setLocalSettings] = useState({
        sale: {
            quantity: true,
            tax: true,
            warranty: true,
            additionalField: false,
            discount: true,
            serialNumber: false,
            notes: true
        },
        purchase: {
            quantity: true,
            tax: true,
            warranty: false,
            additionalField: true,
            discount: false,
            serialNumber: true,
            notes: true
        }
    });

    // Update local settings when store settings change
    useEffect(() => {
        if (settings?.printSettings) {
            setLocalSettings(settings.printSettings);
        }
    }, [settings?.printSettings]);

    // Track changes
    useEffect(() => {
        if (settings?.printSettings) {
            const hasUnsavedChanges =
                JSON.stringify(localSettings) !== JSON.stringify(settings.printSettings);
            setHasChanges(hasUnsavedChanges);
        }
    }, [localSettings, settings?.printSettings]);

    // Show error toast if store has error
    useEffect(() => {
        if (storeError) {
            toast.error(storeError);
            clearError();
        }
    }, [storeError, clearError]);

    const toggle = (category, key) => {
        setLocalSettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key],
            },
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);

        try {
            // First update the store
            updatePrintSettings(localSettings);
            
            // Then save to database
            const result = await saveSettings();
            
            if (result.success) {
                toast.success('Print settings saved successfully!');
                setHasChanges(false);
            } else {
                // Revert local settings if save failed
                setLocalSettings(settings.printSettings);
                toast.error(result.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.message || 'Failed to save settings');
            // Revert local settings on error
            setLocalSettings(settings.printSettings);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setLocalSettings(settings.printSettings);
        setHasChanges(false);
        toast.success('Changes reverted');
    };

    const handleResetToDefaults = () => {
        const defaultSettings = {
            sale: {
                quantity: true,
                tax: true,
                warranty: true,
                additionalField: false,
                discount: true,
                serialNumber: false,
                notes: true
            },
            purchase: {
                quantity: true,
                tax: true,
                warranty: false,
                additionalField: true,
                discount: false,
                serialNumber: true,
                notes: true
            }
        };
        resetPrintSettings(defaultSettings);
        setLocalSettings(defaultSettings);
        toast.success('Reset to default print settings');
    };

    const ToggleSwitch = ({ enabled, onClick, disabled = false }) => {
        return (
            <button
                onClick={onClick}
                disabled={disabled || storeLoading || isSaving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out active:scale-95
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
                        ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
                />
            </button>
        );
    };

    const SectionHeader = ({ icon: Icon, title, description, color = "indigo" }) => (
        <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 bg-${color}-50 rounded-lg`}>
                <Icon className={`text-${color}-600 text-xl`} />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
    );

    const ToggleItem = ({ label, description, category, field, icon: Icon }) => (
        <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-gray-100 rounded-lg">
                    <Icon className="text-gray-600 text-sm" />
                </div>
                <div>
                    <h3 className="font-medium text-gray-700 text-sm">{label}</h3>
                    <p className="text-xs text-gray-400">{description}</p>
                </div>
            </div>
            <ToggleSwitch
                enabled={localSettings[category][field]}
                onClick={() => toggle(category, field)}
            />
        </div>
    );

    if (storeLoading && !settings?.printSettings) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border">
                                    <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
                                    {[1, 2, 3, 4, 5].map((j) => (
                                        <div key={j} className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                                <div>
                                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                                                </div>
                                            </div>
                                            <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
                                        </div>
                                    ))}
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
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <FiPrinter className="text-2xl text-indigo-600" />
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Print Settings
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sale Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition">
                        <SectionHeader 
                            icon={FiShoppingCart} 
                            title="Sale Print Settings" 
                            description="Configure what appears on sale invoices"
                            color="green"
                        />
                        <div className="space-y-1">
                            <ToggleItem 
                                label="Quantity" 
                                description="Show item quantities" 
                                category="sale" 
                                field="quantity"
                                icon={FiBox}
                            />
                            <ToggleItem 
                                label="Tax" 
                                description="Show tax calculations" 
                                category="sale" 
                                field="tax"
                                icon={FiPercent}
                            />
                            <ToggleItem 
                                label="Warranty" 
                                description="Show warranty information" 
                                category="sale" 
                                field="warranty"
                                icon={FiShield}
                            />
                            <ToggleItem 
                                label="Additional Field" 
                                description="Show custom additional field" 
                                category="sale" 
                                field="additionalField"
                                icon={FiFileText}
                            />
                            <ToggleItem 
                                label="Discount" 
                                description="Show discount details" 
                                category="sale" 
                                field="discount"
                                icon={FiPercent}
                            />
                            <ToggleItem 
                                label="Serial Number" 
                                description="Show item serial numbers" 
                                category="sale" 
                                field="serialNumber"
                                icon={FiBox}
                            />
                            <ToggleItem 
                                label="Notes" 
                                description="Show order notes" 
                                category="sale" 
                                field="notes"
                                icon={FiFileText}
                            />
                        </div>
                    </div>

                    {/* Purchase Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition">
                        <SectionHeader 
                            icon={FiShoppingBag} 
                            title="Purchase Print Settings" 
                            description="Configure what appears on purchase orders"
                            color="purple"
                        />
                        <div className="space-y-1">
                            <ToggleItem 
                                label="Quantity" 
                                description="Show item quantities" 
                                category="purchase" 
                                field="quantity"
                                icon={FiBox}
                            />
                            <ToggleItem 
                                label="Tax" 
                                description="Show tax calculations" 
                                category="purchase" 
                                field="tax"
                                icon={FiPercent}
                            />
                            <ToggleItem 
                                label="Warranty" 
                                description="Show warranty information" 
                                category="purchase" 
                                field="warranty"
                                icon={FiShield}
                            />
                            <ToggleItem 
                                label="Additional Field" 
                                description="Show custom additional field" 
                                category="purchase" 
                                field="additionalField"
                                icon={FiFileText}
                            />
                            <ToggleItem 
                                label="Discount" 
                                description="Show discount details" 
                                category="purchase" 
                                field="discount"
                                icon={FiPercent}
                            />
                            <ToggleItem 
                                label="Serial Number" 
                                description="Show item serial numbers" 
                                category="purchase" 
                                field="serialNumber"
                                icon={FiBox}
                            />
                            <ToggleItem 
                                label="Notes" 
                                description="Show order notes" 
                                category="purchase" 
                                field="notes"
                                icon={FiFileText}
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-3">
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
        </div>
    );
}