import { HttpRequest, HttpResponse, NextFunction } from "../types/http";
// Folosim exact același casing ca în numele fișierului
import { verificaSiRepararaRoluriAdmin } from "../services/AuthService"; 
import { AdminService } from "../services/adminService";

// Adăugăm un middleware pentru depanarea problemelor cu admin
export const verificaProblemeAdmin = async (_req: HttpRequest, res: HttpResponse, next: NextFunction): Promise<void> => {
  try {
    try {
      // Verificăm și Firebase și MongoDB pentru a ne asigura că utilizatorul are rol de admin
      await AdminService.verificaSiCorecteazaAdminPrincipal();
      // Don't check return value of void function
      await verificaSiRepararaRoluriAdmin();
      
      // Proceed to next middleware
      next();
    } catch (adminError) {
      console.error("Eroare la repararea rolurilor de admin:", adminError);
      res.status(500).json({ 
        success: false, 
        message: "Nu s-au putut repara rolurile de admin" 
      });
      return;
    }
  } catch (error) {
    console.error("Eroare în verificaProblemeAdmin:", error);
    next(error);
  }
};