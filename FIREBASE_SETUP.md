# CampusConnect: enable shared listings with Firebase

This version uses **Firebase Authentication (anonymous sign-in)** and **Cloud Firestore**. It does not need VS Code, Node, or a separate server. You do need to create a Firebase project once and paste its web-app config into `firebase-config.js`.

## 1. Create a Firebase project

1. Open https://console.firebase.google.com/ and sign in with your Google account.
2. Select **Add project** and name it `CampusConnect` (or another name).
3. Google Analytics is optional for this student prototype; you can turn it off.
4. When the project is ready, click the Web icon (`</>`) to add a Web app.
5. Give it a nickname such as `CampusConnect Website`. You do not need to set up Firebase Hosting.
6. Firebase will show a `firebaseConfig` object. Copy the values into `firebase-config.js`, replacing each `PASTE_...` placeholder. Keep the property names and quotation marks as they are.

The web config is designed to be included in a website. It is not a password. Your Firestore Security Rules in step 4 are what protect database writes.

## 2. Turn on anonymous sign-in

1. In Firebase Console, open **Build → Authentication**.
2. Click **Get started** if prompted.
3. Open **Sign-in method** (or **Sign-in providers**).
4. Select **Anonymous**, enable it, and save.

This gives each browser a Firebase identity without asking students to create an account. A browser's anonymous identity is not a verified real-world identity.

## 3. Create the shared database

1. Open **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode**.
4. Choose a location near your users, such as `asia-south1` (Mumbai), if available. The database location cannot be changed later.
5. Create the database.

## 4. Add the database security rules

In Firestore Database, open the **Rules** tab. Replace the sample rules with the following, then click **Publish**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /listings/{listingId} {
      // Anyone can read public campus listings. Posting requires anonymous sign-in.
      allow read: if true;

      // A signed-in browser can create a listing only in its own name.
      allow create: if request.auth != null
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.keys().hasAll([
          'type', 'category', 'name', 'location', 'date',
          'description', 'whatsapp', 'recovered', 'createdBy', 'createdAt'
        ])
        && request.resource.data.type in ['lost', 'found']
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0
        && request.resource.data.name.size() <= 60
        && request.resource.data.location is string
        && request.resource.data.location.size() > 0
        && request.resource.data.location.size() <= 80
        && request.resource.data.description is string
        && request.resource.data.description.size() > 0
        && request.resource.data.description.size() <= 400
        && request.resource.data.whatsapp is string
        && request.resource.data.whatsapp.size() <= 18
        && request.resource.data.recovered == false;

      // Only the browser that posted a listing can mark it recovered.
      allow update: if request.auth != null
        && resource.data.createdBy == request.auth.uid
        && request.resource.data.diff(resource.data).affectedKeys()
             .hasOnly(['recovered', 'updatedAt'])
        && request.resource.data.recovered == true;

      // Only the browser that posted a listing can delete it (delete UI is not included yet).
      allow delete: if request.auth != null
        && resource.data.createdBy == request.auth.uid;
    }
  }
}
```

These rules allow anyone to view listings, but only the original posting browser can mark its report recovered. Anyone can still read public listing details, including a WhatsApp number the poster chose to provide. Do not use this prototype for sensitive or confidential information.

## 5. Allow your public website domain

1. In Authentication → Settings → **Authorized domains**, add your website's hostname if it is not already listed.
2. For GitHub Pages, add the hostname `YOUR-USERNAME.github.io` (not the full page path).
3. For Netlify, add the hostname shown in your Netlify site URL.

## 6. Publish the updated website

Upload **all files** from this folder to the root of the same GitHub Pages repository or redeploy the whole folder to Netlify:

- `index.html`
- `style.css`
- `script.js`
- `firebase-config.js` (with your real Firebase config values)

Keep `firebase-config.js` beside `index.html`. Do not upload only `script.js`.

After deployment, refresh the website. On the Browse Listings page, the status should say **Connected · reports sync across devices**. If it says setup required or connection problem, check the config, Anonymous sign-in, Firestore rules, and Authorized domains.

## 7. Test with two browsers/devices

1. Open the public site in your normal browser and submit a test report with a WhatsApp number you control and have permission to use.
2. Open the same public URL in a private/incognito window or a second device.
3. Open Browse Listings. The report should appear there too.
4. Open the report and click the WhatsApp button. Check that WhatsApp opens with a pre-filled message.
5. Return to the browser that created the report and mark it recovered. It should disappear from active listings in both browsers.

## Important limitations of this student prototype

- Reports are shared live through Firestore. The four sample listings in the code are illustrative examples, not real student reports.
- The photo picker currently provides a local preview only. Photos are **not** uploaded or shared; cloud photo upload would need a separate Firebase Storage setup.
- WhatsApp contact is optional. A 10-digit Indian mobile number is accepted and automatically prefixed with `91`; an international number should be entered with its country code.
- The WhatsApp number is public listing data. Only enter a number with the owner's permission. Do not post student IDs, private addresses, OTPs, or other sensitive details.
- Anonymous sign-in identifies a browser session, not a verified student. For a real college-wide launch, ask the college to approve it and add proper student sign-in/moderation and abuse reporting.
- Existing reports saved in the old version's browser-only storage are not automatically migrated to Firebase. Re-submit any test reports you want to keep.
- Firebase has usage limits and billing settings. Check the Firebase console's usage and billing page before a large public rollout; a class demo with modest traffic should be tested first.
