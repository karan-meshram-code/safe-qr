document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and get user data
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadUserData(user.uid);
        }
    });

    // QR code download button
    const downloadQrBtn = document.getElementById('download-qr');
    if (downloadQrBtn) {
        downloadQrBtn.addEventListener('click', downloadQRCode);
    }
});

// Load user data from Firestore
function loadUserData(userId) {
    // Show loading spinners
    document.getElementById('loading-qr').classList.remove('d-none');
    document.getElementById('emergency-info-loading').classList.remove('d-none');
    document.getElementById('emergency-info-content').classList.add('d-none');

    // Get user data from Firestore
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                
                // Update profile info
                updateProfileInfo(userData);
                
                // Update medical info
                updateMedicalInfo(userData);
                
                // Update emergency contacts
                updateEmergencyContacts(userData);
                
                // Generate QR code
                generateQRCode(userId);
                
                // Calculate profile completion percentage
                calculateProfileCompletion(userData);
                
                // Hide loading spinner
                document.getElementById('emergency-info-loading').classList.add('d-none');
                document.getElementById('emergency-info-content').classList.remove('d-none');
            } else {
                console.error("User document doesn't exist!");
            }
        })
        .catch((error) => {
            console.error("Error getting user data:", error);
        });
}

// Update profile information in the dashboard
function updateProfileInfo(userData) {
    // Set name in profile card
    const profileName = document.getElementById('profile-name');
    if (profileName) {
        profileName.textContent = userData.fullName || 'User';
    }
}

// Update medical information in the dashboard
function updateMedicalInfo(userData) {
    const medicalInfo = userData.medicalInfo || {};
    
    // Update blood type
    const bloodTypeElement = document.getElementById('blood-type');
    if (bloodTypeElement) {
        bloodTypeElement.textContent = medicalInfo.bloodType || 'Not Set';
    }
    
    // Update allergy count
    const allergiesCountElement = document.getElementById('allergies-count');
    if (allergiesCountElement) {
        const allergies = medicalInfo.allergies || [];
        allergiesCountElement.textContent = allergies.length;
    }
    
    // Update medication count
    const medicationsCountElement = document.getElementById('medications-count');
    if (medicationsCountElement) {
        const medications = medicalInfo.medications || [];
        medicationsCountElement.textContent = medications.length;
    }
    
    // Update conditions count
    const conditionsCountElement = document.getElementById('conditions-count');
    if (conditionsCountElement) {
        const conditions = medicalInfo.conditions || [];
        conditionsCountElement.textContent = conditions.length;
    }
}

// Update emergency contacts in the dashboard
function updateEmergencyContacts(userData) {
    const contacts = userData.emergencyContacts || [];
    const contactsList = document.getElementById('emergency-contacts-list');
    const noContactsMessage = document.getElementById('no-contacts-message');
    
    if (contactsList && noContactsMessage) {
        // Clear existing contacts
        contactsList.innerHTML = '';
        
        if (contacts.length === 0) {
            // Show no contacts message
            noContactsMessage.classList.remove('d-none');
        } else {
            // Hide no contacts message
            noContactsMessage.classList.add('d-none');
            
            // Add each contact to the list
            contacts.forEach((contact, index) => {
                const contactItem = document.createElement('li');
                contactItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                
                const contactInfo = document.createElement('div');
                contactInfo.innerHTML = `
                    <div><strong>${contact.name}</strong> (${contact.relationship})</div>
                    <div class="text-muted">${contact.phone}</div>
                `;
                
                const contactActions = document.createElement('div');
                const callButton = document.createElement('a');
                callButton.href = `tel:${contact.phone}`;
                callButton.className = 'btn btn-sm btn-outline-primary';
                callButton.innerHTML = '<i class="bi bi-telephone"></i>';
                
                contactActions.appendChild(callButton);
                
                contactItem.appendChild(contactInfo);
                contactItem.appendChild(contactActions);
                contactsList.appendChild(contactItem);
            });
        }
    }
}

// Generate QR code
function generateQRCode(userId) {
    const qrContainer = document.getElementById('qr-container');
    const loadingQr = document.getElementById('loading-qr');
    const noQrMessage = document.getElementById('no-qr-message');
    const qrCodeElement = document.getElementById('qr-code');
    
    // Check if user has completed their profile
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const isProfileComplete = userData.emergencyInfo?.profileComplete || false;
                
                if (isProfileComplete) {
                    // Generate QR code with link to emergency page
                    const qrUrl = `${window.location.origin}/emergency.html?id=${userId}`;
                    
                    // Use QRCode.js library to generate QR code
                    if (qrCodeElement) {
                        QRCode.toCanvas(qrCodeElement, qrUrl, {
                            width: 200,
                            margin: 2,
                            color: {
                                dark: '#4361ee',
                                light: '#ffffff'
                            }
                        }, function(error) {
                            if (error) {
                                console.error('Error generating QR code:', error);
                                showNoQrMessage();
                            } else {
                                // Show QR code
                                loadingQr.classList.add('d-none');
                                qrContainer.classList.remove('d-none');
                                noQrMessage.classList.add('d-none');
                            }
                        });
                    }
                } else {
                    showNoQrMessage();
                }
            } else {
                showNoQrMessage();
            }
        })
        .catch((error) => {
            console.error("Error generating QR code:", error);
            showNoQrMessage();
        });

    // Helper function to show no QR message
    function showNoQrMessage() {
        loadingQr.classList.add('d-none');
        qrContainer.classList.add('d-none');
        noQrMessage.classList.remove('d-none');
    }
}

// Download QR code as image
function downloadQRCode() {
    const canvas = document.querySelector('#qr-code canvas');
    
    if (canvas) {
        // Convert canvas to data URL
        const dataURL = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'SafeQR-Emergency-Code.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Calculate profile completion percentage
function calculateProfileCompletion(userData) {
    const completionProgressElement = document.getElementById('completion-progress');
    const completionPercentageElement = document.getElementById('completion-percentage');
    
    if (completionProgressElement && completionPercentageElement) {
        let totalFields = 0;
        let completedFields = 0;
        
        // Personal info fields
        const personalFields = ['fullName', 'dateOfBirth', 'gender', 'phoneNumber', 'address'];
        personalFields.forEach(field => {
            totalFields++;
            if (userData[field] && userData[field].trim() !== '') {
                completedFields++;
            }
        });
        
        // Medical info fields
        const medicalInfo = userData.medicalInfo || {};
        const medicalFields = ['bloodType', 'height', 'weight'];
        medicalFields.forEach(field => {
            totalFields++;
            if (medicalInfo[field]) {
                completedFields++;
            }
        });
        
        // Lists (allergies, conditions, medications)
        totalFields += 3;
        if ((medicalInfo.allergies || []).length > 0) completedFields++;
        if ((medicalInfo.conditions || []).length > 0) completedFields++;
        if ((medicalInfo.medications || []).length > 0) completedFields++;
        
        // Emergency contacts
        totalFields++;
        if ((userData.emergencyContacts || []).length > 0) completedFields++;
        
        // Calculate percentage
        const percentage = Math.round((completedFields / totalFields) * 100);
        
        // Update UI
        completionProgressElement.style.width = `${percentage}%`;
        completionPercentageElement.textContent = `${percentage}%`;
        
        // Update profile complete status
        const isProfileComplete = percentage >= 70; // Consider profile complete if at least 70% filled
        
        if (isProfileComplete !== (userData.emergencyInfo?.profileComplete || false)) {
            db.collection('users').doc(auth.currentUser.uid).update({
                'emergencyInfo.profileComplete': isProfileComplete
            });
        }
    }
} 