/**
 * Hunarmand Smart Assistant Core Implementation Module
 */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Structural DOM Generation & Mounting Injector
    const chatbotWrapper = document.createElement("div");
    chatbotWrapper.id = "hunarmand-chatbot-container";
    chatbotWrapper.className = "chatbot-closed";

    chatbotWrapper.innerHTML = `
        <button id="chatbot-toggle-btn" aria-label="Toggle Support Assistant">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M12 2C6.477 2 2 4.134 2 9.24c0 2.421 1.012 4.619 2.664 6.223C4.24 17.113 3.146 18.083 3.11 18.115a1 1 0 0 0 .58 1.765c2.183-.004 4.07-.887 5.37-1.724A12.22 12.22 0 0 0 12 18.48c5.523 0 10-4.134 10-9.24C22 4.134 17.523 2 12 2zm0 13c-4.411 0-8-3.248-8-7.24c0-3.992 3.589-7.24 8-7.24s8 3.248 8 7.24c0 3.992-3.589 7.24-8 7.24z"/>
            </svg>
        </button>
        <div id="chatbot-window">
            <div id="chatbot-header">
                <div class="chatbot-info">
                    <div class="chatbot-avatar">H</div>
                    <div class="chatbot-details">
                        <h4>Hunarmand Assistant</h4>
                        <span>Online Assistance</span>
                    </div>
                </div>
                <button id="chatbot-close-btn">&times;</button>
            </div>
            <div id="chatbot-mode-bar">
                <button class="mode-btn active" data-mode="guest">Guest Mode</button>
                <button class="mode-btn" data-mode="user">User Mode</button>
                <button class="mode-btn" data-mode="worker">Worker Mode</button>
            </div>
            <div id="chatbot-messages"></div>
            <div id="chatbot-quick-replies"></div>
            <div id="chatbot-input-container">
                <input type="text" id="chatbot-input" placeholder="Ask me anything..." autocomplete="off">
                <button id="chatbot-send-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(chatbotWrapper);

    // 2. Element References Lookup
    const uiContainer = document.getElementById("hunarmand-chatbot-container");
    const toggleBtn = document.getElementById("chatbot-toggle-btn");
    const closeBtn = document.getElementById("chatbot-close-btn");
    const msgStream = document.getElementById("chatbot-messages");
    const inputField = document.getElementById("chatbot-input");
    const sendBtn = document.getElementById("chatbot-send-btn");
    const quickRepliesBox = document.getElementById("chatbot-quick-replies");
    const modeButtons = document.querySelectorAll(".mode-btn");

    // 3. Operational State Config Maps
    let activeMode = "guest"; 
    const modeWelcomeHistory = { guest: false, user: false, worker: false };

    // 4. Content Libraries
    const quickRepliesData = {
        guest: ["What is Hunarmand?", "How do I hire?", "Is it secure?", "Sign Up Profile"],
        user: ["Fix plumbing leak", "AC stopping cooling", "Short circuit issue", "Paint bedroom wall"],
        worker: ["Boost Low Bookings", "Profile Verification", "Payment Cycles", "5-Star Rating Tips"]
    };

    // 5. Floating Toggles event handlers
    toggleBtn.addEventListener("click", () => {
        const isOpen = uiContainer.classList.contains("chatbot-open");
        if (isOpen) {
            uiContainer.classList.replace("chatbot-open", "chatbot-closed");
        } else {
            uiContainer.classList.replace("chatbot-closed", "chatbot-open");
            if (!modeWelcomeHistory[activeMode]) triggerModeWelcome();
        }
    });

    closeBtn.addEventListener("click", () => {
        uiContainer.classList.replace("chatbot-open", "chatbot-closed");
    });

    // Tab switcher layout handler
    modeButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const targetMode = e.target.getAttribute("data-mode");
            if (targetMode === activeMode) return;

            modeButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            activeMode = targetMode;
            
            triggerModeWelcome();
        });
    });

    // 6. Dialogue Messaging Core Logic
    function appendMessage(text, sender) {
        const row = document.createElement("div");
        row.className = `msg-row ${sender === 'user' ? 'user-msg-row' : 'bot-msg-row'}`;
        
        const bubble = document.createElement("div");
        bubble.className = `msg-bubble ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
        bubble.innerHTML = text;
        
        row.appendChild(bubble);
        msgStream.appendChild(row);
        msgStream.scrollTop = msgStream.scrollHeight;
    }

    function renderTypingIndicator() {
        const row = document.createElement("div");
        row.className = "msg-row bot-msg-row typing-row";
        
        const bubble = document.createElement("div");
        bubble.className = "msg-bubble bot-msg";
        bubble.innerHTML = `
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        row.appendChild(bubble);
        msgStream.appendChild(row);
        msgStream.scrollTop = msgStream.scrollHeight;
        return row;
    }

    function loadQuickReplies(mode) {
        quickRepliesBox.innerHTML = "";
        const prompts = quickRepliesData[mode] || [];
        prompts.forEach(text => {
            const button = document.createElement("button");
            button.className = "quick-reply-pill";
            button.innerText = text;
            button.addEventListener("click", () => {
                appendMessage(text, "user");
                handleSystemInference(text);
            });
            quickRepliesBox.appendChild(button);
        });
    }

    function triggerModeWelcome() {
        msgStream.innerHTML = ""; 
        loadQuickReplies(activeMode);
        
        const indicator = renderTypingIndicator();
        setTimeout(() => {
            indicator.remove();
            let welcomeMsg = "";
            if (activeMode === "guest") {
                welcomeMsg = "Welcome to **Hunarmand** Pakistan! I'm your virtual guest assistant. How can I help guide your journey around our skilled trade ecosystem today?";
            } else if (activeMode === "user") {
                welcomeMsg = "Hello! Please briefly describe your domestic maintenance problem (e.g., 'water pipe is leaking' or 'the switch board is sparkling'). I will diagnose the correct worker category for you.";
            } else if (activeMode === "worker") {
                welcomeMsg = "Greetings, Partner. Welcome back to your operational workspace node. Mention issues with bookings, account verification documentation, or financial ledger questions for immediate feedback.";
            }
            appendMessage(welcomeMsg, "bot");
            modeWelcomeHistory[activeMode] = true;
        }, 850);
    }

    // 7. Text Inference Resolution Engine
    function handleSystemInference(userInput) {
        const cleanInput = userInput.toLowerCase();
        const indicator = renderTypingIndicator();

        setTimeout(() => {
            indicator.remove();
            let outputResponse = "";

            // --- CRITERIA 1: GUEST MODE INTELLIGENCE ---
            if (activeMode === "guest") {
                if (cleanInput.includes("what is") || cleanInput.includes("hunarmand")) {
                    outputResponse = "**Hunarmand** is Pakistan's premier on-demand digital ecosystem connecting vetted, highly skilled local technicians (plumbers, electricians, carpenters) with premium domestic service consumers.";
                } else if (cleanInput.includes("hire") || cleanInput.includes("how to")) {
                    outputResponse = "Hiring is straightforward. Switch to **User Mode** directly above, state your repair problem, find your verified specialist, and review consumer ratings profile boards instantly.";
                } else if (cleanInput.includes("secure") || cleanInput.includes("safe")) {
                    outputResponse = "Safety is paramount at Hunarmand. Every technician undergoes background checks, physical verification steps, and a strict CNIC compliance audit pipeline.";
                } else if (cleanInput.includes("sign up") || cleanInput.includes("profile") || cleanInput.includes("register")) {
                    outputResponse = "Ready to start? Click below to build your user profile node:<br><a href='auth.html' class='chat-redirect-btn'>Register New Account</a>";
                } else {
                    outputResponse = "I can answer FAQs about platform infrastructure, safety parameters, and signup guidelines. Feel free to use the quick prompts below.";
                }
            }

            // --- CRITERIA 2: USER MODE WORKER MATRICULATION ---
            else if (activeMode === "user") {
                let expertCategory = "";
                if (cleanInput.includes("leak") || cleanInput.includes("pipe") || cleanInput.includes("tap") || cleanInput.includes("water") || cleanInput.includes("flush") || cleanInput.includes("plumb")) {
                    expertCategory = "Plumber";
                    outputResponse = "Based on your technical summary, you need a professional **Plumber** to resolve line pressure and prevent structural water damage.";
                } else if (cleanInput.includes("wire") || cleanInput.includes("switch") || cleanInput.includes("short") || cleanInput.includes("light") || cleanInput.includes("fan") || cleanInput.includes("spark") || cleanInput.includes("ups") || cleanInput.includes("electric")) {
                    expertCategory = "Electrician";
                    outputResponse = "Caution: This appears to involve grid load infrastructure. Please choose a certified **Electrician** to manage wiring distribution or breaker points safely.";
                } else if (cleanInput.includes("ac") || cleanInput.includes("cooling") || cleanInput.includes("conditioner") || cleanInput.includes("chilling") || cleanInput.includes("fridge")) {
                    expertCategory = "AC Technician";
                    outputResponse = "This issue requires an experienced **AC & Cooling Appliance Specialist** to handle gas charges, compressor checks, or thermal diagnostics.";
                } else if (cleanInput.includes("paint") || cleanInput.includes("wall") || cleanInput.includes("color") || cleanInput.includes("scrape") || cleanInput.includes("cement")) {
                    expertCategory = "Painter";
                    outputResponse = "To refresh your surfaces or treat dampness, book a professional **Painter** to ensure smooth application and excellent finishes.";
                } else if (cleanInput.includes("door") || cleanInput.includes("lock") || cleanInput.includes("wood") || cleanInput.includes("table") || cleanInput.includes("chair") || cleanInput.includes("cabinet") || cleanInput.includes("carpenter")) {
                    expertCategory = "Carpenter";
                    outputResponse = "For structural framing, internal hardware alignment, or wooden furniture repairs, hire a skilled **Carpenter**.";
                }

                if (expertCategory) {
                    outputResponse += `<br><br>Click below to browse verified profiles:<br><a href='findworker.html?role=${expertCategory.toLowerCase()}' class='chat-redirect-btn'>Hire Verified ${expertCategory}</a>`;
                } else {
                    outputResponse = "Could you clarify if the issue relates to plumbing, electricity, cooling systems, woodwork, or wall painting? This helps me match you with the right professional.";
                }
            }

            // --- CRITERIA 3: WORKER MODE TROUBLESHOOTING ---
            else if (activeMode === "worker") {
                if (cleanInput.includes("booking") || cleanInput.includes("low") || cleanInput.includes("order") || cleanInput.includes("work")) {
                    outputResponse = "**Strategies to boost bookings:**<br>1. Complete 100% of your profile data fields.<br>2. Upload clear photos of your past work.<br>3. Keep your active operational toggle enabled.<br>4. Respond promptly to customer inquiries.";
                } else if (cleanInput.includes("verify") || cleanInput.includes("verification") || cleanInput.includes("cnic") || cleanInput.includes("document")) {
                    outputResponse = "Profile verification audits typically take **24-48 business hours**. Ensure your uploaded CNIC images are clear and your certification numbers are accurate.";
                } else if (cleanInput.includes("payment") || cleanInput.includes("money") || cleanInput.includes("withdraw") || cleanInput.includes("earning")) {
                    outputResponse = "Earnings are calculated dynamically and transferred to your registered digital wallet or bank profile every **Friday**. Track transaction logs in your app wallet.";
                } else if (cleanInput.includes("rating") || cleanInput.includes("star") || cleanInput.includes("review") || cleanInput.includes("feedback")) {
                    outputResponse = "Search indexing algorithms prioritize providers with strong ratings. Arrive on time, confirm task completion clearly, and communicate professional estimates to keep your ratings high.";
                } else {
                    outputResponse = "I can resolve issues regarding booking metrics, payment schedules, and profile verification workflows. Select a quick reply option for immediate details.";
                }
            }

            appendMessage(outputResponse, "bot");
        }, 1100);
    }

    // 8. Event Listener Key Handlers
    function triggerUserSubmission() {
        const promptText = inputField.value.trim();
        if (!promptText) return;

        appendMessage(promptText, "user");
        inputField.value = "";
        handleSystemInference(promptText);
    }

    sendBtn.addEventListener("click", triggerUserSubmission);
    inputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") triggerUserSubmission();
    });
});
