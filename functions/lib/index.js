// Import-uri corecte pentru Firebase Functions v2
import * as functionsV1 from "firebase-functions";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
// Import Firebase Admin corect pentru ESM
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
// Importă nodemailer și cors
import nodemailer from "nodemailer";
import cors from "cors";
// Inițializează Firebase Admin
initializeApp();
// Get Firestore, Storage și Auth
const firestore = getFirestore();
const storage = getStorage();
const auth = getAuth();
// Initialize CORS middleware with more permissive options for Cloud Functions
// @ts-ignore - Ignorăm eroarea de tipuri pentru cors
const corsHandler = cors({
    origin: true, // Permite orice origine, inclusiv localhost și domenii de producție
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials: true,
    maxAge: 3600,
    preflightContinue: false,
    allowedHeaders: [
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Headers"
    ]
});
// Create a nodemailer transporter using SMTP details
const transporter = nodemailer.createTransport({
    service: "gmail", // or your preferred email service
    auth: {
        user: process.env.EMAIL_USER, // Get from environment variables
        pass: process.env.EMAIL_PASSWORD // Get from environment variables
    }
});
// The email address to which admin notifications should be sent
const ADMIN_EMAIL = "dani_popa21@yahoo.ro"; // Replace with your admin email
// HTTP endpoint with CORS support (using v1 functions)
export const httpEventRegistration = functionsV1.https.onRequest((req, res) => {
    // Apply CORS middleware
    return corsHandler(req, res, async () => {
        // Only allow POST requests
        if (req.method !== "POST") {
            res.status(405).send({ error: "Method Not Allowed" });
            return;
        }
        try {
            const data = req.body;
            const { registrationId, eventId, eventTitle, participantName, participantEmail, participantPhone, additionalInfo } = data;
            // Validate required fields
            if (!eventId || !eventTitle || !participantName || !participantEmail) {
                res.status(400).send({ error: "Missing required fields" });
                return;
            }
            // Email content for admin
            const mailOptions = {
                from: "noreply@yourdomain.com", // Change to your domain
                to: ADMIN_EMAIL,
                subject: `Nouă înscriere la eveniment: ${eventTitle}`,
                html: `
          <h2>Detalii înscriere eveniment</h2>
          <p><strong>Eveniment:</strong> ${eventTitle}</p>
          <p><strong>ID Eveniment:</strong> ${eventId}</p>
          <p><strong>ID Înscriere:</strong> ${registrationId}</p>
          <h3>Detalii participant:</h3>
          <ul>
            <li><strong>Nume:</strong> ${participantName}</li>
            <li><strong>Email:</strong> ${participantEmail}</li>
            <li><strong>Telefon:</strong> ${participantPhone}</li>
            ${additionalInfo ? `<li><strong>Informații suplimentare:</strong> ${additionalInfo}</li>` : ""}
          </ul>
          <p>Puteți gestiona înscrierile din panoul de administrare.</p>
        `
            };
            // Send email to admin
            await transporter.sendMail(mailOptions);
            // Also send a confirmation email to the participant
            const userMailOptions = {
                from: "noreply@yourdomain.com",
                to: participantEmail,
                subject: `Confirmare înscriere: ${eventTitle}`,
                html: `
          <h2>Confirmare înscriere la eveniment</h2>
          <p>Mulțumim pentru înscrierea la evenimentul "${eventTitle}".</p>
          <p><strong>Detalii înregistrate:</strong></p>
          <ul>
            <li><strong>Nume:</strong> ${participantName}</li>
            <li><strong>Email:</strong> ${participantEmail}</li>
            <li><strong>Telefon:</strong> ${participantPhone}</li>
          </ul>
          <p>Vă vom contacta cu mai multe informații înainte de eveniment.</p>
          <p>Dacă aveți întrebări, nu ezitați să ne contactați.</p>
        `
            };
            await transporter.sendMail(userMailOptions);
            // Return success response
            res.status(200).send({ success: true });
        }
        catch (error) {
            console.error("Error sending email notification:", error);
            res.status(500).send({ error: "Failed to send notification email" });
        }
    });
});
// Folosim onCall din Firebase Functions v2
export const sendEventRegistrationNotification = onCall(async (request) => {
    // Check if user is authenticated
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    try {
        // Tipăm corect datele ca unknown întâi pentru a evita erorile TypeScript
        const data = request.data;
        const { registrationId, eventId, eventTitle, participantName, participantEmail, participantPhone, additionalInfo } = data;
        // Email content
        const mailOptions = {
            from: "noreply@yourdomain.com", // Change to your domain
            to: ADMIN_EMAIL,
            subject: `Nouă înscriere la eveniment: ${eventTitle}`,
            html: `
        <h2>Detalii înscriere eveniment</h2>
        <p><strong>Eveniment:</strong> ${eventTitle}</p>
        <p><strong>ID Eveniment:</strong> ${eventId}</p>
        <p><strong>ID Înscriere:</strong> ${registrationId}</p>
        <h3>Detalii participant:</h3>
        <ul>
          <li><strong>Nume:</strong> ${participantName}</li>
          <li><strong>Email:</strong> ${participantEmail}</li>
          <li><strong>Telefon:</strong> ${participantPhone}</li>
          ${additionalInfo ? `<li><strong>Informații suplimentare:</strong> ${additionalInfo}</li>` : ""}
        </ul>
        <p>Puteți gestiona înscrierile din panoul de administrare.</p>
      `
        };
        // Send email
        await transporter.sendMail(mailOptions);
        // Also send a confirmation email to the participant
        const userMailOptions = {
            from: "noreply@yourdomain.com",
            to: participantEmail,
            subject: `Confirmare înscriere: ${eventTitle}`,
            html: `
        <h2>Confirmare înscriere la eveniment</h2>
        <p>Mulțumim pentru înscrierea la evenimentul "${eventTitle}".</p>
        <p><strong>Detalii înregistrate:</strong></p>
        <ul>
          <li><strong>Nume:</strong> ${participantName}</li>
          <li><strong>Email:</strong> ${participantEmail}</li>
          <li><strong>Telefon:</strong> ${participantPhone}</li>
        </ul>
        <p>Vă vom contacta cu mai multe informații înainte de eveniment.</p>
        <p>Dacă aveți întrebări, nu ezitați să ne contactați.</p>
      `
        };
        await transporter.sendMail(userMailOptions);
        return { success: true };
    }
    catch (error) {
        console.error("Error sending email notification:", error);
        throw new HttpsError("internal", "Failed to send notification email");
    }
});
// Folosim onDocumentCreated din Firebase Functions v2
export const onNewEventRegistration = onDocumentCreated("eventRegistrations/{registrationId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return null;
    }
    const registrationData = snapshot.data();
    const registrationId = event.params.registrationId;
    // Only proceed if we have all the necessary data
    if (!registrationData || !registrationData.eventId || !registrationData.name) {
        console.log("Missing registration data, aborting email notification");
        return null;
    }
    try {
        // Get event details
        const eventDoc = await firestore.doc(`events/${registrationData.eventId}`).get();
        if (!eventDoc.exists) {
            console.log("Event not found");
            return null;
        }
        const eventData = eventDoc.data() || {};
        // Prepare email content
        const mailOptions = {
            from: "noreply@yourdomain.com", // Change to your domain
            to: ADMIN_EMAIL,
            subject: `Nouă înscriere la eveniment: ${eventData.title || "Eveniment"}`,
            html: `
        <h2>Detalii înscriere eveniment</h2>
        <p><strong>Eveniment:</strong> ${eventData.title || "Titlu eveniment nedisponibil"}</p>
        <p><strong>ID Eveniment:</strong> ${registrationData.eventId}</p>
        <p><strong>ID Înscriere:</strong> ${registrationId}</p>
        <h3>Detalii participant:</h3>
        <ul>
          <li><strong>Nume:</strong> ${registrationData.name}</li>
          <li><strong>Email:</strong> ${registrationData.email}</li>
          <li><strong>Telefon:</strong> ${registrationData.phone}</li>
          ${registrationData.additionalInfo ? `<li><strong>Informații suplimentare:</strong> ${registrationData.additionalInfo}</li>` : ""}
        </ul>
        <p>Puteți gestiona înscrierile din panoul de administrare.</p>
      `
        };
        // Send email to admin
        await transporter.sendMail(mailOptions);
        // Also send confirmation email to participant
        if (registrationData.email) {
            const userMailOptions = {
                from: "noreply@yourdomain.com",
                to: registrationData.email,
                subject: `Confirmare înscriere: ${eventData.title || "Eveniment"}`,
                html: `
          <h2>Confirmare înscriere la eveniment</h2>
          <p>Mulțumim pentru înscrierea la evenimentul "${eventData.title || "Eveniment"}".</p>
          <p><strong>Detalii înregistrate:</strong></p>
          <ul>
            <li><strong>Nume:</strong> ${registrationData.name}</li>
            <li><strong>Email:</strong> ${registrationData.email}</li>
            <li><strong>Telefon:</strong> ${registrationData.phone}</li>
          </ul>
          <p>Vă vom contacta cu mai multe informații înainte de eveniment.</p>
          <p>Dacă aveți întrebări, nu ezitați să ne contactați.</p>
        `
            };
            await transporter.sendMail(userMailOptions);
        }
        return null;
    }
    catch (error) {
        console.error("Error sending email notification:", error);
        return null;
    }
});
// Funcție pentru proxy-ul de analytics (using v1 functions)
export const analyticsProxy = functionsV1.https.onRequest(async (request, response) => {
    // Aplicăm middleware-ul CORS pentru o gestionare mai consistentă
    return corsHandler(request, response, async () => {
        try {
            // Aici poți implementa logica reală de proxy către serviciul tău de analytics
            // sau să salvezi datele direct în Firestore pentru analiza ulterioară
            // Exemplu: Salvare în Firestore
            if (request.method === "POST" && request.body) {
                await firestore.collection("analytics").add({
                    timestamp: FieldValue.serverTimestamp(),
                    data: request.body,
                    userAgent: request.headers["user-agent"] || "unknown",
                    ip: request.ip || "unknown"
                });
            }
            // Răspuns de succes
            response.status(200).json({ success: true });
        }
        catch (error) {
            console.error("Eroare în proxy-ul de analytics:", error);
            response.status(500).json({ error: "Internal server error" });
        }
    });
});
// Folosim onCall din Firebase Functions v2
export const uploadProfilePhoto = onCall(async (request) => {
    // Verifică dacă utilizatorul este autentificat
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "Trebuie să fiți autentificat pentru a utiliza această funcție.");
    }
    try {
        const { photoBase64, userId } = request.data;
        // Verifică dacă este utilizatorul actual sau un admin
        if (request.auth.uid !== userId) {
            // Verifică dacă este admin
            const userRecord = await auth.getUser(request.auth.uid);
            const customClaims = userRecord.customClaims || {};
            if (!customClaims.admin) {
                throw new HttpsError("permission-denied", "Nu aveți permisiunea de a actualiza fotografia altui utilizator.");
            }
        }
        // Verifică dacă base64 este valid
        if (!photoBase64 || typeof photoBase64 !== "string" || !photoBase64.startsWith("data:image/")) {
            throw new HttpsError("invalid-argument", "Formatul imaginii nu este valid.");
        }
        // Extrage datele din string-ul base64
        const matches = photoBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new HttpsError("invalid-argument", "Formatul base64 nu este valid.");
        }
        const contentType = matches[1];
        const base64EncodedImageString = matches[2];
        const imageBuffer = Buffer.from(base64EncodedImageString, "base64");
        // Creează un timestamp unic pentru a preveni cache-ul
        const timestamp = Date.now();
        const photoFileName = `profile_photos/${userId}_${timestamp}.jpg`;
        // Încarcă imaginea în Storage
        const bucket = storage.bucket();
        const file = bucket.file(photoFileName);
        await file.save(imageBuffer, {
            metadata: {
                contentType,
                metadata: {
                    firebaseStorageDownloadTokens: userId,
                }
            }
        });
        // Generează URL pentru imagine
        const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(photoFileName)}?alt=media&token=${userId}&t=${timestamp}`;
        // Batch update pentru toate referințele din Firestore
        const batch = firestore.batch();
        // 1. Actualizează documentul utilizatorului
        const userRef = firestore.collection("users").doc(userId);
        batch.update(userRef, {
            photoURL: downloadURL,
            photoTimestamp: timestamp
        });
        // 2. Verifică dacă utilizatorul este specialist și actualizează documentul specialist
        const specialistRef = firestore.collection("specialists").doc(userId);
        const specialistDoc = await specialistRef.get();
        if (specialistDoc.exists) {
            batch.update(specialistRef, {
                photoURL: downloadURL,
                photoTimestamp: timestamp
            });
        }
        // 3. Actualizează orice alt document care ar putea avea referințe către fotografia de profil
        // De exemplu: appointments, reviews, etc.
        const appointmentsSnapshot = await firestore.collection("appointments")
            .where("specialistId", "==", userId)
            .get();
        appointmentsSnapshot.forEach(doc => {
            batch.update(doc.ref, {
                specialistPhotoURL: downloadURL,
                photoTimestamp: timestamp
            });
        });
        // 4. Actualizează și profilul de autentificare cu noul URL
        await auth.updateUser(userId, {
            photoURL: downloadURL
        });
        // Execută toate actualizările ca batch
        await batch.commit();
        return {
            success: true,
            photoURL: downloadURL,
            timestamp: timestamp
        };
    }
    catch (error) {
        console.error("Eroare la încărcarea fotografiei de profil:", error);
        throw new HttpsError("internal", "Nu s-a putut încărca fotografia de profil.");
    }
});
//# sourceMappingURL=index.js.map