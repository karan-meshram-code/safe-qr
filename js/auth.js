// Auth state observer
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a page that requires authentication
    const requiresAuth = ['dashboard.html', 'profile.html'].some(page => window.location.href.includes(page));
    const isAuthPage = ['login.html', 'signup.html'].some(page => window.location.href.includes(page));
    const isEmergencyPage = window.location.href.includes('emergency.html');

    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            if (isAuthPage) {
                // Redirect to dashboard if already signed in and on auth page
                window.location.href = 'dashboard.html';
            } else if (requiresAuth) {
                // Update UI for signed in user
                updateUIForUser(user);
            }
        } else {
            // No user is signed in
            if (requiresAuth) {
                // Redirect to login if auth required but not signed in
                window.location.href = 'login.html';
            }
        }
    });

    // Handle logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut()
                .then(() => {
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    showAlert('error', `Error logging out: ${error.message}`);
                });
        });
    }

    // Handle signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Handle login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Handle password reset form
    const resetForm = document.getElementById('reset-password-form');
    if (resetForm) {
        resetForm.addEventListener('submit', handlePasswordReset);
    }

    // Handle Google sign-in
    const googleSignupBtn = document.getElementById('google-signup');
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', handleGoogleSignIn);
    }
    
    const googleLoginBtn = document.getElementById('google-login');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleSignIn);
    }
});

// Update UI for signed in user
function updateUIForUser(user) {
    // Update user name in navbar
    const userNameElements = document.querySelectorAll('#user-name, #header-user-name');
    userNameElements.forEach(el => {
        if (el) {
            el.textContent = user.displayName || user.email;
        }
    });

    // Update user email in profile
    const userEmailElements = document.querySelectorAll('#profile-email, #header-user-email, #account-email');
    userEmailElements.forEach(el => {
        if (el) {
            el.textContent = user.email;
            if (el.id === 'account-email') {
                el.value = user.email;
            }
        }
    });
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();
    
    // Get form fields
    const fullName = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const termsCheck = document.getElementById('terms-check').checked;
    
    // Form validation
    if (password !== confirmPassword) {
        showAlert('error', 'Passwords do not match!');
        return;
    }
    
    if (password.length < 6) {
        showAlert('error', 'Password should be at least 6 characters');
        return;
    }
    
    if (!termsCheck) {
        showAlert('error', 'You must agree to the Terms of Service');
        return;
    }
    
    // Show loading state
    setLoadingState('signup', true);
    
    // Create user with email and password
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Update user profile with name
            return userCredential.user.updateProfile({
                displayName: fullName
            }).then(() => {
                // Create user document in Firestore
                return db.collection('users').doc(userCredential.user.uid).set({
                    fullName: fullName,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    emergencyInfo: {
                        profileComplete: false
                    }
                });
            }).then(() => {
                // Send email verification
                return userCredential.user.sendEmailVerification();
            }).then(() => {
                showAlert('success', 'Account created successfully! Please check your email for verification.');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            });
        })
        .catch((error) => {
            showAlert('error', `Error creating account: ${error.message}`);
            setLoadingState('signup', false);
        });
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    // Get form fields
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me')?.checked;
    
    // Set persistence based on remember me checkbox
    const persistence = rememberMe 
        ? firebase.auth.Auth.Persistence.LOCAL 
        : firebase.auth.Auth.Persistence.SESSION;
    
    // Show loading state
    setLoadingState('login', true);
    
    // Set persistence then sign in
    auth.setPersistence(persistence)
        .then(() => {
            return auth.signInWithEmailAndPassword(email, password);
        })
        .then(() => {
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            showAlert('error', `Login failed: ${error.message}`);
            setLoadingState('login', false);
        });
}

// Handle password reset
function handlePasswordReset(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    
    // Show loading state
    setLoadingState('reset', true);
    
    // Send password reset email
    auth.sendPasswordResetEmail(email)
        .then(() => {
            showAlert('success', 'Password reset link sent to your email!', 'reset');
            setLoadingState('reset', false);
            // Reset form
            document.getElementById('reset-password-form').reset();
        })
        .catch((error) => {
            showAlert('error', `Password reset failed: ${error.message}`, 'reset');
            setLoadingState('reset', false);
        });
}

// Handle Google sign in
function handleGoogleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then((result) => {
            // Check if user is new
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            if (isNewUser) {
                // Create user document for new Google sign-ins
                return db.collection('users').doc(result.user.uid).set({
                    fullName: result.user.displayName,
                    email: result.user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    emergencyInfo: {
                        profileComplete: false
                    }
                }).then(() => {
                    window.location.href = 'dashboard.html';
                });
            } else {
                window.location.href = 'dashboard.html';
            }
        })
        .catch((error) => {
            showAlert('error', `Google sign-in failed: ${error.message}`);
        });
}

// Helper function to show alerts
function showAlert(type, message, prefix = '') {
    const alertId = prefix ? `${prefix}-${type}-message` : `${type}-message`;
    const alertElement = document.getElementById(alertId);
    
    if (alertElement) {
        alertElement.textContent = message;
        alertElement.classList.remove('d-none');
        
        // Hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                alertElement.classList.add('d-none');
            }, 5000);
        }
    }
}

// Helper function to set loading state
function setLoadingState(formType, isLoading) {
    const btnText = document.getElementById(`${formType}-btn-text`);
    const spinner = document.getElementById(`${formType}-spinner`);
    
    if (btnText && spinner) {
        if (isLoading) {
            btnText.parentElement.disabled = true;
            spinner.classList.remove('d-none');
        } else {
            btnText.parentElement.disabled = false;
            spinner.classList.add('d-none');
        }
    }
} 