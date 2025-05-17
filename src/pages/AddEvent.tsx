import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

const AddEvent: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    imageUrl: "",
    capacity: 20
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Imaginea este prea mare. Mărimea maximă acceptată este de 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Te rugăm să încarci doar fișiere de tip imagine.");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setError(null);
  };

  const processImage = async (file: File | null): Promise<string> => {
    if (!file) {
      return "/images/BussinesLider.jpg";
    }

    try {
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split(".").pop();
      const fileName = `event_${timestamp}.${fileExtension}`;

      const storageRef = ref(storage, `events/${fileName}`);
      await uploadBytes(storageRef, file);

      const downloadUrl = await getDownloadURL(storageRef);

      console.log("Imaginea a fost încărcată cu succes:", downloadUrl);

      return `/images/Afis 2.jpg`;
    } catch (err) {
      console.error("Eroare la procesarea imaginii:", err);
      throw new Error("Nu s-a putut procesa imaginea. Vă rugăm să încercați din nou.");
    }
  };

  const validateForm = (): boolean => {
    if (!eventData.title) {
      setError("Titlul evenimentului este obligatoriu.");
      return false;
    }

    if (!eventData.date) {
      setError("Data evenimentului este obligatorie.");
      return false;
    }

    if (!eventData.location) {
      setError("Locația evenimentului este obligatorie.");
      return false;
    }

    if (!imageFile && !imagePreview) {
      setError("Te rugăm să încarci o imagine pentru eveniment.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const imageUrl = await processImage(imageFile);

      const eventPayload = {
        ...eventData,
        imageUrl,
        createdAt: Timestamp.now(),
        createdBy: "unknown",
        updatedAt: Timestamp.now(),
        updatedBy: "unknown",
        registeredUsers: []
      };

      const docRef = await addDoc(collection(db, "events"), eventPayload);
      console.log("Eveniment adăugat cu succes:", docRef.id);

      setSuccess(true);

      setEventData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        imageUrl: "",
        capacity: 20
      });
      setImageFile(null);
      setImagePreview("");

      setTimeout(() => {
        navigate(`/events/${docRef.id}`);
      }, 3000);

    } catch (err) {
      console.error("Eroare la salvarea evenimentului:", err);
      setError("A apărut o eroare la salvarea evenimentului. Vă rugăm să încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Doar administratorii pot adăuga evenimente noi.</p>
          <a href="/" className="underline">Înapoi la pagina principală</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Adaugă Eveniment Nou</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Evenimentul a fost adăugat cu succes! Vei fi redirecționat în curând.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Titlu Eveniment*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={eventData.title}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Introduceți titlul evenimentului"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                  Data Eveniment*
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
                  Ora Eveniment
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={eventData.time}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                  Locație*
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={eventData.location}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Introduceți locația evenimentului"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacity">
                  Capacitate (număr participanți)
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={eventData.capacity}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="1"
                />
              </div>

              <div className="mb-4 md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Descriere Eveniment
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={eventData.description}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={5}
                  placeholder="Introduceți descrierea evenimentului"
                />
              </div>

              <div className="mb-4 md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventImage">
                  Imagine Eveniment*
                </label>
                <input
                  type="file"
                  id="eventImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex items-center space-x-4">
                  <label 
                    htmlFor="eventImage" 
                    className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {imagePreview ? "Schimbă Imaginea" : "Încarcă Imagine"}
                  </label>
                  {imagePreview && (
                    <span className="text-sm text-gray-600">
                      Imagine selectată: {imageFile?.name}
                    </span>
                  )}
                </div>

                {imagePreview && (
                  <div className="mt-4 relative">
                    <img 
                      src={imagePreview} 
                      alt="Previzualizare" 
                      className="w-full max-h-64 object-contain border rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setImageFile(null);
                        setEventData(prev => ({ ...prev, imageUrl: "" }));
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  Format recomandat: JPEG sau PNG, dimensiune maximă 5MB. Pentru evenimente importante folosiți imaginea "Afis 2.jpg" din folderul public/images.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <a
                href="/admin"
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Înapoi la Panoul Administrativ
              </a>

              <button
                type="submit"
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Se procesează...
                  </span>
                ) : "Adaugă Eveniment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddEvent;
