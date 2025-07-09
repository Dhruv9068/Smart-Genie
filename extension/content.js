// SchemeGenie Content Script - Enhanced Auto Form Filler
class SchemeGenieFormFiller {
    constructor() {
        this.isActive = false;
        this.currentFormData = null;
        this.filledFields = 0;
        this.totalFields = 0;
        this.fillingStopped = false;
        
        this.init();
    }

    init() {
        this.setupMessageListener();
        this.detectForms();
        this.addSchemeGenieIndicator();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.action) {
                case 'fillForm':
                    this.startFormFilling(message.formId, message.formData);
                    sendResponse({ success: true });
                    break;
                case 'stopFilling':
                    this.stopFormFilling();
                    sendResponse({ success: true });
                    break;
                case 'detectForms':
                    const forms = this.detectForms();
                    sendResponse({ forms });
                    break;
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        });
    }

    detectForms() {
        const forms = document.querySelectorAll('form');
        const detectedForms = [];

        forms.forEach((form, index) => {
            const formInfo = this.analyzeForm(form, index);
            if (formInfo.isGovernmentForm) {
                detectedForms.push(formInfo);
            }
        });

        return detectedForms;
    }

    analyzeForm(form, index) {
        const inputs = form.querySelectorAll('input, select, textarea');
        const formInfo = {
            index,
            isGovernmentForm: false,
            type: 'unknown',
            fields: [],
            confidence: 0
        };

        // Analyze form fields to determine if it's a government form
        const fieldTypes = new Set();
        const fieldNames = [];

        inputs.forEach(input => {
            const name = input.name?.toLowerCase() || '';
            const id = input.id?.toLowerCase() || '';
            const placeholder = input.placeholder?.toLowerCase() || '';
            const label = this.getFieldLabel(input)?.toLowerCase() || '';

            fieldNames.push(name);
            
            // Common government form field patterns
            if (this.isPersonalInfoField(name, id, placeholder, label)) {
                fieldTypes.add('personal');
                formInfo.confidence += 10;
            }
            
            if (this.isEducationField(name, id, placeholder, label)) {
                fieldTypes.add('education');
                formInfo.confidence += 15;
            }
            
            if (this.isIncomeField(name, id, placeholder, label)) {
                fieldTypes.add('income');
                formInfo.confidence += 15;
            }
            
            if (this.isDocumentField(name, id, placeholder, label)) {
                fieldTypes.add('documents');
                formInfo.confidence += 10;
            }

            formInfo.fields.push({
                element: input,
                type: input.type,
                name,
                id,
                label,
                required: input.required
            });
        });

        // Determine form type based on field analysis
        if (fieldTypes.has('education') && fieldTypes.has('personal')) {
            formInfo.type = 'scholarship';
            formInfo.confidence += 20;
        } else if (fieldTypes.has('income') && fieldTypes.has('personal')) {
            formInfo.type = 'benefit';
            formInfo.confidence += 20;
        }

        // Check URL patterns for government sites
        const url = window.location.href.toLowerCase();
        if (url.includes('.gov') || url.includes('scholarship') || url.includes('benefit')) {
            formInfo.confidence += 30;
        }

        formInfo.isGovernmentForm = formInfo.confidence >= 40;
        
        return formInfo;
    }

    isPersonalInfoField(name, id, placeholder, label) {
        const personalPatterns = [
            'name', 'fname', 'lname', 'firstname', 'lastname',
            'email', 'phone', 'mobile', 'address', 'city',
            'state', 'pincode', 'zip', 'dob', 'birth',
            'gender', 'father', 'mother', 'guardian'
        ];
        
        const text = `${name} ${id} ${placeholder} ${label}`;
        return personalPatterns.some(pattern => text.includes(pattern));
    }

    isEducationField(name, id, placeholder, label) {
        const educationPatterns = [
            'education', 'qualification', 'degree', 'school',
            'college', 'university', 'marks', 'percentage',
            'grade', 'class', 'course', 'subject', 'board'
        ];
        
        const text = `${name} ${id} ${placeholder} ${label}`;
        return educationPatterns.some(pattern => text.includes(pattern));
    }

    isIncomeField(name, id, placeholder, label) {
        const incomePatterns = [
            'income', 'salary', 'earning', 'annual',
            'monthly', 'family', 'parent', 'occupation',
            'employment', 'job', 'profession'
        ];
        
        const text = `${name} ${id} ${placeholder} ${label}`;
        return incomePatterns.some(pattern => text.includes(pattern));
    }

    isDocumentField(name, id, placeholder, label) {
        const documentPatterns = [
            'document', 'certificate', 'upload', 'file',
            'attachment', 'proof', 'copy', 'scan'
        ];
        
        const text = `${name} ${id} ${placeholder} ${label}`;
        return documentPatterns.some(pattern => text.includes(pattern));
    }

    getFieldLabel(input) {
        // Try to find label for the input field
        if (input.labels && input.labels.length > 0) {
            return input.labels[0].textContent;
        }
        
        // Look for label with for attribute
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
            return label.textContent;
        }
        
        // Look for nearby text
        const parent = input.parentElement;
        if (parent) {
            const text = parent.textContent.replace(input.value || '', '').trim();
            if (text.length > 0 && text.length < 100) {
                return text;
            }
        }
        
        return '';
    }

    async startFormFilling(formId, formData) {
        try {
            this.isActive = true;
            this.fillingStopped = false;
            this.currentFormData = formData;
            
            // Find the best matching form
            const detectedForms = this.detectForms();
            const targetForm = this.selectBestForm(detectedForms, formId);
            
            if (!targetForm) {
                throw new Error('No suitable form found on this page');
            }

            await this.fillFormFields(targetForm, formData);
            
            this.showSuccessMessage();
            this.notifyPopup('fillingComplete');
            
        } catch (error) {
            console.error('Form filling failed:', error);
            this.showErrorMessage(error.message);
            this.notifyPopup('fillingError', error.message);
        } finally {
            this.isActive = false;
        }
    }

    selectBestForm(detectedForms, formId) {
        if (detectedForms.length === 0) return null;
        
        // Sort by confidence and return the best match
        detectedForms.sort((a, b) => b.confidence - a.confidence);
        return detectedForms[0];
    }

    async fillFormFields(formInfo, userData) {
        this.totalFields = formInfo.fields.length;
        this.filledFields = 0;

        for (const field of formInfo.fields) {
            if (this.fillingStopped) break;
            
            try {
                const value = this.getValueForField(field, userData);
                if (value) {
                    await this.fillField(field.element, value);
                    this.filledFields++;
                    
                    // Add visual feedback
                    this.highlightField(field.element);
                    
                    // Small delay for better UX
                    await this.delay(200);
                }
            } catch (error) {
                console.warn('Failed to fill field:', field.name, error);
            }
        }
    }

    getValueForField(field, userData) {
        const { name, id, label, type } = field;
        const searchText = `${name} ${id} ${label}`.toLowerCase();
        
        // Map common field patterns to user data
        const fieldMappings = {
            // Personal Information
            'name': userData.fullName || userData.name,
            'fname': userData.firstName || userData.fullName?.split(' ')[0],
            'firstname': userData.firstName || userData.fullName?.split(' ')[0],
            'lname': userData.lastName || userData.fullName?.split(' ').slice(1).join(' '),
            'lastname': userData.lastName || userData.fullName?.split(' ').slice(1).join(' '),
            'email': userData.email,
            'phone': userData.phone,
            'mobile': userData.mobile || userData.phone,
            'dob': userData.dob || userData.dateOfBirth,
            'birth': userData.dob || userData.dateOfBirth,
            'gender': userData.gender,
            'father': userData.fatherName,
            'mother': userData.motherName,
            'address': userData.address,
            'city': userData.city,
            'state': userData.state,
            'pincode': userData.pincode,
            'zip': userData.pincode,
            
            // Education
            'education': userData.education,
            'qualification': userData.education,
            'school': userData.school,
            'college': userData.university || userData.college,
            'university': userData.university,
            'course': userData.course,
            'marks': userData.marks,
            'percentage': userData.percentage,
            'cgpa': userData.cgpa,
            
            // Financial
            'income': userData.income || userData.familyIncome || userData.annualIncome,
            'annual': userData.annualIncome || userData.income,
            'family': userData.familyIncome || userData.income,
            'salary': userData.annualIncome || userData.income,
            
            // Banking
            'account': userData.bankAccount,
            'bank': userData.bankAccount,
            'ifsc': userData.ifsc,
            
            // Other
            'category': userData.category,
            'research': userData.researchArea,
            'supervisor': userData.supervisor,
            'publication': userData.publications,
            'age': userData.age
        };

        // Find the best match
        for (const [pattern, value] of Object.entries(fieldMappings)) {
            if (searchText.includes(pattern) && value) {
                return this.formatValueForField(value, type);
            }
        }

        return null;
    }

    formatValueForField(value, fieldType) {
        switch (fieldType) {
            case 'email':
                return value.includes('@') ? value : null;
            case 'tel':
            case 'phone':
                return value.replace(/[^\d+]/g, '');
            case 'date':
                if (value.includes('-')) {
                    return value; // Already in YYYY-MM-DD format
                }
                break;
            case 'number':
                return value.toString().replace(/[^\d]/g, '');
            default:
                return value.toString();
        }
    }

    async fillField(element, value) {
        // Focus the element
        element.focus();
        
        // Clear existing value
        element.value = '';
        
        // Trigger input event to clear any validation
        element.dispatchEvent(new Event('input', { bubbles: true }));
        
        if (element.tagName === 'SELECT') {
            // Handle select elements
            this.selectOption(element, value);
        } else {
            // Handle input and textarea elements
            element.value = value;
        }
        
        // Trigger change events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
    }

    selectOption(selectElement, value) {
        const options = Array.from(selectElement.options);
        
        // Try exact match first
        let option = options.find(opt => 
            opt.value.toLowerCase() === value.toLowerCase() ||
            opt.text.toLowerCase() === value.toLowerCase()
        );
        
        // Try partial match
        if (!option) {
            option = options.find(opt => 
                opt.text.toLowerCase().includes(value.toLowerCase()) ||
                value.toLowerCase().includes(opt.text.toLowerCase())
            );
        }
        
        if (option) {
            selectElement.value = option.value;
            option.selected = true;
        }
    }

    highlightField(element) {
        // Add temporary highlight effect
        const originalStyle = element.style.cssText;
        element.style.cssText += `
            border: 2px solid #f97316 !important;
            background-color: #fef7ed !important;
            transition: all 0.3s ease !important;
        `;
        
        setTimeout(() => {
            element.style.cssText = originalStyle;
        }, 1000);
    }

    stopFormFilling() {
        this.fillingStopped = true;
        this.isActive = false;
        this.showInfoMessage('Form filling stopped by user');
    }

    addSchemeGenieIndicator() {
        // Add a small indicator to show SchemeGenie is active
        const indicator = document.createElement('div');
        indicator.id = 'schemegenie-indicator';
        indicator.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
                display: none;
                align-items: center;
                gap: 6px;
            ">
                <span style="font-size: 14px;">🧞‍♂️</span>
                <span>SchemeGenie Ready</span>
            </div>
        `;
        
        document.body.appendChild(indicator);
        
        // Show indicator briefly when extension is loaded
        const indicatorElement = indicator.firstElementChild;
        indicatorElement.style.display = 'flex';
        
        setTimeout(() => {
            indicatorElement.style.display = 'none';
        }, 3000);
    }

    showSuccessMessage() {
        this.showMessage('✅ Form filled successfully!', '#10b981');
    }

    showErrorMessage(message) {
        this.showMessage(`❌ Error: ${message}`, '#ef4444');
    }

    showInfoMessage(message) {
        this.showMessage(`ℹ️ ${message}`, '#3b82f6');
    }

    showMessage(text, color) {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10001;
            background: ${color};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            max-width: 300px;
            word-wrap: break-word;
        `;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    notifyPopup(action, data = null) {
        chrome.runtime.sendMessage({
            action,
            data
        }).catch(() => {
            // Ignore errors if popup is not open
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the form filler when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SchemeGenieFormFiller();
    });
} else {
    new SchemeGenieFormFiller();
}