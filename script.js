// Grab elements
const startBtn = document.getElementById("startBtn");
const refreshBtn = document.getElementById("refreshBtn");

const hero = document.getElementById("hero");
const results = document.getElementById("results");

const gift1 = document.getElementById("gift1");
const gift2 = document.getElementById("gift2");
const gift3 = document.getElementById("gift3");

const feedback = document.getElementById("feedback");

// Sample gift ideas (placeholder logic)
const giftIdeas = [
  "Scented Candle",
  "Coffee Mug",
  "Desk Plant",
  "Notebook",
  "Wireless Charger",
  "Book",
  "Socks",
  "Photo Frame"
];

// Utility: get random gift
function getRandomGift() {
  const index = Math.floor(Math.random() * giftIdeas.length);
  return giftIdeas[index];
}

// Fill gift cards
function generateGifts() {
  gift1.textContent = getRandomGift();
  gift2.textContent = getRandomGift();
  gift3.textContent = getRandomGift();
}

// Start button → show results
startBtn.addEventListener("click", () => {
  hero.style.display = "none";
  results.style.display = "block";
  generateGifts();
});

// Refresh button → regenerate
refreshBtn.addEventListener("click", () => {
  console.log("User feedback:", feedback.value);
  generateGifts();
});
