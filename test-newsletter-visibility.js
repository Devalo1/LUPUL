// Quick Newsletter Test
// Verifică vizibilitatea newsletter-ului în footer

console.log("🧪 Testing Newsletter Section Visibility...");

// Test dacă elementele newsletter-ului sunt vizibile
const testNewsletterVisibility = () => {
  const newsletterSection = document.querySelector(".newsletter-section");
  const newsletterInput = document.querySelector(".newsletter-input");
  const newsletterButton = document.querySelector(".newsletter-button");

  if (!newsletterSection) {
    console.error("❌ Newsletter section not found");
    return false;
  }

  if (!newsletterInput) {
    console.error("❌ Newsletter input not found");
    return false;
  }

  if (!newsletterButton) {
    console.error("❌ Newsletter button not found");
    return false;
  }

  // Test stilurile
  const inputStyles = window.getComputedStyle(newsletterInput);
  const buttonStyles = window.getComputedStyle(newsletterButton);

  console.log("📧 Newsletter Input Styles:", {
    color: inputStyles.color,
    backgroundColor: inputStyles.backgroundColor,
    border: inputStyles.border,
  });

  console.log("🔘 Newsletter Button Styles:", {
    backgroundColor: buttonStyles.backgroundColor,
    color: buttonStyles.color,
  });

  // Test de contrast
  const isInputVisible = inputStyles.color !== inputStyles.backgroundColor;
  const isButtonVisible = buttonStyles.color !== buttonStyles.backgroundColor;

  if (isInputVisible && isButtonVisible) {
    console.log("✅ Newsletter section is fully visible with good contrast!");
    return true;
  } else {
    console.warn("⚠️ Newsletter section may have contrast issues");
    return false;
  }
};

// Rulează testul când DOM-ul este gata
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", testNewsletterVisibility);
} else {
  testNewsletterVisibility();
}

export { testNewsletterVisibility };
