import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore, storage } from "../firebase";
import { FaArrowLeft, FaSave, FaUpload } from "react-icons/fa";

// Prefixăm cu underscore pentru a evita avertismentul de linting
interface _SpecialSession {
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  price: number;
  specialistId: string;
  specialistName: string;
  specialistRole: string;
  location?: string;
  isOnline: boolean;
  imageUrl?: string;
  createdAt: Date;
  categories?: string[];
  tags?: string[];
  currentParticipants: number;
  participants?: string[];
}

const CreateSessionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [alertMessage, setAlertMessage] = useState<{type: "success" | "error", message: string} | null>(null);
  const [savingSession, setSavingSession] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Form fields
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState("10:00");
  const [sessionEndTime, setSessionEndTime] = useState("11:00");
  const [sessionLocation, setSessionLocation] = useState("");
  const [sessionIsOnline, setSessionIsOnline] = useState(false);
  const [sessionCapacity, setSessionCapacity] = useState(10);
  const [sessionPrice, setSessionPrice] = useState(150);
  const [sessionImageFile, setSessionImageFile] = useState<File | null>(null);
  const [sessionImagePreview, setSessionImagePreview] = useState<string>("");
  const [sessionCategories, setSessionCategories] = useState<string[]>([]);
  const [sessionTags, setSessionTags] = useState<string>("");
  const [sessionRepeat, setSessionRepeat] = useState<"none" | "weekly" | "monthly">("none");
  const [sessionRepeatCount, setSessionRepeatCount] = useState(1);

  // Încărcăm datele specialistului
  React.useEffect(() => {
    const fetchSpecialistData = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          setProfileData(userDoc.data());
        }
      } catch (error) {
        console.error("Eroare la încărcarea datelor specialistului:", error);
      }
    };
    
    fetchSpecialistData();
  }, [user]);

  // Procesează imaginea și returnează URL-ul
  const processSessionImage = async (file: File | null): Promise<string> => {
    // Dacă nu există un fișier nou, folosim imaginea default
    if (!file) {
      return "/images/Events.jpeg";
    }
    
    try {
      // Generăm un nume de fișier unic
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split(".").pop();
      const fileName = `session_${timestamp}.${fileExtension}`;
      
      // Încărcăm fișierul în Firebase Storage
      const storageRef = ref(storage, `specialSessions/${fileName}`);
      await uploadBytes(storageRef, file);
      
      // Obținem URL-ul
      const downloadUrl = await getDownloadURL(storageRef);
      
      console.log("Imaginea a fost încărcată cu succes: ", downloadUrl);
      
      return downloadUrl;
    } catch (err) {
      console.error("Eroare la procesarea imaginii:", err);
      throw new Error("Nu s-a putut procesa imaginea. Vă rugăm să încercați din nou.");
    }
  };

  // Gestionează schimbarea imaginii
  const handleSessionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Verifică dimensiunea fișierului (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAlertMessage({
        type: "error",
        message: "Imaginea este prea mare. Mărimea maximă acceptată este de 5MB."
      });
      return;
    }
    
    // Verifică tipul fișierului (doar imagini)
    if (!file.type.startsWith("image/")) {
      setAlertMessage({
        type: "error",
        message: "Te rugăm să încarci doar fișiere de tip imagine."
      });
      return;
    }
    
    setSessionImageFile(file);
    
    // Creează un URL pentru previzualizare
    const reader = new FileReader();
    reader.onload = () => {
      setSessionImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Salvează sesiunea
  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setAlertMessage({
        type: "error",
        message: "Trebuie să fiți autentificat pentru a crea o sesiune."
      });
      return;
    }
    
    if (!sessionTitle || !sessionDescription || !sessionDate) {
      setAlertMessage({
        type: "error",
        message: "Te rugăm să completezi toate câmpurile obligatorii."
      });
      return;
    }
    
    try {
      setSavingSession(true);
      
      // Procesăm imaginea
      const imageUrl = await processSessionImage(sessionImageFile);
      
      // Pregătim datele sesiunii
      const tagsArray = sessionTags.split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Pentru sesiuni multiple dacă s-a selectat repetiția
      if (sessionRepeat !== "none" && sessionRepeatCount > 1) {
        const originalDate = new Date(sessionDate);
        const sessions = [];
        
        // Creăm sesiunile repetate
        for (let i = 0; i < sessionRepeatCount; i++) {
          const newDate = new Date(originalDate);
          
          if (i > 0) {
            if (sessionRepeat === "weekly") {
              newDate.setDate(newDate.getDate() + (7 * i));
            } else if (sessionRepeat === "monthly") {
              newDate.setMonth(newDate.getMonth() + i);
            }
          }
          
          const sessionData = {
            title: sessionTitle,
            description: sessionDescription,
            date: Timestamp.fromDate(newDate),
            startTime: sessionStartTime,
            endTime: sessionEndTime,
            location: sessionIsOnline ? "" : sessionLocation,
            isOnline: sessionIsOnline,
            capacity: sessionCapacity,
            price: sessionPrice,
            specialistId: user.uid,
            specialistName: profileData?.displayName || user.displayName || "Specialist",
            specialistRole: profileData?.role || "Specialist",
            currentParticipants: 0,
            imageUrl: imageUrl,
            participants: [],
            categories: sessionCategories.length > 0 ? sessionCategories : ["general"],
            tags: tagsArray,
            createdAt: Timestamp.now(),
            lastUpdated: Timestamp.now()
          };
          
          const docRef = await addDoc(collection(firestore, "specialSessions"), sessionData);
          sessions.push({ id: docRef.id, ...sessionData });
        }
        
        setAlertMessage({
          type: "success",
          message: `Au fost create ${sessionRepeatCount} sesiuni cu succes!`
        });
      } else {
        // Creăm o singură sesiune
        const sessionData = {
          title: sessionTitle,
          description: sessionDescription,
          date: Timestamp.fromDate(new Date(sessionDate)),
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          location: sessionIsOnline ? "" : sessionLocation,
          isOnline: sessionIsOnline,
          capacity: sessionCapacity,
          price: sessionPrice,
          specialistId: user.uid,
          specialistName: profileData?.displayName || user.displayName || "Specialist",
          specialistRole: profileData?.role || "Specialist",
          currentParticipants: 0,
          imageUrl: imageUrl,
          participants: [],
          categories: sessionCategories.length > 0 ? sessionCategories : ["general"],
          tags: tagsArray,
          createdAt: Timestamp.now(),
          lastUpdated: Timestamp.now()
        };
        
        await addDoc(collection(firestore, "specialSessions"), sessionData);
        
        setAlertMessage({
          type: "success",
          message: "Sesiunea a fost creată cu succes!"
        });
      }
      
      // Redirecționează înapoi la panoul de specialist după 2 secunde
      setTimeout(() => {
        navigate("/specialist");
      }, 2000);
      
    } catch (err) {
      console.error("Eroare la salvarea sesiunii:", err);
      setAlertMessage({
        type: "error",
        message: "A apărut o eroare la salvarea sesiunii. Vă rugăm să încercați din nou."
      });
    } finally {
      setSavingSession(false);
    }
  };

  return (
    <div className="create-session-page bg-white py-20 pt-28 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 text-white flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={() => navigate("/specialist")}
                className="mr-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <FaArrowLeft />
              </button>
              <h1 className="text-2xl font-bold">Creează o sesiune nouă</h1>
            </div>
          </div>
          
          <div className="p-6">
            {alertMessage && (
              <div className={`mb-6 p-4 rounded-md ${
                alertMessage.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : 
                "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {alertMessage.message}
              </div>
            )}
            
            <form onSubmit={handleSaveSession} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titlu sesiune*
                  </label>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Workshop de terapie prin artă"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descriere*
                  </label>
                  <textarea
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrieți detaliat despre ce este vorba în sesiune și ce vor învăța participanții"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data*
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ora începerii*
                    </label>
                    <input
                      type="time"
                      value={sessionStartTime}
                      onChange={(e) => setSessionStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ora încheierii*
                    </label>
                    <input
                      type="time"
                      value={sessionEndTime}
                      onChange={(e) => setSessionEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      id="isOnline"
                      type="checkbox"
                      checked={sessionIsOnline}
                      onChange={(e) => setSessionIsOnline(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isOnline" className="ml-2 text-sm font-medium text-gray-700">
                      Sesiune online
                    </label>
                  </div>
                  
                  {!sessionIsOnline && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Locație
                      </label>
                      <input
                        type="text"
                        value={sessionLocation}
                        onChange={(e) => setSessionLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Cabinet, Sala de conferințe, etc."
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preț (RON)*
                  </label>
                  <input
                    type="number"
                    value={sessionPrice}
                    onChange={(e) => setSessionPrice(Number(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacitate (număr de participanți)*
                  </label>
                  <input
                    type="number"
                    value={sessionCapacity}
                    onChange={(e) => setSessionCapacity(Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repetare sesiune
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={sessionRepeat}
                      onChange={(e) => setSessionRepeat(e.target.value as "none" | "weekly" | "monthly")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">Fără repetare</option>
                      <option value="weekly">Săptămânal</option>
                      <option value="monthly">Lunar</option>
                    </select>
                    
                    {sessionRepeat !== "none" && (
                      <input
                        type="number"
                        value={sessionRepeatCount}
                        onChange={(e) => setSessionRepeatCount(Number(e.target.value))}
                        min="1"
                        max="12"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Număr de repetiții"
                      />
                    )}
                  </div>
                  {sessionRepeat !== "none" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Se vor crea {sessionRepeatCount} sesiuni {sessionRepeat === "weekly" ? "săptămânale" : "lunare"} începând cu data selectată.
                    </p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categorie
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["general", "terapie", "workshop", "conferință", "curs", "dezvoltare personală"].map(category => (
                      <label key={category} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={sessionCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSessionCategories([...sessionCategories, category]);
                            } else {
                              setSessionCategories(sessionCategories.filter(c => c !== category));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tag-uri (separate prin virgulă)
                  </label>
                  <input
                    type="text"
                    value={sessionTags}
                    onChange={(e) => setSessionTags(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: psihologie, anxietate, terapie de grup"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagine de copertă
                  </label>
                  
                  <div className="flex items-center space-x-6">
                    {sessionImagePreview && (
                      <div className="w-32 h-32 relative">
                        <img 
                          src={sessionImagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSessionImagePreview("");
                            setSessionImageFile(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex justify-center items-center border-2 border-dashed border-gray-300 rounded-md h-32 cursor-pointer hover:bg-gray-50">
                        <label className="cursor-pointer w-full h-full flex flex-col justify-center items-center">
                          <FaUpload className="h-10 w-10 text-gray-400" />
                          <span className="mt-2 text-sm text-gray-500">Adaugă o imagine</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleSessionImageChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Recomandat: imagine de 16:9. Max 5MB. Formate acceptate: JPG, PNG, GIF.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate("/specialist")}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <FaArrowLeft className="mr-2" /> Înapoi la panou
                </button>
                
                <button
                  type="submit"
                  className={`px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center
                    ${savingSession ? "opacity-70 cursor-not-allowed" : ""}`}
                  disabled={savingSession}
                >
                  {savingSession ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Se salvează...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Salvează sesiunea
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSessionPage;