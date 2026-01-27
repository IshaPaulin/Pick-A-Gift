//script.js - VERCEL VERSION
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

// Generate gifts using AI (Gemini API via Vercel serverless function)
async function generateGifts(data) {
  try {
    const requestBody = {
      ...data,
      previouslyShown: previouslyShownGifts // Send exclusion list to backend
    };
    
    // ✅ CRITICAL: Use /api/generate for Vercel deployment
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

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
console.log("Gift Generator initialized - Vercel Version");