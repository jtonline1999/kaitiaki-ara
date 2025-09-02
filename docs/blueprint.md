# **App Name**: Kaitiaki Ara

## Core Features:

- User Authentication: Secure user sign-up, sign-in, and sign-out functionality via email.
- Vehicle Management: Allow users to add, view, edit, and list their vehicles with details like plate number, VIN, make, model, year, and color.
- Compliance Record Management: Enable users to add, view, edit, and list compliance records (registration, WOF, RUC, insurance) for each vehicle, including expiry dates and predicted expiry dates (for RUC).
- OCR-based Data Ingestion: Use Cloud Vision OCR tool to extract vehicle and compliance data from uploaded or captured photos, allowing users to confirm and correct the parsed information.
- Vehicle Metadata Fetch and Caching: Call the getVehicleMetadata tool using plate number from a server Function to fetch and cache vehicle details (make, model, year, color) from the VEHICLE_DATA_API_URL.
- Upcoming Compliance Event Dashboard: Display a unified list of upcoming compliance events (time-based and distance-based) within the next 30 days on the user dashboard.
- RUC Expiry Prediction: The updatePredictedExpiryDates tool calculates and updates predicted expiry dates for RUC records based on odometer logs and default KM/day settings.

## Style Guidelines:

- Primary color: Deep turquoise (#46D1C4) to evoke trustworthiness and a connection to New Zealand's natural landscapes. This color offers a sense of calm and reliability.
- Background color: Very light cyan (#E0F8F7) for a clean and calming backdrop that emphasizes content clarity and legibility.
- Accent color: Coral pink (#F08080) for interactive elements and calls to action, providing a contrasting, engaging, but harmonious feel to guide the user's attention.
- Body and headline font: 'PT Sans' for a modern, readable, and accessible style. This humanist sans-serif offers both a contemporary look and a touch of warmth and personality, suitable for headings and body text.
- Code font: 'Source Code Pro' for displaying any code snippets related to OCR parsing or API calls.
- Use clear, geometric icons from a library like Lucide or Remix Icon to represent vehicle types, compliance records, and actions, enhancing usability and visual appeal.
- Implement a responsive, card-based layout with clear visual hierarchy to ensure optimal viewing and interaction across devices (desktop, tablet, mobile).