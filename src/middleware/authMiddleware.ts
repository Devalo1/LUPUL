import { HttpRequest, HttpResponse, NextFunction } from "../types/http";
// Removed unused import of User

// Extindem Request pentru a include utilizatorul autentificat
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware pentru a proteja rutele - verifică dacă utilizatorul este autentificat
export const protejareRuta = async (req: HttpRequest, res: HttpResponse, next: NextFunction): Promise<void> => {
  try {
    // Fix the split operation by ensuring we have a string
    const authHeader = req.headers?.authorization;
    const token = typeof authHeader === "string" ? authHeader.split(" ")[1] : null;
    
    if (!token) {
      res.status(401).json({ message: "Acces neautorizat - lipsește token-ul" });
      return;
    }
    
    // În mod normal, aici am verifica token-ul JWT
    // Dar pentru simplitate, vom presupune că avem un utilizator valid
    req.user = { id: "123", email: "test@example.com" };
    next();
  } catch (error) {
    console.error("Eroare în protejareRuta:", error);
    res.status(401).json({ message: "Acces neautorizat - token invalid" });
  }
};

// Middleware pentru a verifica dacă utilizatorul este admin - versiune compatibilă cu browser-ul
export const verificaAdmin = async (req: HttpRequest, res: HttpResponse, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Acces neautorizat - utilizator neautentificat" });
      return;
    }
    
    // În loc de interogare Mongoose, folosim Firebase auth sau o verificare simplă
    // Acesta este un exemplu simplificat
    const isAdmin = req.user.email === "admin@example.com";
    
    if (!isAdmin) {
      res.status(403).json({ message: "Acces interzis - utilizator fără drepturi de administrator" });
      return;
    }
    
    next();
  } catch (error) {
    console.error("Eroare în verificaAdmin:", error);
    res.status(500).json({ message: "Eroare server" });
  }
};

export const requireAuth = async (_req: HttpRequest, res: HttpResponse, next: NextFunction): Promise<void> => {
  try {
    // Authentication logic here
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
