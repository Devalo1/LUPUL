// Test quick pentru vizibilitatea footer-ului
// Rulează în browser console pentru a verifica stilurile

console.log("🔍 Testing Footer Visibility...");

// Verifică dacă footer-ul există
const footer = document.querySelector("footer");
if (footer) {
  console.log("✅ Footer găsit!");

  // Verifică linkurile din secțiunea de conformitate
  const complianceLinks = footer.querySelectorAll(".footer-compliance-links a");
  console.log(`📋 Linkuri conformitate găsite: ${complianceLinks.length}`);

  complianceLinks.forEach((link, index) => {
    const styles = window.getComputedStyle(link);
    console.log(`Link ${index + 1}: ${link.textContent}`);
    console.log(`  - Color: ${styles.color}`);
    console.log(`  - Background: ${styles.backgroundColor}`);
  });

  // Verifică newsletter input
  const newsletterInput = footer.querySelector(".newsletter-input");
  if (newsletterInput) {
    const inputStyles = window.getComputedStyle(newsletterInput);
    console.log("📧 Newsletter input:");
    console.log(`  - Color: ${inputStyles.color}`);
    console.log(`  - Background: ${inputStyles.backgroundColor}`);
  }

  console.log("✅ Test completat! Verifică rezultatele de mai sus.");
} else {
  console.log("❌ Footer nu a fost găsit!");
}
