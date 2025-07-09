// SchemeGenie Extension Popup Script with Firebase Integration

class SchemeGeniePopup {
    constructor() {
        // Always use demo account - no login needed
        this.currentUser = {
            id: 'demo-user-123',
            email: 'demo@schemegenie.com',
            name: 'John Demo Student',
            country: 'IN'
        };
        this.savedForms = [];
        this.isConnected = true; // Always connected
        this.currentTab = null;
        this.fillingInProgress = false;
        this.websiteUrl = 'https://schemegenie.netlify.app';
        
        this.init();
    }

    async init() {
        await this.getCurrentTab();
        await this.initializeFirebase();
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

    async initializeFirebase() {
        try {
            console.log('Extension: Initializing with demo account (Firebase removed for security)...');
            
            // Always load demo forms
            await this.loadUserForms();
            
            console.log('Extension: Demo account ready with forms');
        } catch (error) {
            console.error('Demo initialization failed:', error);
            await this.loadDemoForms();
        }
    }
    
    async loadDemoForms() {
        console.log('Extension: Loading demo forms...');
        this.savedForms = [
            {
                id: 'nmms-2024',
                name: 'National Means-cum-Merit Scholarship',
                type: 'education',
                status: 'approved',
                completeness: 100,
                lastUpdated: new Date().toISOString(),
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
                type: 'research',
                status: 'approved',
                completeness: 95,
                lastUpdated: new Date().toISOString(),
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
    }

    async loadUserForms() {
        try {
            console.log('Extension: Loading demo forms...');
            
            // Always use demo forms for security
            await this.loadDemoForms();
        } catch (error) {
            console.error('Failed to load user forms:', error);
            await this.loadDemoForms();
        }
    }

    setupEventListeners() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleRefresh());
        }

        // Setup all button listeners
        this.setupButtonListeners();
    }
    
    setupButtonListeners() {
        const buttons = [
            { id: 'refreshBtn', handler: () => this.handleRefresh() },
            { id: 'dashboardBtn', handler: () => this.openDashboard() },
            { id: 'stopFillingBtn', handler: () => this.stopFilling() },
            { id: 'retryBtn', handler: () => this.handleRetry() },
            { id: 'helpLink', handler: () => this.openHelp() }
        ];
        
        buttons.forEach(({ id, handler }) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }




    updateUI() {
        this.updateStatus();
        
        if (this.fillingInProgress) { 
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
        const states = ['connectedState', 'fillingState', 'errorState'];
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
            'localhost',
            '127.0.0.1',
            '.gov',
            '.gov.in',
            'scholarships.gov.in',
            'ssp.postmatric.karnataka.gov.in',
            'karepass.cgg.gov.in'
        ];

        return govDomains.some(domain => url.includes(domain));
    }

    async handleRefresh() {
        try {
            console.log('Popup: Refreshing extension data...');
            await this.initializeFirebase();
            await this.loadUserForms();
            this.updateUI();
            this.showSuccess('Extension refreshed with latest data!');
        } catch (error) {
            console.error('Refresh failed:', error);
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
            console.log('Popup: Starting form fill for:', formId);
            
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
            console.log('Popup: Sending message to content script with data:', form.formData);
            this.updateUI();

            // Send message to content script to start filling
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'fillForm',
                formId: formId,
                formData: form.formData
            });
            
            console.log('Popup: Content script response:', response);

            // Simulate filling progress
            this.simulateFillingProgress(form);

        } catch (error) {
            console.error('Form filling failed:', error);
            this.fillingInProgress = false;
            
            // More specific error messages
            if (error.message.includes('Could not establish connection')) {
                this.showError('Please refresh the page and try again. The extension needs to reload on this page.');
            } else {
                this.showError('Failed to fill form. Make sure you\'re on a supported government website.');
            }
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
        await this.initializeFirebase();
        this.updateUI();
    }

    async handleLogout() {
        try {
            // Refresh instead of logout
            await this.handleRefresh();
        } catch (error) {
            console.error('Refresh failed:', error);
        }
    }

    openHelp() {
        const helpUrl = 'http://localhost:5173/extension-demo.html';
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
    console.log('Extension popup loaded - initializing demo mode');
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