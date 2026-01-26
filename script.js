// ======================
// STATE MANAGEMENT
// ======================
const formData = {
  occasion: null,
  recipient: null,
  budget: 100,
  style: null,
  additionalInfo: ""
};

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
    formData.additionalInfo = e.target.value;
  });
}

// ======================
// GENERATE BUTTON
// ======================
const generateBtn = document.getElementById("generateBtn");
if (generateBtn) {
  generateBtn.addEventListener("click", () => {
    console.log("Form Data:", formData);
    
    // Basic validation
    if (!formData.occasion || !formData.recipient) {
      alert("Please select an occasion and recipient!");
      return;
    }
    
    // Show results
    showSection("results");
    
    // TODO: Here you would normally fetch gift suggestions
    // For now, just showing the results page
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
  formData.additionalInfo = "";
  
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
// ======================
// REFRESH BUTTON
// ======================
const refreshBtn = document.getElementById("refreshBtn");
if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    console.log("Refreshing gifts with feedback:", feedbackInput.value);
    // TODO: Regenerate gifts based on feedback
    // You can call your gift generation function here
  });
}

// Log for debugging
console.log("Gift Generator initialized");