import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc,
  updateDoc,
  Timestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

interface Appointment {
  id: string;
  specialistName: string;
  serviceType: string;
  serviceName: string;
  date: Timestamp; // Changed from any to Timestamp
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
}

const UserAppointments: React.FC = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchUserAppointments();
    }
  }, [currentUser]);

  const fetchUserAppointments = async () => {
    try {
      setLoading(true);
      
      // Query appointments for the current user
      const q = query(
        collection(db, "appointments"),
        where("userId", "==", currentUser?.uid),
        orderBy("date", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      
      const userAppointments: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userAppointments.push({
          id: doc.id,
          specialistName: data.specialistName || "Specialist",
          serviceType: data.serviceType || "",
          serviceName: data.serviceName || "",
          date: data.date,
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          status: data.status || "scheduled",
          notes: data.notes
        });
      });
      
      setAppointments(userAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      // Update the appointment status to cancelled
      await updateDoc(doc(db, "appointments", selectedAppointment.id), {
        status: "cancelled",
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setAppointments(appointments.map(app => 
        app.id === selectedAppointment.id 
          ? { ...app, status: "cancelled" } 
          : app
      ));
      
      setCancelModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("A apărut o eroare la anularea programării. Vă rugăm încercați din nou.");
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "Data necunoscută";
    try {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (e) {
      return "Data invalidă";
    }
  };

  const isPastAppointment = (timestamp: Timestamp) => {
    if (!timestamp) return false;
    const appointmentDate = new Date(timestamp.seconds * 1000);
    return appointmentDate < new Date();
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Programările mele</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className={`border rounded-lg p-4 ${
                appointment.status === "cancelled" 
                  ? "bg-red-50 border-red-200" 
                  : isPastAppointment(appointment.date)
                  ? "bg-gray-50 border-gray-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{appointment.serviceName}</h3>
                  <p className="text-sm text-gray-600">
                    Cu {appointment.specialistName} • {formatDate(appointment.date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {appointment.startTime} - {appointment.endTime}
                  </p>
                </div>
                
                <div>
                  <span 
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      appointment.status === "cancelled" 
                        ? "bg-red-100 text-red-800" 
                        : appointment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : isPastAppointment(appointment.date)
                        ? "bg-gray-100 text-gray-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {appointment.status === "cancelled" 
                      ? "Anulată" 
                      : appointment.status === "completed"
                      ? "Finalizată"
                      : isPastAppointment(appointment.date)
                      ? "Trecută"
                      : "Programată"}
                  </span>
                </div>
              </div>
              
              {appointment.notes && (
                <div className="mt-2 text-sm text-gray-700">
                  <p className="font-medium">Note:</p>
                  <p>{appointment.notes}</p>
                </div>
              )}
              
              {appointment.status !== "cancelled" && !isPastAppointment(appointment.date) && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setCancelModalOpen(true);
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Anulează programarea
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">Nu aveți programări active.</p>
          <button
            onClick={() => window.location.href = "/appointments"}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Faceți o programare
          </button>
        </div>
      )}
      
      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmați anularea</h3>
            <p className="mb-6">
              Sunteți sigur că doriți să anulați programarea din data de {formatDate(selectedAppointment.date)} 
              la {selectedAppointment.startTime}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setCancelModalOpen(false);
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Nu, păstrează
              </button>
              <button
                onClick={handleCancelAppointment}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Da, anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAppointments;
