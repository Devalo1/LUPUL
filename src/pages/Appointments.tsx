import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { addDoc, collection, Timestamp, getDocs } from "firebase/firestore";
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
  schedule?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    available: boolean;
  }[];
  email?: string;
  phone?: string;
}

const Appointments: React.FC = () => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<string>("individual");
  const [appointmentNote, setAppointmentNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);

  // Fetch real specialists from Firestore with fallback to mock data
  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        setLoading(true);
        const specialistsRef = collection(db, "specialists");
        const snapshot = await getDocs(specialistsRef);

        if (snapshot.empty) {
          console.log("No specialists found in Firestore, using mock data");
          // Mock data representing real specialists of the platform
          const mockSpecialists: Specialist[] = [
            {
              id: "1",
              name: "Dr. Maria Popescu",
              role: "Psiholog Clinician",
              imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
              description: "Specialist în terapia anxietății și depresiei cu 15 ani de experiență în psihoterapie. Expertă în tehnici cognitiv-comportamentale și mindfulness.",
              schedule: [
                { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", available: true },
                { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", available: true },
                { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", available: true },
                { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", available: true },
                { dayOfWeek: 5, startTime: "09:00", endTime: "15:00", available: true }
              ],
              email: "maria.popescu@clinica.ro",
              phone: "+40 721 123 456"
            },
            {
              id: "2",
              name: "Dr. Alexandru Ionescu",
              role: "Psihiatru",
              imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
              description: "Specialist în tulburări de personalitate și psihoze. Expert în terapie medicamentoasă și diagnostic psihiatric cu 20 de ani de practică.",
              schedule: [
                { dayOfWeek: 1, startTime: "10:00", endTime: "18:00", available: true },
                { dayOfWeek: 2, startTime: "10:00", endTime: "18:00", available: true },
                { dayOfWeek: 4, startTime: "10:00", endTime: "18:00", available: true },
                { dayOfWeek: 5, startTime: "10:00", endTime: "16:00", available: true }
              ],
              email: "alexandru.ionescu@clinica.ro",
              phone: "+40 721 234 567"
            },
            {
              id: "3",
              name: "Dr. Elena Georgescu",
              role: "Psihoterapeut Cognitiv-Comportamental",
              imageUrl: "https://images.unsplash.com/photo-1594824792696-fd40caed4d62?w=150&h=150&fit=crop&crop=face",
              description: "Specialist în terapia cognitiv-comportamentală pentru adulți și copii. Focus pe fobii, atacuri de panică și tulburări de anxietate socială.",
              schedule: [
                { dayOfWeek: 1, startTime: "08:00", endTime: "16:00", available: true },
                { dayOfWeek: 2, startTime: "08:00", endTime: "16:00", available: true },
                { dayOfWeek: 3, startTime: "08:00", endTime: "16:00", available: true },
                { dayOfWeek: 4, startTime: "08:00", endTime: "16:00", available: true },
                { dayOfWeek: 5, startTime: "08:00", endTime: "14:00", available: true }
              ],
              email: "elena.georgescu@clinica.ro",
              phone: "+40 721 345 678"
            }
          ];
          
          setSpecialists(mockSpecialists);
          return;
        }

        const specialistsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Specialist[];

        setSpecialists(specialistsList);
      } catch (error) {
        console.error("Error fetching specialists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialists();
  }, []);

  // Generate available days based on specialist schedule
  const generateDays = (): Day[] => {
    const days: Day[] = [];
    const today = new Date();

    const selectedSpecialistObj = specialists.find(s => s.id === selectedSpecialist);
    const specialistSchedule = selectedSpecialistObj?.schedule || [];

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();

      const scheduleForDay = specialistSchedule.find(s => s.dayOfWeek === dayOfWeek && s.available);

      if (scheduleForDay) {
        const formattedDate = date.toISOString().split("T")[0];

        const slots: TimeSlot[] = [];
        const startHour = parseInt(scheduleForDay.startTime.split(":")[0]);
        const endHour = parseInt(scheduleForDay.endTime.split(":")[0]);

        for (let hour = startHour; hour < endHour; hour++) {
          slots.push({
            id: `${formattedDate}-${hour}`,
            time: `${hour.toString().padStart(2, "0")}:00`,
            available: Math.random() > 0.3
          });
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

  const days = selectedSpecialist ? generateDays() : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!currentUser) {
        setError("Trebuie să fiți autentificat pentru a face o programare.");
        return;
      }

      const specialist = specialists.find(s => s.id === selectedSpecialist);
      const dateObj = new Date(`${selectedDate}T${selectedTime}`);
      const endTimeDate = new Date(dateObj);
      const duration = appointmentType === "individual" ? 60 :
        appointmentType === "couple" ? 90 : 120;
      endTimeDate.setMinutes(endTimeDate.getMinutes() + duration);

      const endTime = `${endTimeDate.getHours().toString().padStart(2, "0")}:${
        endTimeDate.getMinutes().toString().padStart(2, "0")}`;

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
        createdAt: Timestamp.now(),
        userPhone: currentUser?.phoneNumber || "",
        price: appointmentType === "individual" ? 150 :
          appointmentType === "couple" ? 200 : 180
      };

      await addDoc(collection(db, "appointments"), appointmentData);

      console.log("Programare salvată:", appointmentData);

      setStep(4);
    } catch (error) {
      console.error("Eroare la salvarea programării:", error);
      setError("A apărut o eroare la salvarea programării. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const renderSpecialistSelection = () => {
    return (
      <div className="mb-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Alege specialistul potrivit pentru tine
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Echipa noastră de specialiști certificați este aici să te ajute. 
            Selectează specialistul care se potrivește cel mai bine nevoilor tale.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specialists.length > 0 ? (
            specialists.map((specialist) => (
              <div
                key={specialist.id}
                className={`group relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${
                  selectedSpecialist === specialist.id
                    ? "ring-4 ring-blue-400 ring-opacity-50 shadow-2xl scale-105 bg-gradient-to-br from-blue-50 to-indigo-50"
                    : "shadow-lg border border-gray-100 hover:border-blue-200"
                }`}
                onClick={() => setSelectedSpecialist(specialist.id)}
              >
                {/* Badge de selecție */}
                {selectedSpecialist === specialist.id && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                {/* Header cu poza și informații de bază */}
                <div className="flex items-start mb-6">
                  <div className="relative">
                    <img
                      src={specialist.imageUrl}
                      alt={specialist.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face";
                      }}
                    />
                    {/* Indicator online */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-3 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                      {specialist.name}
                    </h3>
                    <p className="text-blue-600 font-semibold text-sm mb-2 uppercase tracking-wide">
                      {specialist.role}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Clinica Noastră
                    </div>
                  </div>
                </div>
                
                {/* Descriere */}
                <p className="text-gray-700 mb-6 leading-relaxed text-sm line-clamp-3">
                  {specialist.description}
                </p>
                
                {/* Statistici */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(specialist.schedule || []).filter(s => s.available).length}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Zile/Săptămână</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ★ 4.9
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Rating</div>
                  </div>
                </div>
                
                {/* Informații de contact */}
                <div className="space-y-2 mb-6">
                  {specialist.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      {specialist.email}
                    </div>
                  )}
                  {specialist.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {specialist.phone}
                    </div>
                  )}
                </div>
                
                {/* Butoane de acțiune */}
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const scheduleText = (specialist.schedule || [])
                        .filter(s => s.available)
                        .map(s => {
                          const days = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
                          return `${days[s.dayOfWeek]}: ${s.startTime} - ${s.endTime}`;
                        })
                        .join("\n");
                      
                      alert(`📋 CV - ${specialist.name}\n\n🎓 Specializare: ${specialist.role}\n\n📝 Descriere: ${specialist.description}\n\n📧 Email: ${specialist.email || "Nu este disponibil"}\n📞 Telefon: ${specialist.phone || "Nu este disponibil"}\n\n📅 Program săptămânal:\n${scheduleText || "Program nedefinit"}`);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    📋 Vezi CV
                  </button>
                  
                  {selectedSpecialist === specialist.id && (
                    <div className="flex items-center text-sm text-green-600 font-semibold bg-green-50 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Selectat
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12a1 1 0 000 2 1 1 0 000-2z" />
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 13a4 4 0 011-2.646V6.5a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v3.854A4 4 0 0116 13v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Nu există specialiști disponibili</h3>
                <p className="text-gray-600 mb-6">
                  Momentan nu avem specialiști disponibili pentru programări. Te rugăm să revii mai târziu sau să ne contactezi direct.
                </p>
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  📞 Contactează-ne
                </button>
              </div>
            </div>
          )}
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
          <div className="flex">
            <span className="font-medium w-32">Preț:</span>
            <span>{appointmentType === "individual" ? "150 RON" : appointmentType === "couple" ? "200 RON" : "180 RON"}</span>
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
                disabled={!selectedTime || loading}
                className={`px-6 py-2 rounded transition ${
                  selectedTime && !loading
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Se procesează...
                  </span>
                ) : "Confirmă programare"}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-10 right-1/3 w-64 h-64 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 9V7a3 3 0 113-3m-1 9l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Programează o Ședință
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Alege un specialist din echipa noastră și programează o ședință personalizată pentru nevoile tale
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

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
          <p>Ai nevoie de ajutor? Contactează-ne la <span className="text-blue-600">lupulsicorbul@gmail.com</span> sau sună la <span className="text-blue-600">0734 931 703</span></p>
        </div>
      </div>
    </div>
  );
};

export default Appointments;