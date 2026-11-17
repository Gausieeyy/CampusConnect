# CampusConnect — Campus Lost & Found

A responsive student Design Studio prototype for reporting and browsing lost and found items.

## What it does

- Home dashboard with active, lost, and recovered counts
- Browse listings with keyword search and category/type filters
- Report a lost or found item
- Shared, live listings across browsers using Firebase Authentication and Cloud Firestore
- Optional WhatsApp contact button with a pre-filled message
- The original poster can mark their report recovered; the change syncs for everyone
- Responsive layout for phones and laptops

## Run it

This is a static website. It can be deployed on GitHub Pages or Netlify. Because the JavaScript uses ES modules, open it through a web host rather than double-clicking `index.html` as a local file.

**Before shared reports work:** follow every step in [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md), especially adding your Firebase web config to `firebase-config.js`, enabling Anonymous Authentication, creating Firestore, publishing the provided rules, and authorizing your website domain.

## Files

- `index.html` — page structure
- `style.css` — responsive styling
- `script.js` — interface, Firebase connection, live listings, and WhatsApp links
- `firebase-config.js` — your Firebase web-app configuration (fill in your own values)
- `FIREBASE_SETUP.md` — beginner-friendly Firebase setup and testing guide
- `PROJECT_GUIDE.md` — project explanation and presentation guide

## Important notes

- The four sample listings are illustrative demo data.
- The optional photo picker currently shows a local preview only; images are not uploaded to the shared database.
- WhatsApp contact details are public listing data. Only add a number with the owner's permission.
- Anonymous authentication is not student verification. Get college approval and add proper student authentication/moderation before a real campus-wide launch.
- Reports from the previous browser-only version are not automatically migrated.
