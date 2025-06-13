import React, { useState, useEffect, useRef } from "react";

// --- Helper Components ---

// Simple SVG Icons for different transport types
const TransportIcon = ({ type, className = "w-12 h-12" }) => {
  const icons = {
    Rideshare: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    Taxi: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 11c.058 0 .117.002.175.005L12.42 12.5H16a1 1 0 011 1v2a1 1 0 01-1 1h-1v2a1 1 0 01-1 1H8a1 1 0 01-1-1v-2H6a1 1 0 01-1-1v-2a1 1 0 011-1h3.58l.245-1.495A4.002 4.002 0 0112 11zm0 0V9a2 2 0 100-4 2 2 0 000 4z"
        />
        <path d="M5 21h14" />
        <path d="M6.3 16.3l-1.5-1.5" />
        <path d="M19.2 14.8l-1.5 1.5" />
      </svg>
    ),
    PublicBus: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>
    ),
    Metro: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 21v-4a4 4 0 014-4h10a4 4 0 014 4v4"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 11V9a4 4 0 014-4h10a4 4 0 014 4v2"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 17a2 2 0 100-4 2 2 0 000 4z"
        />
        <path d="M8 21h8" />
        <path d="M12 5V3" />
      </svg>
    ),
    SpecializedService: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 17.5l-4.5 2.5 1.5-5.5L5 11h5.5L12 5.5l1.5 5.5H19l-4 3.5 1.5 5.5z"
        />
      </svg>
    ),
    Default: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4c-1.742 0-3.223-.835-3.772-2M12 12h.01M12 12v.01"
        />
      </svg>
    ),
  };
  return icons[type] || icons.Default;
};

// Loading Spinner
const Spinner = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
);

// --- Main Application Component ---

export default function App() {
  // === STATE MANAGEMENT ===
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isKeySubmitted, setIsKeySubmitted] = useState(false);
  const [isMapApiReady, setIsMapApiReady] = useState(false);

  // Chat and form state
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Conversation flow and validation state
  const [currentStep, setCurrentStep] = useState(0);
  const [clarification, setClarification] = useState({
    needed: false,
    type: "",
    message: "",
  });
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    dateTime: "",
    mobilityNeeds: "",
  });

  // Results state
  const [transportOptions, setTransportOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  // Refs for DOM elements
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // === DATA AND CONSTANTS ===
  const questions = [
    "First, where will your trip start? (e.g., 123 Main St, Arlington, VA)",
    "Great. Where are you heading to? (e.g., Inova Fairfax Hospital)",
    "What day and time is your appointment or desired travel time?",
    "Do you have any specific needs? (e.g., 'I use a wheelchair,' 'I need help with bags,' or 'I can't walk long distances')",
  ];

  // === EFFECTS ===

  // Effect to load Google Maps script as soon as API key is submitted
  useEffect(() => {
    if (isKeySubmitted && googleApiKey && !window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places,routes`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapApiReady(true); // Set API ready state on load
      document.head.appendChild(script);
    }
  }, [isKeySubmitted, googleApiKey]);

  // Effect to start the conversation
  useEffect(() => {
    if (isKeySubmitted) {
      setChatHistory([
        {
          role: "bot",
          content:
            "Hello! I'm here to help you find the best transportation in Northern Virginia. Let's plan your trip together.",
        },
        {
          role: "bot",
          content: questions[0],
        },
      ]);
      setCurrentStep(1);
    }
  }, [isKeySubmitted]);

  // Effect to scroll to the bottom of the chat and focus the input
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // After any chat update, if we are not loading, focus the input
    if (!isLoading && !selectedOption) {
      inputRef.current?.focus();
    }
  }, [chatHistory, isLoading, selectedOption]);

  // Effect to initialize the map when an option is selected
  useEffect(() => {
    if (selectedOption && isMapApiReady) {
      initMap();
    }
  }, [selectedOption, isMapApiReady]);

  // === LOGIC AND HANDLERS ===

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (googleApiKey.trim() && geminiApiKey.trim()) {
      setIsKeySubmitted(true);
    } else {
      setChatHistory([
        {
          role: "bot",
          content:
            "Please enter both a valid Google Maps and Gemini API Key to begin.",
        },
      ]);
    }
  };

  // Validation function for addresses using Google Geocoder
  const validateAddress = (address) => {
    return new Promise((resolve) => {
      if (!isMapApiReady || !window.google.maps.Geocoder) {
        console.warn(
          "Google Maps API not ready for validation, proceeding without it."
        );
        resolve({ isValid: true, address: address }); // Gracefully proceed if API isn't ready
        return;
      }
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        {
          address: address,
          componentRestrictions: { administrativeArea: "VA" },
        },
        (results, status) => {
          if (status === "OK" && results.length > 0) {
            if (results[0].partial_match) {
              resolve({
                isValid: false,
                message: `I found a few places matching "${address}". Could you be more specific, perhaps with a street name or zip code?`,
              });
            } else {
              resolve({ isValid: true, address: results[0].formatted_address });
            }
          } else {
            resolve({
              isValid: false,
              message:
                "I'm sorry, I couldn't find that address. Could you please check the spelling or provide a more specific location?",
            });
          }
        }
      );
    });
  };

  // Validation function for date and time
  const validateDateTime = (text) => {
    const hasAmPm = /\b(am|pm)\b/i.test(text);
    if (!hasAmPm) {
      const hasNumber = /\d/.test(text);
      if (hasNumber) {
        return {
          isValid: false,
          message:
            "To make sure I get the time right, could you specify if that's AM or PM?",
        };
      }
    }
    return { isValid: true };
  };

  // Initialize and render the Google Map
  const initMap = () => {
    if (!window.google || !selectedOption || !document.getElementById("map"))
      return;

    const mapElement = document.getElementById("map");
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: null,
      suppressMarkers: true,
    });

    const map = new window.google.maps.Map(mapElement, {
      zoom: 12,
      center: { lat: 38.8048, lng: -77.0469 }, // Alexandria
      mapTypeControl: false,
      streetViewControl: false,
    });
    directionsRenderer.setMap(map);

    const request = {
      origin: formData.origin,
      destination: formData.destination,
      travelMode: "DRIVING",
    };

    directionsService.route(request, (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);
        const leg = result.routes[0].legs[0];
        new window.google.maps.Marker({
          position: leg.end_location,
          map: map,
          title: leg.end_address,
        });
      } else {
        console.error(`Directions request failed due to ${status}`);
        mapElement.innerHTML = `<div class="flex items-center justify-center h-full text-slate-500">Could not display the map route.</div>`;
      }
    });
  };

  const getTransportSuggestions = async (finalData) => {
    setIsLoading(true);
    setTransportOptions([]);

    const prompt = `
            You are a helpful and compassionate AI assistant named "Nova Transit Helper", specializing in transportation for elderly and individuals with mobility challenges in Fairfax County, Northern Virginia.
            Your tone must be simple, reassuring, and clear. Avoid jargon.

            **IMPORTANT**: You MUST use the following URLs as your primary sources of truth for available transportation options. Prioritize information from these official and community-run sites over general knowledge. The PDF guide is the most comprehensive resource.

            - **Official Fairfax County Guide (Primary Source):** https://www.fairfaxcounty.gov/neighborhood-community-services/sites/neighborhood-community-services/files/assets/documents/ncs-transportation/guide%20to%20transportation%20options.pdf
            - **Fairfax County Older Adults Page:** https://www.fairfaxcounty.gov/familyservices/older-adults/transportation-for-older-adults
            - **Reston for a Lifetime Resources:** https://www.restonforalifetime.org/transportation/#rides
            - **Main Fairfax County Website:** https://www.fairfaxcounty.gov/

            The user needs to travel from:
            - Origin: ${finalData.origin}
            - Destination: ${finalData.destination}
            - Time: ${finalData.dateTime}
            - Specific Needs: "${finalData.mobilityNeeds}". This is crucial. Pay close attention to needs like "can't walk long distances", which means you should de-prioritize public transit options that require long walks to stations and prioritize door-to-door services (like many of the volunteer driver programs listed in the provided links). If the user mentions a wheelchair, look for services that are explicitly wheelchair accessible.

            Task:
            1.  Based *only* on the information in the provided URLs, generate up to 3 diverse transportation suggestions relevant to the user's needs.
            2.  For each suggestion, provide a "name" (e.g., "Herndon-Reston FISH", "MetroAccess", "Fairfax Connector").
            3.  Provide a "type" from this specific list: Rideshare, Taxi, PublicBus, Metro, SpecializedService. Use "SpecializedService" for volunteer driver programs, paratransit, and other senior-focused options from the links.
            4.  Write a simple, one-sentence "description" explaining why it's a good choice based on the user's specific needs, referencing details from the source links. For example, "This is a volunteer service that can take you to medical appointments or the grocery store."
            5.  Provide a rough "cost_estimate" based on the source documents (e.g., "Free, but donations accepted", "About $2.00", "Varies").
            6.  Provide a rough "duration_estimate" (e.g., "About 30 minutes"). This can be a general estimate.
        `;

    try {
      let modelChatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = {
        contents: modelChatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              suggestions: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    type: {
                      type: "STRING",
                      description:
                        "One of: Rideshare, Taxi, PublicBus, Metro, SpecializedService",
                    },
                    name: { type: "STRING" },
                    description: { type: "STRING" },
                    cost_estimate: { type: "STRING" },
                    duration_estimate: { type: "STRING" },
                  },
                  required: [
                    "type",
                    "name",
                    "description",
                    "cost_estimate",
                    "duration_estimate",
                  ],
                },
              },
            },
            required: ["suggestions"],
          },
        },
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error Response:", errorBody);
        throw new Error(
          `The AI service returned an error (Status: ${response.status}). This may be a permission or API key issue. Please try again later.`
        );
      }

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates[0] &&
        result.candidates[0].content
      ) {
        const jsonText = result.candidates[0].content.parts[0].text;
        const parsedData = JSON.parse(jsonText);
        if (parsedData.suggestions && parsedData.suggestions.length > 0) {
          setTransportOptions(parsedData.suggestions);
          setChatHistory((prev) => [
            ...prev,
            {
              role: "bot",
              content:
                "Okay, I've found a few options for you. Please take a look and choose the one that seems best.",
            },
          ]);
        } else {
          throw new Error(
            "The AI found no suitable suggestions. The trip may be too long, or there may be no available options for the needs provided."
          );
        }
      } else {
        console.error("Unexpected AI response format:", result);
        throw new Error(
          "I received an unexpected response from the AI. Please try rephrasing your request."
        );
      }
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.message ||
        "I'm having a little trouble connecting. Please check your connection or try again in a few moments.";
      setChatHistory((prev) => [
        ...prev,
        { role: "bot", content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || selectedOption) return;

    const currentInput = userInput;
    setUserInput("");
    const newChatHistory = [
      ...chatHistory,
      { role: "user", content: currentInput },
    ];
    setChatHistory(newChatHistory);
    setIsLoading(true);

    // --- VALIDATION AND CLARIFICATION LOGIC ---
    if (clarification.needed) {
      // User is providing a clarification
      const previousAttempt = formData[clarification.type] || "";
      const updatedField = `${previousAttempt} ${currentInput}`;

      const newFormData = { ...formData, [clarification.type]: updatedField };

      setFormData(newFormData);
      setClarification({ needed: false, type: "", message: "" });

      // **FIXED LOGIC**: Now ask the *next* question and advance the step
      if (currentStep < questions.length) {
        setChatHistory([
          ...newChatHistory,
          { role: "bot", content: questions[currentStep] },
        ]);
        setCurrentStep(currentStep + 1);
      } else {
        // This was the last clarification needed, now get suggestions
        setChatHistory([
          ...newChatHistory,
          {
            role: "bot",
            content:
              "Thank you! I have all the information I need. Let me find the best options for you. This might take a moment...",
          },
        ]);
        getTransportSuggestions(newFormData);
        setCurrentStep(currentStep + 1);
      }
    } else {
      // --- REGULAR QUESTION FLOW ---
      let nextStep = currentStep;
      const newFormData = { ...formData };
      let validationResult = { isValid: true };

      const fieldToUpdate = Object.keys(formData)[currentStep - 1];
      newFormData[fieldToUpdate] = currentInput;

      if (currentStep === 1 || currentStep === 2) {
        // Address validation
        validationResult = await validateAddress(currentInput);
        if (validationResult.isValid)
          newFormData[fieldToUpdate] = validationResult.address;
      } else if (currentStep === 3) {
        // Time validation
        validationResult = validateDateTime(currentInput);
      }

      setFormData(newFormData);

      if (!validationResult.isValid) {
        setClarification({
          needed: true,
          type: fieldToUpdate,
          message: validationResult.message,
        });
        setChatHistory([
          ...newChatHistory,
          { role: "bot", content: validationResult.message },
        ]);
      } else {
        if (nextStep < questions.length) {
          setChatHistory([
            ...newChatHistory,
            { role: "bot", content: questions[nextStep] },
          ]);
          setCurrentStep(nextStep + 1);
        } else {
          setChatHistory([
            ...newChatHistory,
            {
              role: "bot",
              content:
                "Thank you! I have all the information I need. Let me find the best options for you. This might take a moment...",
            },
          ]);
          getTransportSuggestions(newFormData);
          setCurrentStep(nextStep + 1);
        }
      }
    }
    setIsLoading(false);
  };

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    window.scrollTo(0, 0);
  };

  const handleStartOver = () => {
    setChatHistory([]);
    setUserInput("");
    setIsLoading(false);
    setCurrentStep(0);
    setFormData({
      origin: "",
      destination: "",
      dateTime: "",
      mobilityNeeds: "",
    });
    setTransportOptions([]);
    setSelectedOption(null);
    setClarification({ needed: false, type: "", message: "" });

    setChatHistory([
      {
        role: "bot",
        content:
          "Hello! I'm here to help you find the best transportation in Northern Virginia. Let's plan your trip together.",
      },
      {
        role: "bot",
        content: questions[0],
      },
    ]);
    setCurrentStep(1);
  };

  // === RENDER ===
  if (!isKeySubmitted) {
    return (
      <div className="bg-slate-100 min-h-screen flex items-center justify-center font-sans p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">
            Welcome!
          </h1>
          <p className="text-slate-600 mb-6 text-center">
            This app requires API keys to function.
          </p>
          <form onSubmit={handleApiKeySubmit}>
            <div className="mb-4">
              <label
                className="block text-slate-700 font-bold mb-2"
                htmlFor="google-key"
              >
                Google Maps API Key
              </label>
              <input
                type="password"
                id="google-key"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                placeholder="Enter Google Maps API Key"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-slate-700 font-bold mb-2"
                htmlFor="gemini-key"
              >
                Gemini API Key
              </label>
              <input
                type="password"
                id="gemini-key"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter Gemini API Key"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Start Application
            </button>
          </form>
          <div className="text-xs text-slate-500 mt-4 text-center space-y-2">
            <p>
              You can get keys from the Google Cloud Console and Google AI
              Studio.
            </p>
            <p>
              <strong>Required Google Maps APIs:</strong> Maps JavaScript API,
              Directions API, and Geocoding API.
            </p>
          </div>
          {chatHistory.length > 0 &&
            chatHistory[0].content.startsWith("Please enter both") && (
              <p className="text-red-500 text-center font-bold mt-4">
                {chatHistory[0].content}
              </p>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
            NOVA Senior Transit
          </h1>
          <p className="text-lg text-slate-600 mt-2">
            Your friendly guide to getting around Northern Virginia.
          </p>
        </header>

        {selectedOption && (
          <section
            id="map-view"
            className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Your Trip Overview
            </h2>
            <div className="flex items-start bg-blue-50 p-4 rounded-lg">
              <div className="pr-4 text-blue-600">
                <TransportIcon
                  type={selectedOption.type}
                  className="w-16 h-16"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-800">
                  {selectedOption.name}
                </h3>
                <p className="text-slate-700 mt-1">
                  {selectedOption.description}
                </p>
                <div className="flex space-x-4 text-sm mt-2 text-slate-600">
                  <span>
                    <strong>Cost:</strong> {selectedOption.cost_estimate}
                  </span>
                  <span>
                    <strong>Time:</strong> {selectedOption.duration_estimate}
                  </span>
                </div>
              </div>
            </div>
            <div
              id="map"
              className="w-full h-80 bg-slate-200 rounded-lg mt-4 border border-slate-300"
            >
              <div className="flex items-center justify-center h-full text-slate-500">
                Loading Map...
              </div>
            </div>
            <button
              onClick={handleStartOver}
              className="w-full mt-6 bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-green-700 transition-colors duration-300"
            >
              Plan Another Trip
            </button>
          </section>
        )}

        <main
          className={`bg-white rounded-xl shadow-lg border border-slate-200 ${
            selectedOption ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <div className="p-6 h-[60vh] overflow-y-auto flex flex-col space-y-4">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-sm md:max-w-md text-lg p-4 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-slate-200 text-slate-800 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && transportOptions.length === 0 && (
              <div className="flex justify-start">
                <div className="bg-slate-200 text-slate-800 p-4 rounded-2xl rounded-bl-none inline-flex items-center">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {transportOptions.length > 0 && !selectedOption && (
            <div className="p-6 border-t border-slate-200">
              <h3 className="text-xl font-bold text-center text-slate-700 mb-4">
                Here are your options:
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {transportOptions.map((opt, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col"
                  >
                    <div className="flex items-center mb-2">
                      <TransportIcon
                        type={opt.type}
                        className="w-8 h-8 mr-3 text-slate-600"
                      />
                      <h4 className="font-bold text-lg text-slate-800">
                        {opt.name}
                      </h4>
                    </div>
                    <p className="text-slate-600 flex-grow">
                      {opt.description}
                    </p>
                    <div className="text-sm text-slate-500 my-3">
                      <p>
                        <strong>Est. Cost:</strong> {opt.cost_estimate}
                      </p>
                      <p>
                        <strong>Est. Time:</strong> {opt.duration_estimate}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectOption(opt)}
                      className="w-full mt-auto bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Select This Option
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
            <form
              onSubmit={handleSubmit}
              className="flex items-center space-x-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={
                  isLoading
                    ? "Thinking..."
                    : clarification.needed
                    ? "Please provide clarification..."
                    : !isMapApiReady
                    ? "Loading map tools..."
                    : "Type your answer here..."
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
                disabled={
                  isLoading ||
                  !isMapApiReady ||
                  currentStep > questions.length ||
                  selectedOption
                }
              />
              <button
                type="submit"
                className="bg-blue-600 text-white font-bold py-3 px-5 rounded-lg text-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-blue-300 flex items-center justify-center"
                disabled={
                  isLoading ||
                  !isMapApiReady ||
                  !userInput.trim() ||
                  selectedOption
                }
              >
                {isLoading ? <Spinner /> : "Send"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
