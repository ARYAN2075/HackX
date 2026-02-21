# 🚀 HACK HUNTERS - Authentication Quick Start Guide

## Getting Started in 2 Minutes

### Step 1: Create Your First Account

1. **Open the app** → You'll see the **Welcome Screen**
2. Click **"Create Account"** or **"Sign Up"**
3. Fill in the signup form:
   ```
   Full Name:     John Doe
   Email:         john@example.com
   Password:      SecurePass123
   Confirm:       SecurePass123
   ```
4. Click **"Create Account"**
5. ✅ **Success!** You're automatically logged in and redirected to the Dashboard

### Step 2: Explore the Dashboard

After logging in, you'll see:
- **User Profile** - Your name appears in the sidebar
- **Stats Cards** - Document count, chat sessions, status
- **Quick Actions** - Upload, Chat, FAQ, History
- **Theme Toggle** - Switch between dark/light mode
- **Logout Button** - In the sidebar

### Step 3: Test Session Persistence

1. **Refresh the page** (F5 or Ctrl+R)
2. ✅ You're still logged in! Session restored automatically
3. **Close the browser completely**
4. **Reopen the app**
5. ✅ Still logged in! (Session valid for 1 day by default)

### Step 4: Try "Remember Me"

1. Click **Logout** in the sidebar
2. Go to **Login** page
3. Enter credentials:
   ```
   Email:     john@example.com
   Password:  SecurePass123
   ```
4. ✅ **Check "Remember Me"**
5. Click **"Sign In"**
6. Now your session will last **7 days** instead of 1

---

## 🧪 Testing All Features

### Test 1: Password Reset Flow

1. On **Login** page, click **"Forgot Password?"**
2. Enter email: `john@example.com`
3. Click **"Send Reset Link"**
4. ✅ Email verified → See success message
5. Click **"Enter New Password"**
6. Set new password:
   ```
   New Password:     MyNewPassword123
   Confirm:          MyNewPassword123
   ```
7. Click **"Save New Password"**
8. ✅ Password updated! Modal closes automatically
9. Now login with the new password

### Test 2: Form Validation Errors

**Invalid Email:**
1. Try signing up with `test@com` → ❌ Error: "Please enter a valid email address"

**Password Mismatch:**
1. Sign up with:
   - Password: `Pass123`
   - Confirm: `Pass456`
2. → ❌ Error: "Passwords do not match"

**Existing Email:**
1. Try signing up again with `john@example.com`
2. → ❌ Error: "An account with this email already exists"

**Wrong Password:**
1. Login with correct email but wrong password
2. → ❌ Error: "Invalid email or password"

### Test 3: Password Strength Indicator

1. Go to **Sign Up** page
2. Type passwords to see strength meter:
   - `pass` → 🔴 **Weak** (0-1 bars)
   - `Password` → 🟡 **Fair** (2 bars)
   - `Password1` → 🟢 **Good** (3 bars)
   - `Password1!` → 🔵 **Strong** (4 bars)

### Test 4: Protected Routes

1. **Logout** from the app
2. Try accessing dashboard features:
   - Can't access Upload, Chat, FAQ without login
3. Must login first → Then access granted

---

## 📋 Pre-Filled Test Accounts

After creating these accounts, you can quickly test login:

```
Account 1:
Email:    test@example.com
Password: Test1234

Account 2:
Email:    admin@hack.com
Password: Admin123!

Account 3:
Email:    demo@demo.com
Password: Demo1234
```

**To create them:**
1. Go to Sign Up for each
2. Fill in the form
3. They'll be saved in your browser's localStorage

---

## 🔍 Debugging & Developer Tools

### View Stored Data

Open **Browser DevTools** (F12) → **Application/Storage** → **Local Storage**:

```javascript
// View all users
localStorage.getItem('hack_hunters_users')

// View current session
localStorage.getItem('hack_hunters_session')

// Clear all auth data (manual logout)
localStorage.removeItem('hack_hunters_session')
localStorage.removeItem('hack_hunters_users')
```

### Check Authentication State

In the browser console:
```javascript
// Import and check
import { getSession, isAuthenticated } from './utils/authService';

// Check if logged in
console.log(isAuthenticated());

// Get current session
console.log(getSession());
```

---

## 🎨 UI Features to Try

### 1. Show/Hide Password
- Click the **Eye icon** in any password field to toggle visibility

### 2. Google Sign-In (Simulated)
- Click **"Sign in with Google"** on Login/Signup
- Instantly logs you in as "User" (demo only)

### 3. Theme Toggle
- Click **Settings** in sidebar
- Toggle **Dark/Light Mode**
- See cyber theme transform!

### 4. Toast Notifications
Watch for success/error messages:
- ✅ Green toasts → Success
- ❌ Red toasts → Errors
- ℹ️ Blue toasts → Info

### 5. Loading States
- Notice button spinners during:
  - Login (1.5 seconds)
  - Sign Up (1.8 seconds)
  - Password Reset (1.8 seconds)

### 6. Animated 3D Canvas
- On Login/Signup pages, see floating data nodes
- Beautiful cyber-tech aesthetic!

---

## ⚡ Power User Tips

### Quick Test Flow (30 seconds)
```
1. Sign Up → john@test.com / Test1234
2. Auto-login → Dashboard
3. Click Upload → Upload a PDF
4. Go to Chat → Ask questions
5. Logout → Login again → Session works!
```

### Keyboard Shortcuts
- `Tab` → Navigate between fields
- `Enter` → Submit forms
- `Escape` → Close modals

### Session Expiry Test
1. Login without "Remember Me"
2. Change system time forward 25 hours
3. Refresh page → Session expired
4. Redirected to Welcome screen

---

## 🐛 Troubleshooting

### "I'm stuck on the Welcome screen"
→ Your session expired. Just login again!

### "Can't create account with my email"
→ Email already exists. Try:
1. Logging in instead
2. Using a different email
3. Resetting password if forgotten

### "Password reset not working"
→ Make sure:
1. Email exists in the system (sign up first)
2. New password is at least 8 characters
3. Passwords match

### "Page refresh logs me out"
→ Your session expired. Sessions last:
- 1 day (normal login)
- 7 days ("Remember Me")

### "Clear all data and start fresh"
```javascript
// Run in browser console
localStorage.clear();
location.reload();
```

---

## 📱 Mobile Testing

1. Open app on mobile browser
2. All features work on touch devices
3. Split-screen auth pages collapse to single column
4. Forms are touch-optimized

---

## 🎯 Common User Journeys

### Journey 1: First-Time Visitor
```
Welcome → Sign Up → Dashboard → Upload Document → Chat → Logout
```

### Journey 2: Returning User
```
Welcome → Login → Dashboard → Resume Work
```

### Journey 3: Forgot Password
```
Login → Forgot Password → Reset → Login with New Password → Dashboard
```

### Journey 4: Quick Demo
```
Welcome → Sign Up (Google) → Instant Access → Explore Features
```

---

## 📊 What Gets Stored?

### In `hack_hunters_users`:
```json
[
  {
    "id": "user_1645231234567_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "createdAt": "2026-02-20T10:30:00.000Z",
    "lastLogin": "2026-02-20T11:45:00.000Z"
  }
]
```

### In `hack_hunters_session`:
```json
{
  "userId": "user_1645231234567_abc123",
  "email": "john@example.com",
  "name": "John Doe",
  "loginTime": "2026-02-20T11:45:00.000Z",
  "rememberMe": false
}
```

---

## ✅ Checklist: Test Everything

- [ ] Create a new account
- [ ] Login with the account
- [ ] Refresh page (session persists)
- [ ] Logout
- [ ] Login again with "Remember Me"
- [ ] Try wrong password (see error)
- [ ] Try invalid email format (see error)
- [ ] Reset password via Forgot Password
- [ ] Login with new password
- [ ] Check password strength indicator
- [ ] Toggle password visibility
- [ ] Try Google Sign-In (simulated)
- [ ] Navigate dashboard after login
- [ ] Change theme in settings
- [ ] Test on mobile browser
- [ ] Clear localStorage and start fresh

---

## 🎓 Learning Points

### What You've Experienced:
1. ✅ **Form Validation** - Real-time email/password checking
2. ✅ **Error Handling** - Clear, specific error messages
3. ✅ **Session Management** - Persistent login state
4. ✅ **Password Security** - Strength indicators, show/hide
5. ✅ **User Feedback** - Loading states, success toasts
6. ✅ **Protected Routes** - Auth-gated navigation
7. ✅ **Responsive Design** - Works on all devices
8. ✅ **Modern UX** - Smooth animations, glassmorphism

### Behind the Scenes:
- **TypeScript** for type safety
- **LocalStorage** as simulated database
- **Session expiry** logic with timestamps
- **Password strength** algorithm (4 criteria)
- **Email regex** validation
- **Auto-login** after signup
- **React state management** for auth flow

---

## 🚀 Next Steps

After testing auth:
1. **Upload a Document** → Try the upload feature
2. **Chat with Document** → Ask questions about your files
3. **Explore FAQ** → See suggested queries
4. **Check History** → View past conversations
5. **Customize Settings** → Change theme, preferences

---

**Happy Testing! 🎉**

Questions? Check `/AUTH_DOCUMENTATION.md` for full technical details.
