# SafeQR - Emergency Information QR Code System

SafeQR is a web application that allows users to create and manage personalized QR codes containing vital medical and emergency contact information. In case of an emergency or accident, first responders can quickly scan the QR code to access critical information about the individual.

## Features

- **User Authentication**: Secure signup and login with email/password or Google authentication
- **Personal Profile**: Store personal details like name, address, and contact information
- **Medical Information**: Record blood type, allergies, medical conditions, medications, and other important health details
- **Emergency Contacts**: Add and manage emergency contact persons
- **QR Code Generation**: Create a unique QR code linked to your emergency information
- **Privacy Settings**: Control what information is shared when your QR code is scanned
- **Mobile Responsive**: Works seamlessly on all devices

## Technology Stack

- HTML5, CSS3, JavaScript
- Bootstrap 5 for responsive design
- Firebase Authentication for user management
- Firebase Firestore for database storage
- QRCode.js for QR code generation

## Setup Instructions

1. **Clone the repository**

2. **Set up Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password and Google Sign-in)
   - Create a Firestore database
   - Update the Firebase configuration in `js/firebase-config.js` with your project settings

3. **Deploy the application**
   - You can deploy the application using Firebase Hosting:
     ```
     npm install -g firebase-tools
     firebase login
     firebase init
     firebase deploy
     ```
   - Or serve it locally using any web server

## Project Structure

```
SafeQR/
├── index.html               # Landing page
├── login.html              # User login
├── signup.html             # New user registration
├── dashboard.html          # User dashboard with QR code
├── profile.html            # Profile management
├── emergency.html          # QR scan result page
├── css/
│   └── styles.css          # Custom styles
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   ├── auth.js             # Authentication logic
│   ├── app.js              # Main application logic
│   ├── dashboard.js        # Dashboard functionality
│   ├── profile.js          # Profile management functionality
│   └── emergency.js        # Emergency page functionality
└── assets/                 # Images and other assets
```

## How It Works

1. **User Registration**: Users create an account and enter their personal, medical, and emergency contact information
2. **QR Code Generation**: A unique QR code is generated once the profile is sufficiently complete
3. **QR Code Usage**: Users can download and print their QR code to carry on a wallet card, keychain, bracelet, etc.
4. **Emergency Access**: In case of emergency, anyone can scan the QR code to access critical information

## Customization

- Update colors and styling in the `css/styles.css` file
- Modify the Firebase configuration in `js/firebase-config.js`
- Adjust QR code appearance in `js/dashboard.js`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created for emergency preparedness and safety. 