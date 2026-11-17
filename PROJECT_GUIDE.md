# CampusConnect — Design Studio Project Guide

## 1. Project title
CampusConnect: Campus Lost & Found Portal

## 2. Problem statement
Students sometimes lose personal belongings such as water bottles, notebooks, identity cards, keys and electronic accessories within a college campus. Information about lost and found objects is often shared informally through friends, class groups or campus offices. These disconnected methods can make it difficult to locate an item or connect it with its owner.

## 3. Proposed solution
CampusConnect is a simple web-based portal that provides one organised place to report lost belongings, report found belongings and search existing listings. Users can view an item's category, location, date and description. A listing can be marked as recovered once the item has been returned.

## 4. Objectives
- Provide a central place for lost and found reports.
- Make reports searchable by keyword and category.
- Help students share useful item and location details.
- Track whether an item is still active or has been recovered.
- Keep the prototype simple and accessible.

## 5. Intended users
- Students who have lost an item.
- Students or staff who have found an item.
- Campus help-desk or security staff in a future full version.

## 6. Main modules
1. Home dashboard: overview and recent listings.
2. Browse listings: search and category/type filters.
3. Report form: submit lost/found item details.
4. Item details: view description, date and location.
5. Recovery status: mark a listing as recovered.

## 7. Tools and technologies
- HTML: structures the pages, forms, buttons and content.
- CSS: styles the interface and makes it responsive.
- JavaScript: handles form submission, search, filters and status updates.
- Firebase Cloud Firestore: saves reports online and syncs them across browsers and devices.

## 8. Basic workflow
A user opens the portal → reports an item or browses existing reports → searches by keyword/category → checks the item details → follows the institution's safe handover process → marks the listing as recovered.

## 9. Benefits
- Reduces reliance on scattered informal messages.
- Makes information easier to search.
- Encourages students to help one another.
- Provides a clear status for resolved reports.

## 10. Limitations and future scope
The shared database works after the owner configures Firebase. This remains a student prototype, not an officially approved college service. Future improvements could include:
- A secure backend and shared database.
- College email login and role-based admin access.
- Moderation of reports and image uploads.
- A private contact or claim-request workflow.
- QR codes at campus help desks.
- Optional notifications when a similar item is reported.

## 11. Short presentation script
“Good morning. Our project is CampusConnect, a Campus Lost and Found Portal. We identified that students can lose belongings such as notebooks, water bottles, keys and electronic accessories inside the campus. At present, information may be spread across friends, messaging groups and campus offices. Our solution is a central website where a student can report a lost item, another person can report a found item, and users can search by item name or category. The listing shows useful details such as the item description, date and campus location. Once an item is returned, its status can be marked as recovered. We developed this prototype using HTML, CSS and JavaScript, with Firebase Authentication and Cloud Firestore so reports can sync across devices. A person who posts a listing can optionally add a WhatsApp number, allowing someone who recognises the item to contact them. Before a real college-wide launch, the system would need college approval, verified student accounts and moderation.”

## 12. Likely viva questions and answers

**Q1. What problem does your project solve?**  
It organises lost and found information in one searchable platform instead of relying only on scattered messages or word of mouth.

**Q2. Why did you choose this problem?**  
It is a common campus problem, easy to understand and has a practical solution that can be demonstrated.

**Q3. Which technologies did you use?**  
HTML for structure, CSS for design, JavaScript for functionality, Firebase Authentication for anonymous browser sign-in and Cloud Firestore for shared online reports.

**Q4. What is Firebase Cloud Firestore?**  
Firebase Cloud Firestore is a cloud database. It stores reports online and can synchronise changes across different browsers and devices.

**Q5. Is this a real multi-user website?**  
After Firebase is configured, reports are stored in a shared online database and appear across devices. The app uses anonymous browser sign-in, which does not verify that a person is a DSU student.

**Q6. How can you prevent false claims?**  
A future version could require the claimant to describe a private identifying detail and have campus staff verify ownership before handing over an item.

**Q7. What is the future scope?**  
Secure student login, a shared database, admin moderation, notifications and a private claim process.

**Q8. What happens when an item is recovered?**  
The browser that originally posted the listing can mark it as recovered. The update is saved to Firestore and synchronises to other users.

**Q9. What is the main limitation?**  
The prototype uses anonymous browser sign-in rather than verified college accounts, and its photo picker does not upload images. Firebase must also be configured by the project owner before shared listings work.

**Q10. How is this useful to the college?**  
It can make the lost-and-found process more organised and reduce the effort required to connect finders with owners.


## Shared database and WhatsApp contact

The updated build uses Firebase Anonymous Authentication and Cloud Firestore so listings submitted from one browser can appear on other devices. Follow `FIREBASE_SETUP.md` to create your own Firebase project, paste the web config into `firebase-config.js`, enable Anonymous sign-in, create Firestore, publish the security rules, and authorize your hosting domain.

The report form includes an optional WhatsApp number. A listing with a contact number shows a WhatsApp button and pre-filled message. Only provide a number with the owner's permission. The photo picker is still a local preview and does not upload photos.
