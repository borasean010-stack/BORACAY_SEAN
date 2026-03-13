# Blueprint: Boracay Reservation Website

## Overview
This project is a reservation website for tours and activities in Boracay (BORACAY SEAN). It allows users to browse available activities, view details, and make reservations. The project also includes an admin panel for managing reservations.

## Project Structure
* `index.html`: The main landing page of the website.
* `style.css`: The main stylesheet for the website.
* `main.js`: The main JavaScript file for the website.
* `admin.html`: The admin panel for managing reservations (Naver Smart Store style).
* `admin.css`: Styles for the admin panel.
* `admin.js`: Logic for the admin panel.
* `login.html`: The user login page (Luxurious design).
* `golf.html`: Detail page for Fairway Golf Club activity.
* `resort-quote.html`: Page for requesting resort accommodation quotes.
* `shangrila-resort.html`: Detailed introduction page for Shangri-La Boracay Resort.

## Features & UI Enhancements

### 1. Logo & Branding Update
* **Company Name:** Updated from "BORACAY_SEAN" to "BORACAY SEAN" across all platforms.
* **Navigation Bar Logo:** Added "BORACAY SEAN" text next to the logo image in the PC fixed navigation bar.
* **Consistent Styling:** Standardized title tags, side menu logos, and other branding elements to use the new name.
* **Responsive Design:** Optimized logo text size and spacing for both PC (26px) and mobile (16px) views using CSS gap for better alignment.

### 2. Activity & Spa Reservation Options
* **Time Selection:** Added specialized time selection tabs for activities and spas to ensure accurate scheduling.
    * Activities (Parasailing, Helmet Diving, Jet Ski, Introductory Diving, Fairway Golf Club): 09:00, 10:00, 11:00, 13:00, 14:00.
    * Spas (Luna, Bora, S-SPA, Helios, Ayurveda): 12:30, 14:30, 16:30, 19:30.
* **Massage Type Selection:** Added product type selection for spa services to allow users to choose specific programs.
    * Luna Spa: Placenta, Stone, Noni Seed Oil, Tiger Oil massages.
    * Bora Spa: Honey, Placenta massages.
    * S-SPA (에스파): Pure Oil, Placenta, Stone, Hilot, Four-hand massages.
    * Helios Spa: Honey Stone, Coco Spa, Honey Stone + Coco Spa.
    * Ayurveda Spa: Placenta, Stone, Golden Ring, Ayurveda Spa.

### 2. UI/UX Improvements
* **Sophisticated Counter Design:** Redesigned the quantity selection buttons (+/-) with a modern, clean aesthetic using better spacing, subtle shadows, and responsive feedback.
* **Selection Tabs:** Implemented a reusable "Selection Tab" UI component across all detail pages for a consistent and intuitive user experience.
* **Booking Integration:** Updated the purchase and cart logic to capture the selected time and product type, ensuring all reservation data is passed to the booking form.

### 3. Menu Structure Update
* **Navigation Bar:** Added "리조트 견적" (Resort Quote) menu item between "한눈에 요금표" and "장바구니" for easier access to resort pricing. Points to `resort-quote.html`.
* **Side Menu:** Updated the mobile side menu to include "리조트 견적" for consistency across all platforms.

## Current Milestone: Product Management & Navigation

### 1. New Activity & Updates: Fairway Golf Club (페어웨이 골프클럽)
* **Objective:** Add a new golf activity and keep it updated.
* **Implementation:** Created `golf.html` and registered it in `main.js`. 
* **Updates:** 
    * Updated thumbnail to `golf1.jpg`.
    * Updated `golf.html` gallery to use `golf1.jpg` through `golf4.jpg`.

### 2. Product Deletion: Sunset Sailing (선셋 세일링) & Beach Island Tour (비치 아일랜드 투어)
* **Objective:** Remove outdated products from the activity list.
* **Implementation:** Removed entries for "Sunset Sailing" and "Beach Island Tour" from `main.js`.

### 3. Resort Quote System (리조트 견적)
* **Objective:** Implement a specialized form for users to request resort accommodation quotes.
* **Features:** 
    * Check-in/Check-out date selection.
    * Guest count selection (Adults/Children).
    * Dynamic "Child Age" input fields that appear when children are added.
    * Premium vertical scrolling card UI for resort selection with large icons.
    * **Resort Detail Pages:** Added dedicated introduction pages for resorts (e.g., Shangri-La) providing comprehensive info on facilities and room types.
    * Quote request submission logic: Bypasses the payment method selection in `booking-form.html` for a direct request.

## Previous Milestone: Admin & Login Redesign

### 1. Login Page Redesign (Luxurious & Centered)
* **Objective:** Transform the login page into a high-end, visually appealing entry point.
* **Design Strategy:** Prominent centered logo, glassmorphism effects, and elegant typography.

### 2. Admin Site Redesign (Naver Smart Store Style)
* **Objective:** Reorganize the admin interface to match the Naver Smart Store Seller Center layout.
* **Structural Changes:** Left-side vertical sidebar, green accent color (`#00c73c`), and a dashboard-first view.
