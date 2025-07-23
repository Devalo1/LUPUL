import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { isUserAdmin, MAIN_ADMIN_EMAIL } from "../utils/userRoles";

const ArticleDebugger: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [debugResults, setDebugResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addDebugMessage = (message: string) => {
    setDebugResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const clearDebugResults = () => {
    setDebugResults([]);
  };

  const testAdminStatus = async () => {
    setIsLoading(true);
    addDebugMessage("🔍 Testez statusul de admin...");

    try {
      if (!user) {
        addDebugMessage("❌ Nu există utilizator autentificat");
        return;
      }

      addDebugMessage(`📧 Email utilizator: ${user.email}`);
      addDebugMessage(`🎭 Status admin din context: ${isAdmin}`);

      // Test verificare direct prin email
      const isMainAdmin = user.email === MAIN_ADMIN_EMAIL;
      addDebugMessage(`👑 Este admin principal: ${isMainAdmin}`);

      // Test prin funcția de utilitate
      if (user.email) {
        const adminStatusFromFunction = await isUserAdmin(user.email);
        addDebugMessage(
          `🔧 Status admin din funcție: ${adminStatusFromFunction}`
        );
      }

      // Verificare în Firestore
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("email", "==", user.email));
      const userDocs = await getDocs(userQuery);

      if (!userDocs.empty) {
        const userData = userDocs.docs[0].data();
        addDebugMessage(
          `💾 Date utilizator din Firestore: ${JSON.stringify({
            isAdmin: userData.isAdmin,
            role: userData.role,
            email: userData.email,
          })}`
        );
      } else {
        addDebugMessage("❌ Nu s-a găsit utilizatorul în Firestore");
      }
    } catch (error) {
      addDebugMessage(`❌ Eroare la testarea statusului de admin: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testArticlePermissions = async () => {
    setIsLoading(true);
    addDebugMessage("📰 Testez permisiunile pentru articole...");

    try {
      // Test citire articole
      const articlesRef = collection(db, "articles");
      const articlesSnapshot = await getDocs(articlesRef);
      addDebugMessage(
        `✅ Citire articole: ${articlesSnapshot.size} articole găsite`
      );

      // Test creare articol (doar pentru admini)
      const testArticle = {
        title: `Test Article - ${new Date().toISOString()}`,
        content: "Acesta este un articol de test pentru debugging.",
        author: user?.displayName || "Test User",
        published: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        tags: ["test", "debugging"],
        preview: "Articol de test pentru verificarea funcționalității.",
      };

      try {
        const newDocRef = await addDoc(articlesRef, testArticle);
        addDebugMessage(
          `✅ Creare articol: Articol creat cu ID ${newDocRef.id}`
        );

        // Ștergem articolul de test
        await deleteDoc(doc(db, "articles", newDocRef.id));
        addDebugMessage(`🗑️ Articol de test șters cu succes`);
      } catch (createError: any) {
        addDebugMessage(
          `❌ Eroare la crearea articolului: ${createError.message}`
        );
        if (createError.code === "permission-denied") {
          addDebugMessage(
            "🚫 Acces interzis - probabil nu aveți drepturi de admin în Firestore Rules"
          );
        }
      }
    } catch (error: any) {
      addDebugMessage(`❌ Eroare la testarea permisiunilor: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testFirestoreRules = async () => {
    setIsLoading(true);
    addDebugMessage("🔐 Testez regulile Firestore...");

    try {
      // Test accesul la diverse colecții
      const collections = ["articles", "users", "products", "events"];

      for (const collectionName of collections) {
        try {
          const collectionRef = collection(db, collectionName);
          const snapshot = await getDocs(collectionRef);
          addDebugMessage(
            `✅ ${collectionName}: ${snapshot.size} documente citite`
          );
        } catch (error: any) {
          addDebugMessage(`❌ ${collectionName}: ${error.message}`);
        }
      }
    } catch (error: any) {
      addDebugMessage(`❌ Eroare la testarea regulilor: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runFullDiagnostic = async () => {
    clearDebugResults();
    addDebugMessage("🚀 Încep diagnosticul complet...");

    await testAdminStatus();
    await testFirestoreRules();
    await testArticlePermissions();

    addDebugMessage("✅ Diagnosticul s-a terminat!");
  };

  return (
    <div className="container mx-auto px-4 py-8 article-debugger-container">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">🔧 Debugger Articole</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Informații Utilizator Curent
          </h2>
          <div className="bg-gray-100 p-4 rounded">
            <p>
              <strong>Email:</strong> {user?.email || "Neautentificat"}
            </p>
            <p>
              <strong>Display Name:</strong> {user?.displayName || "N/A"}
            </p>
            <p>
              <strong>UID:</strong> {user?.uid || "N/A"}
            </p>
            <p>
              <strong>Status Admin (Context):</strong> {isAdmin ? "DA" : "NU"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={testAdminStatus}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Status Admin
          </button>

          <button
            onClick={testFirestoreRules}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Firestore Rules
          </button>

          <button
            onClick={testArticlePermissions}
            disabled={isLoading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Test Permisiuni Articole
          </button>

          <button
            onClick={runFullDiagnostic}
            disabled={isLoading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            Diagnostic Complet
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={clearDebugResults}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Șterge Rezultate
          </button>
        </div>

        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
          <h3 className="text-white mb-2">🖥️ Rezultate Debug:</h3>
          {debugResults.length === 0 ? (
            <p>Apăsați un buton pentru a începe debugging-ul...</p>
          ) : (
            debugResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
          {isLoading && (
            <div className="text-yellow-400">⏳ Se execută testul...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleDebugger;
