import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

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

exports.sendEventRegistrationNotification = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  try {
    const {
      registrationId,
      eventId,
      eventTitle,
      participantName,
      participantEmail,
      participantPhone,
      additionalInfo
    } = data;

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
  } catch (error) {
    console.error("Error sending email notification:", error);
    throw new functions.https.HttpsError("internal", "Failed to send notification email");
  }
});

// You can also create a Firestore trigger as an alternative approach
exports.onNewEventRegistration = functions.firestore
  .document("eventRegistrations/{registrationId}")
  .onCreate(async (snapshot, context) => {
    const registrationData = snapshot.data();
    const registrationId = context.params.registrationId;

    // Only proceed if we have all the necessary data
    if (!registrationData || !registrationData.eventId || !registrationData.name) {
      console.log("Missing registration data, aborting email notification");
      return null;
    }

    try {
      // Get event details
      const eventDoc = await admin.firestore().doc(`events/${registrationData.eventId}`).get();
      
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
    } catch (error) {
      console.error("Error sending email notification:", error);
      return null;
    }
  });
