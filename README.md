# NOVA Senior Transit

NOVA Senior Transit is a web application designed to help seniors and individuals with mobility challenges find suitable transportation options in Northern Virginia. The application provides a user-friendly chat interface to gather trip details and then suggests the most relevant transportation services based on the user's needs.

## Features

-   **Conversational UI:** A simple chat interface guides users through the process of planning their trip.
-   **Personalized Recommendations:** The application uses the Gemini API to provide transportation suggestions tailored to the user's specific mobility needs.
-   **Interactive Map:** Once a transportation option is selected, the application displays the route on an interactive Google Map.
-   **Focus on Accessibility:** The application prioritizes services that are accessible to individuals with mobility challenges, such as those who use wheelchairs or need assistance with bags.

## Technologies Used

-   **React:** The application is built using the React library.
-   **Google Maps API:** Used for address validation, geocoding, and displaying maps.
-   **Gemini API:** Powers the conversational AI and provides transportation recommendations.
-   **Tailwind CSS:** For styling the application.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/BenPerel/nova-senior-transit.git
    cd nova-senior-transit
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up API Keys:**
    The application requires API keys for both Google Maps and Gemini. You will be prompted to enter these keys when you first launch the application.

    -   **Google Maps API Key:** You can obtain a key from the [Google Cloud Console](https://console.cloud.google.com/). You will need to enable the following APIs:
        -   Maps JavaScript API
        -   Directions API
        -   Geocoding API
    -   **Gemini API Key:** You can obtain a key from [Google AI Studio](https://aistudio.google.com/).

4.  **Run the application:**
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:3000`.

## How It Works

1.  **Enter API Keys:** When you first launch the application, you will be prompted to enter your Google Maps and Gemini API keys.
2.  **Chat with the Assistant:** The application will then guide you through a series of questions to gather information about your trip, including your origin, destination, travel time, and any specific mobility needs.
3.  **Get Recommendations:** Based on your input, the application will provide a list of recommended transportation options.
4.  **View Your Trip:** Once you select an option, the application will display your trip on an interactive map.
