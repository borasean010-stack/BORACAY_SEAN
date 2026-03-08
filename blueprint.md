# Blueprint: Boracay Reservation Website

## Overview
This project is a reservation website for tours and activities in Boracay. It allows users to browse available activities, view details, and make reservations. The project also includes an admin panel for managing reservations.

## Project Structure
* `index.html`: The main landing page of the website.
* `style.css`: The main stylesheet for the website.
* `main.js`: The main JavaScript file for the website.
* `admin.html`: The admin panel for managing reservations (Naver Smart Store style).
* `admin.css`: Styles for the admin panel.
* `admin.js`: Logic for the admin panel.
* `login.html`: The user login page (Luxurious design).

## Current Plan: Admin & Login Redesign

### 1. Login Page Redesign (Luxurious & Centered)
* **Objective:** Transform the login page into a high-end, visually appealing entry point.
* **Design Strategy:**
    * Center the logo prominently.
    * Use a sophisticated color palette (gold/black or deep blue/white).
    * Apply premium visual effects (glassmorphism, soft deep shadows, elegant typography).
    * Remove distracting navigation elements during the login process.

### 2. Admin Site Redesign (Naver Smart Store Style)
* **Objective:** Reorganize the admin interface to match the Naver Smart Store Seller Center layout.
* **Structural Changes:**
    * Move navigation from the top to a left-side vertical sidebar.
    * Implement a dashboard-first view with key metrics (New Orders, Completed, etc.).
    * Use Naver's signature green (`#00c73c`) as the primary accent color.
    * Maintain existing functionality (Firebase integration, reservation management) while changing the UI.

### 3. Implementation Steps
1. **Update `login.html` and related styles** for the luxurious look.
2. **Restructure `admin.html`** to include a sidebar and main content area.
3. **Overhaul `admin.css`** to implement the sidebar layout and Smart Store aesthetics.
4. **Adjust `admin.js`** to ensure navigation logic works with the new sidebar structure.
