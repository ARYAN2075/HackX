# 🔐 HACK HUNTERS Authentication System

## Overview
Complete authentication system with user registration, login, password reset, session management, and protected routes.

## Features Implemented

### ✅ Authentication Screens
- **Login Page** - Email + Password authentication with "Remember Me" option
- **Sign Up Page** - Full name, Email, Password, Confirm Password with validation
- **Forgot Password Flow** - Email verification → Reset password (4-step modal)
- **Welcome Screen** - Landing page with navigation to login/signup

### ✅ Functional UI States
- ❌ **Error Messages** - Inline validation errors for:
  - Invalid email format
  - Wrong password
  - Empty required fields
  - Password mismatch
  - Account already exists
  - Account not found
- ✅ **Success Messages** - Toast notifications for:
  - Account created successfully
  - Login successful
  - Password reset successful
  - Logout confirmation
- ⏳ **Loading States** - Button spinners during:
  - Login process (1.5s simulated)
  - Sign up process (1.8s simulated)
  - Password reset (1.8s simulated)
- 🔒 **Disabled States** - Buttons disabled during loading

### ✅ UX Improvements
- **Real-time Validation** - Form fields validate on change
- **Show/Hide Password** - Eye icon toggles in all password fields
- **Password Strength Indicator** - 4-level strength meter (Weak → Strong)
- **Password Match Indicator** - Visual checkmark when passwords match
- **Remember Me Checkbox** - Session persistence (7 days vs 1 day)
- **Auto-redirect** - Automatic navigation to dashboard after successful auth
- **Session Persistence** - LocalStorage-based session management
- **Auto-login on Refresh** - Sessions restored on page reload

### ✅ Dashboard After Login
- **User Profile Integration** - User name displayed in sidebar
- **Protected Routes** - All app features require authentication
- **Logout Button** - Available in sidebar with session cleanup
- **Document Statistics** - Active document count, chat sessions, status
- **Quick Actions** - Upload, Chat, FAQ, History navigation

### ✅ Design & Styling
- **Modern Cyber-Tech Theme** - Dark navy backgrounds with electric cyan accents
- **Glassmorphism Effects** - Frosted glass panels with blur
- **Neon Glow Effects** - Electric cyan borders and shadows
- **3D Animated Canvas** - Floating data nodes on auth pages
- **Responsive Design** - Mobile-friendly layouts
- **Light & Dark Mode Support** - Theme toggle in settings
- **Smooth Animations** - Motion.js powered transitions

---

## 🔄 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                      │
└─────────────────────────────────────────────────────────────┘

First-Time User Flow:
┌───────────┐     ┌───────────┐     ┌──────────────┐     ┌──────────┐
│  Welcome  │────▶│  Sign Up  │────▶│  Auto Login  │────▶│Dashboard │
│   Screen  │     │   Page    │     │  + Session   │     │          │
└───────────┘     └───────────┘     └──────────────┘     └──────────┘
                        │
                        ├──▶ Validate Name (required)
                        ├──▶ Validate Email (format + unique)
                        ├──▶ Validate Password (min 6 chars)
                        ├──▶ Confirm Password Match
                        ├──▶ Create User in LocalStorage
                        └──▶ Create Session → Redirect

Existing User Flow:
┌───────────┐     ┌───────────┐     ┌──────────────┐     ┌──────────┐
│  Welcome  │────▶│   Login   │────▶│Verify Creds  │────▶│Dashboard │
│   Screen  │     │   Page    │     │ + Session    │     │          │
└───────────┘     └───────────┘     └──────────────┘     └──────────┘
                        │
                        ├──▶ Check Email Exists
                        ├──▶ Validate Password
                        ├──▶ Create Session (Remember Me?)
                        └──▶ Redirect to Dashboard

Forgot Password Flow:
┌───────────┐     ┌──────────────────┐     ┌───────────┐     ┌─────────┐
│   Login   │────▶│ Forgot Password  │────▶│   Reset   │────▶│  Done   │
│   Page    │     │  Enter Email     │     │  Password │     │         │
└───────────┘     └──────────────────┘     └───────────┘     └─────────┘
                          │                       │
                          ├──▶ Check Email        ├──▶ New Password (8+ chars)
                          ├──▶ Simulated Send     ├──▶ Confirm Match
                          └──▶ Show Success       └──▶ Update in DB → Redirect

Session Restore on Refresh:
┌───────────┐     ┌──────────────┐     ┌──────────┐
│   Load    │────▶│Check Session │────▶│Dashboard │
│   App     │     │  in Storage  │     │  (Auth)  │
└───────────┘     └──────────────┘     └──────────┘
                          │
                          ├──▶ Session Found? → Auto-login
                          ├──▶ Session Expired? → Welcome
                          └──▶ No Session? → Welcome

Logout Flow:
┌──────────┐     ┌──────────────┐     ┌───────────┐
│Dashboard │────▶│Clear Session │────▶│  Welcome  │
│   (any)  │     │ + Clear Data │     │   Screen  │
└──────────┘     └──────────────┘     └───────────┘
                          │
                          ├──▶ Remove session from localStorage
                          ├──▶ Clear app state (documents, chats)
                          └──▶ Redirect to welcome
```

---

## 📁 File Structure

```
/src/app/
├── App.tsx                          # Main app with auth routing & session check
├── utils/
│   └── authService.ts               # Authentication service (user DB, sessions)
└── components/
    ├── LoginPage.tsx                # Login form with validation
    ├── SignupPage.tsx               # Signup form with password strength
    ├── ForgotPasswordModal.tsx      # Password reset flow (4 steps)
    ├── WelcomeScreen.tsx            # Landing page
    ├── Dashboard.tsx                # Protected dashboard (requires auth)
    ├── Sidebar.tsx                  # Navigation with logout button
    └── Toast.tsx                    # Success/error notifications
```

---

## 🔑 LocalStorage Database Schema

### Users Database
```typescript
Key: "hack_hunters_users"
Value: User[]

interface User {
  id: string;              // "user_1645231234567_abc123def"
  name: string;            // "John Doe"
  email: string;           // "john@example.com" (lowercase)
  password: string;        // Plain text (would be hashed in production)
  createdAt: string;       // ISO timestamp
  lastLogin?: string;      // ISO timestamp of last login
}
```

### Session Storage
```typescript
Key: "hack_hunters_session"
Value: Session

interface Session {
  userId: string;          // User ID reference
  email: string;           // User email
  name: string;            // User display name
  loginTime: string;       // ISO timestamp
  rememberMe: boolean;     // True = 7 days, False = 1 day
}
```

---

## 🛡️ Security Features

### Validation Rules
- **Email**: Must match regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Password**: Minimum 6 characters (8+ recommended)
- **Name**: Required, non-empty string
- **Unique Email**: Cannot sign up with existing email

### Session Management
- **Session Expiry**:
  - Remember Me: 7 days (168 hours)
  - Normal: 1 day (24 hours)
- **Auto-cleanup**: Expired sessions cleared on app load
- **Secure Logout**: Clears all session data + app state

### Password Security
- **Strength Meter**: Checks for:
  - Length (8+ characters)
  - Uppercase letters
  - Numbers
  - Special characters
- **Visual Feedback**: 4-level color-coded indicator
- **Show/Hide Toggle**: All password fields support visibility toggle

---

## 🎨 Error Handling

### Login Errors
| Condition | Error Message |
|-----------|---------------|
| Empty email | "Please enter your email address" |
| Empty password | "Please enter your password" |
| User not found | "Invalid email or password" |
| Wrong password | "Invalid email or password" |

### Signup Errors
| Condition | Error Message |
|-----------|---------------|
| Empty name | "Please enter your full name" |
| Invalid email | "Please enter a valid email address" |
| Email exists | "An account with this email already exists" |
| Password < 6 chars | "Password must be at least 6 characters" |
| Passwords don't match | "Passwords do not match" |

### Password Reset Errors
| Condition | Error Message |
|-----------|---------------|
| Invalid email | "Please enter a valid email address" |
| Email not found | "No account found with this email address" |
| Password < 8 chars | "Password must be at least 8 characters" |
| Passwords don't match | "Passwords do not match" |

---

## ✨ Success States

### Toast Notifications
- ✅ **Account Created**: "Account created successfully! Welcome aboard."
- ✅ **Login Success**: "Welcome back! Successfully logged in."
- ✅ **Password Reset**: "Password Updated! Your password has been reset successfully."
- ℹ️ **Logout**: "Logged out successfully"

### Visual Feedback
- **Progress Indicators**: Step-based progress in password reset modal
- **Animated Icons**: Spinning loaders during async operations
- **Color Coding**:
  - Success: Green (#10b981)
  - Error: Red (#f87171)
  - Info: Cyan (#00F3FF)

---

## 📱 Responsive Design

### Breakpoints
- **Mobile** (<768px): Single column, simplified navigation
- **Tablet** (768px-1024px): Adaptive layouts
- **Desktop** (>1024px): Split-screen auth pages with 3D illustrations

### Mobile-Specific Features
- Touch-optimized buttons (min 44px tap target)
- Simplified navigation
- Condensed forms
- Full-width action buttons

---

## 🚀 Usage Examples

### Creating a New Account
1. Navigate to Welcome Screen
2. Click "Sign Up" or "Create Account"
3. Fill in:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Password: `SecurePass123!` (min 6 chars)
   - Confirm Password: `SecurePass123!`
4. Click "Create Account"
5. **Auto-login** → Redirects to Dashboard
6. Session saved in localStorage

### Logging In
1. Navigate to Login Page
2. Enter credentials:
   - Email: `john@example.com`
   - Password: `SecurePass123!`
3. (Optional) Check "Remember Me" for 7-day session
4. Click "Sign In"
5. Redirects to Dashboard with active session

### Resetting Password
1. On Login Page, click "Forgot Password?"
2. **Step 1**: Enter email → Click "Send Reset Link"
3. **Step 2**: Confirmation screen (simulated email sent)
4. **Step 3**: Click "Enter New Password"
   - New Password: `NewPassword123!` (8+ chars)
   - Confirm Password: `NewPassword123!`
5. **Step 4**: Success! Password updated in database

### Logging Out
1. Click user profile icon in sidebar
2. Click "Logout" button
3. Session cleared from localStorage
4. All app data reset
5. Redirected to Welcome Screen

---

## 🧪 Testing the System

### Test Accounts (After Creating)
Create test accounts with these patterns:
```
Email: test@example.com
Password: Test1234!

Email: admin@hack.com
Password: Admin123!
```

### Test Scenarios

#### ✅ First-Time User Journey
1. Open app → Welcome screen shown
2. Click "Sign Up"
3. Fill form with valid data → Account created
4. Auto-logged in → Dashboard shown
5. Refresh page → Still logged in (session restored)

#### ✅ Returning User Journey
1. Open app → Welcome screen (if logged out)
2. Click "Login"
3. Enter valid credentials → Login successful
4. Dashboard shown with user name in sidebar

#### ✅ Error Handling
1. Try logging in with non-existent email → Error: "Invalid email or password"
2. Try signing up with existing email → Error: "An account with this email already exists"
3. Try passwords that don't match → Error: "Passwords do not match"
4. Try weak password (< 6 chars) → Error shown

#### ✅ Password Reset
1. Click "Forgot Password?" on login
2. Enter valid email → Success: Email sent (simulated)
3. Click "Enter New Password"
4. Set new password → Success: Password updated
5. Return to login → Can login with new password

#### ✅ Session Persistence
1. Login with "Remember Me" checked
2. Close browser completely
3. Reopen app → Still logged in (session valid for 7 days)
4. Login without "Remember Me"
5. Wait 25+ hours → Session expired → Redirected to welcome

---

## 🔧 Advanced Features

### Auto-Login After Signup
- Automatically creates session after successful registration
- No need to manually log in after signup
- Immediate access to dashboard

### Session Expiry Logic
```typescript
// Check session validity
const session = getSession();
if (session) {
  const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
  const maxHours = session.rememberMe ? 168 : 24; // 7 days vs 1 day
  
  if (hoursSinceLogin > maxHours) {
    clearSession(); // Expired
  }
}
```

### Google Sign-In (Simulated)
- Mock Google OAuth button on login/signup
- Clicking it bypasses form and logs in as "User"
- Real implementation would use Firebase/Auth0

---

## 🎯 Future Enhancements (Not Implemented)

- [ ] Email verification (real SMTP)
- [ ] OAuth integration (Google, GitHub, Microsoft)
- [ ] Two-factor authentication (2FA)
- [ ] Password strength requirements enforcement
- [ ] Account deletion
- [ ] Profile editing
- [ ] Password change from settings
- [ ] Login history tracking
- [ ] Security notifications
- [ ] Rate limiting on login attempts
- [ ] CAPTCHA for bot protection

---

## 📝 Notes for Developers

### Production Considerations
⚠️ **This is a simulated authentication system for hackathon purposes.**

For production, implement:
1. **Backend API** - Replace localStorage with real database (PostgreSQL, MongoDB)
2. **Password Hashing** - Use bcrypt/argon2 to hash passwords
3. **JWT Tokens** - Replace sessions with secure JWT tokens
4. **HTTPS Only** - Enforce secure connections
5. **Rate Limiting** - Prevent brute-force attacks
6. **Input Sanitization** - Prevent XSS/SQL injection
7. **CSRF Protection** - Add CSRF tokens to forms
8. **Email Verification** - Send real verification emails
9. **Password Reset Tokens** - Use time-limited reset tokens
10. **Logging & Monitoring** - Track auth events for security

### Code Quality
- ✅ TypeScript for type safety
- ✅ Modular architecture (separate auth service)
- ✅ Reusable components (forms, inputs, toasts)
- ✅ Consistent error handling
- ✅ Clean code practices

---

## 📞 Support

For issues or questions about the authentication system:
1. Check this documentation
2. Review `/src/app/utils/authService.ts` for business logic
3. Inspect browser localStorage to debug sessions
4. Check browser console for error messages

---

**Built with ❤️ for Hack The Spring '26**  
**HACK HUNTERS – Smart Document Assistant**
