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

## Features & UI Enhancements

### 1. Activity & Spa Reservation Options
* **Time Selection:** Added specialized time selection tabs for activities and spas to ensure accurate scheduling.
    * Activities (Parasailing, Helmet Diving, Jet Ski, Introductory Diving): 09:00, 10:00, 11:00, 13:00, 14:00.
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

## Previous Milestone: Admin & Login Redesign

### 1. Login Page Redesign (Luxurious & Centered)
* **Objective:** Transform the login page into a high-end, visually appealing entry point.
* **Design Strategy:** Prominent centered logo, glassmorphism effects, and elegant typography.

### 2. Admin Site Redesign (Naver Smart Store Style)
* **Objective:** Reorganize the admin interface to match the Naver Smart Store Seller Center layout.
* **Structural Changes:** Left-side vertical sidebar, green accent color (`#00c73c`), and a dashboard-first view.
