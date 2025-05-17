import functions from "firebase-functions";
import nodemailer from "nodemailer";
import cors from "cors";
import express from 'express';

// Obținem listele de origini permise din variabilele de mediu sau folosim valori implicite
const getAllowedOrigins = () => {
  const defaultOrigins = ['https://lupulsicorbul.com', 'https://www.lupulsicorbul.com'];
  const localOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://localhost:4173'];
  
  if (process.env.ALLOWED_ORIGINS) {
    try {
      const configuredOrigins = process.env.ALLOWED_ORIGINS.split(',');
      // Always include local origins for development
      return [...configuredOrigins, ...localOrigins];
    } catch (err) {
      console.warn('Error parsing ALLOWED_ORIGINS, using defaults:', err);
      return [...defaultOrigins, ...localOrigins];
    }
  }
  
  // Always include local origins for development
  return [...defaultOrigins, ...localOrigins];
};

// Configurăm CORS cu opțiuni de securitate îmbunătățite
const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Permitem cereri fără origin (ex. din Postman sau direct de la serverul de funcții)
    if (!origin) {
      console.log('Allowing request with no origin');
      return callback(null, true);
    }
    
    // Verificăm dacă originea cererii este în lista de origini permise
    if (allowedOrigins.includes(origin)) {
      console.log(`Allowing request from origin: ${origin}`);
      return callback(null, true);
    } else {
      // For development purposes, allow all localhost origins even if not explicitly listed
      if (origin.startsWith('http://localhost:')) {
        console.log(`Allowing localhost request from: ${origin}`);
        return callback(null, true);
      }
      
      console.warn(`CORS blocked request from origin: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // Cache preflight pentru 24 ore
});

// ⚠️ IMPORTANT: Inițializăm Express doar în dezvoltare când este solicitat explicit
let app;
if (process.env.NODE_ENV === 'development' && process.env.START_SERVER === 'true') {
  app = express();

  // Adăugăm middleware de logging pentru debugging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Endpoint de test
  app.get('/', (req, res) => {
    res.send('Backend is running');
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Obținem credențialele din variabilele de mediu cu fallback la cele hard-coded pentru development
const getEmailCredentials = () => {
  // Prioritatea: variabile de mediu > config de dezvoltare
  return {
    email: process.env.EMAIL_USER || "popa.dumitru.fv.5@gmail.com",
    password: process.env.EMAIL_PASSWORD || "gltf gfzy vmhv vtcx",
  };
};

// Configurare Nodemailer cu credențialele corecte
const configureTransporter = () => {
  const credentials = getEmailCredentials();
  
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: credentials.email,
      pass: credentials.password,
    },
  });
};

// Instanțiem transporterul când este nevoie, nu la startup
const getTransporter = () => {
  const transporter = configureTransporter();
  return transporter;
};

// Funcție pentru generarea unui număr de comandă unic
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `LC-${year}${month}${day}-${randomPart}`;
};

// Definirea meniului cu prețuri, produse și oferte speciale
const menuItems = {
  // Secțiunea Gogoși
  gogosi: {
    nume: "GOGOȘI",
    produse: [
      {
        id: "gogosi-mica",
        nume: "Mică",
        descriere: "3 gogoși",
        pret: 10,
        inStock: true,
        category: "gogosi",
        image: "/images/AdobeStock_370191089.jpeg"
      },
      {
        id: "gogosi-mare",
        nume: "Mare",
        descriere: "5 gogoși",
        pret: 15,
        inStock: true,
        category: "gogosi",
        image: "/images/AdobeStock_370191089.jpeg"
      },
      {
        id: "glazura-ciocolata",
        nume: "Opțiune glazură ciocolată",
        descriere: "Adaos pentru orice porție",
        pret: 2,
        inStock: true,
        category: "topping",
        image: "/images/AdobeStock_370191089.jpeg"
      }
    ],
    extraInfo: ["Arome disponibile: ciocolată, ciocolată albă, fructe de pădure, căpșuni, caramel, kiwi, dulceață, etc."]
  },
  
  // Secțiunea Cafea
  cafea: {
    nume: "CAFEA",
    produse: [
      {
        id: "espresso",
        nume: "Espresso",
        descriere: "Cafea espresso",
        pret: 5,
        inStock: true,
        category: "cafea",
        image: "/images/AdobeStock_370191089.jpeg"
      },
      {
        id: "cafea-lapte",
        nume: "Cafea cu lapte",
        descriere: "Cafea cu lapte",
        pret: 10,
        inStock: true,
        category: "cafea",
        image: "/images/AdobeStock_370191089.jpeg"
      },
      {
        id: "cappuccino",
        nume: "Cappuccino",
        descriere: "Cafea cappuccino",
        pret: 10,
        inStock: true,
        category: "cafea",
        image: "/images/AdobeStock_370191089.jpeg"
      }
    ]
  },
  
  // Secțiunea Clătite
  clatite: {
    nume: "CLĂTITE",
    produse: [
      {
        id: "clatita",
        nume: "Bucată",
        descriere: "Clătită cu diverse arome",
        pret: 8,
        inStock: true,
        category: "clatite",
        image: "/images/AdobeStock_370191089.jpeg"
      }
    ],
    extraInfo: ["Arome disponibile: ciocolată, ciocolată albă, afine, etc."]
  },
  
  // Secțiunea Shake
  shake: {
    nume: "SHAKE",
    produse: [
      {
        id: "shake-ciocolata",
        nume: "Shake ciocolată neagră/albă",
        descriere: "Shake răcoritor cu ciocolată",
        pret: 10,
        inStock: true,
        category: "shake",
        image: "/images/AdobeStock_370191089.jpeg"
      },
      {
        id: "shake-proteic",
        nume: "Shake proteic",
        descriere: "Shake cu adaos de proteine",
        pret: 12,
        inStock: true,
        category: "shake",
        image: "/images/AdobeStock_370191089.jpeg"
      }
    ]
  },
  
  // Secțiunea Oferte Speciale
  oferte: {
    nume: "OFERTĂ SPECIALĂ",
    produse: [
      {
        id: "good-morning",
        nume: "Good Morning",
        descriere: "Porție mică gogoși + cafea (între orele 10-12)",
        pret: 12,
        inStock: true,
        category: "oferte",
        image: "/images/AdobeStock_370191089.jpeg"
      }
    ]
  }
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
    console.log('From:', getEmailCredentials().email);
    console.log('To:', getEmailCredentials().email);
    console.log('Subject:', `Nouă comandă primită (${orderNumber})`);
    
    const mailOptions = {
      from: getEmailCredentials().email,
      to: getEmailCredentials().email, 
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
    const transporter = getTransporter();
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
  return corsMiddleware(req, res, async () => {
    // Check if we have data from a callable function or direct HTTP request
    const requestData = req.body.data || req.body;
    const { eventId, eventTitle, eventDate, eventLocation, participantCount, user, participant } = requestData;

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

    // Verificăm câmpurile obligatorii
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
    console.log('From:', getEmailCredentials().email);
    console.log('To:', getEmailCredentials().email);
    console.log('Subject:', `Înscriere nouă la eveniment: ${eventTitle}`);
    
    const mailOptions = {
      from: getEmailCredentials().email,
      to: getEmailCredentials().email,
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
    const transporter = getTransporter();
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
      from: getEmailCredentials().email,
      to: getEmailCredentials().email,
      subject: `Înscriere nouă la eveniment: ${eventTitle}`,
      text: `Detalii participant:
      ${participantDetails}

      Această înscriere a fost înregistrată la ${new Date().toLocaleString('ro-RO')}.`,
    };

    console.log('Preparing to send email with the following options:', mailOptions);

    // Verify transporter before sending
    console.log('Verifying email transporter...');
    const transporter = getTransporter();
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

// Funcție pentru trimiterea mesajelor din formularul de contact de pe pagina de servicii
export const sendContactFormEmail = functions.https.onRequest((req, res) => {
  // Aplicăm middleware-ul CORS
  return corsMiddleware(req, res, async () => {
    console.log('Contact Form function invoked with method:', req.method);
    
    // Handle preflight requests separately
    if (req.method === 'OPTIONS') {
      // Preflight is already handled by corsMiddleware
      res.status(204).send('');
      return;
    }

    console.log('Contact form request received:', req.body);

    // Verificăm metoda HTTP
    if (req.method !== "POST") {
      console.error('Invalid method:', req.method);
      return res.status(405).send("Method Not Allowed");
    }

    // Verificăm câmpurile obligatorii
    const { name, email, phone, service, message } = req.body || {};

    if (!name || !email || !message) {
      console.error('Missing required fields in request body');
      return res.status(400).send("Bad Request: Missing required fields");
    }

    // Construim conținutul email-ului
    const mailOptions = {
      from: getEmailCredentials().email,
      to: "lupulsicorbul@gmail.com", // Adresa destinatarului specificată în cerință
      subject: `Mesaj nou de contact: ${service || 'Întrebare generală'}`,
      text: `Un nou mesaj a fost trimis prin formularul de contact de pe pagina de servicii:

Detalii contact:
- Nume: ${name}
- Email: ${email}
- Telefon: ${phone || 'Nu a fost furnizat'}
- Serviciu de interes: ${service || 'Nu a fost specificat'}

Mesaj:
${message}

Acest mesaj a fost trimis la data ${new Date().toLocaleString('ro-RO')}.`,
    };

    console.log('Preparing to send contact form email with options:', {
      from: getEmailCredentials().email,
      to: "lupulsicorbul@gmail.com",
      subject: mailOptions.subject
    });

    // Verificăm transporterul înainte de trimitere
    console.log('Verifying email transporter...');
    const transporter = getTransporter();
    try {
      await transporter.verify();
      console.log('Transporter verification passed');
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
    }

    // Trimitem email-ul
    try {
      const info = await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending contact form email:", error);
            reject(error);
          } else {
            console.log("Contact form email sent successfully!");
            console.log("Response:", info.response);
            resolve(info);
          }
        });
      });

      // Răspuns de succes
      return res.status(200).json({
        success: true,
        message: "Contact form email sent successfully"
      });
    } catch (error) {
      console.error("Failed to send contact form email:", error);
      return res.status(500).json({
        success: false,
        message: "Could not send the contact form email",
        error: error.message
      });
    }
  });
});

// Funcție pentru a furniza meniul cu toate produsele
export const getMenuItems = functions.https.onRequest((req, res) => {
  return corsMiddleware(req, res, async () => {
    console.log('Menu items function invoked with method:', req.method);
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    // Doar metoda GET este permisă pentru această funcție
    if (req.method !== "GET") {
      console.error('Invalid method:', req.method);
      return res.status(405).send("Method Not Allowed");
    }

    try {
      // Opțional, putem extrage un parametru pentru a filtra doar anumite categorii
      const category = req.query.category;
      
      if (category && menuItems[category]) {
        // Dacă avem o categorie specifică, returnăm doar acea categorie
        return res.status(200).json({
          success: true,
          data: {
            [category]: menuItems[category]
          }
        });
      } else {
        // Returnăm tot meniul
        return res.status(200).json({
          success: true,
          data: menuItems
        });
      }
    } catch (error) {
      console.error("Failed to retrieve menu items:", error);
      return res.status(500).json({
        success: false,
        error: {
          message: "Could not retrieve menu items",
          details: error.message
        }
      });
    }
  });
});
