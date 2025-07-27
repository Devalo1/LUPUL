// Script Node.js pentru ștergerea completă a unui user din Firebase Authentication
// Folosește-l DOAR pe backend/local, nu în browser!

const admin = require("firebase-admin");
const path = require("path");

// Înlocuiește cu calea către cheia ta de service account descărcată din Firebase Console
const serviceAccount = require(path.resolve(__dirname, "serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const emailToDelete = process.argv[2]; // rulează: node admin-delete-firebase-user.js email@exemplu.com

if (!emailToDelete) {
  console.error("Te rog să specifici emailul ca argument: node admin-delete-firebase-user.js email@exemplu.com");
  process.exit(1);
}

async function deleteUserByEmail(email) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(userRecord.uid);
    console.log(`User with email ${email} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting user:", error.message);
  }
}

deleteUserByEmail(emailToDelete);
