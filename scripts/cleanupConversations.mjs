// Script pentru ștergerea conversațiilor fără userId sau cu userId greșit din Firestore
// Rulează: node scripts/cleanupConversations.mjs

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Înlocuiește cu lista de userId-uri valide dacă vrei să păstrezi doar pentru userii existenți
const VALID_USER_IDS = null; // sau ['uid1', 'uid2', ...]

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function cleanupConversations() {
  const snapshot = await db.collection("conversations").get();
  let deleted = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (
      !data.userId ||
      (VALID_USER_IDS && !VALID_USER_IDS.includes(data.userId))
    ) {
      console.log(`Șterg conversația ${doc.id} (userId: ${data.userId})`);
      await doc.ref.delete();
      deleted++;
    }
  }
  console.log(`Total conversații șterse: ${deleted}`);
}

cleanupConversations().catch(console.error);
