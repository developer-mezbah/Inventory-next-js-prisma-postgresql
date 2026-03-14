// store/settingsStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import client_api from "@/utils/API_FETCH";

const useSettingsStore = create(
  persist(
    (set, get) => ({
      // State
      settings: {
        formSettings: {
          warranty: true,
          tax: true,
          discount: true,
        },
        printSettings: {
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
        },
        // Add other settings categories here later
        // notificationSettings: {},
        // appearanceSettings: {},
        // etc.
      },
      isLoading: false,
      error: null,
      isInitialized: false,

      // Actions
      initializeSettings: async () => {
        // Prevent multiple initializations
        if (get().isInitialized) return;

        set({ isLoading: true, error: null });
        
        try {
          // Fetch all settings in one API call
          const response = await client_api.get(
            '/api/settings',
            ""
          );

          if (response.success && response.data) {
            set({ 
              settings: response.data,
              isInitialized: true,
              isLoading: false 
            });
          } else {
            throw new Error('Failed to load settings');
          }
        } catch (error) {
          console.error('Error initializing settings:', error);
          set({ 
            error: error.message,
            isLoading: false,
            // Keep default settings on error
          });
        }
      },

      // Form Settings Actions
      updateFormSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            formSettings: {
              ...state.settings.formSettings,
              ...newSettings,
            },
          },
        }));
      },

      toggleFormSetting: (key) => {
        set((state) => ({
          settings: {
            ...state.settings,
            formSettings: {
              ...state.settings.formSettings,
              [key]: !state.settings.formSettings[key],
            },
          },
        }));
      },

      resetFormSettings: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            formSettings: {
              warranty: true,
              tax: true,
              discount: true,
            },
          },
        }));
      },

      // Print Settings Actions
      updatePrintSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            printSettings: {
              ...state.settings.printSettings,
              ...newSettings,
            },
          },
        }));
      },

      updatePrintCategory: (category, categorySettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            printSettings: {
              ...state.settings.printSettings,
              [category]: {
                ...state.settings.printSettings[category],
                ...categorySettings,
              },
            },
          },
        }));
      },

      togglePrintSetting: (category, key) => {
        set((state) => ({
          settings: {
            ...state.settings,
            printSettings: {
              ...state.settings.printSettings,
              [category]: {
                ...state.settings.printSettings[category],
                [key]: !state.settings.printSettings[category][key],
              },
            },
          },
        }));
      },

      resetPrintSettings: (defaultSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            printSettings: defaultSettings || {
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
            },
          },
        }));
      },

      // Generic Settings Actions
      updateSettings: (category, newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [category]: {
              ...state.settings[category],
              ...newSettings,
            },
          },
        }));
      },

      // Save settings to database
      saveSettings: async () => {
        const state = get();
        set({ isLoading: true, error: null });
        try {
          const response = await client_api.create(
            '/api/settings',
            "",
            state.settings
          );

          if (response.success) {
            set({ isLoading: false });
            return { success: true };
          } else {
            throw new Error(response.error || 'Failed to save settings');
          }
        } catch (error) {
          console.error('Error saving settings:', error);
          set({ 
            error: error.message,
            isLoading: false 
          });
          return { success: false, error: error.message };
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'app-settings', // name in localStorage
      partialize: (state) => ({ 
        settings: state.settings,
        isInitialized: state.isInitialized 
      }), // only persist these fields
    }
  )
);

export default useSettingsStore;