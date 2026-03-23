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
    * **Caticlan Pickup-Sending Name Update:** Changed "카티클란 공항 왕복 픽업샌딩" to "카티클란 왕복 픽업샌딩" in `main.js` for consistency.
    * **Naver Cafe Link Optimization (Mobile):** Updated the main page's "알려드립니다 !!" section with mobile-optimized URLs for Announcements, Reviews, and FAQ (`https://m.cafe.naver.com/ca-fe/web/cafes/17953658/menus/...`).
    * **Calendar Rendering Fix:** Fixed a bug in `catipickipsending.html` where the calendar was missing due to an undefined `currentDate` variable. Initialized the date selection logic to match other product pages.
    * **Date Validation Logic:** Implemented strict date validation for pickup-sending and resort products. 
        * **Pickup-Sending:** Users cannot select a sending date earlier than the pickup date. Selecting a pickup date after the current sending date automatically updates the sending date. Dates before the pickup date are visually disabled in sending mode.
        * **Resort Quote:** The checkout date cannot be set earlier than the check-in date. Changing the check-in date automatically updates the checkout date if it becomes invalid.
    * **Currency Exchange Request:** Added a "Currency Exchange Request Amount" (환전 요청 금액) field to the pickup/sending details section in `booking-form.html`. This field is specifically for **Dollar ➔ Peso** exchange. Information is collected during booking and displayed in the admin panel (`admin.js`).
    * **Mobile Layout Optimization (Pickup-Sending):** Refined the mobile booking drawer for pickup-sending products by optimizing font sizes, calendar spacing, and padding to ensure a better fit on small screens.
    * **Mobile Product List Information:** Enabled truncated 1-line product descriptions on mobile views to provide essential info under product titles while maintaining a clean 2-column grid layout.
    * **Pickup-Sending Calendar Refinement:** Updated the calendar to initialize with "Not Selected" status, forcing the user to explicitly choose the pickup date as the first action. Validated that both dates must be selected before proceeding to purchase.
    * **Thumbnail Information Update:**
        * **Black Pearl Yacht Hopping:** Updated description to: "럭셔리 요트위에서 즐기는 보라카이 선셋과 신나는 음악과 파티가 함께하는 1등 선상 파티 호핑".
        * **Secret Garden Malumpati:** Updated description to: "우리끼리 프라이빗하게 즐기고 신비로운 블루라군과 튜빙".
        * **Bora-Ajae Hopping:** Updated description to: "카라바오 섬에서 즐기는 호핑투어".
    * **Badge Removal:** 
        * Removed the "HOT" badge from the Bora-Ajae Hopping Tour in `main.js`.
        * Removed the "HOT" badge from "Experience Diving" (체험 다이빙) and "S-SPA" (에스파) in `main.js`.
    * **Pickup & Sending Label Update:**
        * **Child Category Deletion:** Removed the "Child" (소인) selection row from `pickup-sending.html`.
        * **Unified Age Range:** Updated the person selection label to "예약 인원 (36개월~성인)" to reflect unified pricing for that range.
        * **Private Transfer Option:** Added a "Private Transfer" (단독 차량 이용) option for $40 per team. This is a one-time fixed fee paid locally (not included in the online total price). The selection is captured during booking for coordination.
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
    * **Hero Video Optimization (March 2026):**
        * **Objective:** Ensure the hero video appears as quickly as possible and eliminate the "black screen" and any thumbnail delay.
        * **Preloading:** Added `<link rel="preload" href="hero-video.mp4" as="video" type="video/mp4">` to the HTML head to prioritize video download.
        * **Immediate Appearance:** Removed visual fallbacks (thumbnail images) and transition delays to allow the video to be visible as soon as the first frame is ready.
        * **Speed Optimization:** Configured the video tag with `autoplay`, `muted`, `loop`, `playsinline`, and `preload="auto"` for maximum performance.
        * **Playback Start Time (March 2026):** Set the hero video to start from the 4-second mark to bypass the initial static/low-quality portion. Implemented using both HTML `#t=4` fragment and JavaScript `currentTime` control for cross-browser consistency. The video also loops back to the 4-second mark.
    * **Massage Description Update (March 2026):**
        * **Bora Spa:** "보라카이 꿀 마사지 원조"
        * **Poseidon Spa:** "연예인이 운영하는 스파 모든 룸 안 개별 수영장 + 자쿠지"
        * **S-SPA (에스파):** "보라카이 최초 포핸드 마사지 런칭"
        * **Kabayan Spa:** "디몰 버젯마트 근처 마사지샵"
        * **Ayurveda Spa:** "분위기에 취하고 마사지에 반하는 마사지샵"
        * **Maris Spa:** "로멘틱 마리스 스파,허니문이나 커플 연인들에게 인기만점"
        * **Luna Spa:** "보라카이 최초 노니씨드 마사지 런칭"
        * **Helios Spa:** "유럽풍 고급 분위기 스파"

    ### 11. Event Banner Layout Update
    * **Objective:** Change the event banner from a single-item slider back to a 2-column layout to show both banners simultaneously.
    * **Implementation:** 
        * Updated `.banner-wrapper` in `style.css` to use `display: grid` with `grid-template-columns: repeat(2, 1fr)` on PC.
        * Configured banners to stack vertically on mobile for better readability.
        * Removed slider navigation arrows and dots from `index.html` as they are no longer required for the static grid layout.
        * Removed redundant flex-basis settings that were hiding the second banner.

    ### 12. Dynamic Reservation Date Initialization
    * **Objective:** Ensure the reservation date input defaults to the current date (today) every time a detail page is loaded.
    * **Implementation:** 
        * Updated the script in all activity and spa detail pages to initialize `selectedDate` using the current local date (`new Date()`).
        * Formatted the initial date as `YYYY-MM-DD`.
        * Added logic in `window.onload` to automatically update the visible date display element (`#pc-date-display`) with the current date.
        * Affected all detail pages including `aspa.html`, `golf.html`, `spa.html`, `pickup-sending.html`, etc.

    ### 14. Mobile Booking Drawer UX Optimization
    * **Objective:** Ensure the "Add to Cart" and "Buy Now" buttons are always accessible at the bottom of the screen when using the mobile booking drawer.
    * **Implementation:**
        * **Restructured HTML:** Divided the `.reservation-box` into three parts: `drawer-header`, `drawer-scroll-area`, and `drawer-footer`.
        * **Fixed Footer:** Moved the purchase buttons into the `drawer-footer`, ensuring they stay fixed at the bottom of the viewport even while scrolling.
        * **Scrollable Area:** Wrapped all selection options (calendar, time slots, person count) in the `drawer-scroll-area` to allow users to navigate through all options independently of the buttons.
        * **Native-like UI:** Added a `drawer-handle` and header title ("예약 옵션 선택") to the drawer for a more professional, app-like feel.
        * **Affected Pages:** All 21 product detail pages (Spas, Activities, Pickup-Sending).

    ### 15. Massage Type Persistence in Cart
    * **Objective:** Ensure specific massage types (e.g., Placenta, Stone) are explicitly captured and displayed in the cart and booking summary.
    * **Implementation:**
        * Updated all spa detail pages (`aspa.html`, `boraspa.html`, `helios.html`, `kabayan.html`, `luna.html`, `maris.html`, `poseidon.html`, `spa.html`) to include the specific massage name in the `details` field of the item object.
        * Refined `cart.html` rendering logic to prominently display "종류: [Massage Type]" for spa/massage items.
        * Verified that `booking-form.html` displays these details in the order summary for user confirmation.
        * This ensures clear communication of the selected service throughout the booking flow.

    ### 16. SEO & Favicon Optimization (March 2026)
    * **Objective:** Ensure the brand logo (mark) and correct site information appear in Google search results and social media thumbnails.
    * **Issue:** The previous favicon (`logo.png`) was not square (400x343), which caused Google to not display the site icon in search results.
    * **Fixes:**
        * **Favicon Update:** Standardized on `og-image.png` (1080x1080 square) for `link rel="icon"` and `apple-touch-icon`.
        * **Open Graph (OG) Tags:** Updated `og:image` to use the square `og-image.png` for better visibility in mobile search results and SNS sharing.
        * **Twitter Cards:** Added `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image` tags for optimized sharing on X (Twitter).
        * **Structured Data:** Enhanced the `Organization` JSON-LD in `index.html` to include the site name and official social links (Naver Cafe).
        * **Favicon File:** Created `favicon.png` in the root directory for better crawler recognition.
    * **Affected Files:** `index.html`, `activities.html`, `massage.html`, `essential-tours.html`, `price-list.html`, `resort-quote.html`.
    * **Action Required:** Request a re-crawl in Google Search Console to speed up the update in search results.

    ### 17. UI Scaling & Booking Flow Enhancement
    * **Objective:** Improve visual density on desktop and collect more accurate activity/massage pickup info.
    * **Implementation:**
        * **UI Scaling:** Reduced font sizes, padding, and margins by ~10% for desktop screens to match a "90% zoom" look. Added `max-width: 1200px` constraints.
        * **Activity Pickup Field:** Added a conditional "Pickup Resort" field in `booking-form.html` for specific activities and spa services.
        * **Admin/Mypage Sync:** Updated `admin.js` and `mypage.html` to display the newly collected activity pickup information.

    ### 18. Booking Completion UX Improvement (March 2026)
    * **Objective:** Streamline the post-booking process and reduce confirmation delays caused by missing communication.
    * **Implementation:**
        * **Account Copy Feature:** Added a "Copy" button next to the bank account number in `booking-complete.html` with a toast notification feedback.
        * **Strengthened Confirmation Guidance:** Replaced generic guidance with a clear, bold message stating that depositing is not enough—customers **must** send their Korean name to the Boracay Sean Kakao channel for final confirmation.
        * **Visual Hierarchy:** Used bolding and color highlighting to emphasize the "Final Confirmation" (최종 확정) and the penalty of not contacting (missed confirmation).

    ### 19. Admin Automated Guidance Generation (March 2026)
    * **Objective:** Enable admins to generate and copy reservation confirmation messages with a single click.
    * **Implementation:**
        * **One-Click Copy:** Added a "👉 예약 안내문 복사" button in the admin reservation detail modal.
        * **Template Logic:** Implemented dynamic templates for all major product categories (Hopping, Malumpati, Massage, Pickup-Sending, VIP Lounge, Golf, etc.).
        * **Smart Logic:** 
            * **Hopping:** Automatically selects meeting location based on Dry/Rainy season (White Beach vs. Bulabog).
            * **Massage:** Distinguishes between shuttle-supported shops (Resort Pickup) and others (Individual Movement).
            * **Malumpati:** Handles both Day tour and Sending tour (includes airport tax info) variations.
            * **Validation:** Injects customer name, headcount, dates, flights, and resorts directly into the message.
        * **User Feedback:** Shows an alert once the text is successfully copied to the clipboard.

    ### 20. Event Banner Update & Fix (March 2026)
    * **Objective:** Add a new event banner to the main page slider and fix broken image issues.
    * **Implementation:** 
        * Added `event.png` as a slide in the `.banner-wrapper` section of `index.html`. 
        * **Fix:** Addressed the "broken image" (X-box) issue by updating the version query string (`?v=20260322_v2`) for `event.png` and adding versioning to `main-popup1.png` and `main-popup2.png` to force browser cache refresh.
    * **Results:** Ensures users see the latest banner and popup designs without caching conflicts.

    ### 21. Admin Individual Reservation Management (March 2026)
    * **Objective:** Allow administrators to delete or cancel specific reservations individually, in addition to the bulk "Delete All" feature.
    * **Implementation:**
        * **Access Control:** The "취소/삭제" (Cancel/Delete) button is only visible to the user with the ID **'luca'**, ensuring high-level security for destructive actions.
        * **UI:** Added a red-bordered "취소/삭제" button to each row in the reservation table across all management tabs (New, Confirmed, Resorts).
        * **Functionality:** Integrated Firestore `deleteDoc` logic to remove specific reservation records permanently upon confirmation.
        * **Styling:** Added `.btn-action-danger` to `admin.css` for a consistent and warning-oriented button design.

    ### 22. Tour-Specific Voucher Generation (March 2026)
    * **Objective:** Allow administrators to generate separate schedules/vouchers for each tour item in a multi-product reservation (cart purchase).
    * **Implementation:**
        * **Parameter Support:** Updated `reservation-schedule.html` to accept an `itemIndex` parameter via URL.
        * **Dynamic Filtering:** If `itemIndex` is provided, the voucher only displays the specific tour at that index from the reservation data.
        * **Admin UI:** Added "바우처 보기" (View Voucher) and "링크 복사" (Copy Link) buttons for each item within the reservation detail modal in `admin.js`.
        * **Firebase Integration:** `reservation-schedule.html` now fetches real-time data directly from Firestore for accuracy.
    * **Benefits:** Provides a more professional and organized way to share tour details with customers who book multiple items simultaneously.

    ### 23. Admin Reservation Editing & Pickup Detail Fix (March 2026)
    * **Objective:** Allow administrators to modify reservation details and ensure all pickup/sending information is correctly displayed.
    * **Implementation:**
        * **Edit Mode:** Added a "수정하기" (Edit) button to the admin detail modal. Administrators can now modify customer names, contact info, flight details, pickup dates, total prices, and requests directly within the dashboard.
        * **Save Logic:** Implemented `handleSaveEdit` using Firestore `updateDoc` to persist changes.
        * **Pickup Detail Visibility:** Fixed an issue where airport pickup/sending dates and flight numbers were missing from the admin details and vouchers.
        * **Voucher Enhancement:** `reservation-schedule.html` now displays a dedicated card for "Airport Pickup-Sending" details if that information is present in the reservation, regardless of its position in the items array.
    * **Benefits:** Provides administrators with full control over reservation data, allowing for quick adjustments based on customer requests.

    ### 24. Admin Panel Cleanup & Data Reorganization (March 2026)
    * **Objective:** Restore the clean look of the main reservation tabs and move the delete functionality to a dedicated "System Setup" view.
    * **Implementation:**
        * **Tab Reversion:** Reverted the action column in "New", "Confirmed", and "Resort" tabs to only show "입금확인" (Received) and "상세" (Detail) buttons.
        * **System Setup Enhancement:** The "System Setup" tab now displays a full list of all reservations with a red "취소/삭제" (Cancel/Delete) button for each row, allowing for selective data management without cluttering the daily workflow.
        * **Pickup/Sending Fix:** Ensured that airport pickup and sending flight/date details are prominently displayed in both the admin detail modal and the tour-specific vouchers.
        * **Editing Capability:** Administrators can now edit all critical reservation fields (names, dates, flights, totals) directly from the detail modal to handle customer change requests efficiently.

    ### 25. Unified Itinerary & Admin Edit Sync (March 2026)
    * **Objective:** Provide a professional, consolidated itinerary for cart purchases and ensure it reflects real-time admin edits.
    * **Implementation:**
        * **Consolidated Voucher:** Added a "Copy Total Schedule Link" button in the admin modal. This link shows all tours and pickup/sending details in a single, sorted view.
        * **Smart Sorting:** The itinerary now automatically groups and sorts all items (including airport transfers) by date and time, creating a logical flow for the traveler.
        * **Admin-Voucher Sync:** Since the voucher fetches data directly from Firestore using the reservation ID, any edits made by the administrator (names, dates, flights) are instantly reflected when the customer clicks their voucher link.
        * **Pickup Detail Logic:** Specifically handled airport pickup/sending details so they appear as independent entries in the timeline, even if they aren't explicitly listed in the items array.
    * **Benefits:** Eliminates the need for multiple separate links and ensures the customer always sees the most up-to-date schedule managed by the admin.

    ### 26. Restricted Admin Editing Access (March 2026)
    * **Objective:** Enhance security by limiting who can modify reservation data within the admin panel.
    * **Implementation:**
        * **Permission Logic:** Updated the `showDetail` function in `admin.js` to check the logged-in administrator's ID.
        * **Access Control:** The "수정하기" (Edit) button is now exclusively visible to users with IDs **'luca'** or **'admin'**. Other administrators can view details but cannot initiate changes.
        * **Context:** This ensures that critical data updates are handled only by authorized high-level managers while maintaining standard visibility for other staff members.

    ### 27. UI Label Standardization (March 2026)
    * **Objective:** Clarify the purpose of pickup location fields for better user understanding.
    * **Implementation:**
        * **Label Update:** Changed "🏨 투어/스파 픽업 리조트" to "픽업샌딩 / 마사지 픽업 리조트" in `mypage.html` and `booking-form.html`.
        * **Consistency:** Applied the same terminology across both the booking entry form and the customer's personal reservation history page to ensure a seamless experience.

    ### 25. Unified Itinerary Voucher & Admin Permission Fix (March 2026)
    * **Objective:** Streamline voucher sharing for cart purchases and ensure admin editing permissions work correctly.
    * **Implementation:**
        * **Consolidated Voucher:** Added a "Copy Total Schedule Link" button in the admin detail modal. This generates a unified URL showing all items (tours, pickups, etc.) in a single, chronologically sorted list.
        * **Dynamic Layout:** Updated `reservation-schedule.html` to automatically detect and display airport pickup/sending information as distinct, sorted entries in the timeline.
        * **Permission Fix:** Resolved a bug where the "수정하기" (Edit) button was hidden due to an undefined variable. It is now correctly restricted to **'luca'** and **'admin'** IDs.
        * **Real-time Sync:** Vouchers now fetch the latest data from Firestore, ensuring any administrative edits are instantly visible to the customer.
    * **Benefits:** Simplifies communication by providing one professional link for multiple bookings and maintains high data security.

    ### 26. Admin Edit UI Fix & Real-time Info Sync (March 2026)
    * **Objective:** Fix the disappearing "Save" button in admin mode and ensure pickup/sending details are visible across all user touchpoints.
    * **Implementation:**
        * **UI Structural Change:** Reorganized the admin detail modal in `admin.js` to place action buttons (Edit, Close) outside the scrollable content area. This prevents them from being overwritten or hidden during the transition to "Save" mode.
        * **My Page Enhancement:** Updated `mypage.html` to fetch real-time data from Firestore. It now prominently displays "Airport Pickup/Sending" details (dates, flights, resorts) at the top of the booking card.
        * **Data Visibility:** Ensured that airport transfer information is correctly mapped from the database to the "My Page" view, making it visible to customers even if it was edited by an admin.
    * **Benefits:** Provides a more reliable administrative editing experience and keeps customers fully informed of their finalized logistics.

    ### 26. Chronological Itinerary Voucher (March 2026)
    * **Objective:** Present a professional and easy-to-read schedule for customers who book multiple tours or transfers.
    * **Implementation:**
        * **Consolidated Timeline:** Updated `reservation-schedule.html` to group all items (Pickup, Tours, Spas, Sending) into a single chronological timeline.
        * **Detailed Guidance:** Integrated product-specific meeting times, meeting places, and preparation lists (instructions) directly into each timeline card.
        * **Smart Sorting:** Logic ensures that "Airport Pickup" always appears first on its date, and "Airport Sending" always appears last on its date, with other activities sorted by time in between.
        * **Dynamic Layout:** Uses a clean, card-based UI with background shading for instructions to ensure critical information like "Meeting Place" is highly visible.
    * **Benefits:** Provides a clear "Day-by-Day" plan for the customer, reducing confusion and support inquiries regarding meeting locations and times.

    ### 27. Granular Reservation Editing (March 2026)
    * **Objective:** Allow administrators to modify specific dates and times for each individual item within a reservation (e.g., changing only the hopping tour date without affecting other activities).
    * **Implementation:**
        * **Per-Item Edit Fields:** Updated the admin edit mode in `admin.js` to dynamically generate date and time input fields for every product in the `items` array.
        * **Data Collection:** Modified `handleSaveEdit` to map through the reservation's items and capture the updated values from the corresponding input fields.
        * **UI Clarity:** Added a dedicated "🛒 예약 상품 일정 수정" (Edit Item Schedule) section at the top of the edit form for better focus on activity logistics.
    * **Benefits:** Provides full flexibility for handling complex rescheduling requests from customers who book multiple tours at once.

    ### 28. Data Integrity & Sync Fix (March 2026)
    * **Objective:** Ensure "Airport Pickup/Sending" data is correctly captured, displayed, and editable across the entire system.
    * **Implementation:**
        * **Capture Fix:** Updated `booking-form.html` to correctly identify the pickup item in the cart even when multiple products are present, ensuring `pickupDate` and `sendingDate` are properly saved to the top-level reservation document.
        * **Admin Detail Visibility:** Refined `admin.js` to explicitly pull airport transfer details from the correct Firestore fields and display them prominently in the detail modal.
        * **My Page Real-time Sync:** Enhanced `mypage.html` to fetch the latest reservation data directly from Firestore based on the customer's contact info, ensuring that any administrative changes to pickup/sending logistics are immediately visible to the user.
        * **Admin Edit Stability:** Restructured the admin modal to separate the "Save/Close" buttons from the scrollable content, preventing UI breakage during data updates.
    * **Benefits:** Guarantees that both administrators and customers always have access to the most accurate and up-to-date travel logistics.

    ### 29. Pickup-Sending Item Visibility Fix (March 2026)
    * **Objective:** Ensure the "Schedule" (일정) field for "Airport Pickup-Sending" items displays the correct date range in the product list.
    * **Implementation:**
        * **Logic Update:** Modified the `itemsHtml` generation in `admin.js` to detect items without a single `date` property but with `pickupDate` and `sendingDate` instead.
        * **Display:** For these items, the "Schedule" field now automatically displays the range (e.g., "2026-03-23 ~ 2026-03-26").
        * **Edit Mode Support:** Updated the admin edit form to pre-populate item-level date fields with this range for pickup-sending products, ensuring consistency during rescheduling.
    * **Benefits:** Prevents confusion by showing complete logistical data within the itemized reservation list.

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
