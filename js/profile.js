document.addEventListener('DOMContentLoaded', () => {
    // Load user profile data when authenticated
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadUserProfileData(user.uid);
            setupFormHandlers(user.uid);
        }
    });

    // Set up event listeners for delete account modal
    setupDeleteAccountModal();

    // Set up event listeners for tabs
    setupTabNavigation();
});

// Load user profile data from Firestore
function loadUserProfileData(userId) {
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                
                // Populate personal information form
                populatePersonalInfoForm(userData);
                
                // Populate medical information form
                populateMedicalInfoForm(userData);
                
                // Populate emergency contacts
                populateEmergencyContacts(userData);
                
                // Populate account settings
                populateAccountSettings(userData);
            } else {
                showAlert('error', "User profile not found!");
            }
        })
        .catch((error) => {
            showAlert('error', `Error loading profile: ${error.message}`);
        });
}

// Populate personal information form with user data
function populatePersonalInfoForm(userData) {
    document.getElementById('fullName')?.value = userData.fullName || '';
    document.getElementById('dateOfBirth')?.value = userData.dateOfBirth || '';
    document.getElementById('gender')?.value = userData.gender || '';
    document.getElementById('phoneNumber')?.value = userData.phoneNumber || '';
    document.getElementById('address')?.value = userData.address || '';
    document.getElementById('city')?.value = userData.city || '';
    document.getElementById('state')?.value = userData.state || '';
    document.getElementById('zipCode')?.value = userData.zipCode || '';
    document.getElementById('additionalInfo')?.value = userData.additionalInfo || '';
}

// Populate medical information form with user data
function populateMedicalInfoForm(userData) {
    const medicalInfo = userData.medicalInfo || {};
    
    // Basic medical info
    document.getElementById('bloodType')?.value = medicalInfo.bloodType || '';
    document.getElementById('height')?.value = medicalInfo.height || '';
    document.getElementById('weight')?.value = medicalInfo.weight || '';
    document.getElementById('organDonor')?.checked = medicalInfo.organDonor || false;
    document.getElementById('medicalNotes')?.value = medicalInfo.notes || '';
    
    // Allergies
    const allergies = medicalInfo.allergies || [];
    const allergiesList = document.getElementById('allergies-list');
    if (allergiesList) {
        allergiesList.innerHTML = '';
        allergies.forEach(allergy => {
            addListItem(allergy, 'allergies-list', 'allergy');
        });
    }
    
    // Medical conditions
    const conditions = medicalInfo.conditions || [];
    const conditionsList = document.getElementById('conditions-list');
    if (conditionsList) {
        conditionsList.innerHTML = '';
        conditions.forEach(condition => {
            addListItem(condition, 'conditions-list', 'condition');
        });
    }
    
    // Medications
    const medications = medicalInfo.medications || [];
    const medicationsList = document.getElementById('medications-list');
    if (medicationsList) {
        medicationsList.innerHTML = '';
        medications.forEach(medication => {
            addListItem(medication, 'medications-list', 'medication');
        });
    }
}

// Populate emergency contacts form with user data
function populateEmergencyContacts(userData) {
    const contacts = userData.emergencyContacts || [];
    const contactsContainer = document.getElementById('contacts-container');
    
    if (contactsContainer) {
        // Remove all existing contacts (except the first template one)
        const contactCards = contactsContainer.querySelectorAll('.contact-card:not(:first-child)');
        contactCards.forEach(card => card.remove());
        
        // If there are no contacts, clear the first template
        if (contacts.length === 0) {
            const firstCard = contactsContainer.querySelector('.contact-card');
            if (firstCard) {
                firstCard.querySelector('.contact-name').value = '';
                firstCard.querySelector('.contact-relationship').value = '';
                firstCard.querySelector('.contact-phone').value = '';
                firstCard.querySelector('.contact-email').value = '';
            }
            return;
        }
        
        // Fill in the first contact
        const firstCard = contactsContainer.querySelector('.contact-card');
        if (firstCard && contacts.length > 0) {
            firstCard.querySelector('.contact-name').value = contacts[0].name || '';
            firstCard.querySelector('.contact-relationship').value = contacts[0].relationship || '';
            firstCard.querySelector('.contact-phone').value = contacts[0].phone || '';
            firstCard.querySelector('.contact-email').value = contacts[0].email || '';
        }
        
        // Add additional contacts
        for (let i = 1; i < contacts.length; i++) {
            addEmergencyContact(contacts[i]);
        }
    }
}

// Populate account settings form
function populateAccountSettings(userData) {
    document.getElementById('account-email').value = userData.email || '';
    
    // Privacy settings
    const shareDataToggle = document.getElementById('share-data-toggle');
    if (shareDataToggle) {
        shareDataToggle.checked = userData.privacySettings?.shareData !== false;
    }
    
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
        notificationsToggle.checked = userData.privacySettings?.notifications || false;
    }
}

// Setup form handlers and event listeners
function setupFormHandlers(userId) {
    // Personal information form
    const personalForm = document.getElementById('personal-form');
    if (personalForm) {
        personalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            savePersonalInfo(userId);
        });
    }
    
    // Medical information form
    const medicalForm = document.getElementById('medical-form');
    if (medicalForm) {
        medicalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveMedicalInfo(userId);
        });
        
        // Add item buttons
        document.querySelector('.add-allergy-btn')?.addEventListener('click', () => {
            addListItemFromInput('allergy-input', 'allergies-list', 'allergy');
        });
        
        document.querySelector('.add-condition-btn')?.addEventListener('click', () => {
            addListItemFromInput('condition-input', 'conditions-list', 'condition');
        });
        
        document.querySelector('.add-medication-btn')?.addEventListener('click', () => {
            addListItemFromInput('medication-input', 'medications-list', 'medication');
        });
    }
    
    // Emergency contacts
    const addContactBtn = document.getElementById('add-contact');
    if (addContactBtn) {
        addContactBtn.addEventListener('click', () => {
            addEmergencyContact();
        });
    }
    
    const saveContactsBtn = document.getElementById('save-contacts');
    if (saveContactsBtn) {
        saveContactsBtn.addEventListener('click', () => {
            saveEmergencyContacts(userId);
        });
    }
    
    // Remove contact buttons (needs event delegation since they can be dynamically added)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.remove-contact')) {
            const contactCard = e.target.closest('.contact-card');
            if (contactCard && document.querySelectorAll('.contact-card').length > 1) {
                contactCard.remove();
            }
        }
    });
    
    // Password change
    const changePasswordBtn = document.getElementById('change-password');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', changePassword);
    }
    
    // Privacy settings
    const savePrivacyBtn = document.getElementById('save-privacy');
    if (savePrivacyBtn) {
        savePrivacyBtn.addEventListener('click', () => {
            savePrivacySettings(userId);
        });
    }
}

// Save personal information to Firestore
function savePersonalInfo(userId) {
    const personalData = {
        fullName: document.getElementById('fullName').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        additionalInfo: document.getElementById('additionalInfo').value
    };
    
    // Update Firestore
    db.collection('users').doc(userId).update(personalData)
        .then(() => {
            showAlert('success', 'Personal information saved successfully!');
        })
        .catch((error) => {
            showAlert('error', `Error saving data: ${error.message}`);
        });
}

// Save medical information to Firestore
function saveMedicalInfo(userId) {
    // Get allergies from list
    const allergiesList = document.getElementById('allergies-list');
    const allergies = Array.from(allergiesList?.querySelectorAll('.list-group-item') || [])
        .map(item => item.querySelector('.item-text').textContent);
    
    // Get conditions from list
    const conditionsList = document.getElementById('conditions-list');
    const conditions = Array.from(conditionsList?.querySelectorAll('.list-group-item') || [])
        .map(item => item.querySelector('.item-text').textContent);
    
    // Get medications from list
    const medicationsList = document.getElementById('medications-list');
    const medications = Array.from(medicationsList?.querySelectorAll('.list-group-item') || [])
        .map(item => item.querySelector('.item-text').textContent);
    
    const medicalData = {
        'medicalInfo.bloodType': document.getElementById('bloodType').value,
        'medicalInfo.height': document.getElementById('height').value,
        'medicalInfo.weight': document.getElementById('weight').value,
        'medicalInfo.organDonor': document.getElementById('organDonor').checked,
        'medicalInfo.notes': document.getElementById('medicalNotes').value,
        'medicalInfo.allergies': allergies,
        'medicalInfo.conditions': conditions,
        'medicalInfo.medications': medications
    };
    
    // Update Firestore
    db.collection('users').doc(userId).update(medicalData)
        .then(() => {
            showAlert('success', 'Medical information saved successfully!');
        })
        .catch((error) => {
            showAlert('error', `Error saving data: ${error.message}`);
        });
}

// Save emergency contacts to Firestore
function saveEmergencyContacts(userId) {
    const contactCards = document.querySelectorAll('.contact-card');
    const contacts = Array.from(contactCards).map(card => {
        return {
            name: card.querySelector('.contact-name').value,
            relationship: card.querySelector('.contact-relationship').value,
            phone: card.querySelector('.contact-phone').value,
            email: card.querySelector('.contact-email').value
        };
    }).filter(contact => contact.name && contact.phone);
    
    // Update Firestore
    db.collection('users').doc(userId).update({
        emergencyContacts: contacts
    })
        .then(() => {
            showAlert('success', 'Emergency contacts saved successfully!');
        })
        .catch((error) => {
            showAlert('error', `Error saving contacts: ${error.message}`);
        });
}

// Save privacy settings to Firestore
function savePrivacySettings(userId) {
    const privacySettings = {
        'privacySettings.shareData': document.getElementById('share-data-toggle').checked,
        'privacySettings.notifications': document.getElementById('notifications-toggle').checked
    };
    
    // Update Firestore
    db.collection('users').doc(userId).update(privacySettings)
        .then(() => {
            showAlert('success', 'Privacy settings saved successfully!');
        })
        .catch((error) => {
            showAlert('error', `Error saving settings: ${error.message}`);
        });
}

// Change password
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    // Validate passwords
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showAlert('error', 'All password fields are required');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showAlert('error', 'New passwords do not match');
        return;
    }
    
    if (newPassword.length < 6) {
        showAlert('error', 'New password should be at least 6 characters');
        return;
    }
    
    // Get current user
    const user = auth.currentUser;
    
    // Re-authenticate user
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    
    user.reauthenticateWithCredential(credential)
        .then(() => {
            // Update password
            return user.updatePassword(newPassword);
        })
        .then(() => {
            showAlert('success', 'Password updated successfully!');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
        })
        .catch((error) => {
            showAlert('error', `Error updating password: ${error.message}`);
        });
}

// Setup delete account modal
function setupDeleteAccountModal() {
    const deleteAccountBtn = document.getElementById('delete-account');
    const confirmDeleteBtn = document.getElementById('confirm-delete-account');
    
    if (deleteAccountBtn && confirmDeleteBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            // Open modal (Bootstrap will handle this)
        });
        
        confirmDeleteBtn.addEventListener('click', () => {
            const confirmEmail = document.getElementById('confirm-email').value;
            const user = auth.currentUser;
            
            if (!user) {
                showAlert('error', 'You must be logged in to delete your account');
                return;
            }
            
            if (confirmEmail !== user.email) {
                showAlert('error', 'Email address does not match your account');
                return;
            }
            
            // Delete user document first
            db.collection('users').doc(user.uid).delete()
                .then(() => {
                    // Then delete user account
                    return user.delete();
                })
                .then(() => {
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    showAlert('error', `Error deleting account: ${error.message}`);
                });
        });
    }
}

// Setup tab navigation
function setupTabNavigation() {
    // Check if URL has a hash for tab
    if (window.location.hash) {
        const tabId = window.location.hash.substring(1);
        const tab = document.querySelector(`#profileTabs button[data-bs-target="#${tabId}"]`);
        if (tab) {
            // Use Bootstrap's tab API to show the tab
            const bsTab = new bootstrap.Tab(tab);
            bsTab.show();
        }
    }
    
    // Update URL when tabs change
    const tabs = document.querySelectorAll('#profileTabs button');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            const targetId = e.target.getAttribute('data-bs-target').substring(1);
            window.location.hash = targetId;
        });
    });
}

// Helper: Add list item from input field
function addListItemFromInput(inputClass, listId, itemType) {
    const inputField = document.querySelector(`.${inputClass}`);
    const text = inputField?.value.trim();
    
    if (text) {
        addListItem(text, listId, itemType);
        inputField.value = '';
        inputField.focus();
    }
}

// Helper: Add list item to a list
function addListItem(text, listId, itemType) {
    const list = document.getElementById(listId);
    if (!list) return;
    
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    
    const itemText = document.createElement('span');
    itemText.className = 'item-text';
    itemText.textContent = text;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn btn-sm btn-outline-danger';
    removeBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
    removeBtn.addEventListener('click', () => li.remove());
    
    li.appendChild(itemText);
    li.appendChild(removeBtn);
    list.appendChild(li);
}

// Helper: Add a new emergency contact card
function addEmergencyContact(contactData = {}) {
    const contactsContainer = document.getElementById('contacts-container');
    if (!contactsContainer) return;
    
    // Get the number of existing contacts to create the proper index
    const contactCount = contactsContainer.querySelectorAll('.contact-card').length + 1;
    
    // Clone the template
    const template = contactsContainer.querySelector('.contact-card');
    const newContact = template.cloneNode(true);
    
    // Update the header
    newContact.querySelector('h6').textContent = `Contact #${contactCount}`;
    
    // Clear or set values
    newContact.querySelector('.contact-name').value = contactData.name || '';
    newContact.querySelector('.contact-relationship').value = contactData.relationship || '';
    newContact.querySelector('.contact-phone').value = contactData.phone || '';
    newContact.querySelector('.contact-email').value = contactData.email || '';
    
    // Add the new contact to the container
    contactsContainer.appendChild(newContact);
}

// Helper: Show alerts
function showAlert(type, message) {
    // Create alert container if it doesn't exist
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        document.querySelector('.container').prepend(alertContainer);
    }
    
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container
    alertContainer.appendChild(alertElement);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(alertElement);
        alert.close();
    }, 5000);
} 