import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  deleteDoc,
  Timestamp,
  addDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  serviceType: string;
  serviceName: string;
  date: any; // Timestamp
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
  createdAt: any; // Timestamp
  price?: number;
}

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number; // în minute
  price: number;
}

interface Specialist {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  description: string;
  schedule?: {
    dayOfWeek: number; // 0-6, where 0 is Sunday
    startTime: string;
    endTime: string;
    available: boolean;
  }[];
  email?: string;
  phone?: string;
}

// Componenta pentru inițializarea datelor
const InitializeData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createAppointmentsAndServices = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Verificăm dacă există deja servicii
      const servicesRef = collection(db, "services");
      const servicesSnapshot = await getDocs(servicesRef);

      if (servicesSnapshot.empty) {
        // Adăugăm servicii dacă nu există
        const services = [
          {
            name: "Consultație Psihologică",
            category: "Psihologie",
            duration: 60, // în minute
            price: 150,
            description: "Consultație psihologică individuală",
            available: true,
            createdAt: Timestamp.now(),
          },
          {
            name: "Terapie de Cuplu",
            category: "Terapie",
            duration: 90, // în minute
            price: 200,
            description: "Ședință de terapie pentru cupluri",
            available: true,
            createdAt: Timestamp.now(),
          },
          {
            name: "Coaching Personal",
            category: "Coaching",
            duration: 60, // în minute
            price: 180,
            description: "Coaching pentru dezvoltare personală",
            available: true,
            createdAt: Timestamp.now(),
          },
        ];

        for (const service of services) {
          await addDoc(servicesRef, service);
        }

        setMessage((prev) => (prev || "") + "Servicii create cu succes. ");
      } else {
        setMessage((prev) => (prev || "") + "Serviciile există deja. ");
      }

      // Verificăm dacă există deja programări
      const appointmentsRef = collection(db, "appointments");
      const appointmentsSnapshot = await getDocs(appointmentsRef);

      if (appointmentsSnapshot.empty) {
        // Adăugăm câteva programări de exemplu dacă nu există
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const appointments = [
          {
            userId: "user123",
            userName: "Andrei Popescu",
            userEmail: "andrei.popescu@example.com",
            userPhone: "0712345678",
            serviceType: "Psihologie",
            serviceName: "Consultație Psihologică",
            date: Timestamp.fromDate(tomorrow),
            startTime: "10:00",
            endTime: "11:00",
            status: "scheduled",
            notes: "Prima consultație",
            createdAt: Timestamp.now(),
            price: 150,
          },
          {
            userId: "user456",
            userName: "Maria Ionescu",
            userEmail: "maria.ionescu@example.com",
            userPhone: "0723456789",
            serviceType: "Terapie",
            serviceName: "Terapie de Cuplu",
            date: Timestamp.fromDate(nextWeek),
            startTime: "14:00",
            endTime: "15:30",
            status: "scheduled",
            notes: "",
            createdAt: Timestamp.now(),
            price: 200,
          },
        ];

        for (const appointment of appointments) {
          await addDoc(appointmentsRef, appointment);
        }

        setMessage((prev) => (prev || "") + "Programări create cu succes.");
      } else {
        setMessage((prev) => (prev || "") + "Programările există deja.");
      }
    } catch (err) {
      console.error("Eroare la crearea datelor inițiale:", err);
      setError(
        "A apărut o eroare la crearea datelor inițiale. Verificați consola pentru detalii."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Inițializare Date</h2>
      <p className="mb-4">
        Acest buton va crea colecțiile necesare pentru funcționarea modulului de
        programări, dacă acestea nu există deja.
      </p>

      <button
        onClick={createAppointmentsAndServices}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Se procesează..." : "Creează colecțiile necesare"}
      </button>

      {message && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showSpecialistForm, setShowSpecialistForm] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<Specialist | null>(
    null
  );
  const [specialistData, setSpecialistData] = useState<Specialist>({
    id: "",
    name: "",
    role: "",
    imageUrl: "",
    description: "",
    email: "",
    phone: "",
    schedule: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", available: true },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", available: true },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", available: true },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", available: true },
      { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", available: true },
    ],
  });

  // Filtre și sortare
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("upcoming");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");

  // Date pentru editarea programării
  const [editedStatus, setEditedStatus] = useState<string>("scheduled");
  const [editedNotes, setEditedNotes] = useState<string>("");
  const [editedDate, setEditedDate] = useState<string>("");
  const [editedStartTime, setEditedStartTime] = useState<string>("");

  // Date pentru raportare
  const [todayAppointments, setTodayAppointments] = useState<number>(0);
  const [weekAppointments, setWeekAppointments] = useState<number>(0);
  const [monthAppointments, setMonthAppointments] = useState<number>(0);
  const [cancelledAppointments, setCancelledAppointments] = useState<number>(0);

  useEffect(() => {
    fetchAppointments();
    fetchServices();
    fetchSpecialists();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      // Obține toate programările, ordonate după data
      const appointmentsQuery = query(
        collection(db, "appointments"),
        orderBy("date", "asc")
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);

      // Procesează datele programărilor
      const appointmentsList = appointmentsSnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Loading appointment data:", data);
        const appointment = {
          id: doc.id,
          userId: data.userId || "",
          userName: data.userName || "Utilizator necunoscut",
          userEmail: data.userEmail || "",
          userPhone: data.userPhone || "",
          serviceType: data.serviceType || "",
          serviceName: data.serviceName || "Serviciu necunoscut",
          date: data.date || null,
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          status: data.status || "scheduled",
          notes: data.notes || "",
          createdAt: data.createdAt || null,
          price: data.price || 0,
        };
        console.log("Processed appointment:", appointment);
        return appointment;
      });

      setAppointments(appointmentsList);

      // Calculează statisticile
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayTimestamp = Timestamp.fromDate(today);

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekStartTimestamp = Timestamp.fromDate(weekStart);

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthStartTimestamp = Timestamp.fromDate(monthStart);

      // Calculează statisticile pentru afișare
      setTodayAppointments(
        appointmentsList.filter(
          (a) =>
            a.date &&
            a.date.seconds >= todayTimestamp.seconds &&
            a.date.seconds < todayTimestamp.seconds + 86400
        ).length
      );

      setWeekAppointments(
        appointmentsList.filter(
          (a) =>
            a.date &&
            a.date.seconds >= weekStartTimestamp.seconds &&
            a.date.seconds < todayTimestamp.seconds + 7 * 86400
        ).length
      );

      setMonthAppointments(
        appointmentsList.filter(
          (a) =>
            a.date &&
            a.date.seconds >= monthStartTimestamp.seconds &&
            a.date.seconds < monthStartTimestamp.seconds + 31 * 86400
        ).length
      );

      setCancelledAppointments(
        appointmentsList.filter((a) => a.status === "cancelled").length
      );
    } catch (error) {
      console.error("Error fetching appointments:", error);
      alert("Eroare la încărcarea programărilor. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      // Obține toate serviciile disponibile
      const servicesQuery = query(collection(db, "services"));
      const servicesSnapshot = await getDocs(servicesQuery);

      const servicesList = servicesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "",
          category: data.category || "",
          duration: data.duration || 60,
          price: data.price || 0,
        };
      });

      setServices(servicesList);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchSpecialists = async () => {
    try {
      setLoading(true);
      const specialistsRef = collection(db, "specialists");
      const specialistsSnapshot = await getDocs(specialistsRef);

      const specialistsList = specialistsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Specialist[];

      setSpecialists(specialistsList);
    } catch (error) {
      console.error("Error fetching specialists:", error);
      alert("Eroare la încărcarea specialiștilor. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      // Verifică dacă data și ora sunt valide
      if (!editedDate || !editedStartTime) {
        alert("Vă rugăm completați data și ora programării.");
        return;
      }

      // Calculează ora de terminare pe baza duratei serviciului
      const selectedService = services.find(
        (s) => s.name === selectedAppointment.serviceName
      );
      const duration = selectedService ? selectedService.duration : 60; // Durată implicită în minute

      // Calculează ora de terminare
      const [hours, minutes] = editedStartTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + duration);

      const formattedEndTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;

      // Conversie string la Timestamp
      const dateObj = new Date(editedDate);
      const timestamp = Timestamp.fromDate(dateObj);

      // Actualizează programarea în Firestore
      const appointmentRef = doc(db, "appointments", selectedAppointment.id);
      await updateDoc(appointmentRef, {
        date: timestamp,
        startTime: editedStartTime,
        endTime: formattedEndTime,
        status: editedStatus,
        notes: editedNotes,
        updatedAt: Timestamp.now(),
      });

      // Adaugă o înregistrare în istoric
      await addDoc(collection(db, "appointmentHistory"), {
        appointmentId: selectedAppointment.id,
        userId: selectedAppointment.userId,
        previousDate: selectedAppointment.date,
        newDate: timestamp,
        previousStatus: selectedAppointment.status,
        newStatus: editedStatus,
        changedBy: "admin", // Ar trebui să fie email-ul administratorului real
        changedAt: Timestamp.now(),
      });

      // Actualizează lista locală
      setAppointments(
        appointments.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? {
                ...appointment,
                date: timestamp,
                startTime: editedStartTime,
                endTime: formattedEndTime,
                status: editedStatus as
                  | "scheduled"
                  | "completed"
                  | "cancelled"
                  | "no-show",
                notes: editedNotes,
              }
            : appointment
        )
      );

      // Închide modalul
      alert("Programarea a fost actualizată cu succes!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Eroare la actualizarea programării. Vă rugăm încercați din nou.");
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      // Șterge programarea
      await deleteDoc(doc(db, "appointments", selectedAppointment.id));

      // Adaugă o înregistrare că programarea a fost ștearsă
      await addDoc(collection(db, "appointmentHistory"), {
        appointmentId: selectedAppointment.id,
        userId: selectedAppointment.userId,
        status: "deleted",
        changedBy: "admin", // Ar trebui să fie email-ul administratorului real
        changedAt: Timestamp.now(),
      });

      // Actualizează lista locală
      setAppointments(
        appointments.filter(
          (appointment) => appointment.id !== selectedAppointment.id
        )
      );

      // Închide modalul
      alert("Programarea a fost ștearsă cu succes!");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Eroare la ștergerea programării. Vă rugăm încercați din nou.");
    }
  };

  const handleAddSpecialist = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!specialistData.name || !specialistData.role) {
        alert("Numele și rolul specialistului sunt obligatorii.");
        return;
      }

      const specialistsRef = collection(db, "specialists");
      const newSpecialistRef = await addDoc(specialistsRef, {
        name: specialistData.name,
        role: specialistData.role,
        imageUrl: specialistData.imageUrl || "https://via.placeholder.com/150",
        description: specialistData.description || "",
        email: specialistData.email || "",
        phone: specialistData.phone || "",
        schedule: specialistData.schedule || [],
        createdAt: Timestamp.now(),
      });

      const newSpecialist = {
        ...specialistData,
        id: newSpecialistRef.id,
      };

      setSpecialists([...specialists, newSpecialist]);
      alert("Specialist adăugat cu succes!");
      setShowSpecialistForm(false);
      resetSpecialistForm();
    } catch (error) {
      console.error("Error adding specialist:", error);
      alert("Eroare la adăugarea specialistului. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSpecialist = async () => {
    if (!editingSpecialist) return;

    try {
      setLoading(true);

      // Validate required fields
      if (!specialistData.name || !specialistData.role) {
        alert("Numele și rolul specialistului sunt obligatorii.");
        return;
      }

      const specialistRef = doc(db, "specialists", editingSpecialist.id);
      await updateDoc(specialistRef, {
        name: specialistData.name,
        role: specialistData.role,
        imageUrl: specialistData.imageUrl,
        description: specialistData.description,
        email: specialistData.email,
        phone: specialistData.phone,
        schedule: specialistData.schedule,
        updatedAt: Timestamp.now(),
      });

      // Update local state
      setSpecialists(
        specialists.map((spec) =>
          spec.id === editingSpecialist.id
            ? { ...specialistData, id: editingSpecialist.id }
            : spec
        )
      );

      alert("Specialist actualizat cu succes!");
      setShowSpecialistForm(false);
      setEditingSpecialist(null);
      resetSpecialistForm();
    } catch (error) {
      console.error("Error updating specialist:", error);
      alert(
        "Eroare la actualizarea specialistului. Vă rugăm încercați din nou."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpecialist = async (specialistId: string) => {
    if (!window.confirm("Ești sigur că vrei să ștergi acest specialist?")) {
      return;
    }

    try {
      setLoading(true);

      // Check if specialist has any appointments
      const appointmentsRef = collection(db, "appointments");
      const q = query(
        appointmentsRef,
        where("specialistId", "==", specialistId)
      );
      const appointmentsSnapshot = await getDocs(q);

      if (!appointmentsSnapshot.empty) {
        if (
          !window.confirm(
            "Acest specialist are programări. Ștergerea sa va afecta programările existente. Continuați?"
          )
        ) {
          return;
        }
      }

      await deleteDoc(doc(db, "specialists", specialistId));

      // Update local state
      setSpecialists(specialists.filter((spec) => spec.id !== specialistId));
      alert("Specialist șters cu succes!");
    } catch (error) {
      console.error("Error deleting specialist:", error);
      alert("Eroare la ștergerea specialistului. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSpecialist = (specialist: Specialist) => {
    setEditingSpecialist(specialist);
    setSpecialistData({
      ...specialist,
    });
    setShowSpecialistForm(true);
  };

  const resetSpecialistForm = () => {
    setSpecialistData({
      id: "",
      name: "",
      role: "",
      imageUrl: "",
      description: "",
      email: "",
      phone: "",
      schedule: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", available: true },
        { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", available: true },
        { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", available: true },
        { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", available: true },
        { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", available: true },
      ],
    });
  };

  const updateScheduleDay = (index: number, field: string, value: any) => {
    const updatedSchedule = [...(specialistData.schedule || [])];
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      [field]: value,
    };
    setSpecialistData({
      ...specialistData,
      schedule: updatedSchedule,
    });
  };

  const getDayName = (dayOfWeek: number) => {
    const days = [
      "Duminică",
      "Luni",
      "Marți",
      "Miercuri",
      "Joi",
      "Vineri",
      "Sâmbătă",
    ];
    return days[dayOfWeek];
  };

  const handleOpenModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);

    // Pregătește datele pentru editare
    setEditedStatus(appointment.status);
    setEditedNotes(appointment.notes || "");

    // Convertește data la formatul necesar pentru input type="date"
    const date = new Date(appointment.date.seconds * 1000);
    const formattedDate = date.toISOString().slice(0, 10);
    setEditedDate(formattedDate);

    setEditedStartTime(appointment.startTime);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleOpenDeleteModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAppointment(null);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Programată";
      case "completed":
        return "Finalizată";
      case "cancelled":
        return "Anulată";
      case "no-show":
        return "Neprezentare";
      default:
        return status;
    }
  };

  // Formatarea datelor pentru afișare
  const formatDate = (timestamp: any) => {
    if (!timestamp) {
      console.log("formatDate: timestamp is null or undefined");
      return "📅 Necunoscut";
    }
    try {
      console.log("formatDate: timestamp", timestamp);
      const date = new Date(timestamp.seconds * 1000);
      console.log("formatDate: converted date", date);
      const formatted = date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      console.log("formatDate: formatted result", formatted);
      // Adaugă un prefix pentru a face data vizibilă în caz de probleme de CSS
      return `📅 ${formatted}`;
    } catch (e) {
      console.error("formatDate: error formatting date", e);
      return "📅 Data invalidă";
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "🕐 Necunoscută";
    return `🕐 ${timeString}`;
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "";
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
    }).format(amount);
  };

  // Filtrarea programărilor
  const getFilteredAppointments = () => {
    // Obține timestamp pentru filtrare dată
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayTimestamp = { seconds: Math.floor(today.getTime() / 1000) };

    return appointments
      .filter((appointment) => {
        // Filtrare text căutare
        const searchTermMatch =
          !searchTerm ||
          appointment.userName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          appointment.userEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          appointment.serviceName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        // Filtrare status
        const statusMatch =
          filterStatus === "all" || appointment.status === filterStatus;

        // Filtrare serviciu
        const serviceMatch =
          filterService === "all" || appointment.serviceName === filterService;

        // Filtrare interval de date
        let dateMatch = true;
        if (filterDateRange === "upcoming") {
          dateMatch =
            appointment.date &&
            appointment.date.seconds >= todayTimestamp.seconds;
        } else if (filterDateRange === "past") {
          dateMatch =
            appointment.date &&
            appointment.date.seconds < todayTimestamp.seconds;
        } else if (filterDateRange === "today") {
          dateMatch =
            appointment.date &&
            appointment.date.seconds >= todayTimestamp.seconds &&
            appointment.date.seconds < todayTimestamp.seconds + 86400;
        } else if (filterDateRange === "week") {
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + 7);
          const weekEndTimestamp = {
            seconds: Math.floor(weekEnd.getTime() / 1000),
          };

          dateMatch =
            appointment.date &&
            appointment.date.seconds >= todayTimestamp.seconds &&
            appointment.date.seconds < weekEndTimestamp.seconds;
        }

        return searchTermMatch && statusMatch && serviceMatch && dateMatch;
      })
      .sort((a, b) => {
        // Sortare
        if (sortBy === "date") {
          const diff = a.date.seconds - b.date.seconds;
          return sortOrder === "asc" ? diff : -diff;
        } else if (sortBy === "service") {
          const diff = a.serviceName.localeCompare(b.serviceName);
          return sortOrder === "asc" ? diff : -diff;
        } else if (sortBy === "userName") {
          const diff = a.userName.localeCompare(b.userName);
          return sortOrder === "asc" ? diff : -diff;
        } else if (sortBy === "status") {
          const diff = a.status.localeCompare(b.status);
          return sortOrder === "asc" ? diff : -diff;
        }
        return 0;
      });
  };

  // Obține lista de servicii unice pentru filtrare
  const uniqueServices = Array.from(
    new Set(appointments.map((a) => a.serviceName))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <style>
        {`
          /* CSS forțat pentru vizibilitatea datelor */
          .date-cell-container {
            background-color: white !important;
          }
          .date-cell-text {
            color: #111827 !important;
            font-weight: 700 !important;
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
            background-color: transparent !important;
            text-shadow: none !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
          }
          .time-cell-text {
            color: #4b5563 !important;
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
            background-color: transparent !important;
            text-shadow: none !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
          }
          /* Forțează culorile pentru toate celulele de dată din tabel */
          tbody tr td.date-cell-container,
          tbody tr td:first-child {
            background-color: white !important;
          }
          tbody tr td.date-cell-container .date-cell-text,
          tbody tr td.date-cell-container div.text-sm,
          tbody tr td:first-child .date-cell-text,
          tbody tr td:first-child div.text-sm {
            color: #111827 !important;
            font-weight: 700 !important;
            text-shadow: none !important;
            background: transparent !important;
            opacity: 1 !important;
          }
          tbody tr td.date-cell-container .time-cell-text,
          tbody tr td.date-cell-container div.text-xs,
          tbody tr td:first-child .time-cell-text,
          tbody tr td:first-child div.text-xs {
            color: #4b5563 !important;
            text-shadow: none !important;
            background: transparent !important;
            opacity: 1 !important;
          }
          /* Asigură-te că hover-ul nu schimbă culorile */
          tbody tr:hover td.date-cell-container,
          tbody tr:hover td:first-child {
            background-color: #f9fafb !important;
          }
          tbody tr:hover td.date-cell-container .date-cell-text,
          tbody tr:hover td.date-cell-container div.text-sm,
          tbody tr:hover td:first-child .date-cell-text,
          tbody tr:hover td:first-child div.text-sm {
            color: #111827 !important;
            font-weight: 700 !important;
          }
          tbody tr:hover td.date-cell-container .time-cell-text,
          tbody tr:hover td.date-cell-container div.text-xs,
          tbody tr:hover td:first-child .time-cell-text,
          tbody tr:hover td:first-child div.text-xs {
            color: #4b5563 !important;
          }
          /* Fix pentru cazuri speciale de culoare albă */
          * {
            color: inherit;
          }
          tbody tr td.date-cell-container * {
            color: inherit !important;
          }
        `}
      </style>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Gestionare Programări</h2>

        {/* Dashboard sumar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-blue-600 font-medium">
              Programări astăzi
            </span>
            <span className="text-2xl font-bold">{todayAppointments}</span>
          </div>

          <div className="bg-green-50 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-green-600 font-medium">
              Programări săptămâna aceasta
            </span>
            <span className="text-2xl font-bold">{weekAppointments}</span>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-purple-600 font-medium">
              Programări luna aceasta
            </span>
            <span className="text-2xl font-bold">{monthAppointments}</span>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-orange-600 font-medium">
              Programări anulate
            </span>
            <span className="text-2xl font-bold">{cancelledAppointments}</span>
          </div>
        </div>

        {/* Filtre și sortare */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Caută
            </label>
            <input
              type="text"
              id="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nume client, email sau serviciu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Toate statusurile</option>
              <option value="scheduled">Programate</option>
              <option value="completed">Finalizate</option>
              <option value="cancelled">Anulate</option>
              <option value="no-show">Neprezentare</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <label
              htmlFor="service"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Serviciu
            </label>
            <select
              id="service"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
            >
              <option value="all">Toate serviciile</option>
              {uniqueServices.map((service, index) => (
                <option key={index} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48">
            <label
              htmlFor="dateRange"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Interval de timp
            </label>
            <select
              id="dateRange"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
            >
              <option value="all">Toate programările</option>
              <option value="upcoming">Viitoare</option>
              <option value="past">Trecute</option>
              <option value="today">Astăzi</option>
              <option value="week">Această săptămână</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-48">
            <label
              htmlFor="sortBy"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sortează după
            </label>
            <select
              id="sortBy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Dată</option>
              <option value="userName">Nume client</option>
              <option value="service">Serviciu</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <label
              htmlFor="sortOrder"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ordine
            </label>
            <select
              id="sortOrder"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Crescător</option>
              <option value="desc">Descrescător</option>
            </select>
          </div>
        </div>

        {/* Tabel programări */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Data și ora
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Client
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Serviciu
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getFilteredAppointments().length > 0 ? (
                  getFilteredAppointments().map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 whitespace-nowrap bg-white date-cell-container">
                        <div
                          className="text-sm font-medium text-gray-900 date-cell-text"
                          data-testid="appointment-date"
                          title={`Data programării: ${formatDate(appointment.date)}`}
                        >
                          {formatDate(appointment.date)}
                        </div>
                        <div
                          className="text-xs text-gray-500 time-cell-text"
                          data-testid="appointment-time"
                          title={`Ora: ${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}`}
                        >
                          {formatTime(appointment.startTime)} -{" "}
                          {formatTime(appointment.endTime)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.userName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.userEmail}
                        </div>
                        {appointment.userPhone && (
                          <div className="text-xs text-gray-500">
                            {appointment.userPhone}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          {appointment.serviceName}
                        </div>
                        {appointment.price && appointment.price > 0 && (
                          <div className="text-xs text-gray-500">
                            {formatCurrency(appointment.price)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(appointment.status)}`}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenModal(appointment)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Editează
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(appointment)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Șterge
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 px-4 text-center text-gray-500"
                    >
                      Nu s-au găsit programări care să corespundă criteriilor
                      selectate.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Specialists Management Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Specialiști</h2>
            <button
              onClick={() => {
                setEditingSpecialist(null);
                setShowSpecialistForm(true);
                resetSpecialistForm();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Adaugă specialist
            </button>
          </div>

          {showSpecialistForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">
                {editingSpecialist
                  ? "Editează Specialist"
                  : "Adaugă Specialist Nou"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nume <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={specialistData.name}
                    onChange={(e) =>
                      setSpecialistData({
                        ...specialistData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ex: Dr. Ana Popescu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={specialistData.role}
                    onChange={(e) =>
                      setSpecialistData({
                        ...specialistData,
                        role: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ex: Psihoterapeut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={specialistData.email}
                    onChange={(e) =>
                      setSpecialistData({
                        ...specialistData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={specialistData.phone}
                    onChange={(e) =>
                      setSpecialistData({
                        ...specialistData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ex: 0712345678"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Imagine
                  </label>
                  <input
                    type="text"
                    value={specialistData.imageUrl}
                    onChange={(e) =>
                      setSpecialistData({
                        ...specialistData,
                        imageUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descriere
                  </label>
                  <textarea
                    value={specialistData.description}
                    onChange={(e) =>
                      setSpecialistData({
                        ...specialistData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Descriere a experienței și specializărilor"
                  ></textarea>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Program Săptămânal</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Zi
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ora început
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ora sfârșit
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Disponibil
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(specialistData.schedule || []).map((day, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {getDayName(day.dayOfWeek)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="time"
                              value={day.startTime}
                              onChange={(e) =>
                                updateScheduleDay(
                                  index,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="border border-gray-300 rounded-md px-2 py-1"
                              disabled={!day.available}
                              aria-label={`Ora de început pentru ${getDayName(day.dayOfWeek)}`}
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="time"
                              value={day.endTime}
                              onChange={(e) =>
                                updateScheduleDay(
                                  index,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              className="border border-gray-300 rounded-md px-2 py-1"
                              disabled={!day.available}
                              aria-label={`Ora de sfârșit pentru ${getDayName(day.dayOfWeek)}`}
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={day.available}
                              onChange={(e) =>
                                updateScheduleDay(
                                  index,
                                  "available",
                                  e.target.checked
                                )
                              }
                              className="form-checkbox h-5 w-5 text-blue-600"
                              aria-label={`Disponibil pentru ${getDayName(day.dayOfWeek)}`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={
                    editingSpecialist
                      ? handleUpdateSpecialist
                      : handleAddSpecialist
                  }
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading
                    ? "Se procesează..."
                    : editingSpecialist
                      ? "Actualizează"
                      : "Adaugă"}
                </button>
                <button
                  onClick={() => setShowSpecialistForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Anulează
                </button>
              </div>
            </div>
          )}

          {/* Specialists List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialist
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {specialists.length > 0 ? (
                  specialists.map((specialist) => (
                    <tr key={specialist.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={
                                specialist.imageUrl ||
                                "https://via.placeholder.com/150"
                              }
                              alt={specialist.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {specialist.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {specialist.role}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {specialist.email && (
                          <div className="text-sm text-gray-500">
                            {specialist.email}
                          </div>
                        )}
                        {specialist.phone && (
                          <div className="text-sm text-gray-500">
                            {specialist.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-500">
                          {specialist.schedule
                            ?.filter((day) => day.available)
                            .map((day, idx) => (
                              <div key={idx}>
                                {getDayName(day.dayOfWeek)}: {day.startTime} -{" "}
                                {day.endTime}
                              </div>
                            ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEditSpecialist(specialist)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Editează
                        </button>
                        <button
                          onClick={() => handleDeleteSpecialist(specialist.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Șterge
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      Nu există specialiști înregistrați.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal editare programare */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Editare Programare</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Închide modalul"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="text-sm font-medium text-gray-500">Client</h4>
                <p className="text-base font-medium">
                  {selectedAppointment.userName}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedAppointment.userEmail}
                </p>
                {selectedAppointment.userPhone && (
                  <p className="text-sm text-gray-500">
                    {selectedAppointment.userPhone}
                  </p>
                )}
              </div>

              <div className="border-b pb-4">
                <h4 className="text-sm font-medium text-gray-500">Serviciu</h4>
                <p className="text-base font-medium">
                  {selectedAppointment.serviceName}
                </p>
                {selectedAppointment.price && selectedAppointment.price > 0 && (
                  <p className="text-sm text-gray-500">
                    {formatCurrency(selectedAppointment.price)}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="appointmentDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data programării
                </label>
                <input
                  type="date"
                  id="appointmentDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={editedDate}
                  onChange={(e) => setEditedDate(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="appointmentTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ora de început
                </label>
                <input
                  type="time"
                  id="appointmentTime"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={editedStartTime}
                  onChange={(e) => setEditedStartTime(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                >
                  <option value="scheduled">Programată</option>
                  <option value="completed">Finalizată</option>
                  <option value="cancelled">Anulată</option>
                  <option value="no-show">Neprezentare</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Note
                </label>
                <textarea
                  id="notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Note interne despre programare..."
                ></textarea>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleUpdateAppointment}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Actualizează programarea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmare ștergere */}
      {isDeleteModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Confirmare ștergere</h3>
              <button
                onClick={handleCloseDeleteModal}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Închide modalul de confirmare"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Sunteți sigur că doriți să ștergeți această programare? Această
                acțiune nu poate fi anulată.
              </p>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">Detalii programare:</p>
                <p className="text-sm mt-2">
                  <span className="font-medium">Client:</span>{" "}
                  {selectedAppointment.userName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Serviciu:</span>{" "}
                  {selectedAppointment.serviceName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Data:</span>{" "}
                  {formatDate(selectedAppointment.date)} (
                  {formatTime(selectedAppointment.startTime)} -{" "}
                  {formatTime(selectedAppointment.endTime)})
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCloseDeleteModal}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Anulează
              </button>
              <button
                onClick={handleDeleteAppointment}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Șterge programarea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inițializare date */}
      <InitializeData />
    </div>
  );
};

export default AdminAppointments;
