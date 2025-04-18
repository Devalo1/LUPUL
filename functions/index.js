import functions from "firebase-functions";
import nodemailer from "nodemailer";
import cors from "cors";

// Configure CORS with proper options
const corsMiddleware = cors({
  origin: 'https://lupulsicorbul.com', // Permite cereri doar din domeniul tău
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Permite trimiterea cookie-urilor
});

// Configurare Nodemailer cu Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "popa.dumitru.fv.5@gmail.com", // Adresa ta Gmail
    pass: "gltf gfzy vmhv vtcx", // Parola de aplicație generată
  },
});

// Funcție pentru generarea unui număr de comandă unic
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `LC-${year}${month}${day}-${randomPart}`;
};

// Funcție pentru trimiterea comenzilor prin e-mail
export const sendOrderEmail = functions.https.onRequest((req, res) => {
  // Apply CORS middleware first, before any other processing
  return corsMiddleware(req, res, async () => {
    console.log('Function invoked with method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers));
    
    // Handle preflight requests separately
    if (req.method === 'OPTIONS') {
      // Preflight is already handled by corsMiddleware
      res.status(204).send('');
      return;
    }

    console.log('Request received:', req.body);
    console.log('Request body:', req.body);

    // Verificăm metoda HTTP
    if (req.method !== "POST") {
      console.error('Invalid method:', req.method);
      return res.status(405).send("Method Not Allowed");
    }

    // Verificăm câmpurile obligatorii
    const { name, address, phone, paymentMethod, items, email, participant } = req.body || {};

    if (!name || !address || !phone || !paymentMethod || !items) {
      console.error('Missing fields in request body');
      return res.status(400).send("Bad Request: Missing fields");
    }

    // Generăm număr de comandă unic
    const orderNumber = generateOrderNumber();
    console.log('Order number generated:', orderNumber);

    console.log('Request body:', req.body);
    console.log('Order details:', { orderNumber, name, address, phone, paymentMethod, items, participant });

    const orderDetails = items
      .map(
        (item) =>
          `- ${item.name} (Cantitate: ${item.quantity}, Preț: ${item.price} RON)`
      )
      .join("\n");

    // Include participant information if available
    const participantInfo = participant ? 
      `
      Informații participant:
      - Nume complet: ${participant.fullName || 'N/A'}
      - Așteptări: ${participant.expectations || 'N/A'}` : '';

    // Create mail options with more detailed debugging
    console.log('Attempting to send email with the following configuration:');
    console.log('From:', "popa.dumitru.fv.5@gmail.com");
    console.log('To:', "popa.dumitru.fv.5@gmail.com");
    console.log('Subject:', `Nouă comandă primită (${orderNumber})`);
    
    const mailOptions = {
      from: "popa.dumitru.fv.5@gmail.com",
      to: "popa.dumitru.fv.5@gmail.com", 
      subject: `Nouă comandă primită (${orderNumber})`,
      text: `Detalii comandă:
      - Număr comandă: ${orderNumber}
      - Nume: ${name}
      - Adresă: ${address}
      - Telefon: ${phone}
      - Metoda de plată: ${paymentMethod}
      - Produse:
      ${orderDetails}${participantInfo}`,
    };

    // Verify transporter before sending
    console.log('Verifying email transporter...');
    try {
      await transporter.verify();
      console.log('Transporter verification passed');
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      // Continue anyway, just for diagnostic purposes
    }

    // Transformăm callback-ul în promisiune pentru a gestiona mai bine răspunsul
    const sendMail = () => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            console.error("Error details:", JSON.stringify(error));
            reject(error);
          } else {
            console.log("Email sent successfully!");
            console.log("Response:", info.response);
            console.log("Message ID:", info.messageId);
            resolve(info);
          }
        });
      });
    };

    // Trimitem e-mailul și gestionăm răspunsul
    try {
      const info = await sendMail();
      console.log("Email successfully processed:", info);
      return res.status(200).json({
        success: true,
        message: "Order email sent successfully",
        orderNumber: orderNumber,
        emailInfo: {
          messageId: info.messageId,
          response: info.response
        }
      });
    } catch (error) {
      console.error("Failed to send email - detailed error:", error);
      return res.status(500).json({
        success: false,
        status: {
          code: 13,
          message: "Could not send the email",
          details: error.message
        }
      });
    }
  });
});

// Funcție pentru trimiterea notificărilor de înscriere la evenimente
export const sendEventRegistrationEmail = functions.https.onRequest((req, res) => {
  // Aplicăm middleware-ul CORS
  return corsMiddleware(req, res, async () => {
    console.log('Event Registration function invoked with method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers));
    
    // Handle preflight requests separately
    if (req.method === 'OPTIONS') {
      // Preflight is already handled by corsMiddleware
      res.status(204).send('');
      return;
    }

    console.log('Event registration request received:', req.body);
    
    // Verificăm metoda HTTP
    if (req.method !== "POST") {
      console.error('Invalid method:', req.method);
      return res.status(405).send("Method Not Allowed");
    }

    // Extrage datele - fie direct, fie din obiectul data (cum este trimis de callable functions)
    const requestData = req.body.data || req.body;
    console.log('Extracted request data:', requestData);

    // Verificăm câmpurile obligatorii
    const { eventId, eventTitle, eventDate, eventLocation, participantCount, user, participant } = requestData;

    if (!eventId || !eventTitle || !user) {
      console.error('Missing fields in request data');
      console.error('eventId:', eventId);
      console.error('eventTitle:', eventTitle); 
      console.error('user:', user);
      return res.status(400).send("Bad Request: Missing fields");
    }

    // Include participant information if available
    const participantInfo = participant ? 
      `
      Informații participant:
      - Nume complet: ${participant.fullName || 'N/A'}
      - Așteptări: ${participant.expectations || 'N/A'}
      - Vârstă: ${participant.age || 'N/A'}` : '';

    // Create proper email (not test email) - matching order email format
    console.log('Attempting to send event registration email with the following configuration:');
    console.log('From:', "popa.dumitru.fv.5@gmail.com");
    console.log('To:', "popa.dumitru.fv.5@gmail.com");
    console.log('Subject:', `Înscriere nouă la eveniment: ${eventTitle}`);
    
    const mailOptions = {
      from: "popa.dumitru.fv.5@gmail.com",
      to: "popa.dumitru.fv.5@gmail.com",
      subject: `Înscriere nouă la eveniment: ${eventTitle}`,
      text: `Detalii înscriere la eveniment:
      - Eveniment: ${eventTitle}
      - ID Eveniment: ${eventId}
      - Data: ${eventDate || 'Necunoscută'}
      - Locație: ${eventLocation || 'Necunoscută'}
      - Număr total participanți: ${participantCount || 1}
      
      Detalii participant:
      - ID Utilizator: ${user.id}
      - Email: ${user.email || 'Necunoscut'}
      - Nume: ${user.displayName || 'Necunoscut'}${participantInfo}
      
      Această înscriere a fost înregistrată la ${new Date().toLocaleString('ro-RO')}.`,
    };

    // Verify transporter before sending
    console.log('Verifying email transporter...');
    try {
      await transporter.verify();
      console.log('Transporter verification passed');
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      // Continue anyway, just for diagnostic purposes
    }

    // Transformăm callback-ul în promisiune cu mai multe detalii de logging
    const sendMail = () => {
      return new Promise((resolve, reject) => {
        console.log('Attempting to send event registration email...');
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            console.error("Error details:", JSON.stringify(error));
            reject(error);
          } else {
            console.log("Event registration email sent successfully!");
            console.log("Response:", info.response);
            console.log("Message ID:", info.messageId);
            resolve(info);
          }
        });
      });
    };

    // Trimitem e-mailul și gestionăm răspunsul cu mai multe detalii
    try {
      const info = await sendMail();
      console.log("Event registration email successfully processed:", info);
      
      // Dacă cererea a venit de la o funcție callable, răspundem în formatul corect
      if (req.body.data) {
        return res.status(200).json({
          result: {
            success: true,
            message: "Event registration email sent successfully",
            emailInfo: {
              messageId: info.messageId,
              response: info.response
            }
          }
        });
      } else {
        // Răspuns normal pentru cereri HTTP directe
        return res.status(200).json({
          success: true,
          message: "Event registration email sent successfully",
          emailInfo: {
            messageId: info.messageId,
            response: info.response
          }
        });
      }
    } catch (error) {
      console.error("Failed to send event registration email - detailed error:", error);
      
      // Răspuns pentru erori
      if (req.body.data) {
        return res.status(500).json({
          error: {
            code: 13,
            message: "Could not send the registration email",
            details: error.message
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          status: {
            code: 13,
            message: "Could not send the registration email",
            details: error.message
          }
        });
      }
    }
  });
});

// Funcție pentru trimiterea detaliilor participanților prin e-mail
export const sendParticipantDetailsEmail = functions.https.onRequest((req, res) => {
  // Aplicăm middleware-ul CORS
  return corsMiddleware(req, res, async () => {
    console.log('Participant Details function invoked with method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers));
    
    // Handle preflight requests separately
    if (req.method === 'OPTIONS') {
      // Preflight is already handled by corsMiddleware
      res.status(204).send('');
      return;
    }

    console.log('Participant details request received:', req.body);

    // Verificăm metoda HTTP
    if (req.method !== "POST") {
      console.error('Invalid method:', req.method);
      return res.status(405).send("Method Not Allowed");
    }

    // Verificăm câmpurile obligatorii
    const { eventTitle, participant, remainingSeats } = req.body || {};

    console.log('Checking required fields:', { 
      eventTitle, 
      participant: participant ? {
        fullName: participant.fullName,
        email: participant.email,
        age: participant.age,
        expectations: participant.expectations
      } : 'missing', 
      remainingSeats 
    });

    if (!eventTitle || !participant || !participant.fullName || !participant.email || remainingSeats === undefined) {
      console.error('Missing fields in request body');
      console.error('eventTitle:', eventTitle);
      console.error('participant:', participant);
      console.error('remainingSeats:', remainingSeats);
      return res.status(400).send("Bad Request: Missing fields");
    }

    // Construim detaliile participantului
    const participantDetails = `
      - Nume complet: ${participant.fullName}
      - Email: ${participant.email}
      - Vârstă: ${participant.age || 'Nespecificată'}
      - Așteptări: ${participant.expectations || 'Nespecificate'}
      - Locuri rămase: ${remainingSeats}
    `;

    // Configurăm opțiunile email-ului
    const mailOptions = {
      from: "popa.dumitru.fv.5@gmail.com",
      to: "popa.dumitru.fv.5@gmail.com",
      subject: `Înscriere nouă la eveniment: ${eventTitle}`,
      text: `Detalii participant:
      ${participantDetails}

      Această înscriere a fost înregistrată la ${new Date().toLocaleString('ro-RO')}.`,
    };

    console.log('Preparing to send email with the following options:', mailOptions);

    // Verify transporter before sending
    console.log('Verifying email transporter...');
    try {
      await transporter.verify();
      console.log('Transporter verification passed');
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      // Continue anyway, just for diagnostic purposes
    }

    // Transformăm callback-ul în promisiune
    const sendMail = () => {
      return new Promise((resolve, reject) => {
        console.log('Attempting to send participant details email...');
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            console.error("Error details:", JSON.stringify(error));
            reject(error);
          } else {
            console.log("Participant details email sent successfully!");
            console.log("Response:", info.response);
            console.log("Message ID:", info.messageId);
            resolve(info);
          }
        });
      });
    };

    // Trimitem email-ul
    try {
      const info = await sendMail();
      console.log("Participant details email successfully processed:", info);
      return res.status(200).json({
        success: true,
        message: "Participant details email sent successfully",
        emailInfo: {
          messageId: info.messageId,
          response: info.response
        }
      });
    } catch (error) {
      console.error("Failed to send participant details email - detailed error:", error);
      return res.status(500).json({
        success: false,
        status: {
          code: 13,
          message: "Could not send the participant details email",
          details: error.message
        }
      });
    }
  });
});
