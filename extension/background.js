// SchemeGenie Extension Background Script with Firebase Integration
class SchemeGenieBackground {
    constructor() {
        this.websiteUrl = 'https://schemegenie.netlify.app';
        this.init();
    }

    init() {
        this.setupInstallListener();
        this.setupMessageListener();
        this.setupTabUpdateListener();
        this.setupContextMenus();
        this.setupWebRequestListener();
    }

    setupInstallListener() {
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                this.handleFirstInstall();
            } else if (details.reason === 'update') {
                this.handleUpdate(details.previousVersion);
            }
        });
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.action) {
                case 'getUserData':
                    this.getUserData().then(sendResponse);
                    return true;
                
                case 'saveUserData':
                    this.saveUserData(message.data).then(sendResponse);
                    return true;
                
                case 'clearUserData':
                    this.clearUserData().then(sendResponse);
                    return true;
                
                case 'checkConnection':
                    this.checkSchemeGenieConnection().then(sendResponse);
                    return true;
                
                case 'syncWithSchemeGenie':
                    this.syncWithSchemeGenie().then(sendResponse);
                    return true;
                
                case 'getApprovedForms':
                    this.getApprovedForms().then(sendResponse);
                    return true;
                
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        });
    }

    setupTabUpdateListener() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.handleTabUpdate(tabId, tab);
            }
        });
    }

    setupContextMenus() {
        chrome.contextMenus.create({
            id: 'schemegenie-fill-form',
            title: 'Fill with SchemeGenie',
            contexts: ['editable'],
            documentUrlPatterns: [
                'https://*.gov/*',
                'https://*.gov.in/*',
                'https://*.scholarships.gov.in/*'
            ]
        });

        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === 'schemegenie-fill-form') {
                this.handleContextMenuClick(tab);
            }
        });
    }

    setupWebRequestListener() {
        // Listen for requests to SchemeGenie to detect login
        chrome.webRequest.onCompleted.addListener(
            (details) => {
                if (details.url.includes('schemegenie.netlify.app')) {
                    // User might have logged in, trigger sync
                    setTimeout(() => {
                        this.syncWithSchemeGenie();
                    }, 2000);
                }
            },
            { urls: ["https://schemegenie.netlify.app/*"] }
        );
        
        // Also listen for Firebase auth changes
        chrome.webRequest.onCompleted.addListener(
            (details) => {
                if (details.url.includes('firebase') && details.url.includes('auth')) {
                    setTimeout(() => {
                        this.syncWithSchemeGenie();
                    }, 1000);
                }
            },
            { urls: ["https://*.googleapis.com/*", "https://*.firebaseapp.com/*"] }
        );
    }

    async handleFirstInstall() {
        // Open welcome page
        const welcomeUrl = 'https://schemegenie.netlify.app/';
        await chrome.tabs.create({ url: welcomeUrl });
        
        // Set default settings
        await chrome.storage.local.set({
            schemeGenieSettings: {
                autoFill: true,
                showNotifications: true,
                highlightFields: true,
                version: chrome.runtime.getManifest().version
            }
        });
    }

    async handleUpdate(previousVersion) {
        console.log(`Updated from version ${previousVersion}`);
        await this.migrateSettings(previousVersion);
    }

    async handleTabUpdate(tabId, tab) {
        if (this.isGovernmentSite(tab.url)) {
            // Inject content script if not already injected
            try {
                await chrome.scripting.executeScript({
                    target: { tabId },
                    files: ['content.js']
                });
                
                await chrome.scripting.insertCSS({
                    target: { tabId },
                    files: ['content.css']
                });
            } catch (error) {
                console.log('Content script injection skipped:', error.message);
            }
            
            // Update badge to show extension is active
            await chrome.action.setBadgeText({
                tabId,
                text: '✓'
            });
            
            await chrome.action.setBadgeBackgroundColor({
                color: '#f97316'
            });
        } else {
            // Clear badge for non-government sites
            await chrome.action.setBadgeText({
                tabId,
                text: ''
            });
        }
    }

    async handleContextMenuClick(tab) {
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'fillForm',
                source: 'contextMenu'
            });
        } catch (error) {
            console.error('Context menu action failed:', error);
        }
    }

    isGovernmentSite(url) {
        if (!url) return false;
        
        const govPatterns = [
            '.gov',
            '.gov.in',
            'scholarships.gov.in',
            'ssp.postmatric.karnataka.gov.in',
            'karepass.cgg.gov.in'
        ];
        
        return govPatterns.some(pattern => url.includes(pattern));
    }

    async getUserData() {
        try {
            const result = await chrome.storage.local.get(['schemeGenieUser']);
            return { success: true, data: result.schemeGenieUser || null };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async saveUserData(userData) {
        try {
            await chrome.storage.local.set({ schemeGenieUser: userData });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async clearUserData() {
        try {
            await chrome.storage.local.remove(['schemeGenieUser', 'schemeGenieForms']);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async checkSchemeGenieConnection() {
        try {
            const userData = await this.getUserData();
            if (!userData.success || !userData.data) {
                return { success: false, error: 'Not logged in' };
            }
            
            // Try to connect to Firebase
            const response = await this.testFirebaseConnection();
            return { success: response.success, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async testFirebaseConnection() {
        try {
            // Simple connection test to Firebase
            const response = await fetch(`https://scheme-genie-1982f-default-rtdb.firebaseio.com/.json`);
            if (response.ok) {
                return { success: true, data: { connected: true } };
            }
            throw new Error('Connection failed');
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async syncWithSchemeGenie() {
        try {
            const userData = await this.getUserData();
            if (!userData.success || !userData.data) {
                throw new Error('User not logged in');
            }
            
            // Try to fetch approved forms from Firebase
            const formsResponse = await this.fetchApprovedFormsFromFirebase(userData.data.userId);
            
            if (formsResponse.success) {
                // Cache the forms locally
                await chrome.storage.local.set({
                    schemeGenieForms: formsResponse.data,
                    lastSync: Date.now()
                });
            }
            
            return formsResponse;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async fetchApprovedFormsFromFirebase(userId) {
        try {
            // This would connect to your Firebase Firestore to get approved applications
            // For now, return sample data
            return {
                success: true,
                data: [
                    {
                        id: 'nmms-2024',
                        name: 'National Means-cum-Merit Scholarship',
                        status: 'approved',
                        completeness: 95,
                        formData: {
                            fullName: 'John Doe',
                            email: 'john@example.com',
                            phone: '+91-9876543210',
                            age: '20',
                            income: '150000'
                        }
                    },
                    {
                        id: 'pmrf-2024',
                        name: 'Prime Minister Research Fellowship',
                        status: 'approved',
                        completeness: 88,
                        formData: {
                            fullName: 'John Doe',
                            email: 'john@example.com',
                            education: 'Masters',
                            researchArea: 'Computer Science'
                        }
                    }
                ]
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getApprovedForms() {
        try {
            const result = await chrome.storage.local.get(['schemeGenieForms']);
            return { success: true, data: result.schemeGenieForms || [] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async migrateSettings(previousVersion) {
        const currentVersion = chrome.runtime.getManifest().version;
        
        if (this.compareVersions(previousVersion, '1.0.0') < 0) {
            console.log('Migrating settings to version 1.0.0');
        }
    }

    compareVersions(version1, version2) {
        const v1parts = version1.split('.').map(Number);
        const v2parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            
            if (v1part < v2part) return -1;
            if (v1part > v2part) return 1;
        }
        
        return 0;
    }
}

// Initialize background script
new SchemeGenieBackground();