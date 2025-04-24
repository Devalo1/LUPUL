import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, getDocs, doc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import { firestore } from "../firebase";
import { isUserSpecialist } from "../utils/userRoles";
import { FaCalendarAlt, FaUser, FaPhoneAlt, FaEnvelope, FaCheck, FaTimes, FaClock } from "react-icons/fa";

interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  date: Timestamp;
  time: string;
  service: string;
  details?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  specialistId?: string;
  specialistNotes?: string;
}

interface UserDetails {
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
}

const SpecialistPanel: React.FC = () => {
  const { user, loading } = useAuth();
  const [isSpecialist, setIsSpecialist] = useState<boolean>(false);
  const [checkingRole, setCheckingRole] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<{[userId: string]: UserDetails}>({});
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [specialistNotes, setSpecialistNotes] = useState<string>("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{type: "success" | "error", message: string} | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  
  const navigate = useNavigate();

  // Verificăm dacă utilizatorul este specialist
  useEffect(() => {
    const checkSpecialistStatus = async () => {
      if (!user?.email) return;
      
      try {
        const isSpecialist = await isUserSpecialist(user.email);
        setIsSpecialist(isSpecialist);
      } catch (error) {
        console.error("Eroare la verificarea rolului de specialist:", error);
        setIsSpecialist(false);
      } finally {
        setCheckingRole(false);
      }
    };
    
    if (!loading) {
      checkSpecialistStatus();
    }
  }, [user, loading]);
  
  // Redirecționare dacă utilizatorul nu este specialist
  useEffect(() => {
    if (!loading && !checkingRole && !isSpecialist && user) {
      navigate("/dashboard");
      
      // Afișează un mesaj care explică de ce a fost redirecționat
      setAlertMessage({
        type: "error",
        message: "Nu aveți permisiunea de a accesa panoul de specialist."
      });
    }
  }, [isSpecialist, loading, checkingRole, user, navigate]);

  // Încărcăm programările asignate specialistului
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !isSpecialist) return;
      
      setLoadingAppointments(true);
      try {
        const appointmentsRef = collection(firestore, "appointments");
        
        // Încărcăm toate programările care au fost asignate acestui specialist sau sunt în așteptare
        const q = query(
          appointmentsRef, 
          where("specialistId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        
        const appointmentsData: Appointment[] = [];
        querySnapshot.forEach((doc) => {
          const apptData = doc.data() as Omit<Appointment, "id">;
          appointmentsData.push({
            id: doc.id,
            ...apptData,
            date: apptData.date as unknown as Timestamp
          });
        });
        
        // Sortăm programările după dată (cele mai recente primele)
        appointmentsData.sort((a, b) => {
          return b.date.toDate().getTime() - a.date.toDate().getTime();
        });
        
        setAppointments(appointmentsData);
        
        // Încărcăm detaliile utilizatorilor pentru fiecare programare
        const userIds = Array.from(new Set(appointmentsData.map(appt => appt.userId)));
        await fetchUserDetails(userIds);
      } catch (error) {
        console.error("Eroare la încărcarea programărilor:", error);
        setAlertMessage({
          type: "error",
          message: "A apărut o eroare la încărcarea programărilor. Vă rugăm încercați din nou."
        });
      } finally {
        setLoadingAppointments(false);
      }
    };
    
    if (isSpecialist) {
      fetchAppointments();
    }
  }, [user, isSpecialist]);

  // Funcție pentru a încărca detaliile utilizatorilor
  const fetchUserDetails = async (userIds: string[]) => {
    const userDetailsMap: {[userId: string]: UserDetails} = {};
    
    for (const userId of userIds) {
      try {
        const userDoc = await getDoc(doc(firestore, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userDetailsMap[userId] = {
            displayName: userData.displayName || "Utilizator necunoscut",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            photoURL: userData.photoURL || ""
          };
        }
      } catch (error) {
        console.error(`Eroare la încărcarea detaliilor pentru utilizatorul ${userId}:`, error);
      }
    }
    
    setUserDetails(userDetailsMap);
  };

  // Funcție pentru a actualiza statusul unei programări
  const updateAppointmentStatus = async (appointmentId: string, newStatus: "confirmed" | "completed" | "cancelled") => {
    if (!user) return;
    
    setActionInProgress(appointmentId);
    
    try {
      const appointmentRef = doc(firestore, "appointments", appointmentId);
      
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: new Date(),
        ...(specialistNotes ? { specialistNotes } : {})
      });
      
      // Actualizăm lista locală de programări
      setAppointments(prevAppointments => 
        prevAppointments.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, status: newStatus, ...(specialistNotes ? { specialistNotes } : {}) } 
            : appt
        )
      );
      
      setAlertMessage({
        type: "success",
        message: `Programare ${
          newStatus === "confirmed" ? "confirmată" : 
          newStatus === "completed" ? "marcată ca finalizată" : 
          "anulată"
        } cu succes!`
      });
      
      // Resetăm selecția și notele
      setSelectedAppointment(null);
      setSpecialistNotes("");
    } catch (error) {
      console.error("Eroare la actualizarea statusului programării:", error);
      setAlertMessage({
        type: "error",
        message: "A apărut o eroare la actualizarea programării. Vă rugăm încercați din nou."
      });
    } finally {
      setActionInProgress(null);
      
      // Ascundem mesajul după 5 secunde
      setTimeout(() => {
        setAlertMessage(null);
      }, 5000);
    }
  };

  // Formatarea datei
  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("ro-RO", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    }).format(date);
  };
  
  // Filtrarea programărilor în funcție de status
  const filteredAppointments = filter === "all" 
    ? appointments 
    : appointments.filter(appt => appt.status === filter);

  if (loading || checkingRole) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-gray-700">Se încarcă...</span>
      </div>
    );
  }
  
  if (!isSpecialist) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h2 className="text-lg font-semibold mb-2">Acces restricționat</h2>
          <p>Nu aveți permisiunea de a accesa această pagină. Aceasta este destinată specialiștilor.</p>
          <button 
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Înapoi la panoul de control
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="specialist-panel min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Panou Specialist</h1>
              <p className="text-gray-600 mt-1">
                Gestionați programările și consultațiile clienților dvs.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="mr-4">
                <span className="text-sm text-gray-600">Specialist:</span>
                <span className="ml-2 font-medium">{user?.displayName || user?.email}</span>
              </div>
              <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-blue-600">
                    {(user?.displayName?.charAt(0) || user?.email?.charAt(0) || "").toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {alertMessage && (
            <div className={`mb-6 p-4 rounded-md ${
              alertMessage.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : 
              "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {alertMessage.message}
            </div>
          )}
          
          <div className="mb-6 flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                filter === "all" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Toate
            </button>
            <button 
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                filter === "pending" 
                  ? "bg-yellow-500 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              În așteptare
            </button>
            <button 
              onClick={() => setFilter("confirmed")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                filter === "confirmed" 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Confirmate
            </button>
            <button 
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                filter === "completed" 
                  ? "bg-blue-800 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Finalizate
            </button>
            <button 
              onClick={() => setFilter("cancelled")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                filter === "cancelled" 
                  ? "bg-red-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Anulate
            </button>
          </div>
          
          <div className="overflow-hidden rounded-lg border border-gray-200">
            {loadingAppointments ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-3 text-gray-600">Se încarcă programările...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-800">Nu există programări</h3>
                <p className="text-gray-600 mt-1">
                  {filter === "all" 
                    ? "Nu aveți programări asignate momentan."
                    : `Nu aveți programări cu statusul "${
                        filter === "pending" ? "în așteptare" :
                        filter === "confirmed" ? "confirmate" :
                        filter === "completed" ? "finalizate" :
                        "anulate"
                      }".`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data & Ora
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serviciu
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acțiuni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              {userDetails[appointment.userId]?.photoURL ? (
                                <img 
                                  src={userDetails[appointment.userId].photoURL} 
                                  alt={userDetails[appointment.userId].displayName} 
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <FaUser className="text-gray-500" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {userDetails[appointment.userId]?.displayName || appointment.userName || "Client necunoscut"}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FaEnvelope className="mr-1 h-3 w-3" />
                                {userDetails[appointment.userId]?.email || appointment.userEmail}
                              </div>
                              {(userDetails[appointment.userId]?.phoneNumber || appointment.userPhone) && (
                                <div className="text-sm text-gray-500 flex items-center">
                                  <FaPhoneAlt className="mr-1 h-3 w-3" />
                                  {userDetails[appointment.userId]?.phoneNumber || appointment.userPhone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                          <div className="text-sm text-gray-500">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{appointment.service}</div>
                          {appointment.details && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">{appointment.details}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === "pending" 
                              ? "bg-yellow-100 text-yellow-800"
                              : appointment.status === "confirmed" 
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {appointment.status === "pending" && (
                              <>
                                <FaClock className="mr-1" />
                                În așteptare
                              </>
                            )}
                            {appointment.status === "confirmed" && (
                              <>
                                <FaCheck className="mr-1" />
                                Confirmată
                              </>
                            )}
                            {appointment.status === "completed" && (
                              <>
                                <FaCheck className="mr-1" />
                                Finalizată
                              </>
                            )}
                            {appointment.status === "cancelled" && (
                              <>
                                <FaTimes className="mr-1" />
                                Anulată
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedAppointment(appointment)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Detalii
                          </button>
                          
                          {appointment.status === "pending" && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                              disabled={actionInProgress === appointment.id}
                              className="text-green-600 hover:text-green-900 mr-3 disabled:opacity-50"
                            >
                              {actionInProgress === appointment.id ? "Se procesează..." : "Confirmă"}
                            </button>
                          )}
                          
                          {appointment.status === "confirmed" && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                              disabled={actionInProgress === appointment.id}
                              className="text-blue-600 hover:text-blue-900 mr-3 disabled:opacity-50"
                            >
                              {actionInProgress === appointment.id ? "Se procesează..." : "Finalizează"}
                            </button>
                          )}
                          
                          {(appointment.status === "pending" || appointment.status === "confirmed") && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                              disabled={actionInProgress === appointment.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {actionInProgress === appointment.id ? "Se procesează..." : "Anulează"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal pentru detalii programare */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Detalii programare</h2>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Client</h3>
                <p className="mt-1 text-base font-medium">
                  {userDetails[selectedAppointment.userId]?.displayName || selectedAppointment.userName || "Client necunoscut"}
                </p>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <FaEnvelope className="mr-2 h-3 w-3" />
                  {userDetails[selectedAppointment.userId]?.email || selectedAppointment.userEmail}
                </p>
                {(userDetails[selectedAppointment.userId]?.phoneNumber || selectedAppointment.userPhone) && (
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <FaPhoneAlt className="mr-2 h-3 w-3" />
                    {userDetails[selectedAppointment.userId]?.phoneNumber || selectedAppointment.userPhone}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Programare</h3>
                <p className="mt-1 text-base font-medium">{selectedAppointment.service}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(selectedAppointment.date)} la {selectedAppointment.time}
                </p>
                <span className={`mt-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  selectedAppointment.status === "pending" 
                    ? "bg-yellow-100 text-yellow-800"
                    : selectedAppointment.status === "confirmed" 
                    ? "bg-green-100 text-green-800"
                    : selectedAppointment.status === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {selectedAppointment.status === "pending" && "În așteptare"}
                  {selectedAppointment.status === "confirmed" && "Confirmată"}
                  {selectedAppointment.status === "completed" && "Finalizată"}
                  {selectedAppointment.status === "cancelled" && "Anulată"}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Detalii solicitate de client</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {selectedAppointment.details || "Nu au fost furnizate detalii suplimentare."}
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Note specialist</h3>
              <textarea
                value={specialistNotes || selectedAppointment.specialistNotes || ""}
                onChange={(e) => setSpecialistNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                rows={4}
                placeholder="Adaugă note despre această programare (vizibile doar pentru tine)"
              ></textarea>
            </div>
            
            <div className="flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Închide
              </button>
              
              {selectedAppointment.status === "pending" && (
                <>
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "confirmed")}
                    disabled={actionInProgress === selectedAppointment.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionInProgress === selectedAppointment.id ? "Se procesează..." : "Confirmă programarea"}
                  </button>
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "cancelled")}
                    disabled={actionInProgress === selectedAppointment.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionInProgress === selectedAppointment.id ? "Se procesează..." : "Anulează programarea"}
                  </button>
                </>
              )}
              
              {selectedAppointment.status === "confirmed" && (
                <>
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "completed")}
                    disabled={actionInProgress === selectedAppointment.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionInProgress === selectedAppointment.id ? "Se procesează..." : "Marchează ca finalizată"}
                  </button>
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "cancelled")}
                    disabled={actionInProgress === selectedAppointment.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionInProgress === selectedAppointment.id ? "Se procesează..." : "Anulează programarea"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialistPanel;