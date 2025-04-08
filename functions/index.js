import functions from "firebase-functions";
import nodemailer from "nodemailer";
import cors from "cors";

const corsHandler = cors({ 
  origin: '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
  console.log('Function invoked with method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers));

  // Adaugă CORS headers manual (optional)
  res.set('Access-Control-Allow-Origin', '*');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  corsHandler(req, res, () => {
    console.log('Request received:', req.body);
    console.log('Request body:', req.body);

    // Verificăm metoda HTTP
    if (req.method !== "POST") {
      console.error('Invalid method:', req.method);
      return res.status(405).send("Method Not Allowed");
    }

    // Verificăm câmpurile obligatorii
    const { name, address, phone, paymentMethod, items, email } = req.body || {};

    if (!name || !address || !phone || !paymentMethod || !items) {
      console.error('Missing fields in request body');
      return res.status(400).send("Bad Request: Missing fields");
    }

    // Generăm număr de comandă unic
    const orderNumber = generateOrderNumber();
    console.log('Order number generated:', orderNumber);

    console.log('Request body:', req.body);
    console.log('Order details:', { orderNumber, name, address, phone, paymentMethod, items });

    const orderDetails = items
      .map(
        (item) =>
          `- ${item.name} (Cantitate: ${item.quantity}, Preț: ${item.price} RON)`
      )
      .join("\n");

    const mailOptions = {
      from: "popa.dumitru.fv.5@gmail.com", // Adresa trebuie să fie aceeași cu cea configurată în Nodemailer
      to: "popa.dumitru.fv.5@gmail.com", // Poți trimite emailul către aceeași adresă sau către altă adresă
      subject: `Nouă comandă primită (${orderNumber})`,
      text: `Detalii comandă:
      - Număr comandă: ${orderNumber}
      - Nume: ${name}
      - Adresă: ${address}
      - Telefon: ${phone}
      - Metoda de plată: ${paymentMethod}
      - Produse:
      ${orderDetails}`,
    };

    // Transformăm callback-ul în promisiune pentru a gestiona mai bine răspunsul
    const sendMail = () => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            reject(error);
          } else {
            console.log("Email sent:", info.response);
            resolve(info);
          }
        });
      });
    };

    // Trimitem e-mailul și gestionăm răspunsul
    sendMail()
      .then((info) => {
        console.log("Email sent successfully:", info);
        return res.status(200).json({
          message: "Order email sent successfully",
          orderNumber: orderNumber
        });
      })
      .catch((error) => {
        console.error("Failed to send email:", error);
        return res.status(500).json({
          "status": {
            "code": 13,
            "message": "Could not build the function."
          }
        });
      });
  });
});
