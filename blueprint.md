# Project Blueprint: BORACAY SEAN

## Overview
BORACAY SEAN is a comprehensive travel service website for Boracay, Philippines. It offers various tours, activities, and massage services with a focus on providing a seamless and premium experience for Korean travelers. The platform includes features such as real-time chat with an AI counselor, a shopping cart, and detailed product pages with integrated booking and payment flows (simulated/integrated with external forms).

## Project Structure & Implementation Details

### Core Technology Stack
- **Frontend:** Vanilla HTML5, CSS3 (Modern features: Grid, Flexbox, Container Queries, Cascade Layers, :has selector), and Modern JavaScript (ES Modules, Async/Await, Fetch API).
- **Backend/Integration:** Firebase (Firestore for data, Cloud Functions for AI logic, Firebase Hosting).
- **Libraries:** Three.js (for 3D graphics if requested), Google Generative AI (Gemini) for the AI counselor.

### Key Components & Features
- **Responsive Design:** Mobile-first approach with sticky navigation, side menus, and optimized booking drawers for small screens.
- **Dynamic Product Rendering:** Products are managed in `main.js` and rendered dynamically on the homepage, activities, and essential tours pages.
- **Booking Flow:** Each product page has a specialized booking box with:
    - Custom calendar for date selection (with logic for valid dates, e.g., odd/even days, start/end date constraints).
    - Person/Option counters with real-time price calculation.
    - Integration with a shopping cart (localStorage) and direct buy (sessionStorage) functionality.
- **AI Counselor:** A specialized AI agent ('Sean') provides travel advice and product recommendations using Firebase Cloud Functions and Gemini.
- **Pricing Management:** Prices are centralized in `main.js` and mirrored in individual HTML files and backend logic for consistency.

## Recently Implemented Changes (June 16, 2026)

### System-wide SEO & Menu Porting
Ported optimized metadata and standardized the site navigation to ensure consistency and improve SEO.
- **Metadata Synchronization**: Ported optimized `<title>`, `<meta name="description">`, and Open Graph tags from the June 15 version to the current base.
- **Menu Standardization**: Standardized the top and side navigation menus across all major pages to use extensionless URLs (matching Firebase Hosting `cleanUrls` config).
- **Package Page Integration**: Ensured "보라카이 패키지" (Boracay Package) is consistently included in the main navigation.

### Bohol Sean Expansion (Ongoing)
Started the implementation of the Bohol branch management system.
- **Dedicated Admin Panel**: Created `bohol-admin.html` and `bohol-admin.js` for managing Bohol-specific schedules.
- **Voucher System**: Implemented `bohol-voucher.html` for digital voucher generation for Bohol services.

## Recently Implemented Changes (June 9, 2026)

### Boracay Package Optimization
- **Page Renaming**: Standardized the package detail page as `boracay-package.html`.
- **UI Bug Fixes**: Resolved an issue where the mobile booking drawer would auto-open on page load.
- **Bottom Bar Styling**: Corrected the "Buy Now" bottom bar on the package page to align with the site's high-end aesthetic.

## Recently Implemented Changes (June 8, 2026)

### Price List Page Update
Updated the 'Price List' page (`price-list.html`) to reflect the new pricing structure.
- **Image Replacement**: Removed the old multiple images and replaced them with a single, comprehensive price list image: `price list.jpg`.

## Current State & Next Steps
- **Standardizing Site Navigation**: Complete the update of the menu structure across ALL 40+ HTML files to include the "보라카이 패키지" link and use extensionless URLs.
- **SEO Validation**: Perform a final sweep to ensure all public pages have the correct canonical URLs and metadata.
- **Bohol Expansion**: Finalize the Bohol admin system and integrate it with the main platform if required.
- **Price Synchronization**: Ensure all prices in `main.js`, individual HTML files, and backend logic are fully synchronized.

