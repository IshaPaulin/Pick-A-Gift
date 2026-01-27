//script.js
// ======================
// STATE MANAGEMENT
// ======================
const formData = {
  occasion: null,
  recipient: null,
  budget: 100,
  style: null,
  notes: ""
};

// Track all previously suggested gifts
let previouslyShownGifts = [];

// AI Prompt Template
const PROMPT_TEMPLATE = `You are a thoughtful gifting expert who suggests practical, creative, and meaningful gifts.

Task:
Suggest 3 gift ideas based on the details below. The gifts should feel intentional, not generic.

Details:
Occasion: {{occasion}}
Recipient: {{recipient}}
Budget: ₹{{budget}}
Preferred gift style: {{style}}
Additional notes: {{notes}}

Rules:
- Stay within the given budget.
- Avoid cliché or overused gifts unless they are clearly justified.
- Prioritize usefulness, emotional value, or personalization.
- If details are vague, make reasonable assumptions and state them subtly.
- Keep gift names concise (max 8-10 words)
- Keep explanations brief and punchy (max 25-30 words, 1-2 sentences)
{{exclude_previous}}

Output format (strict JSON):
{
  "gifts": [
    {
      "gift": "Short, catchy gift name (max 10 words)",
      "why": "Brief, punchy explanation (max 30 words)",
      "price_range": "Approximate price"
    }
  ]
}`;

// ======================
// SECTION SWITCHING
// ======================
const sections = document.querySelectorAll(".section");

function showSection(id) {
  sections.forEach(section => section.classList.remove("active"));
  const targetSection = document.getElementById(id);
  if (targetSection) {
    targetSection.classList.add("active");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ======================
// LANDING PAGE
// ======================
const startBtn = document.getElementById("startBtn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    showSection("questions");
  });
}

// ======================
// OPTION SELECTION
// ======================
const optionGroups = document.querySelectorAll(".options[data-question]");

optionGroups.forEach(group => {
  const questionType = group.dataset.question;
  const options = group.querySelectorAll(".option");

  options.forEach(option => {
    option.addEventListener("click", () => {
      // Remove selection from siblings
      options.forEach(opt => opt.classList.remove("selected"));
      
      // Select clicked option
      option.classList.add("selected");
      
      // Store in formData
      formData[questionType] = option.dataset.value;
      
      console.log(`Selected ${questionType}:`, option.dataset.value);
    });
  });
});

// ======================
// BUDGET SLIDER
// ======================
const budgetRange = document.getElementById("budgetRange");
const budgetValue = document.getElementById("budgetValue");

if (budgetRange && budgetValue) {
  // Update display and gradient on input
  budgetRange.addEventListener("input", (e) => {
    const value = e.target.value;
    budgetValue.textContent = value;
    formData.budget = parseInt(value);
    
    // Update gradient fill
    const min = parseInt(e.target.min);
    const max = parseInt(e.target.max);
    const percentage = ((value - min) / (max - min)) * 100;
    
    e.target.style.background = `linear-gradient(to right, #0b2d4d 0%, #0b2d4d ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`;
  });
  
  // Initialize gradient
  budgetRange.dispatchEvent(new Event('input'));
}

// ======================
// ADDITIONAL INFO INPUT
// ======================
const additionalInfoInput = document.getElementById("additionalInfo");
if (additionalInfoInput) {
  additionalInfoInput.addEventListener("input", (e) => {
    formData.notes = e.target.value;
  });
}

// ======================
// GENERATE BUTTON
// ======================
const generateBtn = document.getElementById("generateBtn");
if (generateBtn) {
  generateBtn.addEventListener("click", async () => {
    console.log("Form Data:", formData);
    
    // Validation
    if (!formData.occasion || !formData.recipient) {
      alert("Please select an occasion and recipient!");
      return;
    }
    
    if (!formData.style) {
      alert("Please select a preferred gift style!");
      return;
    }
    
    // Reset previously shown gifts for new search
    previouslyShownGifts = [];
    
    // Show loading state
    generateBtn.textContent = "Generating ideas...";
    generateBtn.disabled = true;
    
    try {
      // Generate gifts
      const gifts = await generateGifts(formData);
      
      // Show results
      displayGifts(gifts);
      showSection("results");
    } catch (error) {
      console.error("Error generating gifts:", error);
      alert("Oops! Something went wrong. Please try again.");
    } finally {
      generateBtn.textContent = "Generate Ideas";
      generateBtn.disabled = false;
    }
  });
}

// ======================
// REFRESH BUTTON (Results page)
// ======================
const refreshBtn = document.getElementById("refreshBtn");
if (refreshBtn) {
  refreshBtn.addEventListener("click", async () => {
    const feedbackInput = document.getElementById("feedbackInput");
    const additionalFeedback = feedbackInput ? feedbackInput.value : "";
    
    // Show loading state
    refreshBtn.disabled = true;
    refreshBtn.style.opacity = "0.6";
    
    try {
      // Generate new gifts with additional feedback
      const updatedFormData = { ...formData };
      if (additionalFeedback) {
        updatedFormData.notes = formData.notes 
          ? `${formData.notes}. Also: ${additionalFeedback}` 
          : additionalFeedback;
      }
      
      const gifts = await generateGifts(updatedFormData);
      
      // Display new gifts
      displayGifts(gifts);
      
      // Clear feedback input
      if (feedbackInput) {
        feedbackInput.value = "";
      }
    } catch (error) {
      console.error("Error refreshing gifts:", error);
      alert("Oops! Couldn't refresh. Please try again.");
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.style.opacity = "1";
    }
  });
}

// ======================
// HELPER FUNCTIONS
// ======================

// Build prompt from template
function buildPrompt(data) {
  let prompt = PROMPT_TEMPLATE;
  
  prompt = prompt.replace('{{occasion}}', data.occasion || 'any occasion');
  prompt = prompt.replace('{{recipient}}', data.recipient || 'someone special');
  prompt = prompt.replace('{{budget}}', data.budget || '1000');
  prompt = prompt.replace('{{style}}', data.style || 'thoughtful');
  prompt = prompt.replace('{{notes}}', data.notes || 'No additional preferences');
  
  // Add exclusion list if we have previously shown gifts
  if (previouslyShownGifts.length > 0) {
    const exclusionText = `\n- DO NOT suggest any of these gifts that were already shown: ${previouslyShownGifts.join(', ')}`;
    prompt = prompt.replace('{{exclude_previous}}', exclusionText);
  } else {
    prompt = prompt.replace('{{exclude_previous}}', '');
  }
  
  return prompt;
}

// Generate gifts using AI (Gemini API via backend)
async function generateGifts(data) {
  try {
    const requestBody = {
      ...data,
      previouslyShown: previouslyShownGifts // Send exclusion list to backend
    };
    
    const response = await fetch("http://localhost:3000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    console.log("API response:", result);

    if (!result.gifts || !Array.isArray(result.gifts)) {
      throw new Error("Invalid response format from server");
    }

    // Add new gifts to the exclusion list
    result.gifts.forEach(gift => {
      if (gift.gift && !previouslyShownGifts.includes(gift.gift)) {
        previouslyShownGifts.push(gift.gift);
      }
    });

    return result.gifts;
  } catch (error) {
    console.error("Error generating gifts:", error);
    throw error;
  }
}

// Display gifts in the results section
function displayGifts(gifts) {
  if (!Array.isArray(gifts)) return;

  const giftCards = [
    document.getElementById("gift1"),
    document.getElementById("gift2"),
    document.getElementById("gift3")
  ];

  giftCards.forEach((card, index) => {
    if (!card || !gifts[index]) return;

    // Restart animation
    card.classList.remove("gift-card");
    void card.offsetWidth; // force reflow
    card.classList.add("gift-card");

    // Stagger animation
    card.style.animationDelay = `${index * 0.12}s`;

    const gift = gifts[index];
    card.innerHTML = `
      <div class="gift-content">
        <h3 class="gift-name">${gift.gift ?? "Gift idea"}</h3>
        <p class="gift-why">${gift.why ?? ""}</p>
        <p class="gift-price">${gift.price_range ?? ""}</p>
      </div>
    `;
  });
}

// Get form data as JSON (useful for API calls later)
function getFormData() {
  return JSON.stringify(formData);
}

// Reset form
function resetForm() {
  formData.occasion = null;
  formData.recipient = null;
  formData.budget = 100;
  formData.style = null;
  formData.notes = "";
  previouslyShownGifts = [];
  
  // Clear UI selections
  document.querySelectorAll(".option.selected").forEach(opt => {
    opt.classList.remove("selected");
  });
  
  if (budgetRange) {
    budgetRange.value = 100;
    budgetRange.dispatchEvent(new Event('input'));
  }
  
  if (additionalInfoInput) {
    additionalInfoInput.value = "";
  }
}

// Log for debugging
console.log("Gift Generator initialized");