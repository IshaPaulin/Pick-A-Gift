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

// AI Prompt Template
const PROMPT_TEMPLATE = `You are a thoughtful gifting expert who suggests practical, creative, and meaningful gifts.

Task:
Suggest 5 gift ideas based on the details below. The gifts should feel intentional, not generic.

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

Output format (strict JSON):
[
  {
    "gift": "Gift name",
    "why": "1–2 sentence explanation of why this gift fits the person and occasion",
    "price_range": "Approximate price"
  }
]`;

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
// FEEDBACK INPUT (Results page)
// ======================
const feedbackInput = document.getElementById("feedbackInput");
if (feedbackInput) {
  feedbackInput.addEventListener("input", (e) => {
    console.log("Feedback:", e.target.value);
    // TODO: Handle regenerating gifts with feedback
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
  
  return prompt;
}

// Generate gifts using AI (Claude API)
async function generateGifts(data) {
  console.log("Mock AI generating gifts with:", data);

  // Simulate network / AI thinking delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  return [
    {
      gift: "Specialty Coffee Sampler",
      why: "A curated set of coffee blends that feels thoughtful without adding clutter.",
      price_range: "₹800–1200"
    },
    {
      gift: "Minimal Desk Organizer",
      why: "Keeps their workspace tidy while matching a clean, aesthetic vibe.",
      price_range: "₹600–1000"
    },
    {
      gift: "Personalized Bookmark",
      why: "A subtle personal touch that feels intentional and useful for everyday reading.",
      price_range: "₹300–500"
    },
    {
      gift: "Scented Soy Candle",
      why: "Adds warmth to their space without being overpowering or generic.",
      price_range: "₹700–900"
    },
    {
      gift: "Compact Travel Mug",
      why: "Practical for daily routines and great for someone always on the move.",
      price_range: "₹900–1300"
    }
  ];
}

// Display gifts in the results section
function displayGifts(gifts) {
  // Get first 3 gifts for the cards
  const giftCards = [
    document.getElementById("gift1"),
    document.getElementById("gift2"),
    document.getElementById("gift3")
  ];
  
  gifts.slice(0, 3).forEach((gift, index) => {
    const card = giftCards[index];
    if (card) {
      card.innerHTML = `
        <div class="gift-content">
          <h3 class="gift-name">${gift.gift}</h3>
          <p class="gift-why">${gift.why}</p>
          <p class="gift-price">${gift.price_range}</p>
        </div>
      `;
    }
  });
  
  // Store remaining gifts for refresh functionality
  window.allGifts = gifts;
  window.currentGiftIndex = 3;
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