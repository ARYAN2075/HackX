# 🔧 TROUBLESHOOTING GUIDE

## ✅ Files Created to Fix Issues

I've just created these **essential files** that were missing:

### 1. `/index.html` ✅
- Root HTML file that loads the React app
- Contains the `<div id="root">` mount point
- References `/src/main.tsx`

### 2. `/src/main.tsx` ✅
- React application entry point
- Mounts the App component to the DOM
- Imports all CSS styles

---

## 🚀 Your App Should Now Work!

The HACK HUNTERS document Q&A system is now **fully configured and ready to run**.

### Complete Flow:
1. **App starts** → `index.html` loads
2. **React mounts** → `main.tsx` renders `App.tsx`
3. **User sees** → Welcome screen (if not logged in)
4. **After login** → Dashboard with upload option
5. **Upload doc** → Progress animation → Document becomes active
6. **Ask questions** → AI responds with sources → View in preview panel

---

## 🐛 If You Still See Issues

### Problem: "Blank Page"
**Solution:** 
- Open browser console (F12)
- Check for error messages
- Common fixes:
  - Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
  - Restart development server

### Problem: "Document upload doesn't work"
**Check:**
1. Are you logged in? (Upload requires authentication)
2. File type correct? (Only PDF, DOCX, TXT supported)
3. Look for console errors

### Problem: "Questions don't get answered"
**Check:**
1. Is a document uploaded and active?
2. Check the "Active Document" badge at top of chat
3. Try suggested questions first
4. Open console to see if there are JavaScript errors

### Problem: "PDF preview not showing"
**Note:** 
- PDF preview works for `.pdf` files only
- DOCX and TXT show "preview not available" (this is correct)
- Use the **Intelligence tab** for document analysis
- Toggle between "Intelligence" and "Preview" modes

### Problem: "Authentication not working"
**Check:**
1. Email format valid? (must contain @)
2. Password requirements met? (8+ chars, 1 uppercase, 1 number, 1 special)
3. On signup: Do passwords match?
4. Clear localStorage and try again:
   ```javascript
   // In browser console:
   localStorage.clear();
   location.reload();
   ```

---

## 📋 Quick Test Checklist

Run through this to verify everything works:

### ✅ Authentication
- [ ] Welcome screen loads
- [ ] Can navigate to Signup
- [ ] Can create account (email + password)
- [ ] Automatically redirected to Dashboard after signup
- [ ] Can logout
- [ ] Can login again with same credentials
- [ ] Session persists on page refresh

### ✅ Document Upload
- [ ] Click "Upload Document" in sidebar
- [ ] See upload dropzone
- [ ] Can drag & drop PDF file
- [ ] See upload progress (0-100%)
- [ ] See processing stages
- [ ] Document appears as "Active Document"
- [ ] Auto-redirected to Chat after upload

### ✅ Q&A System
- [ ] Chat panel shows welcome message
- [ ] Can see suggested questions
- [ ] Can click suggested question
- [ ] AI responds with answer
- [ ] Response includes source citations (page numbers)
- [ ] Source panel shows below answer
- [ ] Can type custom question
- [ ] Can save query (star button)
- [ ] Can copy answer (copy button)
- [ ] Can react with thumbs up/down

### ✅ Document Preview
- [ ] Right panel shows document info
- [ ] Can toggle between "Intelligence" and "Preview"
- [ ] Intelligence shows: summary, key insights, key terms
- [ ] Preview shows PDF viewer (for PDF files)
- [ ] Can navigate pages in PDF
- [ ] Can zoom in/out
- [ ] Can jump to specific page

---

## 🎯 Expected Behavior

### Document Upload Flow:
```
1. User drags PDF file
2. File appears in upload queue
3. Progress bar: "Uploading... 0%"
   → Increases to 100%
4. Status changes to "Processing"
5. Progress: "Parsing document... 10%"
   → "Extracting text & tables... 40%"
   → "Converting to embeddings... 70%"
   → "Indexing for search... 95%"
6. Status: "Document indexed successfully" ✓
7. Green checkmark icon
8. After 1.5 seconds: Auto-redirect to Chat
```

### Q&A Flow:
```
1. User types: "What is this document about?"
2. Message appears in chat (user bubble on right)
3. AI typing indicator appears (3 dots)
4. After ~1 second: AI response appears (left side)
5. Response includes:
   - Formatted text (bold, bullets)
   - Answer specific to document name
   - Source citations panel below
6. Source panel shows:
   - "Sources (2 chunks)"
   - Page numbers (P.1, P.2)
   - Section names
   - Text snippets in quotes
```

---

## 🔍 Console Check

Open browser console (F12) and you should see:
- ✅ No red errors
- ✅ React DevTools detected
- ✅ Vite connected (if in dev mode)
- ✅ Maybe some info logs (these are fine)

### Red Flags (Bad):
- ❌ "Failed to fetch"
- ❌ "Cannot read property of undefined"
- ❌ "Module not found"
- ❌ "Unexpected token"

If you see these, **copy the full error message** and I can help debug!

---

## 💡 Understanding Simulated Features

Your app uses **simulated backend** for demo purposes:

### What's Simulated:
1. **Authentication**: Uses localStorage (not a real server)
   - Passwords stored in plain text (demo only!)
   - Session management client-side only
   
2. **Document Processing**: Animated progress (not real AI)
   - No actual text extraction
   - No real embeddings
   - No vector database
   
3. **Q&A Responses**: Pattern-matched answers (not real LLM)
   - Looks at keywords in question
   - Returns pre-written answers
   - Sources are generated, not retrieved

### What's Real:
1. **File Upload**: Real file handling
   - Creates blob URLs from actual files
   - Reads file metadata (size, type)
   - Estimates page count
   
2. **PDF Preview**: Real PDF rendering
   - Uses browser's PDF viewer
   - Page navigation works
   - Zoom functionality works
   
3. **UI/UX**: Fully functional
   - All animations real
   - All interactions work
   - State management working
   - Routing works

---

## 🚀 Next Steps to Make It Real

### To connect real backend:

1. **Replace auth in `/src/app/utils/authService.ts`**:
   ```typescript
   // Current: localStorage
   // Replace with: API calls to your backend
   ```

2. **Replace Q&A in `/src/app/components/ChatPanel.tsx`**:
   ```typescript
   // Line 209-242: handleSend function
   // Current: generateSimulatedResponse()
   // Replace with: fetch('/api/chat', {...})
   ```

3. **Add real document processing**:
   - Upload file to server
   - Extract text (PyPDF2, python-docx, etc.)
   - Generate embeddings (OpenAI, Cohere, etc.)
   - Store in vector DB (Pinecone, Weaviate, etc.)
   - Retrieve similar chunks on query
   - Generate answer with LLM (GPT-4, Claude, etc.)

---

## 📞 Still Having Issues?

Tell me:
1. **What page are you on?** (Welcome? Login? Dashboard? Upload? Chat?)
2. **What did you do?** (Clicked button? Uploaded file? Typed question?)
3. **What happened?** (Nothing? Error? Wrong result?)
4. **Console errors?** (Copy the full error if any)

I'll help debug the specific issue! 🔧
