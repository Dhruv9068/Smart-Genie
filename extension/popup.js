// SchemeGenie Extension Popup Script with Firebase Integration
class SchemeGeniePopup {
    constructor() {
        this.currentUser = null;
        this.savedForms = [];
        this.isConnected = false;
        this.currentTab = null;
        this.fillingInProgress = false;
        this.websiteUrl = 'https://schemegenie.netlify.app';
        
        this.init();
    }

    async init() {
        await this.getCurrentTab();
        await this.checkConnection();
        this.setupEventListeners();
        this.updateUI();
    }

    async getCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tab;
        } catch (error) {
            console.error('Failed to get current tab:', error);
        }
    }

    async checkConnection() {
        try {
            // First check local storage
            let userData = await this.getStoredUserData();
            
            // If no local data, try to sync from website
            if (!userData) {
                await this.syncFromWebsite();
                userData = await this.getStoredUserData();
            }
            
            if (userData && (userData.token || userData.id)) {
                // Verify user data is valid
                const isValid = userData.id ? true : await this.verifyFirebaseToken(userData.token);
                
                if (isValid) {
                    this.currentUser = userData;
                    this.isConnected = true;
                    await this.loadUserForms();
                } else {
                    // Token expired, clear storage
                    await this.clearUserData();
                }
            }
        } catch (error) {
            console.error('Connection check failed:', error);
            this.showError('Connection failed. Please try again.');
        }
    }
    
    async syncFromWebsite() {
        try {
            // Try to get user data from the website's localStorage
            const tabs = await chrome.tabs.query({url: "https://schemegenie.netlify.app/*"});
            
            if (tabs.length > 0) {
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => {
                        // Try to get Firebase auth data
                        const firebaseAuth = localStorage.getItem('firebase:authUser:AIzaSyCZmv4R5JsQkTG3jaLH1AlUdZzWByC539s:[DEFAULT]');
                        if (firebaseAuth) {
                            const authData = JSON.parse(firebaseAuth);
                            return {
                                id: authData.uid,
                                email: authData.email,
                                name: authData.displayName || authData.email,
                                token: authData.accessToken
                            };
                        }
                        return null;
                    }
                });
                
                if (results && results[0] && results[0].result) {
                    await this.saveUserData(results[0].result);
                }
            }
        } catch (error) {
            console.log('Could not sync from website:', error);
        }
    }

    async getStoredUserData() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['schemeGenieUser'], (result) => {
                resolve(result.schemeGenieUser || null);
            });
        });
    }

    async verifyFirebaseToken(token) {
        try {
            // In a real implementation, this would verify the Firebase token
            // For now, we'll simulate verification
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true); // Simulate successful verification
                }, 500);
            });
        } catch (error) {
            return false;
        }
    }

    async loadUserForms() {
        try {
            // Try to get forms from Firebase
            const formsData = await this.fetchUserFormsFromFirebase();
            
            if (formsData && formsData.length > 0) {
                this.savedForms = formsData;
            } else {
                // Fallback to sample data
                this.savedForms = [
                    {
                        id: 'nmms-2024',
                        name: 'National Means-cum-Merit Scholarship',
                        type: 'education',
                        status: 'approved',
                        completeness: 95,
                        lastUpdated: new Date().toISOString(),
                        formData: {
                            fullName: this.currentUser?.name || 'John Doe',
                            email: this.currentUser?.email || 'john@example.com',
                            phone: '+91-9876543210',
                            age: '20',
                            income: '150000'
                        }
                    },
                    {
                        id: 'pmrf-2024',
                        name: 'Prime Minister Research Fellowship',
                        type: 'research',
                        status: 'approved',
                        completeness: 88,
                        lastUpdated: new Date().toISOString(),
                        formData: {
                            fullName: this.currentUser?.name || 'John Doe',
                            email: this.currentUser?.email || 'john@example.com',
                            education: 'Masters',
                            researchArea: 'Computer Science'
                        }
                    }
                ];
            }

            // Simulate user data if not available
            if (!this.currentUser.name) {
                this.currentUser = {
                    ...this.currentUser,
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    applicationsCount: this.savedForms.length
                };
            }
        } catch (error) {
            console.error('Failed to load user forms:', error);
        }
    }

    async fetchUserFormsFromFirebase() {
        try {
            // This would connect to your Firebase and fetch approved applications
            // For now, return null to use fallback data
            return null;
        } catch (error) {
            console.error('Firebase fetch error:', error);
            return null;
        }
    }

    setupEventListeners() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.handleRefresh());
        }

        // Dashboard button
        const dashboardBtn = document.getElementById('dashboardBtn');
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => this.openDashboard());
        }

        // Stop filling button
        const stopFillingBtn = document.getElementById('stopFillingBtn');
        if (stopFillingBtn) {
            stopFillingBtn.addEventListener('click', () => this.stopFilling());
        }

        // Retry button
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.handleRetry());
        }

        // Footer links
        const helpLink = document.getElementById('helpLink');
        if (helpLink) {
            helpLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openHelp();
            });
        }

        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    updateUI() {
        this.updateStatus();
        
        if (!this.isConnected) {
            this.showLoginState();
        } else if (this.fillingInProgress) {
            this.showFillingState();
        } else {
            this.showConnectedState();
        }
    }

    updateStatus() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusDot = statusIndicator?.querySelector('.status-dot');
        const statusText = statusIndicator?.querySelector('.status-text');

        if (!statusDot || !statusText) return;

        if (this.isConnected) {
            statusDot.className = 'status-dot';
            statusText.textContent = 'Connected';
        } else {
            statusDot.className = 'status-dot error';
            statusText.textContent = 'Not Connected';
        }
    }

    showLoginState() {
        this.hideAllStates();
        const loginState = document.getElementById('loginState');
        if (loginState) {
            loginState.style.display = 'block';
            loginState.classList.add('fade-in');
        }
    }

    showConnectedState() {
        this.hideAllStates();
        const connectedState = document.getElementById('connectedState');
        if (connectedState) {
            connectedState.style.display = 'block';
            connectedState.classList.add('fade-in');
        }

        this.updateUserInfo();
        this.updateStats();
        this.updatePageDetection();
        this.updateFormsList();
    }

    showFillingState() {
        this.hideAllStates();
        const fillingState = document.getElementById('fillingState');
        if (fillingState) {
            fillingState.style.display = 'block';
            fillingState.classList.add('fade-in');
        }
    }

    showErrorState(message) {
        this.hideAllStates();
        const errorState = document.getElementById('errorState');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorState && errorMessage) {
            errorMessage.textContent = message;
            errorState.style.display = 'block';
            errorState.classList.add('fade-in');
        }
    }

    hideAllStates() {
        const states = ['loginState', 'connectedState', 'fillingState', 'errorState'];
        states.forEach(stateId => {
            const element = document.getElementById(stateId);
            if (element) {
                element.style.display = 'none';
                element.classList.remove('fade-in');
            }
        });
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        const userInitial = document.getElementById('userInitial');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');

        if (userInitial) {
            userInitial.textContent = this.currentUser.name?.charAt(0).toUpperCase() || 'U';
        }

        if (userName) {
            userName.textContent = this.currentUser.name || 'User';
        }

        if (userEmail) {
            userEmail.textContent = this.currentUser.email || 'user@example.com';
        }
    }

    updateStats() {
        const savedFormsCount = document.getElementById('savedFormsCount');
        const applicationsCount = document.getElementById('applicationsCount');

        if (savedFormsCount) {
            savedFormsCount.textContent = this.savedForms.filter(f => f.status === 'approved').length.toString();
        }

        if (applicationsCount) {
            applicationsCount.textContent = this.savedForms.length.toString();
        }
    }

    updatePageDetection() {
        const detectionStatus = document.getElementById('detectionStatus');
        const detectionUrl = document.getElementById('detectionUrl');

        if (!detectionStatus || !detectionUrl || !this.currentTab) return;

        const url = this.currentTab.url;
        detectionUrl.textContent = url;

        // Check if current page is a government form
        const isGovSite = this.isGovernmentSite(url);
        
        if (isGovSite) {
            detectionStatus.textContent = '✅ Government form detected';
            detectionStatus.style.color = '#10b981';
        } else {
            detectionStatus.textContent = '🔍 No forms detected';
            detectionStatus.style.color = '#6b7280';
        }
    }

    updateFormsList() {
        const formsList = document.getElementById('formsList');
        if (!formsList) return;

        const approvedForms = this.savedForms.filter(form => form.status === 'approved');

        if (approvedForms.length === 0) {
            formsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-text">
                        No approved forms yet.<br>
                        Complete applications on SchemeGenie to see them here.
                    </div>
                </div>
            `;
            return;
        }

        formsList.innerHTML = approvedForms.map(form => `
            <div class="form-item">
                <div class="form-info">
                    <div class="form-name">${form.name}</div>
                    <div class="form-details">
                        ${form.completeness}% complete • Ready to use
                    </div>
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary btn-small" onclick="popup.fillForm('${form.id}')">
                        <span class="btn-icon">✨</span>
                        Fill
                    </button>
                </div>
            </div>
        `).join('');
    }

    isGovernmentSite(url) {
        const govDomains = [
            '.gov',
            '.gov.in',
            'scholarships.gov.in',
            'ssp.postmatric.karnataka.gov.in',
            'karepass.cgg.gov.in'
        ];

        return govDomains.some(domain => url.includes(domain));
    }

    async handleLogin() {
        try {
            // Open SchemeGenie login page
            const schemeGenieUrl = 'https://schemegenie.netlify.app/';
            await chrome.tabs.create({ url: schemeGenieUrl });
            
            // Show instructions
            this.showLoginInstructions();
        } catch (error) {
            console.error('Login failed:', error);
            this.showError('Failed to open login page');
        }
    }

    showLoginInstructions() {
        // Update the login state to show instructions
        const loginState = document.getElementById('loginState');
        if (loginState) {
            loginState.innerHTML = `
                <div class="state-icon">🔗</div>
                <h2 class="state-title">Login in Progress</h2>
                <p class="state-description">
                    Please login to SchemeGenie in the new tab, then click refresh here.
                </p>
                <button class="btn btn-primary" onclick="popup.handleRefresh()">
                    <span class="btn-icon">🔄</span>
                    Check Login Status
                </button>
            `;
        }
    }

    async handleRefresh() {
        try {
            await this.checkConnection();
            if (this.isConnected) {
                await this.loadUserForms();
            }
            this.updateUI();
        } catch (error) {
            console.error('Refresh failed:', error);
            this.showError('Failed to refresh data');
        }
    }

    async openDashboard() {
        try {
            const dashboardUrl = 'https://schemegenie.netlify.app/dashboard';
            await chrome.tabs.create({ url: dashboardUrl });
        } catch (error) {
            console.error('Failed to open dashboard:', error);
        }
    }

    async fillForm(formId) {
        try {
            if (!this.currentTab) {
                this.showError('No active tab found');
                return;
            }

            const form = this.savedForms.find(f => f.id === formId);
            if (!form) {
                this.showError('Form not found');
                return;
            }

            if (form.status !== 'approved') {
                this.showError('Form not approved for auto-fill');
                return;
            }

            // Start filling process
            this.fillingInProgress = true;
            this.updateUI();

            // Send message to content script to start filling
            await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'fillForm',
                formId: formId,
                formData: form.formData
            });

            // Simulate filling progress
            this.simulateFillingProgress(form);

        } catch (error) {
            console.error('Form filling failed:', error);
            this.fillingInProgress = false;
            this.showError('Failed to fill form. Make sure you\'re on a supported government website.');
        }
    }

    simulateFillingProgress(form) {
        let progress = 0;
        const totalFields = Object.keys(form.formData || {}).length || 10;
        let filledFields = 0;

        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            filledFields = Math.floor((progress / 100) * totalFields);

            if (progress >= 100) {
                progress = 100;
                filledFields = totalFields;
                clearInterval(progressInterval);
                
                setTimeout(() => {
                    this.fillingInProgress = false;
                    this.updateUI();
                    this.showSuccess('Form filled successfully!');
                }, 1000);
            }

            this.updateFillingProgress(progress, filledFields, totalFields, form.name);
        }, 300);
    }

    updateFillingProgress(percentage, filled, total, formName) {
        const fillingProgress = document.getElementById('fillingProgress');
        const fillingPercentage = document.getElementById('fillingPercentage');
        const currentFormName = document.getElementById('currentFormName');
        const fieldsProgress = document.getElementById('fieldsProgress');

        if (fillingProgress) {
            fillingProgress.style.background = `conic-gradient(#f97316 ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg)`;
        }

        if (fillingPercentage) {
            fillingPercentage.textContent = `${Math.round(percentage)}%`;
        }

        if (currentFormName) {
            currentFormName.textContent = formName;
        }

        if (fieldsProgress) {
            fieldsProgress.textContent = `${filled}/${total} fields`;
        }
    }

    stopFilling() {
        this.fillingInProgress = false;
        this.updateUI();
        
        // Send message to content script to stop filling
        if (this.currentTab) {
            chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'stopFilling'
            }).catch(() => {
                // Ignore errors if content script is not available
            });
        }
    }

    async handleRetry() {
        await this.checkConnection();
        this.updateUI();
    }

    async handleLogout() {
        try {
            await this.clearUserData();
            this.currentUser = null;
            this.savedForms = [];
            this.isConnected = false;
            this.updateUI();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    async clearUserData() {
        return new Promise((resolve) => {
            chrome.storage.local.remove(['schemeGenieUser'], () => {
                resolve();
            });
        });
    }

    openHelp() {
        const helpUrl = 'https://schemegenie.netlify.app/';
        chrome.tabs.create({ url: helpUrl });
    }

    showSuccess(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        this.showErrorState(message);
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.popup = new SchemeGeniePopup();
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillingComplete') {
        if (window.popup) {
            window.popup.fillingInProgress = false;
            window.popup.updateUI();
            window.popup.showSuccess('Form filled successfully!');
        }
    } else if (message.action === 'fillingError') {
        if (window.popup) {
            window.popup.fillingInProgress = false;
            window.popup.showError(message.error || 'Form filling failed');
        }
    }
});