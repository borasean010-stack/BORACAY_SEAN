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
* **Mobile Visibility:** Wrapped logo text in `.logo-text` span and updated CSS to ensure visibility and 900 weight on mobile.

### 2. Main Popup Slider Fix
* **Issue:** Only the first banner was visible in some environments.
* **Fix:** Corrected the popup slider transition and flex layout in `style.css` and refined the sliding logic in `main.js`.
* **Features:**
    * Automatic sliding every 4 seconds.
    * Interactive navigation dots for manual sliding.
    * Pause-on-hover functionality to allow users to read the content.

### 3. Activity & Spa Reservation Options
* **Time Selection:** Added specialized time selection tabs for activities and spas to ensure accurate scheduling.
    * Activities (Parasailing, Helmet Diving, Jet Ski, Introductory Diving, Fairway Golf Club): 09:00, 10:00, 11:00, 13:00, 14:00.
    * Spas (Luna, Bora, S-SPA, Helios, Ayurveda): 12:30, 14:30, 16:30, 19:30.
* **Massage Type Selection:** Added product type selection for spa services to allow users to choose specific programs.
    * Luna Spa: Placenta, Stone, Noni Seed Oil, Tiger Oil massages.
    * Bora Spa: Honey, Placenta massages.
    *   S-SPA (에스파): Pure Oil, Placenta, Stone, Hilot, Four-hand massages.
        *   Helios Spa: Honey Stone, Coco Spa, Honey Stone + Coco Spa.
        *   Ayurveda Spa: Placenta, Stone, Golden Ring, Ayurveda Spa.
        *   Poseidon Spa (포세이돈 스파): VIP, VVIP massages.

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

    ### 4. Massage Option UI Fix (Text Truncation)
    * **Issue:** Long massage names (e.g., "성장 마사지 (2시간)", "포핸드 마사지") were being truncated with "..." in the selection area.
    * **Fix:** Updated the `initSelectors` logic in `spa.html`, `aspa.html`, `boraspa.html`, `helios.html`, and `poseidon.html` to remove fixed-width constraints and text-overflow hidden.
    * **Changes:**
        * Removed `white-space: nowrap`, `overflow: hidden`, and `text-overflow: ellipsis`.
        * Added `word-break: keep-all` and `line-height: 1.2` to allow multi-line text wrapping for long names.
        * Adjusted font size slightly (to 11px) to better accommodate content in the 2-column grid layout.
        * Ensured height flexibility so that the selection card expands vertically if text wraps.

    ### 5. Poseidon Spa Update
    * **Massage Types:** Updated from "포세이돈 스파" to specific options: **VIP (105,000원)** and **VVIP (119,000원)**.

    ### 6. Black Pearl Yacht Hopping Tour (블랙펄 요트호핑투어) Update
    * **Child Pricing Deletion:** Removed child pricing and related selection UI. The tour now only accepts adult reservations.
    * **Massage Time Selection Deletion:** Removed the massage time selection section as it was no longer required for this specific tour.
    * **Price Label Update:** Changed the price label from "가격" or "인원 선택" to "요금" to match the requested terminology.
    * **Dynamic Pricing:** Ensured the total price updates dynamically based on the adult count, displayed as the "Total Price" (총 합계 금액).

    ### 7. Time Selection UI Grid Update (All Pages)
    * **3-Column Layout:** Standardized the time selection (이용 가능 시간 선택 / 티오프 시간 선택) UI to use a 3-column grid layout across all activity and spa pages.
    * **Implementation:** Updated the `.selection-tabs` class in `style.css` to `grid-template-columns: repeat(3, 1fr)`.
    * **HTML Fixes:** Corrected broken HTML structures in several files where the `selection-tabs` container was closed prematurely.
    * **Affected Files:** `aspa.html`, `boraspa.html`, `golf.html`, `helios.html`, `helmet-diving.html`, `jetski.html`, `kabayan.html`, `luna.html`, `maris.html`, `parasailing.html`, `poseidon.html`, `scuba-diving.html`, `spa.html`.

    ### 8. Reservation Box & Option Sheet Optimization
    * **Objective:** Simplify the booking UI by removing redundant information and standardizing layouts.
    * **UI Simplification:**
        * **Removed "Total Reservation Count" (총 예약 인원):** Deleted this summary from all spa and activity pages to reduce vertical clutter.
        * **Mobile Price Display:** Hidden the separate "Total Summary" (총 합계 금액) on mobile views, as the total price is already dynamically displayed on the "Buy Now" button.
        * **Massage Type Layout:** Standardized the massage program selection list to a **2-column grid** layout on both **PC and Mobile** for all spa pages (`aspa.html`, `boraspa.html`, etc.).
    * **Styling Alignment:** Updated `pickup-sending.html` to match the refined design of the hopping tour page for consistent branding.
    * **Benefits:** A much cleaner, more compact booking interface that fits better on mobile screens and provides a faster path to purchase.

    ### 9. Link Optimization (Mobile & PC Friendly)
    * **Objective:** Update Naver Cafe links to provide the best experience based on the platform.
    * **Main Page "Notice" Section (PC Friendly):**
        * **Announcements (공지사항):** Updated to `https://cafe.naver.com/f-e/cafes/17953658/menus/21`.
        * **Reviews (내돈내산):** Updated to `https://cafe.naver.com/f-e/cafes/17953658/menus/141`.
        * **FAQ (자주묻는 질문):** Updated to `https://cafe.naver.com/f-e/cafes/17953658/menus/165`.
    * **General Site Optimization:**
        * **Mobile-Specific Links:** Some links are optimized for mobile using `m.cafe.naver.com` where direct redirection is preferred.
        * **General Cafe Link:** Updated across all footers and buttons to `https://m.cafe.naver.com/jesupblue.cafe?`.

    ### 10. Product & Label Updates (March 2026)
    * **Thumbnail Information Update:**
        * **Black Pearl Yacht Hopping:** Updated description to: "럭셔리 요트위에서 즐기는 보라카이 선셋과 신나는 음악과 파티가 함께하는 1등 선상 파티 호핑".
        * **Secret Garden Malumpati:** Updated description to: "우리끼리 프라이빗하게 즐기고 신비로운 블루라군과 튜빙".
        * **Bora-Ajae Hopping:** Updated description to: "카라바오 섬에서 즐기는 호핑투어".
    * **Badge Removal:** Removed the "HOT" badge from the Bora-Ajae Hopping Tour in `main.js`.
    * **Pickup & Sending Label Update:**
        * **Child Category Deletion:** Removed the "Child" (소인) selection row from `pickup-sending.html`.
        * **Unified Age Range:** Updated the person selection label to "예약 인원 (36개월~성인)" to reflect unified pricing for that range.
    * **Secret Garden Malumpati Age Ranges:**
        * Updated Adult label to "성인 인원 (중1학년~성인)".
        * Updated Child label to "소인 인원 (36개월~초6학년)".
    * **Ayurveda Spa Style:** Unified the "Total Summary" design to match other pages.
    * **S-SPA Navigation Fix:** Fixed the active menu tab when viewing the S-SPA detail page.
    * **Booking Form Optimization:** Permanently hidden the "Other Requests" (기타 요청사항) field for all products except resort quotes. The field is now hidden by default in the HTML and only revealed via JavaScript when a resort quote is detected, preventing any UI flicker during page load.
    * **My Page Consistency:** Verified that the "My Requests" section in `mypage.html` remains hidden for activity bookings as the underlying data field is no longer populated for non-resort products.
    *   **JL Snap Photo Price Update:**
    *   **New Pricing (2 Persons):** Type A - 750,000 KRW, Type B - 450,000 KRW, Type C - 300,000 KRW.
    *   **UI Update:** Added a Type selection tab in `jl-snap.html` to allow users to choose between sessions. Updated `main.js` to reflect the starting price of 300,000 KRW.
    * **Hero Video Update:**
    * **Replacement:** Replaced the main hero video `hero-video.mp4` with `mainhereo (1).mov`.
    * **Implementation:** Updated `index.html` with the new source and set the type to `video/quicktime`.


## Previous Milestone: Admin & Login Redesign

### 1. Login Page Redesign (HanaTour Seller Style)
* **Objective:** Redesign the login pages to match the clean, professional aesthetic of modern seller portals (e.g., HanaTour Seller).
* **Scope:** Applied to both the **General User Login (`login.html`)** and the **Admin Mode Login (`admin.html`)**.
* **Design Strategy:** 
    * **Clean Layout:** Switched from a dark glassmorphism style to a bright, clean white centered box on a light gray background (`#f8f9fa`).
    * **Branding:** Centered the Boracay Sean logo and brand name with a welcoming message.
    * **Color Palette:** Used orange (`#ff6a00`) as the primary accent color for buttons and interactive elements.
    * **Consistency:** Both the client-facing login and the internal seller center login now share the same professional visual language.
    * **Responsive:** Fully optimized for mobile and desktop views with a maximum width of 420px - 480px for the login cards.

### 2. Admin Site Redesign (Naver Smart Store Style)
* **Objective:** Reorganize the admin interface to match the Naver Smart Store Seller Center layout.
* **Structural Changes:** Left-side vertical sidebar, green accent color (`#00c73c`), and a dashboard-first view.
