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

## Recently Implemented Changes (April 1, 2026)

### Admin UI & Consistency Updates
- **Luxury Mobile Admin View**: Implemented a responsive, high-end mobile interface for the admin panel.
    - **Bottom Navigation**: Added a glassmorphism-style fixed bottom nav for quick access to Home, Schedule, New Reservations, and Confirmed list.
    - **Dashboard Optimization**: Redesigned the main dashboard into a 2x2 grid for mobile, focusing on Today/Tomorrow schedules and reservation counts.
    - **Responsive Data Views**: Optimized schedule cards and reservation tables for small screens, hiding non-essential columns and improving touch targets.
- **Schedule Tab Visual Feedback**: Added an `active` state highlight (orange glow and translation) for "Today's Schedule" and "Tomorrow's Schedule" buttons in the admin panel.

- **Date Awareness Enhancement:** Integrated a dynamic date display heading (`timeline-header`) in the schedule timeline section to clearly show which date's schedule is being viewed (e.g., "2026-04-01 일정").
- **Resort Name Standardization:** Updated the `translateResort` function in `admin.js` and `resortMap` in `reservation-schedule.html` to ensure all resort names are consistently displayed in Korean (e.g., "헤난 가든", "헤난 팜비치", "크림슨") across the admin and voucher views.
- **Representative Name Priority:** Modified `registerBulkSchedule` and `makeQuickVoucher` logic to prioritize the English name of the representative for display in the schedule list, ensuring a cleaner and more professional appearance.
- **Quick Voucher Massage Shop Content:** Expanded the parsing logic in `makeQuickVoucher` to recognize more massage shops (e.g., 카바얀, 힐롯, 포세이돈, 마리스, 헬리오스) and added detailed guidance with Google Maps links for these shops in the `reservation-schedule.html` voucher view.

## Recently Implemented Changes (March 30, 2026)

### Admin System & Quick Voucher Updates
- **환전 정보(exchangeAmount) 추출 로직 개선:** 엑셀 데이터의 인덱스 유연성을 확보하고 필터링 조건을 완화하여 퀵 바우처 생성 시 환전 금액이 누락되지 않도록 수정했습니다. (parts[23~25] 확인 및 필터링 최적화)
- **Enhanced Pax Extraction Logic:** Improved the "Quick Voucher" generation feature in `admin.js` to accurately parse the number of people (pax) from the remarks section.
    - Added support for various patterns like `4+3`, `2명`, `2인`, `2pax`, `인원 2`, and `[Product Name] 2`.
    - Implemented a more robust cleaning process that excludes dates, times, and currency amounts from the pax search string to prevent incorrect summing of values.
    - Ensured that if a specific pax count is found in a remark line, it overrides the total reservation pax for that specific tour item only.

## Recently Implemented Changes (March 29, 2026)

### Product Detail Updates
Updated the "포함사항" (Included), "불포함 사항" (Excluded), "안내사항" (Information), and "유의사항" (Precautions) sections for the following products:
1.  **픽업샌딩 (Pick-up/Sending):** Updated `pickup-sending.html` and `catipickipsending.html` with detailed service procedures and updated inclusion/exclusion lists.
2.  **블랙펄 요트호핑투어 (Black Pearl Yacht Hopping Tour):** Updated `hopping-tour.html` with detailed yacht amenities, snacks, and updated tips/meal options.
3.  **시크릿가든 말룸파티 (Secret Garden Malumpati):** Updated `malumpati.html` with comprehensive meal details and updated local payment options (tubing, doctor fish).
4.  **스쿠버 다이빙 (Scuba Diving):** Updated `scuba-diving.html` with equipment rental and pick-up/drop-off details.
5.  **제트스키 & 페러세일링 (Jet Ski & Parasailing):** Updated `jetski.html` and `parasailing.html` with updated inclusion lists (photo/video service, pick-up).
6.  **헬멧다이빙 (Helmet Diving):** Updated `helmet-diving.html` with equipment and pick-up meeting point details.
7.  **프리다이빙 체험 (Freediving):**
    - Updated `freediving.html` with detailed inclusion list (equipment, photos, meals, certification).
    - **Price Update:** Changed from 70,000 KRW to 112,500 KRW across `freediving.html`, `main.js`, and `functions/index.js`.

### System-wide Consistency
- Synchronized product prices in `functions/index.js` to ensure the AI counselor provides up-to-date information.
- Verified that all dynamic rendering in `activities.html` and `essential-tours.html` reflects the new pricing and data.

## Current State & Next Steps
- The platform is fully functional with updated product information and pricing.
- UI/UX enhancements for the mobile booking drawer were recently applied.
- Future tasks may include integrating a real payment gateway and expanding the resort quote functionality.
