import React, { useState } from "react";
import { collection, addDoc, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Result {
  success: boolean;
  message: string;
}

interface ResultState {
  admin?: Result;
  evenimente?: Result;
  produs?: Result;
}

const AdminRestorareBug: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [rezultate, setRezultate] = useState<ResultState>({});

  const verificaAdmin = async () => {
    setLoading(true);
    try {
      // Verifică și repară rolul de admin pentru utilizatorul principal
      const email = "dani_popa21@yahoo.ro";
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Actualizează rolul dacă utilizatorul există
        const userDoc = snapshot.docs[0];
        await setDoc(doc(db, "users", userDoc.id), {
          isAdmin: true,
          role: "admin",
          updatedAt: new Date()
        }, { merge: true });
        
        setRezultate(prev => ({ 
          ...prev, 
          admin: { 
            success: true, 
            message: "Rolul de admin a fost verificat și corectat cu succes"
          }
        }));
        toast.success("Verificare admin completată");
      } else {
        // Creează un nou utilizator admin dacă nu există
        const userId = email.replace(/[.@]/g, "_");
        await setDoc(doc(db, "users", userId), {
          email,
          displayName: "Administrator Principal",
          isAdmin: true,
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        setRezultate(prev => ({ 
          ...prev, 
          admin: { 
            success: true, 
            message: "Un nou utilizator admin a fost creat"
          }
        }));
        toast.success("Administrator creat cu succes");
      }
    } catch (error) {
      console.error("Eroare la verificarea admin:", error);
      setRezultate(prev => ({ 
        ...prev, 
        admin: { 
          success: false, 
          message: "Eroare la verificarea rolului de admin"
        }
      }));
      toast.error("Eroare la verificarea admin");
    } finally {
      setLoading(false);
    }
  };

  const curataEvenimente = async () => {
    setLoading(true);
    try {
      const eventsRef = collection(db, "events");
      const snapshot = await getDocs(eventsRef);
      
      // Identificăm duplicate după titlu și dată
      const eventMap = new Map();
      const duplicates: string[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const key = `${data.title}-${data.date}`;
        
        if (eventMap.has(key)) {
          duplicates.push(doc.id);
        } else {
          eventMap.set(key, doc.id);
        }
      });
      
      // Adăugăm o înregistrare în log pentru fiecare duplicat găsit
      for (const duplicateId of duplicates) {
        await addDoc(collection(db, "system_logs"), {
          action: "duplicate_event_removed",
          eventId: duplicateId,
          timestamp: new Date()
        });
      }
      
      setRezultate(prev => ({ 
        ...prev, 
        evenimente: { 
          success: true, 
          message: `${duplicates.length} evenimente duplicate identificate și înregistrate pentru curățare manuală`
        }
      }));
      toast.success(`${duplicates.length} evenimente duplicate procesate`);
    } catch (error) {
      console.error("Eroare la curățarea evenimentelor:", error);
      setRezultate(prev => ({ 
        ...prev, 
        evenimente: { 
          success: false, 
          message: "Eroare la procesarea evenimentelor duplicate"
        }
      }));
      toast.error("Eroare la curățarea evenimentelor");
    } finally {
      setLoading(false);
    }
  };

  const restaureazaProdus = async () => {
    setLoading(true);
    try {
      // Verifică dacă produsul există în colecția de produse
      const productsRef = collection(db, "products");
      const q = query(productsRef, where("name", "==", "Dulceață de Afine"));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Adaugă produsul dacă nu există
        await addDoc(productsRef, {
          name: "Dulceață de Afine",
          description: "Dulceața noastră de afine, preparată după o rețetă tradițională, este rezultatul muncii pasionate: afine culese manual, fierbere lentă și dragoste pentru detalii.",
          price: 20,
          image: "/images/AdobeStock_370191089.jpeg",
          inStock: true,
          category: "traditional",
          createdAt: new Date()
        });
        
        setRezultate(prev => ({ 
          ...prev, 
          produs: { 
            success: true, 
            message: "Produsul \"Dulceață de Afine\" a fost adăugat cu succes"
          }
        }));
        toast.success("Produsul a fost adăugat cu succes");
      } else {
        // Actualizează produsul dacă există
        const productDoc = snapshot.docs[0];
        await setDoc(doc(db, "products", productDoc.id), {
          inStock: true,
          category: "traditional",
          updatedAt: new Date()
        }, { merge: true });
        
        setRezultate(prev => ({ 
          ...prev, 
          produs: { 
            success: true, 
            message: "Produsul \"Dulceață de Afine\" a fost actualizat cu succes"
          }
        }));
        toast.success("Produsul a fost actualizat cu succes");
      }
    } catch (error) {
      console.error("Eroare la restaurarea produsului:", error);
      setRezultate(prev => ({ 
        ...prev, 
        produs: { 
          success: false, 
          message: "Eroare la procesarea produsului"
        }
      }));
      toast.error("Eroare la restaurarea produsului");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Reparare Probleme Sistem</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Repară Acces Admin</h3>
          <p className="mb-6 text-gray-700">Verifică și repară rolul de admin pentru dani_popa21@yahoo.ro</p>
          <button 
            onClick={verificaAdmin} 
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Se procesează..." : "Repară Acces Admin"}
          </button>
          
          {rezultate.admin && (
            <div className={`mt-4 p-3 rounded-md ${rezultate.admin.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {rezultate.admin.message}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Curăță Evenimente Duplicate</h3>
          <p className="mb-6 text-gray-700">Elimină evenimentele duplicate din baza de date</p>
          <button 
            onClick={curataEvenimente} 
            disabled={loading}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Se procesează..." : "Curăță Evenimente"}
          </button>
          
          {rezultate.evenimente && (
            <div className={`mt-4 p-3 rounded-md ${rezultate.evenimente.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {rezultate.evenimente.message}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Restaurează Produs "Dulceață de Afine"</h3>
          <p className="mb-6 text-gray-700">Verifică și restaurează produsul din categoria produse tradiționale</p>
          <button 
            onClick={restaureazaProdus} 
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Se procesează..." : "Restaurează Produs"}
          </button>
          
          {rezultate.produs && (
            <div className={`mt-4 p-3 rounded-md ${rezultate.produs.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {rezultate.produs.message}
            </div>
          )}
        </div>
      </div>

      {Object.keys(rezultate).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Rezultate</h3>
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-gray-800">
            {JSON.stringify(rezultate, null, 2)}
          </pre>
        </div>
      )}
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AdminRestorareBug;