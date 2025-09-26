document.addEventListener('DOMContentLoaded', () => {
    // Get user ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (userId) {
        loadEmergencyData(userId);
    } else {
        showError("No user ID provided. This QR code may be invalid.");
    }

    // Set up retry button
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            if (userId) {
                hideError();
                loadEmergencyData(userId);
            }
        });
    }

    // Set up emergency action buttons
    const callEmergencyBtn = document.getElementById('call-emergency-btn');
    if (callEmergencyBtn) {
        callEmergencyBtn.addEventListener('click', () => {
            callEmergencyServices();
        });
    }

    const callEmergencyServicesBtn = document.getElementById('call-emergency-services');
    if (callEmergencyServicesBtn) {
        callEmergencyServicesBtn.addEventListener('click', () => {
            callEmergencyServices();
        });
    }

    const callPrimaryContactBtn = document.getElementById('call-primary-contact');
    if (callPrimaryContactBtn) {
        callPrimaryContactBtn.addEventListener('click', () => {
            callPrimaryContact();
        });
    }

    const shareLocationBtn = document.getElementById('share-location');
    if (shareLocationBtn) {
        shareLocationBtn.addEventListener('click', () => {
            shareCurrentLocation();
        });
    }
});

// Load emergency data from Firestore
function loadEmergencyData(userId) {
    showLoading();

    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                
                // Check if data sharing is allowed
                const isDataSharingAllowed = userData.privacySettings?.shareData !== false;
                
                if (isDataSharingAllowed) {
                    // Populate emergency information
                    populatePersonalInfo(userData);
                    populateMedicalInfo(userData);
                    populateEmergencyContacts(userData);
                    
                    // Show content
                    hideLoading();
                    showContent();
                } else {
                    showError("The user has chosen not to share their emergency information.");
                }
            } else {
                showError("User data not found. This QR code may be invalid or the user has deleted their account.");
            }
        })
        .catch((error) => {
            console.error("Error loading emergency data:", error);
            showError("An error occurred while loading the emergency information. Please try again.");
        });
}

// Populate personal information
function populatePersonalInfo(userData) {
    // Basic info
    document.getElementById('person-name').textContent = userData.fullName || 'Not provided';
    document.getElementById('person-dob').textContent = userData.dateOfBirth || 'Not provided';
    document.getElementById('person-gender').textContent = userData.gender || 'Not provided';
    document.getElementById('person-phone').textContent = userData.phoneNumber || 'Not provided';
    
    // Calculate age if DOB is provided
    if (userData.dateOfBirth) {
        const dob = new Date(userData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        
        document.getElementById('person-age').textContent = age;
    } else {
        document.getElementById('person-age').textContent = 'Not provided';
    }
    
    // Address
    const address = [];
    if (userData.address) address.push(userData.address);
    if (userData.city) address.push(userData.city);
    if (userData.state) address.push(userData.state);
    if (userData.zipCode) address.push(userData.zipCode);
    
    document.getElementById('person-address').textContent = address.length > 0 ? address.join(', ') : 'Not provided';
    
    // Additional info
    document.getElementById('person-additional-info').textContent = userData.additionalInfo || 'None provided';
}

// Populate medical information
function populateMedicalInfo(userData) {
    const medicalInfo = userData.medicalInfo || {};
    
    // Blood type
    document.getElementById('blood-type').textContent = medicalInfo.bloodType || 'Unknown';
    
    // Physical info
    document.getElementById('person-height').textContent = medicalInfo.height ? `${medicalInfo.height} cm` : 'Not provided';
    document.getElementById('person-weight').textContent = medicalInfo.weight ? `${medicalInfo.weight} kg` : 'Not provided';
    document.getElementById('organ-donor').textContent = medicalInfo.organDonor ? 'Yes' : 'No';
    
    // Allergies
    const allergiesList = document.getElementById('allergies-list');
    const allergies = medicalInfo.allergies || [];
    const noAllergiesElement = document.getElementById('no-allergies');
    
    if (allergies.length > 0) {
        // Hide no allergies message
        noAllergiesElement.classList.add('d-none');
        
        // Clear existing list items
        allergiesList.innerHTML = '';
        
        // Add each allergy to the list
        allergies.forEach(allergy => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-warning';
            li.textContent = allergy;
            allergiesList.appendChild(li);
        });
    } else {
        // Show no allergies message
        noAllergiesElement.classList.remove('d-none');
    }
    
    // Medical conditions
    const conditionsList = document.getElementById('conditions-list');
    const conditions = medicalInfo.conditions || [];
    const noConditionsElement = document.getElementById('no-conditions');
    
    if (conditions.length > 0) {
        // Hide no conditions message
        noConditionsElement.classList.add('d-none');
        
        // Clear existing list items
        conditionsList.innerHTML = '';
        
        // Add each condition to the list
        conditions.forEach(condition => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-info';
            li.textContent = condition;
            conditionsList.appendChild(li);
        });
    } else {
        // Show no conditions message
        noConditionsElement.classList.remove('d-none');
    }
    
    // Medications
    const medicationsList = document.getElementById('medications-list');
    const medications = medicalInfo.medications || [];
    const noMedicationsElement = document.getElementById('no-medications');
    
    if (medications.length > 0) {
        // Hide no medications message
        noMedicationsElement.classList.add('d-none');
        
        // Clear existing list items
        medicationsList.innerHTML = '';
        
        // Add each medication to the list
        medications.forEach(medication => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-info';
            li.textContent = medication;
            medicationsList.appendChild(li);
        });
    } else {
        // Show no medications message
        noMedicationsElement.classList.remove('d-none');
    }
    
    // Medical notes
    document.getElementById('medical-notes').textContent = medicalInfo.notes || 'None provided';
}

// Populate emergency contacts
function populateEmergencyContacts(userData) {
    const contacts = userData.emergencyContacts || [];
    const contactsList = document.getElementById('contacts-list');
    const noContactsElement = document.getElementById('no-contacts');
    
    if (contacts.length > 0) {
        // Hide no contacts message
        noContactsElement.classList.add('d-none');
        
        // Clear existing content
        contactsList.innerHTML = '';
        
        // Add each contact
        contacts.forEach((contact, index) => {
            const contactCard = document.createElement('div');
            contactCard.className = 'card mb-3';
            
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            
            const nameElement = document.createElement('h5');
            nameElement.className = 'card-title';
            nameElement.textContent = contact.name;
            
            const relationshipElement = document.createElement('p');
            relationshipElement.className = 'card-subtitle mb-2 text-muted';
            relationshipElement.textContent = contact.relationship;
            
            const phoneElement = document.createElement('p');
            phoneElement.className = 'card-text';
            phoneElement.innerHTML = `<i class="bi bi-telephone me-2"></i>${contact.phone}`;
            
            const emailElement = document.createElement('p');
            emailElement.className = 'mb-0';
            emailElement.innerHTML = contact.email ? `<i class="bi bi-envelope me-2"></i>${contact.email}` : '';
            
            const callButton = document.createElement('a');
            callButton.href = `tel:${contact.phone}`;
            callButton.className = 'btn btn-primary mt-3';
            callButton.innerHTML = '<i class="bi bi-telephone-fill me-2"></i>Call';
            
            // For the first contact, set it as primary
            if (index === 0) {
                contactCard.classList.add('border-primary');
                const primaryBadge = document.createElement('div');
                primaryBadge.className = 'position-absolute top-0 end-0 p-2';
                primaryBadge.innerHTML = '<span class="badge bg-primary">Primary</span>';
                cardBody.appendChild(primaryBadge);
            }
            
            cardBody.appendChild(nameElement);
            cardBody.appendChild(relationshipElement);
            cardBody.appendChild(phoneElement);
            if (contact.email) cardBody.appendChild(emailElement);
            cardBody.appendChild(callButton);
            
            contactCard.appendChild(cardBody);
            contactsList.appendChild(contactCard);
        });
    } else {
        // Show no contacts message
        noContactsElement.classList.remove('d-none');
    }
}

// Call emergency services (911 in the US, may need to be adjusted for other countries)
function callEmergencyServices() {
    window.location.href = 'tel:911';
}

// Call primary emergency contact
function callPrimaryContact() {
    // Get all user data to find the first emergency contact
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    
    if (userId) {
        db.collection('users').doc(userId).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    const contacts = userData.emergencyContacts || [];
                    
                    if (contacts.length > 0) {
                        // Call the first contact (primary)
                        window.location.href = `tel:${contacts[0].phone}`;
                    } else {
                        alert('No emergency contacts have been provided.');
                    }
                }
            })
            .catch((error) => {
                console.error("Error getting emergency contact:", error);
                alert('An error occurred while trying to call the emergency contact.');
            });
    }
}

// Share current location
function shareCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                
                // Try to use Web Share API if available
                if (navigator.share) {
                    navigator.share({
                        title: 'Emergency Location',
                        text: 'This is my current location for emergency purposes:',
                        url: mapsUrl
                    })
                    .catch((error) => {
                        console.error('Error sharing location:', error);
                        fallbackShare(mapsUrl);
                    });
                } else {
                    fallbackShare(mapsUrl);
                }
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to get your location. Please check your device settings and try again.');
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
    
    // Fallback for sharing when Web Share API is not available
    function fallbackShare(url) {
        // Create a temporary input to copy the URL to clipboard
        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        alert('Location link copied to clipboard. You can now paste and share it.');
    }
}

// Show loading spinner
function showLoading() {
    document.getElementById('loading-container').classList.remove('d-none');
    document.getElementById('error-container').classList.add('d-none');
    document.getElementById('emergency-content').classList.add('d-none');
}

// Hide loading spinner
function hideLoading() {
    document.getElementById('loading-container').classList.add('d-none');
}

// Show error message
function showError(message) {
    document.getElementById('loading-container').classList.add('d-none');
    document.getElementById('error-container').classList.remove('d-none');
    document.getElementById('emergency-content').classList.add('d-none');
    
    // Set error message
    document.getElementById('error-message').textContent = message;
}

// Hide error message
function hideError() {
    document.getElementById('error-container').classList.add('d-none');
}

// Show content
function showContent() {
    document.getElementById('emergency-content').classList.remove('d-none');
} 