// SchemeGenie Content Script - Enhanced Auto Form Filler
class SchemeGenieFormFiller {
    constructor() {
        this.isActive = false;
        this.currentFormData = null;
        this.filledFields = 0;
        this.totalFields = 0;
        this.fillingStopped = false;
        
        console.log('SchemeGenie Content Script: Initializing...');
        this.init();
    }

    init() {
        this.setupMessageListener();
        this.detectForms();
        this.addSchemeGenieIndicator();
        console.log('SchemeGenie Content Script: Ready on', window.location.href);
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('Content Script: Received message:', message);
            
            switch (message.action) {
                case 'fillForm':
                    console.log('Content Script: Starting form fill with data:', message.formData);
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
            return true; // Keep message channel open for async response
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

        console.log('Content Script: Detected forms:', detectedForms);
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
        if (url.includes('.gov') || url.includes('scholarship') || url.includes('benefit') || url.includes('localhost') || url.includes('127.0.0.1')) {
            formInfo.confidence += 30;
        }

        formInfo.isGovernmentForm = formInfo.confidence >= 20; // Lower threshold for demo
        
        return formInfo;
    }

    isPersonalInfoField(name, id, placeholder, label) {
        const personalPatterns = [
            'name', 'fname', 'lname', 'firstname', 'lastname', 'fullname',
            'email', 'phone', 'mobile', 'address', 'city',
            'state', 'pincode', 'zip', 'dob', 'birth', 'dateofbirth',
            'gender', 'father', 'mother', 'guardian'
        ];
        
        const text = `${name} ${id} ${placeholder} ${label}`;
        return personalPatterns.some(pattern => text.includes(pattern));
    }

    isEducationField(name, id, placeholder, label) {
        const educationPatterns = [
            'education', 'qualification', 'degree', 'school',
            'college', 'university', 'marks', 'percentage',
            'grade', 'class', 'course', 'subject', 'board', 'cgpa'
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
            'attachment', 'proof', 'copy', 'scan', 'bank', 'ifsc'
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
            console.log('Content Script: Starting form filling process...');
            this.isActive = true;
            this.fillingStopped = false;
            this.currentFormData = formData;
            
            // Show loading message
            this.showMessage('🧞‍♂️ SchemeGenie is filling the form...', '#f97316');
            
            // Find all fillable fields
            const allFields = document.querySelectorAll('input, select, textarea');
            console.log('Content Script: Found', allFields.length, 'fields to process');
            
            this.totalFields = allFields.length;
            this.filledFields = 0;

            // Fill fields with delay for visual effect
            for (let i = 0; i < allFields.length; i++) {
                if (this.fillingStopped) break;
                
                const field = allFields[i];
                const value = this.getValueForField(field, formData);
                
                if (value) {
                    await this.fillField(field, value);
                    this.filledFields++;
                    console.log(`Content Script: Filled field ${field.name || field.id} with value:`, value);
                    
                    // Add visual feedback
                    this.highlightField(field);
                    
                    // Small delay for better UX
                    await this.delay(300);
                }
            }

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

    getValueForField(field, userData) {
        const name = (field.name || '').toLowerCase();
        const id = (field.id || '').toLowerCase();
        const placeholder = (field.placeholder || '').toLowerCase();
        const label = this.getFieldLabel(field)?.toLowerCase() || '';
        const searchText = `${name} ${id} ${placeholder} ${label}`;
        
        console.log('Content Script: Mapping field:', searchText, 'Type:', field.type);
        
        // Enhanced field mappings for better matching
        const fieldMappings = {
            // Personal Information - more comprehensive patterns
            'fullname': userData.fullName || userData.name,
            'name': userData.fullName || userData.name,
            'fname': userData.firstName || userData.fullName?.split(' ')[0],
            'firstname': userData.firstName || userData.fullName?.split(' ')[0],
            'lname': userData.lastName || userData.fullName?.split(' ').slice(1).join(' '),
            'lastname': userData.lastName || userData.fullName?.split(' ').slice(1).join(' '),
            'email': userData.email,
            'phone': userData.phone,
            'mobile': userData.mobile || userData.phone,
            'dateofbirth': userData.dateOfBirth || userData.dob,
            'dob': userData.dob || userData.dateOfBirth,
            'birth': userData.dob || userData.dateOfBirth,
            'fathername': userData.fatherName || userData.father,
            'mothername': userData.motherName || userData.mother,
            'gender': userData.gender,
            'father': userData.fatherName,
            'mother': userData.motherName,
            'address': userData.address,
            'city': userData.city,
            'state': userData.state,
            'pincode': userData.pincode,
            'district': userData.district || userData.city,
            'zip': userData.pincode,
            
            // Education - enhanced patterns
            'education': userData.education,
            'qualification': userData.education,
            'school': userData.school,
            'college': userData.university || userData.college,
            'class': userData.class || userData.currentClass,
            'university': userData.university,
            'course': userData.course,
            'marks': userData.marks,
            'percentage': userData.percentage,
            'cgpa': userData.cgpa,
            
            // Financial - enhanced patterns
            'banknumber': userData.bankAccount || userData.accountNumber,
            'bankaccount': userData.bankAccount || userData.accountNumber,
            'account': userData.bankAccount,
            'ifsc': userData.ifscCode || userData.ifsc,
            'ifsccode': userData.ifscCode || userData.ifsc,
            'income': userData.income || userData.familyIncome || userData.annualIncome,
            'annual': userData.annualIncome || userData.income,
            'family': userData.familyIncome || userData.income,
            'salary': userData.annualIncome || userData.income,
            
            // Research specific fields
            'researcharea': userData.researchArea,
            'research': userData.researchArea,
            'supervisor': userData.supervisor,
            'publications': userData.publications,
            'experience': userData.experience,
            'category': userData.category,
            'age': userData.age,
            
            // Additional common fields
            'yearofpassing': userData.yearOfPassing || '2024',
            'awards': userData.awards,
            'examscores': userData.examScores,
            'preferredinstitute': userData.preferredInstitute,
            'researchproposal': userData.researchProposal || 'Research proposal summary will be provided separately.'
        };

        // Find the best match
        for (const [pattern, value] of Object.entries(fieldMappings)) {
            if (searchText.includes(pattern) && value) {
                console.log('Content Script: Matched', pattern, 'with value:', value);
                return this.formatValueForField(value, field.type);
            }
        }

        // Fallback for common field names
        if (searchText.includes('name') && !searchText.includes('father') && !searchText.includes('mother')) {
            return userData.fullName || userData.name;
        }

        return null;
    }

    formatValueForField(value, fieldType) {
        if (!value || value === 'undefined') return null;
        
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
        try {
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
            
            console.log('Content Script: Successfully filled field with value:', value);
        } catch (error) {
            console.error('Content Script: Error filling field:', error);
        }
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
            console.log('Content Script: Selected option:', option.text);
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
        
        // Add checkmark
        const checkmark = document.createElement('div');
        checkmark.innerHTML = '✓';
        checkmark.style.cssText = `
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            color: #10b981;
            font-weight: bold;
            font-size: 14px;
            pointer-events: none;
            z-index: 1000;
        `;
        
        if (element.parentElement.style.position !== 'relative') {
            element.parentElement.style.position = 'relative';
        }
        element.parentElement.appendChild(checkmark);
        
        setTimeout(() => {
            element.style.cssText = originalStyle;
            if (checkmark.parentElement) {
                checkmark.parentElement.removeChild(checkmark);
            }
        }, 2000);
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
        this.showMessage('✅ Form filled successfully! ' + this.filledFields + ' fields completed.', '#10b981');
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
            if (message.parentElement) {
                message.remove();
            }
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