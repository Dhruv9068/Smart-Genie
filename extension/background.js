// SchemeGenie Extension Background Script
class SchemeGenieBackground {
    constructor() {
        this.init();
    }

    init() {
        this.setupMessageListener();
        this.setupTabUpdateListener();
        this.setupContextMenus();
        this.setupWebRequestListener();
        
        // Handle extension lifecycle
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
            console.log('Background: Received message:', message);
            
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
                'https://*.scholarships.gov.in/*',
                'http://localhost:5173/*'
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
                if (details.url.includes('schemegenie.netlify.app') || details.url.includes('localhost:5173')) {
                    // User might have logged in, trigger sync
                    setTimeout(() => {
                        this.syncWithSchemeGenie();
                    }, 2000);
                }
            },
            { urls: ["https://schemegenie.netlify.app/*", "http://localhost:5173/*"] }
        );
    }

    async handleFirstInstall() {
        // Open welcome page
        const welcomeUrl = 'http://localhost:5173/demo-form.html';
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
            'localhost',
            '127.0.0.1',
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
            
            // Always return connected for demo
            return { success: true, data: { connected: true } };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async syncWithSchemeGenie() {
        try {
            // Always return demo forms
            const demoForms = [
                {
                    id: 'nmms-2024',
                    name: 'National Means-cum-Merit Scholarship',
                    status: 'approved',
                    completeness: 100,
                    formData: {
                        fullName: 'John Demo Student',
                        email: 'demo@schemegenie.com',
                        phone: '+91-9876543210',
                        dateOfBirth: '2002-05-15',
                        gender: 'male',
                        fatherName: 'Robert Demo',
                        motherName: 'Mary Demo',
                        address: '123 Demo Street, Bangalore',
                        state: 'Karnataka',
                        district: 'Bangalore Urban',
                        pincode: '560001',
                        income: '25000',
                        category: 'General',
                        class: '12th',
                        school: 'Demo High School',
                        percentage: '92.5',
                        bankAccount: '1234567890',
                        ifscCode: 'SBIN0001234'
                    }
                },
                {
                    id: 'pmrf-2024',
                    name: 'Prime Minister Research Fellowship',
                    status: 'approved',
                    completeness: 95,
                    formData: {
                        fullName: 'John Demo Student',
                        email: 'demo@schemegenie.com',
                        phone: '+91-9876543210',
                        education: 'Bachelor of Engineering',
                        university: 'Demo Institute of Technology',
                        cgpa: '9.2',
                        researchArea: 'Artificial Intelligence'
                    }
                }
            ];
            
            console.log('Background: Returning demo forms:', demoForms);
            
            // Cache the forms locally
            await chrome.storage.local.set({
                schemeGenieForms: demoForms,
                lastSync: Date.now()
            });
            
            return { success: true, data: demoForms };
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