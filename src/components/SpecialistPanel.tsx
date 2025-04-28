import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts";
import { collection, doc, getDoc, getDocs, addDoc, query, where } from "firebase/firestore";
import { firestore } from "../firebase";
import { FaPaperPlane } from "react-icons/fa";

interface DataItem {
  id: string;
  name?: string; // Make name optional
  createdAt?: Date;
  status?: string;
  reason?: string;
  [key: string]: unknown;
}

interface _RequestData {
  id: string;
  status?: string;
  reason?: string;
  adminComment?: string;
  createdAt?: Date;
  currentSpecialization?: string;
  newSpecialization?: string;
  [key: string]: unknown;
}

const SpecialistPanel: React.FC = () => {
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [specialistData, setSpecialistData] = useState({
    currentSpecialization: "",
    services: []
  });
  const [specializationChangeRequest, setSpecializationChangeRequest] = useState({
    newSpecialization: "",
    reason: "",
    status: "pending"
  });
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [formMessage, setFormMessage] = useState<{type: "success" | "error", message: string} | null>(null);
  const [previousRequests, setPreviousRequests] = useState<DataItem[]>([]);
  const [_selectedAppointment, _setSelectedAppointment] = useState(null);
  const [_uploadProgress, _setUploadProgress] = useState(0);
  const [_selectedServiceType, _setSelectedServiceType] = useState("");
  const [_loadingServiceType, _setLoadingServiceType] = useState(false);
  const [_savingServiceType, _setSavingServiceType] = useState(false);
  const [_availableServices, _setAvailableServices] = useState([]);
  const [_specialistServices, _setSpecialistServices] = useState([]);
  const [_loadingServices, _setLoadingServices] = useState(false);
  const [_addingService, _setAddingService] = useState(false);
  const [_selectedService, _setSelectedService] = useState("");
  const [_servicePrice, _setServicePrice] = useState("");

  useEffect(() => {
    if (!user) return;
    
    const fetchSpecialistData = async () => {
      try {
        setLoading(true);
        
        // Fetch specialist profile data
        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSpecialistData({
            currentSpecialization: userData.specialization || "",
            services: userData.services || []
          });
        }
        
        // Fetch previous specialization change requests
        const requestsRef = collection(firestore, "specializationChangeRequests");
        const q = query(requestsRef, where("userId", "==", user.uid));
        const requestsSnapshot = await getDocs(q);
        
        const requests: DataItem[] = [];
        requestsSnapshot.forEach((doc) => {
          requests.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
          });
        });
        
        // Sort by creation date, newest first
        requests.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
          return dateB - dateA;
        });
        setPreviousRequests(requests);
        
      } catch (error) {
        console.error("Error fetching specialist data:", error);
        setFormMessage({
          type: "error",
          message: "A apărut o eroare la încărcarea datelor. Vă rugăm încercați din nou."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpecialistData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSpecializationChangeRequest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!specializationChangeRequest.newSpecialization || !specializationChangeRequest.reason) {
      setFormMessage({
        type: "error",
        message: "Vă rugăm completați toate câmpurile obligatorii."
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Add the request to the database
      const requestRef = collection(firestore, "specializationChangeRequests");
      await addDoc(requestRef, {
        userId: user.uid,
        userEmail: user.email,
        currentSpecialization: specialistData.currentSpecialization,
        newSpecialization: specializationChangeRequest.newSpecialization,
        reason: specializationChangeRequest.reason,
        status: "pending",
        createdAt: new Date()
      });
      
      // Reset form and show success message
      setSpecializationChangeRequest({
        newSpecialization: "",
        reason: "",
        status: "pending"
      });
      
      setFormMessage({
        type: "success",
        message: "Cererea de schimbare a specializării a fost trimisă cu succes și este în așteptare pentru aprobare."
      });
      
      setShowChangeForm(false);
      
      // Refresh the list of previous requests
      const requestsRef = collection(firestore, "specializationChangeRequests");
      const q = query(requestsRef, where("userId", "==", user.uid));
      const requestsSnapshot = await getDocs(q);
      
      const requests: DataItem[] = [];
      requestsSnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        });
      });
      
      // Sort by creation date, newest first
      requests.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      });
      setPreviousRequests(requests);
      
    } catch (error) {
      console.error("Error submitting specialization change request:", error);
      setFormMessage({
        type: "error",
        message: "A apărut o eroare la trimiterea cererii. Vă rugăm încercați din nou."
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Get display name for status
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobată";
      case "rejected":
        return "Respinsă";
      case "pending":
      default:
        return "În așteptare";
    }
  };

  if (!user || userRole !== "specialist") {
    return (
      <div className="p-6 bg-white rounded shadow-sm">
        <p className="text-center text-gray-600">
          Accesul este permis doar pentru specialiști.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-600 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold">Panou Specialist</h1>
            <p className="mt-2 text-blue-100">Gestionează specializările și serviciile oferite</p>
          </div>
          
          <div className="p-6">
            {formMessage && (
              <div className={`mb-6 p-4 rounded-md ${
                formMessage.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : 
                "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {formMessage.message}
              </div>
            )}
            
            {/* Current specialization card */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaPaperPlane className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-blue-900">Specializarea curentă</h3>
                  <p className="mt-1 text-xl font-semibold text-blue-600">
                    {specialistData.currentSpecialization || "Nespecificată"}
                  </p>
                  <p className="mt-2 text-sm text-blue-700">
                    Puteți solicita o schimbare a specializării folosind formularul de mai jos. Solicitarea va fi revizuită de administratori.
                  </p>
                  
                  <div className="mt-4">
                    {!showChangeForm ? (
                      <button
                        onClick={() => setShowChangeForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Solicită schimbarea specializării
                      </button>
                    ) : (
                      <form onSubmit={handleSubmitRequest} className="mt-3 space-y-4 bg-white p-4 rounded-md shadow-sm">
                        <h4 className="text-lg font-medium text-gray-800">Solicitare schimbare specializare</h4>
                        
                        <div>
                          <label htmlFor="newSpecialization" className="block text-sm font-medium text-gray-700">
                            Noua specializare dorită *
                          </label>
                          <select
                            id="newSpecialization"
                            name="newSpecialization"
                            value={specializationChangeRequest.newSpecialization}
                            onChange={handleInputChange}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          >
                            <option value="">Selectați noua specializare</option>
                            <option value="Psihologie">Psihologie</option>
                            <option value="Psihoterapie">Psihoterapie</option>
                            <option value="Nutriție">Nutriție</option>
                            <option value="Fitness">Fitness</option>
                            <option value="Coaching">Coaching</option>
                            <option value="Meditație">Meditație</option>
                            <option value="Yoga">Yoga</option>
                            <option value="Consiliere">Consiliere</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                            Motivul schimbării *
                          </label>
                          <textarea
                            id="reason"
                            name="reason"
                            rows={4}
                            value={specializationChangeRequest.reason}
                            onChange={handleInputChange}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Vă rugăm să explicați motivul pentru care doriți să schimbați specializarea."
                            required
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowChangeForm(false)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Anulează
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {loading ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Se trimite...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <FaPaperPlane className="mr-2" />
                                Trimite solicitarea
                              </span>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Previous requests section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                Istoricul solicitărilor de schimbare a specializării
              </h3>
              
              {previousRequests.length === 0 ? (
                <p className="text-gray-500 italic">Nu aveți solicitări anterioare.</p>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {previousRequests.map((request) => (
                      <li key={request.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              Schimbare: {String(request.currentSpecialization || "")} → {String(request.newSpecialization || "")}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(String(request.status || ""))}`}>
                              {getStatusDisplayName(String(request.status || ""))}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {typeof request.reason === "string" && request.reason.length > 100 ?
                                `${request.reason.substring(0, 100)}...` :
                                request.reason}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-xs text-gray-500 sm:mt-0">
                            <p>
                              <time dateTime={request.createdAt instanceof Date ? request.createdAt.toISOString() : ""}>
                                {formatDate(request.createdAt instanceof Date ? request.createdAt : new Date())}
                              </time>
                            </p>
                          </div>
                        </div>
                        {request.adminComment && (
                          <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            <p className="font-semibold">Răspuns administrator:</p>
                            <p>{String(request.adminComment || "")}</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialistPanel;