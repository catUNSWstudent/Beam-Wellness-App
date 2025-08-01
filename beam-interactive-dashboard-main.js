// beam-interactive-dashboard-main.js
// This script contains the main application logic, view switching, and feature interactions.
// It depends on the Firebase setup in beam-interactive-dashboard-firebase-config.js.

import { signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, updateDoc, FieldValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    const landingPageView = document.getElementById('landingPageView');
    const authView = document.getElementById('authView');
    const dashboardView = document.getElementById('dashboardView');
    const checkInView = document.getElementById('checkInView');
    const companionView = document.getElementById('companionView');
    const calmSpaceView = document.getElementById('calmSpaceView');
    const stepChallengeView = document.getElementById('stepChallengeView'); // Renamed to Activity Challenge in UI, but ID remains
    const settingsView = document.getElementById('settingsView');
    const profileSettingsView = document.getElementById('profileSettingsView');
    const dataPrivacySettingsView = document.getElementById('dataPrivacySettingsView');
    
    const navDashboard = document.getElementById('nav-dashboard');
    const navCheckIn = document.getElementById('nav-check-in');
    const navCompanion = document.getElementById('nav-companion');
    const navCalmSpace = document.getElementById('nav-calm-space');
    const navStepChallenge = document.getElementById('nav-step-challenge'); // Refers to Activity Challenge
    const navSettings = document.getElementById('nav-settings');
    const mobileNav = document.getElementById('mobile-nav');

    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    let chatHistory = [];

    const analyzeScoresBtn = document.getElementById('analyzeScoresBtn');
    const scoreAnalysisModal = document.getElementById('scoreAnalysisModal');
    const closeAnalysisModal = document.getElementById('closeAnalysisModal');
    const analysisOutput = document.getElementById('analysisOutput');
    const analysisLoading = document.getElementById('analysisLoading');

    // Calm Space Elements (for emoji prompts)
    const calmSpaceGreeting = document.getElementById('calmSpaceGreeting');
    const calmSpaceEmojiButtons = document.querySelectorAll('#calmSpaceView .emoji-button');
    const calmSpacePromptLoading = document.getElementById('calmSpacePromptLoading');
    const journalingInput = document.getElementById('journalingInput');
    const getJournalInsightBtn = document.getElementById('getJournalInsightBtn'); // New button
    const journalInsightOutput = document.getElementById('journalInsightOutput'); // New output area
    const journalInsightLoading = document.getElementById('journalInsightLoading'); // New loading indicator

    // Privacy Consent Elements (for Companion initial opt-in)
    const privacyConsentView = document.getElementById('privacyConsentView');
    const acceptConsentBtn = document.getElementById('acceptConsentBtn');
    const declineConsentBtn = document.getElementById('declineConsentBtn');

    // Activity Challenge Elements (formerly Step Challenge)
    const userNameInputSection = document.getElementById('userNameInputSection');
    const userNameInput = document.getElementById('userNameInput');
    const saveUserNameBtn = document.getElementById('saveUserNameBtn');
    const stepChallengeContent = document.getElementById('stepChallengeContent'); // Content div
    const myTotalActivityPoints = document.getElementById('myTotalActivityPoints'); // Renamed
    const myDailyActivityPoints = document.getElementById('myDailyActivityPoints'); // Renamed
    const activityInput = document.getElementById('activityInput'); // Renamed
    const activityUnit = document.getElementById('activityUnit'); // New unit selector
    const addActivityBtn = document.getElementById('addActivityBtn'); // Renamed
    const activityMessage = document.getElementById('activityMessage'); // Renamed
    const leaderboardList = document.getElementById('leaderboardList');
    const leaderboardLoading = document.getElementById('leaderboardLoading');

    // NEW Team Leaderboard Elements
    const teamNameInput = document.getElementById('teamNameInput');
    const createTeamBtn = document.getElementById('createTeamBtn');
    const joinTeamBtn = document.getElementById('joinTeamBtn');
    const leaveTeamBtn = document.getElementById('leaveTeamBtn');
    const teamMessage = document.getElementById('teamMessage');
    const currentTeamDisplay = document.getElementById('currentTeamDisplay');
    const currentTeamActivityPoints = document.getElementById('currentTeamActivityPoints'); // Renamed
    const teamJoinCreate = document.getElementById('teamJoinCreate');
    const teamLeaderboardList = document.getElementById('teamLeaderboardList');
    const teamLeaderboardLoading = document.getElementById('teamLeaderboardLoading');
    const teamStatus = document.getElementById('teamStatus');


    // Dashboard Score Elements
    const wellbeingScoreEl = document.getElementById('wellbeingScore');
    const safetyScoreEl = document.getElementById('safetyScore');
    const inclusionScoreEl = document.getElementById('inclusionScore');
    const wellbeingProgressBar = document.getElementById('wellbeingProgressBar');
    const safetyProgressBar = document.getElementById('safetyProgressBar');
    const inclusionProgressBar = document.getElementById('inclusionProgressBar');
    const wellbeingChangeEl = document.getElementById('wellbeingChange');
    const safetyChangeEl = document.getElementById('safetyChange');
    const inclusionChangeEl = document.getElementById('inclusionChange');
    const dashboardLastUpdated = document.getElementById('dashboardLastUpdated');

    // Settings Elements
    const toggleDailyReminders = document.getElementById('toggleDailyReminders');
    const toggleInsightAlerts = document.getElementById('toggleInsightAlerts');
    const toggleDarkMode = document.getElementById('toggleDarkMode');
    const toggleReduceAnimations = document.getElementById('toggleReduceAnimations');
    const logoutBtn = document.getElementById('logoutBtn');
    const openDataPrivacySettingsBtn = document.getElementById('openDataPrivacySettingsBtn');

    // Data Privacy Settings View Elements
    const toggleShareAnonymizedData = document.getElementById('toggleShareAnonymizedData');
    const togglePersonalizedInsights = document.getElementById('togglePersonalizedInsights');
    const companionConsentStatusDataPrivacy = document.getElementById('companionConsentStatusDataPrivacy');
    const toggleCompanionConsentBtnDataPrivacy = document.getElementById('toggleCompanionConsentBtnDataPrivacy');
    const dataPrivacyBackBtn = document.getElementById('dataPrivacyBackBtn');


    // Profile Settings Elements
    const openProfileSettingsBtn = document.getElementById('openProfileSettingsBtn');
    const profileDisplayNameInput = document.getElementById('profileDisplayName');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileEmailInput = document.getElementById('profileEmail');
    const saveProfileChangesBtn = document.getElementById('saveProfileChangesBtn');
    const memberSinceDate = document.getElementById('memberSinceDate');
    const profileBackBtn = document.getElementById('profileBackBtn');

    // Landing Page Elements
    const startCheckInLandingBtn = document.getElementById('startCheckInLandingBtn');
    const viewDashboardLandingBtn = document.getElementById('viewDashboardLandingBtn');

    // Auth Page Elements
    const authTitle = document.getElementById('authTitle');
    const authError = document.getElementById('authError');
    const authForm = document.getElementById('authForm');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const authDisplayNameGroup = document.getElementById('authDisplayNameGroup');
    const authDisplayName = document.getElementById('authDisplayName');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authToggleText = document.getElementById('authToggleText');
    const authToggleButton = document.getElementById('authToggleButton');
    const continueAsGuestBtn = document.getElementById('continueAsGuestBtn');

    let isLoginMode = true; // True for login, false for signup

    // --- Auth Logic ---
    authToggleButton.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        authTitle.textContent = isLoginMode ? 'Login to Beam' : 'Sign Up for Beam';
        authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';
        authToggleText.textContent = isLoginMode ? "Don't have an account?" : "Already have an account?";
        authToggleButton.textContent = isLoginMode ? 'Sign Up' : 'Login';
        authDisplayNameGroup.classList.toggle('hidden', isLoginMode);
        authError.classList.add('hidden'); // Clear error on toggle
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.classList.add('hidden'); // Hide previous errors
        const email = authEmail.value.trim();
        const password = authPassword.value.trim();
        const displayName = authDisplayName.value.trim();

        if (isLoginMode) {
            // Login
            try {
                await signInWithEmailAndPassword(window.auth, email, password);
                // User signed in, onAuthStateChanged will handle redirection
            } catch (error) {
                console.error("Login error:", error);
                authError.textContent = error.message.includes('auth/invalid-credential') ? 'Invalid email or password.' : error.message;
                authError.classList.remove('hidden');
            }
        } else {
            // Sign Up
            if (!displayName) {
                authError.textContent = 'Please enter a display name.';
                authError.classList.remove('hidden');
                return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
                // Store display name in localStorage for new user
                localStorage.setItem(`beam_username_${userCredential.user.uid}`, displayName);
                // User signed up, onAuthStateChanged will handle redirection
            } catch (error) {
                console.error("Sign up error:", error);
                authError.textContent = error.message.includes('auth/email-already-in-use') ? 'Email already in use.' : error.message;
                authError.classList.remove('hidden');
            }
        }
    });

    continueAsGuestBtn.addEventListener('click', async () => {
        try {
            // Ensure anonymous sign-in is always available for guests
            if (!window.auth.currentUser || !window.auth.currentUser.isAnonymous) {
                 await signInAnonymously(window.auth);
            }
            window.location.hash = '#dashboard'; // Redirect to dashboard
        } catch (error) {
            console.error("Error signing in anonymously as guest:", error);
            alert("Could not continue as guest. Please try again.");
        }
    });

    // --- Check-in Logic ---
    const checkInStepContent = document.getElementById('checkInStepContent');
    const checkInBackBtn = document.getElementById('checkInBackBtn');
    const checkInNextBtn = document.getElementById('checkInNextBtn');
    const completeCheckInBtn = document.getElementById('completeCheckInBtn');
    const checkInProgressBar = document.getElementById('checkInProgressBar');

    let currentCheckInStep = 0;
    const checkInScores = {
        wellbeing: 5, // Default starting value for slider
        safety: 5,
        inclusion: 5,
        reflection: ""
    };

    const checkInQuestions = [
        {
            title: "How are you feeling today?",
            subtitle: "Take a moment to check in with yourself",
            key: "wellbeing",
            icon: "😊",
            min: 1, max: 10, initial: 7
        },
        {
            title: "How psychologically safe do you feel?",
            subtitle: "In your current environment and relationships",
            key: "safety",
            icon: "🛡️",
            min: 1, max: 10, initial: 8
        },
        {
            title: "How included do you feel?",
            subtitle: "In your community and decision-making processes",
            key: "inclusion",
            icon: "🤝",
            min: 1, max: 10, initial: 6
        },
        {
            title: "What's on your mind?",
            subtitle: "Share any thoughts, concerns, or celebrations (optional)",
            key: "reflection",
            icon: "💭"
        }
    ];

    function renderCheckInStep() {
        const stepData = checkInQuestions[currentCheckInStep];
        const totalSteps = checkInQuestions.length;
        const progressPercentage = ((currentCheckInStep + 1) / totalSteps) * 100;
        checkInProgressBar.style.width = `${progressPercentage}%`;

        let contentHtml = `
            <div class="mb-6 text-center">
                <span class="text-4xl mb-4 inline-block">${stepData.icon}</span>
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">${stepData.title}</h2>
                <p class="text-gray-600">${stepData.subtitle}</p>
            </div>
            <p class="text-sm text-gray-500 mb-4">Step ${currentCheckInStep + 1} of ${totalSteps}</p>
        `;

        if (stepData.key === "reflection") {
            contentHtml += `
                <textarea id="checkInReflectionInput" class="w-full h-48 bg-gray-50 rounded-lg p-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Share whatever feels right for you today. This space is yours to express yourself freely and safely.">${checkInScores.reflection}</textarea>
                <p class="text-sm text-gray-500 mt-2">Your thoughts are private and secure. You can skip this step if you prefer.</p>
            `;
            checkInNextBtn.classList.add('hidden');
            completeCheckInBtn.classList.remove('hidden');
        } else {
            const currentValue = checkInScores[stepData.key] || stepData.initial;
            contentHtml += `
                <div class="slider-value" id="currentSliderValue">${currentValue}</div>
                <input type="range" id="checkInSlider" min="${stepData.min}" max="${stepData.max}" value="${currentValue}" class="w-full">
                <p class="text-sm text-gray-500 mt-2">1 = Not at all - 10 = Completely</p>
            `;
            checkInNextBtn.classList.remove('hidden');
            completeCheckInBtn.classList.add('hidden');
        }

        checkInStepContent.innerHTML = contentHtml;

        // Update button visibility
        if (currentCheckInStep === 0) {
            checkInBackBtn.classList.add('hidden');
        } else {
            checkInBackBtn.classList.remove('hidden');
        }

        // Add event listener for slider
        if (stepData.key !== "reflection") {
            const slider = document.getElementById('checkInSlider');
            const sliderValueDisplay = document.getElementById('currentSliderValue');
            slider.oninput = function() {
                sliderValueDisplay.textContent = this.value;
                checkInScores[stepData.key] = parseInt(this.value);
            };
        } else {
            const reflectionInput = document.getElementById('checkInReflectionInput');
            reflectionInput.oninput = function() {
                checkInScores.reflection = this.value;
            };
        }
    }

    checkInNextBtn.addEventListener('click', () => {
        if (currentCheckInStep < checkInQuestions.length - 1) {
            currentCheckInStep++;
            renderCheckInStep();
        }
    });

    checkInBackBtn.addEventListener('click', () => {
        if (currentCheckInStep > 0) {
            currentCheckInStep--;
            renderCheckInStep();
        }
    });

    completeCheckInBtn.addEventListener('click', async () => {
        if (!window.db || !window.currentUserId) {
            alert("App not ready. Please wait or refresh.");
            return;
        }

        const todayDate = formatDate(new Date());
        const checkInDocRef = doc(window.db, `artifacts/${__app_id}/users/${window.currentUserId}/checkIns`, todayDate);

        try {
            await setDoc(checkInDocRef, {
                wellbeing: checkInScores.wellbeing,
                safety: checkInScores.safety,
                inclusion: checkInScores.inclusion,
                reflection: checkInScores.reflection,
                timestamp: new Date()
            }, { merge: true });

            alert("Check-in complete! Your scores have been saved.");
            // Reset check-in for next time
            currentCheckInStep = 0;
            checkInScores.wellbeing = 5;
            checkInScores.safety = 5;
            checkInScores.inclusion = 5;
            checkInScores.reflection = "";
            window.location.hash = '#dashboard'; // Go back to dashboard after completion
        } catch (e) {
            console.error("Error saving check-in:", e);
            alert("Error saving check-in. Please try again.");
        }
    });

    // Listen for dashboard score updates from Firestore
    let unsubscribeDashboard = null;
    function listenForDashboardUpdates() {
        if (!window.db || !window.currentUserId) {
            console.warn("Firestore not ready for dashboard updates.");
            return;
        }

        if (unsubscribeDashboard) {
            unsubscribeDashboard();
        }

        const checkInsCollectionRef = collection(window.db, `artifacts/${__app_id}/users/${window.currentUserId}/checkIns`);
        const q = query(checkInsCollectionRef); // No orderBy to avoid index issues

        unsubscribeDashboard = onSnapshot(q, (snapshot) => {
            let latestCheckIn = null;
            let latestDate = null;
            const weeklyData = {}; // Stores data for the chart

            const startOfWeek = getStartOfWeek(); // Function from step challenge

            snapshot.forEach((doc) => {
                const data = doc.data();
                const docDate = new Date(doc.id); // Assuming doc.id is YYYY-MM-DD

                // For dashboard current scores: find the very latest check-in
                if (!latestCheckIn || docDate > latestDate) {
                    latestCheckIn = data;
                    latestDate = docDate;
                }

                // For weekly trends chart: collect data for the current week
                if (docDate >= startOfWeek) {
                    const dayOfWeek = docDate.getDay(); // 0 (Sunday) to 6 (Saturday)
                    const dayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Map Sunday to 6, Monday to 0
                    const dayLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex];
                    
                    // Average scores for the day if multiple check-ins
                    if (!weeklyData[dayLabel]) {
                        weeklyData[dayLabel] = { wellbeing: [], safety: [], inclusion: [] };
                    }
                    weeklyData[dayLabel].wellbeing.push(data.wellbeing);
                    weeklyData[dayLabel].safety.push(data.safety);
                    weeklyData[dayLabel].inclusion.push(data.inclusion);
                }
            });

            // Update Dashboard Scores
            if (latestCheckIn) {
                wellbeingScoreEl.textContent = latestCheckIn.wellbeing.toFixed(1);
                safetyScoreEl.textContent = latestCheckIn.safety.toFixed(1);
                inclusionScoreEl.textContent = latestCheckIn.inclusion.toFixed(1);

                wellbeingProgressBar.style.width = `${latestCheckIn.wellbeing * 10}%`;
                safetyProgressBar.style.width = `${latestCheckIn.safety * 10}%`;
                inclusionProgressBar.style.width = `${latestCheckIn.inclusion * 10}%`;

                // Update last updated date
                dashboardLastUpdated.textContent = `Last updated: ${latestDate.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

                // For weekly change, we'd need to compare to a previous week's average or specific day.
                // For simplicity, we'll keep the static "+0.0 this week" for now or calculate a simple change if enough data exists.
                // For now, these will remain static or show 0.0
                wellbeingChangeEl.textContent = "+0.0 this week";
                safetyChangeEl.textContent = "+0.0 this week";
                inclusionChangeEl.textContent = "+0.0 this week";

            } else {
                // No check-ins yet
                wellbeingScoreEl.textContent = "0.0";
                safetyScoreEl.textContent = "0.0";
                inclusionScoreEl.textContent = "0.0";
                wellbeingProgressBar.style.width = `0%`;
                safetyProgressBar.style.width = `0%`;
                inclusionProgressBar.style.width = `0%`;
                dashboardLastUpdated.textContent = `Last updated: N/A`;
                wellbeingChangeEl.textContent = "+0.0 this week";
                safetyChangeEl.textContent = "+0.0 this week";
                inclusionChangeEl.textContent = "+0.0 this week";
            }

            // Update Weekly Trends Chart
            const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const wellbeingData = chartLabels.map(day => {
                const values = weeklyData[day]?.wellbeing || [];
                return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            });
            const safetyData = chartLabels.map(day => {
                const values = weeklyData[day]?.safety || [];
                return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            });
            const inclusionData = chartLabels.map(day => {
                const values = weeklyData[day]?.inclusion || [];
                return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            });

            // Destroy existing chart if it exists to prevent multiple instances
            if (window.myWeeklyTrendsChart) {
                window.myWeeklyTrendsChart.destroy();
            }

            const ctx = document.getElementById('weeklyTrendsChart').getContext('2d');
            window.myWeeklyTrendsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'Wellbeing',
                        data: wellbeingData,
                        borderColor: '#ef4444',
                        backgroundColor: '#ef4444',
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: '#ef4444',
                    }, {
                        label: 'Safety',
                        data: safetyData,
                        borderColor: '#3b82f6',
                        backgroundColor: '#3b82f6',
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: '#3b82f6',
                    }, {
                        label: 'Inclusion',
                        data: inclusionData,
                        borderColor: '#22c55e',
                        backgroundColor: '#22c55e',
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: '#22c55e',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            grid: {
                                color: '#e5e7eb'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 8,
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: '#1f2937',
                            titleFont: { weight: 'bold' },
                            bodySpacing: 5,
                            padding: 12,
                            cornerRadius: 8,
                        }
                    }
                }
            });

        }, (error) => {
            console.error("Error listening to dashboard updates:", error);
            // Handle error display on dashboard
        });
    }
    
    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        if (sender === 'user') {
            messageElement.className = 'flex justify-end';
            messageElement.innerHTML = `
                <div class="chat-bubble chat-bubble-user">
                    <p>${message}</p>
                </div>
            `;
        } else {
            messageElement.className = 'flex items-start space-x-3';
            messageElement.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                   <span class="text-lg">💬</span>
                </div>
                <div class="chat-bubble chat-bubble-bot">
                    <p>${message}</p>
                </div>
            `;
        }
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    async function getCompanionResponse(prompt) {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'flex items-start space-x-3';
        typingIndicator.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
               <span class="text-lg">💬</span>
            </div>
            <div class="chat-bubble chat-bubble-bot">
                <p class="italic text-gray-500">Typing...</p>
            </div>
        `;
        chatWindow.appendChild(typingIndicator);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = ""; // Canvas will inject the API key here
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        let retries = 0;
        const maxRetries = 3;
        let success = false;

        while (retries < maxRetries && !success) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const result = await response.json();
                
                if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
                    const botResponse = result.candidates[0].content.parts[0].text;
                    chatHistory.push({ role: "model", parts: [{ text: botResponse }] });
                    typingIndicator.remove();
                    addMessageToChat('bot', botResponse);
                    success = true;
                } else {
                    throw new Error("Invalid response structure from API");
                }
            } catch (error) {
                console.error('Error fetching companion response:', error);
                retries++;
                if (retries >= maxRetries) {
                    typingIndicator.remove();
                    addMessageToChat('bot', 'Sorry, I seem to be having trouble connecting. Please try again in a moment.');
                } else {
                    await new Promise(res => setTimeout(res, 1000 * Math.pow(2, retries)));
                }
            }
        }
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userInput = chatInput.value.trim();
        if (userInput) {
            addMessageToChat('user', userInput);
            getCompanionResponse(userInput);
            chatInput.value = '';
        }
    });

    // Feature: Analyze Scores
    analyzeScoresBtn.addEventListener('click', async () => {
        analysisOutput.textContent = '';
        analysisLoading.classList.remove('hidden');
        scoreAnalysisModal.classList.remove('hidden');

        // Get current scores from the dashboard display
        const wellbeingScore = parseFloat(wellbeingScoreEl.textContent);
        const safetyScore = parseFloat(safetyScoreEl.textContent);
        const inclusionScore = parseFloat(inclusionScoreEl.textContent);

        const prompt = `Analyze the following wellbeing scores: Wellbeing Score: ${wellbeingScore}/10, Psychological Safety: ${safetyScore}/10, Inclusion Index: ${inclusionScore}/10. Provide a concise, empathetic, and encouraging interpretation of these scores, highlighting strengths and suggesting a general area for continued growth. Keep it under 100 words.`;

        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = ""; // Canvas will inject the API key here
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        let retries = 0;
        const maxRetries = 3;
        let success = false;

        while (retries < maxRetries && !success) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const result = await response.json();
                
                if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
                    analysisOutput.textContent = result.candidates[0].content.parts[0].text;
                    success = true;
                } else {
                    throw new Error("Invalid response structure from API");
                }
            } catch (error) {
                console.error('Error fetching score analysis:', error);
                retries++;
                if (retries >= maxRetries) {
                    analysisOutput.textContent = 'Sorry, I could not generate an analysis at this time. Please try again later.';
                } else {
                    await new Promise(res => setTimeout(res, 1000 * Math.pow(2, retries)));
                }
            } finally {
                analysisLoading.classList.add('hidden');
            }
        }
    });

    closeAnalysisModal.addEventListener('click', () => {
        scoreAnalysisModal.classList.add('hidden');
    });

    // Calm Space: Time-of-Day Greeting Logic
    function updateCalmSpaceGreeting() {
        const now = new Date();
        const hour = now.getHours();
        let greeting = "Hello";
        if (hour >= 5 && hour < 12) {
            greeting = "Good Morning";
        } else if (hour >= 12 && hour < 18) {
            greeting = "Good Afternoon";
        } else {
            greeting = "Good Evening";
        }
        calmSpaceGreeting.textContent = `${greeting}, Let's begin with intention.`;
    }

    // Calm Space: Feature: Generate Reflection Prompt based on Emoji click
    calmSpaceEmojiButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const feeling = button.dataset.feeling;
            calmSpacePromptLoading.classList.remove('hidden');

            const prompt = `Generate a concise, empathetic, and open-ended reflection prompt for someone feeling "${feeling}". The prompt should encourage self-awareness or gentle exploration of thoughts. Keep it under 25 words. Example for 'calm': "What moments of peace did you find today?"`;

            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = ""; // Canvas will inject the API key here
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            let retries = 0;
            const maxRetries = 3;
            let success = false;

            while (retries < maxRetries && !success) {
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    
                    const result = await response.json();
                    
                    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
                        journalingInput.value = result.candidates[0].content.parts[0].text; // Populate the journaling textarea
                        success = true;
                    } else {
                        throw new Error("Invalid response structure from API");
                    }
                } catch (error) {
                    console.error('Error fetching reflection prompt:', error);
                    retries++;
                    if (retries >= maxRetries) {
                        journalingInput.value = 'Could not generate prompt. Try typing your thoughts directly.';
                    } else {
                        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, retries)));
                    }
                } finally {
                    calmSpacePromptLoading.classList.add('hidden');
                }
            }
        });
    });

    // New Feature: Get Journal Insight
    getJournalInsightBtn.addEventListener('click', async () => {
        const journalEntry = journalingInput.value.trim();
        journalInsightOutput.classList.add('hidden');
        journalInsightOutput.textContent = '';
        journalInsightLoading.classList.remove('hidden');

        if (!journalEntry) {
            journalInsightOutput.textContent = 'Please write something in your journal before getting an insight.';
            journalInsightOutput.classList.remove('hidden');
            journalInsightLoading.classList.add('hidden');
            return;
        }

        const prompt = `Based on the following journal entry, provide a concise, empathetic insight or a thoughtful follow-up question to encourage deeper reflection. Keep it under 50 words. \n\nJournal Entry: "${journalEntry}"`;

        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = ""; // Canvas will inject the API key here
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        let retries = 0;
        const maxRetries = 3;
        let success = false;

        while (retries < maxRetries && !success) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const result = await response.json();
                
                if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
                    journalInsightOutput.textContent = result.candidates[0].content.parts[0].text;
                    journalInsightOutput.classList.remove('hidden');
                    success = true;
                } else {
                    throw new Error("Invalid response structure from API");
                }
            } catch (error) {
                console.error('Error fetching journal insight:', error);
                retries++;
                if (retries >= maxRetries) {
                    journalInsightOutput.textContent = 'Sorry, I could not generate an insight at this time. Please try again later.';
                    journalInsightOutput.classList.remove('hidden');
                } else {
                    await new Promise(res => setTimeout(res, 1000 * Math.pow(2, retries)));
                }
            } finally {
                journalInsightLoading.classList.add('hidden');
            }
        }
    });


    // Privacy Consent Button Handlers (for initial Companion modal)
    acceptConsentBtn.addEventListener('click', () => {
        localStorage.setItem('companionConsent', 'true');
        navCompanion.classList.remove('disabled');
        window.location.hash = '#companion'; // Redirect to companion after consent
    });

    declineConsentBtn.addEventListener('click', () => {
        localStorage.setItem('companionConsent', 'false');
        navCompanion.classList.add('disabled');
        privacyConsentView.classList.add('hidden');
        window.location.hash = '#dashboard'; // Redirect to dashboard
        alert("You have declined consent for the Companion feature. It will remain disabled.");
    });


    // --- Settings Logic ---
    // Load initial settings from localStorage
    function loadSettings() {
        toggleDailyReminders.checked = localStorage.getItem('dailyReminders') === 'true';
        toggleInsightAlerts.checked = localStorage.getItem('insightAlerts') === 'true';
        toggleDarkMode.checked = localStorage.getItem('darkMode') === 'true';
        toggleReduceAnimations.checked = localStorage.getItem('reduceAnimations') === 'true';
        toggleShareAnonymizedData.checked = localStorage.getItem('shareAnonymizedData') === 'true';
        togglePersonalizedInsights.checked = localStorage.getItem('personalizedInsights') === 'true';

        // Apply dark mode immediately
        if (toggleDarkMode.checked) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
         // Apply reduce animations (placeholder for actual animation control)
        if (toggleReduceAnimations.checked) {
            document.body.classList.add('reduce-animations'); // Add a class to disable/reduce animations via CSS
        } else {
            document.body.classList.remove('reduce-animations');
        }
    }

    // Save settings to localStorage
    function saveSetting(key, value) {
        localStorage.setItem(key, value);
    }

    // Event listeners for settings toggles
    toggleDailyReminders.addEventListener('change', (e) => saveSetting('dailyReminders', e.target.checked));
    toggleInsightAlerts.addEventListener('change', (e) => saveSetting('insightAlerts', e.target.checked));
    toggleDarkMode.addEventListener('change', (e) => {
        saveSetting('darkMode', e.target.checked);
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });
    toggleReduceAnimations.addEventListener('change', (e) => {
        saveSetting('reduceAnimations', e.target.checked);
        if (e.target.checked) {
            document.body.classList.add('reduce-animations');
        } else {
            document.body.classList.remove('reduce-animations');
        }
    });
    toggleShareAnonymizedData.addEventListener('change', (e) => saveSetting('shareAnonymizedData', e.target.checked));
    togglePersonalizedInsights.addEventListener('change', (e) => saveSetting('personalizedInsights', e.target.checked));


    // Logout functionality
    logoutBtn.addEventListener('click', async () => {
        if (window.auth) {
            try {
                await signOut(window.auth);
                // Clear all local storage related to this user
                localStorage.clear();
                window.currentUserId = null;
                window.currentUserName = null;
                window.isAuthReady = false;
                window.isAuthenticated = false;
                alert("You have been logged out.");
                window.location.hash = '#landing-page'; // Go back to landing page
            } catch (error) {
                console.error("Error logging out:", error);
                alert("Error logging out. Please try again.");
            }
        }
    });

    // Data Privacy Settings View handlers
    openDataPrivacySettingsBtn.addEventListener('click', () => {
        window.location.hash = '#data-privacy-settings';
        updateCompanionConsentStatusDataPrivacy(); // Update status when view opens
    });

    dataPrivacyBackBtn.addEventListener('click', () => {
        window.location.hash = '#settings';
    });

    function updateCompanionConsentStatusDataPrivacy() {
        const consent = localStorage.getItem('companionConsent');
        if (consent === 'true') {
            companionConsentStatusDataPrivacy.textContent = 'Consented';
            companionConsentStatusDataPrivacy.classList.remove('text-red-500');
            companionConsentStatusDataPrivacy.classList.add('text-green-500');
            toggleCompanionConsentBtnDataPrivacy.textContent = 'Revoke Consent';
            toggleCompanionConsentBtnDataPrivacy.classList.remove('bg-blue-500');
            toggleCompanionConsentBtnDataPrivacy.classList.add('bg-red-500');
        } else {
            companionConsentStatusDataPrivacy.textContent = 'Not Consented';
            companionConsentStatusDataPrivacy.classList.remove('text-green-500');
            companionConsentStatusDataPrivacy.classList.add('text-red-500');
            toggleCompanionConsentBtnDataPrivacy.textContent = 'Grant Consent';
            toggleCompanionConsentBtnDataPrivacy.classList.remove('bg-red-500');
            toggleCompanionConsentBtnDataPrivacy.classList.add('bg-blue-500');
        }
    }

    toggleCompanionConsentBtnDataPrivacy.addEventListener('click', () => {
        const currentConsent = localStorage.getItem('companionConsent');
        if (currentConsent === 'true') {
            localStorage.setItem('companionConsent', 'false');
            alert("Companion AI data consent revoked. The Companion feature will now be disabled.");
        } else {
            localStorage.setItem('companionConsent', 'true');
            alert("Companion AI data consent granted. You can now use the Companion feature.");
        }
        updateCompanionConsentStatusDataPrivacy();
        // Re-evaluate nav link status for Companion
        if (localStorage.getItem('companionConsent') === 'false') {
            navCompanion.classList.add('disabled');
        } else {
            navCompanion.classList.remove('disabled');
        }
    });


    // --- Profile Settings Logic ---
    openProfileSettingsBtn.addEventListener('click', () => {
        window.location.hash = '#profile-settings';
        // Populate profile fields
        profileDisplayNameInput.value = window.currentUserName || '';
        profileEmailInput.value = window.auth.currentUser?.email || "guest@example.com"; // Use actual email if logged in
        memberSinceDate.textContent = "July 31, 2025"; // Static date for now
        updateProfileAvatar(window.currentUserName || 'CD');
    });

    profileBackBtn.addEventListener('click', () => {
        window.location.hash = '#settings';
    });

    saveProfileChangesBtn.addEventListener('click', () => {
        const newDisplayName = profileDisplayNameInput.value.trim();
        if (newDisplayName) {
            window.currentUserName = newDisplayName;
            localStorage.setItem(`beam_username_${window.currentUserId}`, newDisplayName);
            alert("Profile updated successfully!");
            updateProfileAvatar(newDisplayName);
            // Optionally, update Firestore user document if you had one for profile info
        } else {
            alert("Display Name cannot be empty.");
        }
    });

    function updateProfileAvatar(name) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        profileAvatar.textContent = initials;
    }


    // --- Activity Challenge Logic (formerly Step Challenge) ---
    // Helper to get the start of the current week (Monday)
    function getStartOfWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Monday start
        const startOfWeek = new Date(today.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    }

    // Helper to format date as YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Conversion factors for Activity Points
    // These are arbitrary and can be adjusted based on desired weighting
    const CONVERSION_FACTORS = {
        steps: 0.01,   // 100 steps = 1 point
        km: 100,       // 1 km = 100 points
        miles: 160,    // 1 mile = 160 points
        points: 1      // 1 point = 1 point (direct input)
    };

    function convertToActivityPoints(value, unit) {
        if (isNaN(value) || value <= 0) {
            return 0;
        }
        const factor = CONVERSION_FACTORS[unit] || 0;
        return value * factor;
    }

    // Save User Name (from activity challenge initial setup)
    saveUserNameBtn.addEventListener('click', () => {
        const userName = userNameInput.value.trim();
        if (userName) {
            window.currentUserName = userName;
            localStorage.setItem(`beam_username_${window.currentUserId}`, userName);
            userNameInputSection.classList.add('hidden');
            stepChallengeContent.classList.remove('hidden');
            activityMessage.textContent = `Welcome, ${userName}!`;
            listenForActivityUpdates(); // Start listening after name is saved
            listenForTeamUpdates(); // Start listening for team updates
        } else {
            activityMessage.textContent = "Please enter a name.";
        }
    });

    // Add Activity Points
    addActivityBtn.addEventListener('click', async () => {
        if (!window.db || !window.currentUserId || !window.currentUserName) {
            activityMessage.textContent = "App not ready. Please wait or refresh.";
            return;
        }

        const inputValue = parseFloat(activityInput.value);
        const unit = activityUnit.value;
        const activityPointsToAdd = convertToActivityPoints(inputValue, unit);

        if (isNaN(activityPointsToAdd) || activityPointsToAdd <= 0) {
            activityMessage.textContent = "Please enter a valid activity value.";
            return;
        }

        activityMessage.textContent = "Adding activity...";
        const todayDate = formatDate(new Date());
        const userActivityDocRef = doc(window.db, `artifacts/${__app_id}/public/data/activityChallenges`, window.currentUserId);

        try {
            const docSnap = await getDoc(userActivityDocRef);
            let userActivityData = docSnap.exists() ? docSnap.data() : { dailyActivity: {}, totalWeeklyActivityPoints: 0, userName: window.currentUserName, teamId: null, lastUpdated: new Date() };

            // Ensure userName is always up-to-date
            userActivityData.userName = window.currentUserName;

            // Update daily activity
            userActivityData.dailyActivity[todayDate] = (userActivityData.dailyActivity[todayDate] || 0) + activityPointsToAdd;
            
            // Recalculate total weekly activity points
            const startOfWeek = getStartOfWeek();
            let newTotalWeeklyActivityPoints = 0;
            for (const date in userActivityData.dailyActivity) {
                const day = new Date(date);
                if (day >= startOfWeek) {
                    newTotalWeeklyActivityPoints += userActivityData.dailyActivity[date];
                } else {
                    // Optionally clean up old daily entries
                    delete userActivityData.dailyActivity[date];
                }
            }
            userActivityData.totalWeeklyActivityPoints = newTotalWeeklyActivityPoints;
            userActivityData.lastUpdated = new Date();

            await setDoc(userActivityDocRef, userActivityData, { merge: true });
            activityInput.value = '';
            activityMessage.textContent = `Added ${activityPointsToAdd.toFixed(1)} activity points!`;

            // If user is part of a team, update team's activity points
            if (userActivityData.teamId) {
                const teamDocRef = doc(window.db, `artifacts/${__app_id}/public/data/teams`, userActivityData.teamId);
                await updateDoc(teamDocRef, {
                    totalWeeklyActivityPoints: FieldValue.increment(activityPointsToAdd),
                    lastUpdated: new Date()
                });
            }

        } catch (e) {
            console.error("Error adding activity: ", e);
            activityMessage.textContent = "Error adding activity. Please try again.";
        }
    });

    // Listen for real-time activity updates for current user and leaderboard
    let unsubscribeActivity = null; // To store the unsubscribe function
    function listenForActivityUpdates() {
        if (!window.db || !window.currentUserId) {
            console.warn("Firestore not ready for activity updates.");
            return;
        }

        if (unsubscribeActivity) {
            unsubscribeActivity(); // Unsubscribe from previous listener if exists
        }

        const challengeCollectionRef = collection(window.db, `artifacts/${__app_id}/public/data/activityChallenges`);
        const q = query(challengeCollectionRef);

        unsubscribeActivity = onSnapshot(q, (snapshot) => {
            const allUsersActivity = [];
            const startOfWeek = getStartOfWeek();
            let currentUserTotalActivityPoints = 0;
            let currentUserDailyActivityPoints = 0;
            let currentUserTeamId = null;
            const todayDate = formatDate(new Date());

            snapshot.forEach((doc) => {
                const data = doc.data();
                const userId = doc.id;
                let weeklyActivity = 0;

                // Aggregate weekly activity for each user
                if (data.dailyActivity) {
                    for (const date in data.dailyActivity) {
                        const day = new Date(date);
                        if (day >= startOfWeek) {
                            weeklyActivity += data.dailyActivity[date];
                        }
                    }
                }

                allUsersActivity.push({
                    userId: userId,
                    userName: data.userName || `User ${userId.substring(0, 4)}`, // Fallback name
                    totalWeeklyActivityPoints: weeklyActivity,
                    teamId: data.teamId || null
                });

                // Find current user's activity and team
                if (userId === window.currentUserId) {
                    currentUserTotalActivityPoints = weeklyActivity;
                    currentUserDailyActivityPoints = data.dailyActivity ? (data.dailyActivity[todayDate] || 0) : 0;
                    currentUserTeamId = data.teamId || null;
                }
            });

            // Update current user's display
            myTotalActivityPoints.textContent = currentUserTotalActivityPoints.toLocaleString(undefined, { maximumFractionDigits: 0 });
            myDailyActivityPoints.textContent = `Today: ${currentUserDailyActivityPoints.toLocaleString(undefined, { maximumFractionDigits: 0 })} points`;

            // Update user's team status
            updateTeamStatusUI(currentUserTeamId);

            // Sort individual leaderboard and display
            allUsersActivity.sort((a, b) => b.totalWeeklyActivityPoints - a.totalWeeklyActivityPoints);
            leaderboardList.innerHTML = ''; // Clear existing list

            if (allUsersActivity.length === 0) {
                leaderboardList.innerHTML = '<p class="text-gray-500">No activity recorded yet. Be the first!</p>';
            } else {
                allUsersActivity.forEach((user, index) => {
                    const isCurrentUser = user.userId === window.currentUserId;
                    const listItem = document.createElement('div');
                    listItem.className = `flex justify-between items-center p-2 rounded-lg ${isCurrentUser ? 'bg-purple-100 font-semibold' : 'bg-gray-50'}`;
                    listItem.innerHTML = `
                        <span>${index + 1}. ${user.userName} ${isCurrentUser ? '(You)' : ''}</span>
                        <span>${user.totalWeeklyActivityPoints.toLocaleString(undefined, { maximumFractionDigits: 0 })} points</span>
                    `;
                    leaderboardList.appendChild(listItem);
                });
            }
            leaderboardLoading.classList.add('hidden');

        }, (error) => {
            console.error("Error listening to activity updates:", error);
            leaderboardList.innerHTML = '<p class="text-red-500">Error loading leaderboard.</p>';
        });
    }

    // --- Team Management Logic ---
    let unsubscribeTeams = null; // To store the unsubscribe function for teams

    async function createTeam() {
        if (!window.db || !window.currentUserId || !window.currentUserName) {
            teamMessage.textContent = "App not ready. Please wait or refresh.";
            return;
        }
        const teamName = teamNameInput.value.trim();
        if (!teamName) {
            teamMessage.textContent = "Please enter a team name.";
            return;
        }

        teamMessage.textContent = "Creating team...";
        const teamDocRef = doc(window.db, `artifacts/${__app_id}/public/data/teams`, teamName);
        const userActivityDocRef = doc(window.db, `artifacts/${__app_id}/public/data/activityChallenges`, window.currentUserId);

        try {
            const teamSnap = await getDoc(teamDocRef);
            if (teamSnap.exists()) {
                teamMessage.textContent = "Team name already exists. Try joining or choose another name.";
                return;
            }

            // Check if user is already in a team
            const userSnap = await getDoc(userActivityDocRef);
            if (userSnap.exists() && userSnap.data().teamId) {
                teamMessage.textContent = `You are already part of team "${userSnap.data().teamId}". Please leave it first.`;
                return;
            }

            // Create team document
            await setDoc(teamDocRef, {
                teamName: teamName,
                totalWeeklyActivityPoints: 0, // Initialize with 0 activity points
                members: [window.currentUserId],
                createdAt: new Date()
            });

            // Update user's activity challenge data with teamId
            await updateDoc(userActivityDocRef, {
                teamId: teamName
            });

            teamNameInput.value = '';
            teamMessage.textContent = `Team "${teamName}" created successfully!`;
            updateTeamStatusUI(teamName);
            listenForTeamUpdates(); // Refresh team leaderboard
        } catch (e) {
            console.error("Error creating team:", e);
            teamMessage.textContent = "Error creating team. Please try again.";
        }
    }

    async function joinTeam() {
        if (!window.db || !window.currentUserId || !window.currentUserName) {
            teamMessage.textContent = "App not ready. Please wait or refresh.";
            return;
        }
        const teamName = teamNameInput.value.trim();
        if (!teamName) {
            teamMessage.textContent = "Please enter a team name to join.";
            return;
        }

        teamMessage.textContent = "Joining team...";
        const teamDocRef = doc(window.db, `artifacts/${__app_id}/public/data/teams`, teamName);
        const userActivityDocRef = doc(window.db, `artifacts/${__app_id}/public/data/activityChallenges`, window.currentUserId);

        try {
            const teamSnap = await getDoc(teamDocRef);
            if (!teamSnap.exists()) {
                teamMessage.textContent = "Team not found. Check the name or create a new one.";
                return;
            }

            // Check if user is already in a team
            const userSnap = await getDoc(userActivityDocRef);
            if (userSnap.exists() && userSnap.data().teamId) {
                teamMessage.textContent = `You are already part of team "${userSnap.data().teamId}". Please leave it first.`;
                return;
            }

            // Add user to team's members array
            const teamData = teamSnap.data();
            if (!teamData.members.includes(window.currentUserId)) {
                await updateDoc(teamDocRef, {
                    members: FieldValue.arrayUnion(window.currentUserId) // Use arrayUnion to add without duplicates
                });
            }

            // Update user's activity challenge data with teamId
            await updateDoc(userActivityDocRef, {
                teamId: teamName
            });

            teamNameInput.value = '';
            teamMessage.textContent = `Joined team "${teamName}" successfully!`;
            updateTeamStatusUI(teamName);
            listenForTeamUpdates(); // Refresh team leaderboard
        } catch (e) {
            console.error("Error joining team:", e);
            teamMessage.textContent = "Error joining team. Please try again.";
        }
    }

    async function leaveTeam() {
        if (!window.db || !window.currentUserId) {
            teamMessage.textContent = "App not ready. Please wait or refresh.";
            return;
        }

        teamMessage.textContent = "Leaving team...";
        const userActivityDocRef = doc(window.db, `artifacts/${__app_id}/public/data/activityChallenges`, window.currentUserId);

        try {
            const userSnap = await getDoc(userActivityDocRef);
            if (!userSnap.exists() || !userSnap.data().teamId) {
                teamMessage.textContent = "You are not currently part of any team.";
                return;
            }

            const currentTeamId = userSnap.data().teamId;
            const teamDocRef = doc(window.db, `artifacts/${__app_id}/public/data/teams`, currentTeamId);

            // Remove user from team's members array
            const teamSnap = await getDoc(teamDocRef);
            if (teamSnap.exists()) {
                const teamData = teamSnap.data();
                await updateDoc(teamDocRef, {
                    members: FieldValue.arrayRemove(window.currentUserId) // Use arrayRemove to remove
                });
            }

            // Remove teamId from user's activity challenge data
            await updateDoc(userActivityDocRef, {
                teamId: FieldValue.delete() // Use Firestore's delete field method
            });

            teamMessage.textContent = `Successfully left team "${currentTeamId}".`;
            updateTeamStatusUI(null); // Clear team status
            listenForTeamUpdates(); // Refresh team leaderboard
        } catch (e) {
            console.error("Error leaving team:", e);
            teamMessage.textContent = "Error leaving team. Please try again.";
        }
    }

    createTeamBtn.addEventListener('click', createTeam);
    joinTeamBtn.addEventListener('click', joinTeam);
    leaveTeamBtn.addEventListener('click', leaveTeam);

    function updateTeamStatusUI(teamId) {
        if (teamId) {
            currentTeamDisplay.textContent = `You are part of team: ${teamId}`;
            currentTeamActivityPoints.classList.remove('hidden'); // Points will be updated by listener
            teamJoinCreate.classList.add('hidden');
            leaveTeamBtn.classList.remove('hidden');
        } else {
            currentTeamDisplay.textContent = "You are not part of a team.";
            currentTeamActivityPoints.classList.add('hidden');
            teamJoinCreate.classList.remove('hidden');
            leaveTeamBtn.classList.add('hidden');
        }
    }

    function listenForTeamUpdates() {
        if (!window.db) {
            console.warn("Firestore not ready for team updates.");
            return;
        }

        if (unsubscribeTeams) {
            unsubscribeTeams();
        }

        const teamsCollectionRef = collection(window.db, `artifacts/${__app_id}/public/data/teams`);
        const q = query(teamsCollectionRef);

        unsubscribeTeams = onSnapshot(q, (snapshot) => {
            const allTeams = [];
            let currentUserTeamActivityPoints = 0;
            let currentUserTeamId = null;

            // First, find the current user's team ID from their activityChallenges document
            // This is important because the teamId might not be immediately updated in localStorage
            // after a join/create operation if the activityChallenges listener hasn't fired yet.
            const userActivityDocRef = doc(window.db, `artifacts/${__app_id}/public/data/activityChallenges`, window.currentUserId);
            getDoc(userActivityDocRef).then(userSnap => {
                if (userSnap.exists()) {
                    currentUserTeamId = userSnap.data().teamId || null;
                }

                snapshot.forEach((teamDoc) => {
                    const data = teamDoc.data();
                    const teamId = teamDoc.id;
                    allTeams.push({
                        teamId: teamId,
                        teamName: data.teamName, // Ensure teamName is captured
                        totalWeeklyActivityPoints: data.totalWeeklyActivityPoints || 0,
                        members: data.members || []
                    });

                    // Update current team's points if user is in this team
                    if (currentUserTeamId && currentUserTeamId === teamId) {
                        currentUserTeamActivityPoints = data.totalWeeklyActivityPoints || 0;
                    }
                });

                // Update current team's points display
                currentTeamActivityPoints.textContent = `Team Activity Points: ${currentUserTeamActivityPoints.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

                // Sort team leaderboard and display
                allTeams.sort((a, b) => b.totalWeeklyActivityPoints - a.totalWeeklyActivityPoints);
                teamLeaderboardList.innerHTML = ''; // Clear existing list

                if (allTeams.length === 0) {
                    teamLeaderboardList.innerHTML = '<p class="text-gray-500">No teams created yet. Be the first!</p>';
                } else {
                    allTeams.forEach((team, index) => {
                        const isCurrentUserTeam = (currentUserTeamId && team.teamId === currentUserTeamId);
                        const listItem = document.createElement('div');
                        listItem.className = `flex justify-between items-center p-2 rounded-lg ${isCurrentUserTeam ? 'bg-green-100 font-semibold' : 'bg-gray-50'}`;
                        listItem.innerHTML = `
                            <span>${index + 1}. ${team.teamName} (${team.members.length} members) ${isCurrentUserTeam ? '(Your Team)' : ''}</span>
                            <span>${team.totalWeeklyActivityPoints.toLocaleString(undefined, { maximumFractionDigits: 0 })} points</span>
                        `;
                        teamLeaderboardList.appendChild(listItem);
                    });
                }
                teamLeaderboardLoading.classList.add('hidden');
            }).catch(error => {
                console.error("Error fetching user's teamId:", error);
                teamLeaderboardList.innerHTML = '<p class="text-red-500">Error loading team leaderboard.</p>';
            });

        }, (error) => {
            console.error("Error listening to team updates:", error);
            teamLeaderboardList.innerHTML = '<p class="text-red-500">Error loading team leaderboard.</p>';
        });
    }


    // Function to switch between main views
    function switchView(view) {
        // --- DEVELOPMENT MODE BYPASS ---
        // Set this to true to bypass authentication checks for easier development/testing.
        // REMEMBER TO SET TO FALSE FOR PRODUCTION DEPLOYMENTS!
        const bypassAuthForDevelopment = true; 
        // --- END DEVELOPMENT MODE BYPASS ---

        // Hide all main views first
        landingPageView.classList.add('hidden');
        authView.classList.add('hidden');
        dashboardView.classList.add('hidden');
        checkInView.classList.add('hidden');
        companionView.classList.add('hidden');
        calmSpaceView.classList.add('hidden');
        stepChallengeView.classList.add('hidden'); // Refers to Activity Challenge
        settingsView.classList.add('hidden');
        profileSettingsView.classList.add('hidden');
        dataPrivacySettingsView.classList.add('hidden');
        privacyConsentView.classList.add('hidden');

        // Deactivate all nav links
        navDashboard.classList.remove('active');
        navCheckIn.classList.remove('active');
        navCompanion.classList.remove('active');
        navCalmSpace.classList.remove('active');
        navStepChallenge.classList.remove('active');
        navSettings.classList.remove('active');

        // Logic to handle authenticated vs. unauthenticated access
        const protectedViews = ['dashboard', 'check-in', 'companion', 'calm-space', 'step-challenge', 'settings', 'profile-settings', 'data-privacy-settings'];

        // Only apply authentication check if not in development bypass mode
        if (!bypassAuthForDevelopment && protectedViews.includes(view) && (!window.isAuthenticated && (!window.auth.currentUser || window.auth.currentUser.isAnonymous))) {
            // If trying to access a protected view and not authenticated, redirect to auth page
            window.location.hash = '#auth';
            return;
        }


        // Show the requested view and activate its nav link
        if (view === 'landing-page') {
            landingPageView.classList.remove('hidden');
            // No nav link active for landing page
            mobileNav.value = ''; // Clear mobile nav selection
        } else if (view === 'auth') {
            authView.classList.remove('hidden');
            // No nav link active for auth page
            mobileNav.value = ''; // Clear mobile nav selection
        } else if (view === 'dashboard') {
            dashboardView.classList.remove('hidden');
            navDashboard.classList.add('active');
            mobileNav.value = 'dashboard';
            // Start listening for dashboard updates when dashboard is active
            if (window.isAuthReady) {
                listenForDashboardUpdates();
            } else {
                document.addEventListener('firebaseAuthReady', listenForDashboardUpdates, { once: true });
            }
        } else if (view === 'check-in') {
            checkInView.classList.remove('hidden');
            navCheckIn.classList.add('active');
            mobileNav.value = 'check-in';
            currentCheckInStep = 0; // Reset to first step
            // Reset checkInScores to initial values or empty for a fresh check-in
            checkInScores.wellbeing = checkInQuestions[0].initial;
            checkInScores.safety = checkInQuestions[1].initial;
            checkInScores.inclusion = checkInQuestions[2].initial;
            checkInScores.reflection = "";
            renderCheckInStep();
        } else if (view === 'companion') {
            const consentGiven = localStorage.getItem('companionConsent');
            if (consentGiven === 'true') {
                companionView.classList.remove('hidden');
                navCompanion.classList.add('active');
                mobileNav.value = 'companion';
            } else if (consentGiven === 'false') {
                alert("The Companion feature is disabled as you have declined the privacy terms. You can re-enable it by going to Settings > Privacy Settings.");
                navCompanion.classList.add('disabled');
                window.location.hash = '#dashboard'; // Redirect to dashboard
            } else {
                // If consent is neither true nor false (i.e., null), show the initial consent modal
                privacyConsentView.classList.remove('hidden');
                navDashboard.classList.add('active'); // Keep dashboard active while modal is open
                mobileNav.value = 'dashboard';
            }
        } else if (view === 'calm-space') {
            calmSpaceView.classList.remove('hidden');
            navCalmSpace.classList.add('active');
            mobileNav.value = 'calm-space';
            updateCalmSpaceGreeting();
        } else if (view === 'step-challenge') { // Refers to Activity Challenge
            stepChallengeView.classList.remove('hidden');
            navStepChallenge.classList.add('active');
            mobileNav.value = 'step-challenge';
            
            if (window.isAuthReady && !window.currentUserName) {
                userNameInputSection.classList.remove('hidden');
                stepChallengeContent.classList.add('hidden');
            } else if (window.isAuthReady && window.currentUserName) {
                userNameInputSection.classList.add('hidden');
                stepChallengeContent.classList.remove('hidden');
                listenForActivityUpdates(); // Use new function
                listenForTeamUpdates(); // Start listening for team updates when activity challenge is active
            } else {
                document.addEventListener('firebaseAuthReady', () => {
                    if (!window.currentUserName) {
                        userNameInputSection.classList.remove('hidden');
                        stepChallengeContent.classList.add('hidden');
                    } else {
                        userNameInputSection.classList.add('hidden');
                        stepChallengeContent.classList.remove('hidden');
                        listenForActivityUpdates(); // Use new function
                        listenForTeamUpdates(); // Start listening for team updates
                    }
                }, { once: true });
            }
        } else if (view === 'settings') {
            settingsView.classList.remove('hidden');
            navSettings.classList.add('active');
            mobileNav.value = 'settings';
        } else if (view === 'profile-settings') {
            profileSettingsView.classList.remove('hidden');
            mobileNav.value = 'settings'; // Keep mobile nav on settings
        } else if (view === 'data-privacy-settings') {
            dataPrivacySettingsView.classList.remove('hidden');
            mobileNav.value = 'settings'; // Keep mobile nav on settings
            updateCompanionConsentStatusDataPrivacy(); // Update status when view opens
        }
    }

    // Handle hash changes for navigation
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1); // Remove '#'
        switchView(hash || 'landing-page'); // Default to landing-page if hash is empty
    });

    // Initial view load based on hash or default to landing page
    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
        switchView(initialHash);
    } else {
        switchView('landing-page');
    }

    // Initial setup on page load
    loadSettings(); // Load settings preferences
    // Check initial consent state for Companion nav link
    const initialConsent = localStorage.getItem('companionConsent');
    if (initialConsent === 'false') {
        navCompanion.classList.add('disabled');
    }
    
    // Ensure FieldValue is properly imported and used from firebase-firestore.js
    // This is already handled by the import statement at the top:
    // import { ..., FieldValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
    // So, 'FieldValue' can be used directly.
});
