import React, { useState } from "react";
import { useAuth } from "../contexts";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import UserAppointments from "../components/UserAppointments";

// Tipuri pentru programări
interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface Day {
  date: string;
  formattedDate: string;
  dayName: string;
  slots: TimeSlot[];
}

interface Specialist {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  description: string;
}

const Appointments: React.FC = () => {
  const { currentUser } = useAuth(); // Ensure currentUser is defined in AuthContextType
  const [step, setStep] = useState(1);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<string>("individual");
  const [appointmentNote, setAppointmentNote] = useState<string>("");

  // Simulare specialiști
  const specialists: Specialist[] = [
    {
      id: "1",
      name: "Dr. Ana Popescu",
      role: "Psihoterapeut",
      imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Specializată în terapie cognitiv-comportamentală cu peste 10 ani de experiență",
    },
    {
      id: "2",
      name: "Dr. Mihai Ionescu",
      role: "Psihoterapeut",
      imageUrl: "https://images.unsplash.com/photo-1553867745-6e038d085e86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Expert în abordări centrate pe persoană și mindfulness pentru anxietate și depresie",
    },
    {
      id: "3",
      name: "Cristina Dumitrescu",
      role: "Consilier",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Specializată în consiliere pentru dezvoltare personală și managementul stresului",
    },
  ];

  // Generează zile disponibile
  const generateDays = (): Day[] => {
    const days: Day[] = [];
    const today = new Date();

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Nu include zilele de weekend
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const formattedDate = date.toISOString().split("T")[0];

        // Generează intervale orare disponibile
        const slots: TimeSlot[] = [];
        for (let hour = 9; hour <= 16; hour++) {
          if (hour !== 12) { // Exclude ora de prânz
            slots.push({
              id: `${formattedDate}-${hour}`,
              time: `${hour}:00`,
              available: Math.random() > 0.3 // Simulează disponibilitatea aleatorie
            });
          }
        }

        days.push({
          date: formattedDate,
          formattedDate: new Date(formattedDate).toLocaleDateString("ro-RO", {
            day: "numeric",
            month: "long",
            year: "numeric"
          }),
          dayName: new Date(formattedDate).toLocaleDateString("ro-RO", { weekday: "long" }),
          slots
        });
      }
    }

    return days;
  };

  const days = generateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Determine the selected specialist name
      const specialist = specialists.find(s => s.id === selectedSpecialist);

      // Convert the date string to a Date object for Firestore
      const dateObj = new Date(`${selectedDate}T${selectedTime}`);

      // Calculate end time based on appointment type
      const endTimeDate = new Date(dateObj);
      const duration = appointmentType === "individual" ? 60 : 
                      appointmentType === "couple" ? 90 : 120; // in minutes
      endTimeDate.setMinutes(endTimeDate.getMinutes() + duration);

      const endTime = `${endTimeDate.getHours().toString().padStart(2, "0")}:${
        endTimeDate.getMinutes().toString().padStart(2, "0")}`;

      // Prepare the appointment data
      const appointmentData = {
        userId: currentUser?.uid,
        userName: currentUser?.displayName || "Utilizator",
        userEmail: currentUser?.email,
        specialistId: selectedSpecialist,
        specialistName: specialist?.name,
        serviceType: specialist?.role,
        serviceName: appointmentType === "individual" ? "Ședință individuală" : 
                   appointmentType === "couple" ? "Terapie de cuplu" : "Terapie de grup",
        date: Timestamp.fromDate(dateObj),
        startTime: selectedTime,
        endTime: endTime,
        status: "scheduled",
        notes: appointmentNote,
        createdAt: Timestamp.now()
      };

      // Save to Firestore
      await addDoc(collection(db, "appointments"), appointmentData);

      console.log("Programare salvată:", appointmentData);

      // Show success message
      setStep(4);
    } catch (error) {
      console.error("Eroare la salvarea programării:", error);
      alert("A apărut o eroare la salvarea programării. Vă rugăm încercați din nou.");
    }
  };

  const renderSpecialistSelection = () => {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Alege un specialist</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {specialists.map((specialist) => (
            <div
              key={specialist.id}
              className={`border rounded-lg p-4 cursor-pointer transition ${
                selectedSpecialist === specialist.id 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setSelectedSpecialist(specialist.id)}
            >
              <div className="flex items-center mb-3">
                <img 
                  src={specialist.imageUrl} 
                  alt={specialist.name}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
                <div>
                  <h3 className="font-medium">{specialist.name}</h3>
                  <p className="text-sm text-gray-600">{specialist.role}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{specialist.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDateSelection = () => {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Alege o dată</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {days.map((day) => (
            <button
              key={day.date}
              className={`border p-3 rounded-lg text-left transition ${
                selectedDate === day.date 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setSelectedDate(day.date)}
            >
              <p className="text-sm text-gray-500 capitalize">{day.dayName}</p>
              <p className="font-medium">{day.formattedDate}</p>
              <p className="text-xs mt-1 text-gray-500">
                {day.slots.filter(slot => slot.available).length} intervale disponibile
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderTimeSelection = () => {
    const selectedDay = days.find(day => day.date === selectedDate);
    
    if (!selectedDay) return null;
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Alege o oră</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {selectedDay.slots.map((slot) => (
            <button
              key={slot.id}
              disabled={!slot.available}
              className={`p-3 rounded-lg text-center transition ${
                !slot.available 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : selectedTime === slot.time
                    ? "bg-blue-500 text-white"
                    : "border border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => slot.available && setSelectedTime(slot.time)}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAppointmentDetails = () => {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Detalii programare</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipul programării
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="appointmentType"
                  value="individual"
                  checked={appointmentType === "individual"}
                  onChange={() => setAppointmentType("individual")}
                  className="mr-2"
                />
                <span>Individuală</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="appointmentType"
                  value="couple"
                  checked={appointmentType === "couple"}
                  onChange={() => setAppointmentType("couple")}
                  className="mr-2"
                />
                <span>Cuplu</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="appointmentType"
                  value="group"
                  checked={appointmentType === "group"}
                  onChange={() => setAppointmentType("group")}
                  className="mr-2"
                />
                <span>Grup</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observații (opțional)
            </label>
            <textarea
              value={appointmentNote}
              onChange={(e) => setAppointmentNote(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Adaugă orice informații relevante pentru specialist..."
            ></textarea>
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const specialist = specialists.find(s => s.id === selectedSpecialist);
    const day = days.find(d => d.date === selectedDate);

    return (
      <div className="mb-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Rezumatul programării</h2>
        <div className="space-y-3">
          <div className="flex">
            <span className="font-medium w-32">Specialist:</span>
            <span>{specialist?.name}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Data:</span>
            <span>{day?.formattedDate}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Ora:</span>
            <span>{selectedTime}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Tip sesiune:</span>
            <span>{appointmentType === "individual" ? "Individuală" : appointmentType === "couple" ? "Cuplu" : "Grup"}</span>
          </div>
          {appointmentNote && (
            <div className="flex">
              <span className="font-medium w-32">Observații:</span>
              <span>{appointmentNote}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSuccessMessage = () => {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Programare confirmată!</h2>
        <p className="text-gray-600 mb-6">Am trimis detaliile programării pe email-ul tău.</p>
        <button
          onClick={() => {
            // Reset la starea inițială
            setStep(1);
            setSelectedSpecialist(null);
            setSelectedDate(null);
            setSelectedTime(null);
            setAppointmentType("individual");
            setAppointmentNote("");
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Fă o altă programare
        </button>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            {renderSpecialistSelection()}
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedSpecialist}
                className={`px-6 py-2 rounded transition ${
                  selectedSpecialist
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continuă
              </button>
            </div>
          </>
        );
      case 2:
        return (
          <>
            {renderDateSelection()}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 text-blue-600 hover:underline transition"
              >
                Înapoi
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDate}
                className={`px-6 py-2 rounded transition ${
                  selectedDate
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continuă
              </button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            {renderTimeSelection()}
            {selectedTime && renderAppointmentDetails()}
            {selectedTime && renderSummary()}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 text-blue-600 hover:underline transition"
              >
                Înapoi
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedTime}
                className={`px-6 py-2 rounded transition ${
                  selectedTime
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Confirmă programare
              </button>
            </div>
          </>
        );
      case 4:
        return renderSuccessMessage();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Programează o Ședință</h1>
          <p className="text-gray-600 mb-8 border-b pb-4">Completează formularul pentru a programa o ședință cu unul din specialiștii noștri.</p>
          
          <div className="bg-white rounded-lg">
            {renderStepContent()}
          </div>
        </div>
        
        {currentUser && step !== 4 && (
          <UserAppointments />
        )}
        
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">De ce să programezi o ședință cu noi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-blue-50 shadow-sm">
              <div className="rounded-full bg-blue-100 p-4 mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-gray-800">Specialiști Certificați</h3>
              <p className="text-gray-600 text-sm">Echipa noastră este formată din specialiști cu experiență vastă în domeniul lor.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-green-50 shadow-sm">
              <div className="rounded-full bg-green-100 p-4 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-gray-800">Programare Rapidă</h3>
              <p className="text-gray-600 text-sm">Procesul de programare este simplu și rapid, cu confirmare instantă.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-50 shadow-sm">
              <div className="rounded-full bg-purple-100 p-4 mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-gray-800">Asistență Dedicată</h3>
              <p className="text-gray-600 text-sm">Oferim suport continuu și răspunsuri la toate întrebările tale.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Ai nevoie de ajutor? Contactează-ne la <span className="text-blue-600">support@example.com</span> sau sună la <span className="text-blue-600">0712 345 678</span></p>
        </div>
      </div>
    </div>
  );
};

export default Appointments;