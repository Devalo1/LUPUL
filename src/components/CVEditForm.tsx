import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaGraduationCap,
  FaCertificate,
  FaLanguage,
  FaAward,
  FaBook,
  FaBriefcase,
  FaUser,
  FaCamera,
  FaImage,
} from "react-icons/fa";
import SimplePhotoUploader from "../services/SimplePhotoUploader";
import {} from /* ref, uploadBytes, getDownloadURL */ "firebase/storage";
import {} from /* storage */ "../firebase-core";
import {} from /* firestore */ "../firebase-core";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
  description?: string;
}

interface Certification {
  id?: string;
  name: string;
  organization: string;
  year: number;
  expiryYear?: number | null;
  description?: string;
}

interface Language {
  language: string;
  proficiency: "basic" | "intermediate" | "advanced" | "native";
}

interface Award {
  id?: string;
  name: string;
  organization: string;
  year: number;
  description?: string;
}

interface Publication {
  id?: string;
  title: string;
  publisher: string;
  year: number;
  url?: string;
  description?: string;
}

interface ExperienceDetail {
  id?: string;
  position: string;
  company: string;
  location?: string;
  startYear: number;
  endYear: number | null;
  description?: string;
  current: boolean;
}

interface CVData {
  experience: number;
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  awards: Award[];
  publications: Publication[];
  bio: string;
  experienceDetails: ExperienceDetail[];
  photoURL?: string;
}

interface CVEditFormProps {
  initialData: CVData | null;
  onSave: (data: CVData) => void;
  onCancel: () => void;
  userId?: string;
}

const CVEditForm: React.FC<CVEditFormProps> = ({
  initialData,
  onSave,
  onCancel,
  userId,
}) => {
  const auth = useAuth();

  const [cvData, setCvData] = useState<CVData>(
    initialData || {
      experience: 0,
      education: [],
      certifications: [],
      languages: [],
      awards: [],
      publications: [],
      bio: "",
      experienceDetails: [],
      photoURL: "",
    }
  );

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [uploadingProfileImage, setUploadingProfileImage] =
    useState<boolean>(false);
  const [profileUploadError, setProfileUploadError] = useState<string | null>(
    null
  );
  const [profileUploadSuccess, setProfileUploadSuccess] =
    useState<boolean>(false);

  const [showEducationForm, setShowEducationForm] = useState(false);
  const [newEducation, setNewEducation] = useState<Omit<Education, "id">>({
    institution: "",
    degree: "",
    field: "",
    startYear: new Date().getFullYear(),
    endYear: null,
    description: "",
  });

  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [newCertification, setNewCertification] = useState<
    Omit<Certification, "id">
  >({
    name: "",
    organization: "",
    year: new Date().getFullYear(),
    expiryYear: null,
    description: "",
  });

  const [showLanguageForm, setShowLanguageForm] = useState(false);
  const [newLanguage, setNewLanguage] = useState<Language>({
    language: "",
    proficiency: "intermediate",
  });

  const [showAwardForm, setShowAwardForm] = useState(false);
  const [newAward, setNewAward] = useState<Omit<Award, "id">>({
    name: "",
    organization: "",
    year: new Date().getFullYear(),
    description: "",
  });

  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [newPublication, setNewPublication] = useState<Omit<Publication, "id">>(
    {
      title: "",
      publisher: "",
      year: new Date().getFullYear(),
      url: "",
      description: "",
    }
  );

  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [newExperience, setNewExperience] = useState<
    Omit<ExperienceDetail, "id">
  >({
    position: "",
    company: "",
    location: "",
    startYear: new Date().getFullYear(),
    endYear: null,
    description: "",
    current: false,
  });

  useEffect(() => {
    if (initialData?.photoURL) {
      setProfileImagePreview(initialData.photoURL);
    }
  }, [initialData]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileUploadError(
        "Imaginea este prea mare. Dimensiunea maximă acceptată este de 5MB."
      );
      return;
    }

    if (!file.type.startsWith("image/")) {
      setProfileUploadError(
        "Vă rugăm să încărcați doar fișiere de tip imagine."
      );
      return;
    }

    setProfileImage(file);
    setProfileUploadError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadProfileImage = async (): Promise<string | null> => {
    if (!profileImage || !userId) return null;

    try {
      setUploadingProfileImage(true);

      const downloadURL = await SimplePhotoUploader.uploadPhoto(
        profileImage,
        userId
      );

      console.log(
        "URL imagine încărcat cu succes prin SimplePhotoUploader:",
        downloadURL
      );

      setUploadingProfileImage(false);
      setProfileUploadSuccess(true);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      setProfileUploadError(
        "A apărut o eroare la încărcarea imaginii. Vă rugăm încercați din nou."
      );
      setUploadingProfileImage(false);
      setProfileUploadSuccess(false);
      return null;
    }
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setCvData({ ...cvData, experience: value });
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCvData({ ...cvData, bio: e.target.value });
  };

  const handleEducationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewEducation({
      ...newEducation,
      [name]:
        name === "startYear" || name === "endYear"
          ? value
            ? parseInt(value)
            : null
          : value,
    });
  };

  const addEducation = () => {
    if (!newEducation.institution || !newEducation.degree) return;

    const educationItem: Education = {
      id: `edu_${Date.now()}`,
      ...newEducation,
    };

    setCvData({
      ...cvData,
      education: [...cvData.education, educationItem],
    });

    setNewEducation({
      institution: "",
      degree: "",
      field: "",
      startYear: new Date().getFullYear(),
      endYear: null,
      description: "",
    });
    setShowEducationForm(false);
  };

  const removeEducation = (id: string) => {
    setCvData({
      ...cvData,
      education: cvData.education.filter((edu) => edu.id !== id),
    });
  };

  const handleCertificationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewCertification({
      ...newCertification,
      [name]:
        name === "year" || name === "expiryYear"
          ? value
            ? parseInt(value)
            : null
          : value,
    });
  };

  const addCertification = () => {
    if (!newCertification.name || !newCertification.organization) return;

    const certificationItem: Certification = {
      id: `cert_${Date.now()}`,
      ...newCertification,
    };

    setCvData({
      ...cvData,
      certifications: [...cvData.certifications, certificationItem],
    });

    setNewCertification({
      name: "",
      organization: "",
      year: new Date().getFullYear(),
      expiryYear: null,
      description: "",
    });
    setShowCertificationForm(false);
  };

  const removeCertification = (id: string) => {
    setCvData({
      ...cvData,
      certifications: cvData.certifications.filter((cert) => cert.id !== id),
    });
  };

  const handleLanguageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewLanguage({
      ...newLanguage,
      [name]: value,
    } as Language);
  };

  const addLanguage = () => {
    if (!newLanguage.language) return;

    setCvData({
      ...cvData,
      languages: [...cvData.languages, newLanguage],
    });

    setNewLanguage({
      language: "",
      proficiency: "intermediate",
    });
    setShowLanguageForm(false);
  };

  const removeLanguage = (index: number) => {
    const updatedLanguages = [...cvData.languages];
    updatedLanguages.splice(index, 1);
    setCvData({
      ...cvData,
      languages: updatedLanguages,
    });
  };

  const handleAwardChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewAward({
      ...newAward,
      [name]:
        name === "year"
          ? value
            ? parseInt(value)
            : new Date().getFullYear()
          : value,
    });
  };

  const addAward = () => {
    if (!newAward.name || !newAward.organization) return;

    const awardItem: Award = {
      id: `award_${Date.now()}`,
      ...newAward,
    };

    setCvData({
      ...cvData,
      awards: [...cvData.awards, awardItem],
    });

    setNewAward({
      name: "",
      organization: "",
      year: new Date().getFullYear(),
      description: "",
    });
    setShowAwardForm(false);
  };

  const removeAward = (id: string) => {
    setCvData({
      ...cvData,
      awards: cvData.awards.filter((award) => award.id !== id),
    });
  };

  const handlePublicationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewPublication({
      ...newPublication,
      [name]:
        name === "year"
          ? value
            ? parseInt(value)
            : new Date().getFullYear()
          : value,
    });
  };

  const addPublication = () => {
    if (!newPublication.title || !newPublication.publisher) return;

    const publicationItem: Publication = {
      id: `pub_${Date.now()}`,
      ...newPublication,
    };

    setCvData({
      ...cvData,
      publications: [...cvData.publications, publicationItem],
    });

    setNewPublication({
      title: "",
      publisher: "",
      year: new Date().getFullYear(),
      url: "",
      description: "",
    });
    setShowPublicationForm(false);
  };

  const removePublication = (id: string) => {
    setCvData({
      ...cvData,
      publications: cvData.publications.filter((pub) => pub.id !== id),
    });
  };

  interface FormDataType extends EventTarget {
    name: string;
    value: string;
    type?: string;
    checked?: boolean;
  }

  const handleExperienceDetailChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as FormDataType;

    if (name === "current" && checked) {
      setNewExperience({
        ...newExperience,
        current: checked,
        endYear: null,
      });
    } else {
      setNewExperience({
        ...newExperience,
        [name]:
          name === "startYear" || name === "endYear"
            ? value
              ? parseInt(value as string)
              : null
            : type === "checkbox"
              ? checked
              : value,
      });
    }
  };

  const addExperienceDetail = () => {
    if (!newExperience.position || !newExperience.company) return;

    const experienceItem: ExperienceDetail = {
      id: `exp_${Date.now()}`,
      ...newExperience,
    };

    setCvData({
      ...cvData,
      experienceDetails: [...cvData.experienceDetails, experienceItem],
    });

    setNewExperience({
      position: "",
      company: "",
      location: "",
      startYear: new Date().getFullYear(),
      endYear: null,
      description: "",
      current: false,
    });
    setShowExperienceForm(false);
  };

  const removeExperienceDetail = (id: string) => {
    setCvData({
      ...cvData,
      experienceDetails: cvData.experienceDetails.filter(
        (exp) => exp.id !== id
      ),
    });
  };

  const handleSave = async () => {
    let finalData = { ...cvData };

    if (profileImage) {
      const imageUrl = await uploadProfileImage();
      if (imageUrl) {
        finalData.photoURL = imageUrl;

        if (userId) {
          try {
            try {
              const specialistRef = doc(db, "specialists", userId);
              await updateDoc(specialistRef, {
                photoURL: imageUrl,
                imageUrl: imageUrl,
                avatarURL: imageUrl,
                lastUpdated: new Date(),
              });
              console.log(
                "Imagine actualizată cu succes în colecția specialists la salvarea CV-ului"
              );
            } catch (specialistError) {
              console.log(
                "Nu s-a putut actualiza imaginea în colecția specialists la salvarea CV-ului"
              );
            }

            try {
              const userRef = doc(db, "users", userId);
              await updateDoc(userRef, {
                photoURL: imageUrl,
                imageUrl: imageUrl,
                avatarURL: imageUrl,
                lastUpdated: new Date(),
              });
              console.log(
                "Imagine actualizată cu succes în colecția users la salvarea CV-ului"
              );
            } catch (userError) {
              console.error(
                "Eroare la actualizarea imaginii în users:",
                userError
              );
            }

            try {
              localStorage.setItem(`user_${userId}_photoURL`, imageUrl);
            } catch (storageError) {
              console.log("Nu s-a putut salva URL-ul în localStorage");
            }
          } catch (error) {
            console.error("Eroare generală la actualizarea imaginii:", error);
          }
        }
      }
    }

    if (!finalData.photoURL && cvData.photoURL) {
      finalData.photoURL = cvData.photoURL;
    }

    onSave(finalData);
  };

  // Metoda salvează doar fotografia de profil fără a trimite întregul CV
  const handleSaveProfileImageOnly = async () => {
    if (!profileImage || !userId) {
      setProfileUploadError(
        "Nu se poate salva imaginea. Lipsește ID-ul utilizatorului sau imaginea."
      );
      return;
    }

    setUploadingProfileImage(true);
    setProfileUploadError(null);
    setProfileUploadSuccess(false);

    try {
      // Încărcăm imaginea în Firebase Storage folosind serviciul îmbunătățit
      const imageUrl = await uploadProfileImage();

      if (!imageUrl) {
        throw new Error("Nu s-a putut obține URL-ul imaginii încărcate.");
      }

      console.log("Image URL obținut:", imageUrl);

      // Actualizăm starea CV-ului local
      setCvData({
        ...cvData,
        photoURL: imageUrl,
      });
      // Setăm previzualizarea cu URL-ul nou
      setProfileImagePreview(imageUrl);

      // Forțăm reîmprospătarea contextului de autentificare pentru a actualiza UI global
      try {
        // Utilizăm noua metodă refreshUserPhoto în loc de refreshUserData
        // pentru o sincronizare mai precisă a fotografiei
        if (auth.refreshUserPhoto) {
          await auth.refreshUserPhoto();
          console.log(
            "Fotografia de profil a fost sincronizată în tot contextul aplicației"
          );
        }
      } catch (refreshError) {
        console.error(
          "Eroare la sincronizarea fotografiei de profil:",
          refreshError
        );
      }

      // Afișăm mesaj de succes
      setProfileUploadSuccess(true);

      // Setăm un timeout pentru a ascunde mesajul de succes
      setTimeout(() => {
        setProfileUploadSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Eroare la salvarea imaginii de profil:", error);
      setProfileUploadError(
        "A apărut o eroare la salvarea imaginii. Vă rugăm încercați din nou."
      );
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const getProficiencyLabel = (proficiency: string): string => {
    switch (proficiency) {
      case "basic":
        return "Nivel de bază";
      case "intermediate":
        return "Nivel intermediar";
      case "advanced":
        return "Nivel avansat";
      case "native":
        return "Limbă maternă";
      default:
        return proficiency;
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="cv-edit-form">
      <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-inner">
        <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
          <FaUser className="mr-2 text-blue-600" />
          Fotografie de Profil pentru Programări
        </h3>

        <div className="flex flex-col md:flex-row items-center">
          <div className="relative w-40 h-40 mb-5 md:mb-0 md:mr-8">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Previzualizare poză profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-6xl text-gray-300" />
              )}
            </div>

            <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 shadow-md cursor-pointer hover:bg-blue-700 transition-colors">
              <label htmlFor="profile-picture-input" className="cursor-pointer">
                <FaCamera className="text-white text-xl" />
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  title="Încarcă poză de profil"
                  aria-label="Încarcă poză de profil"
                />
              </label>
            </div>
          </div>

          <div className="text-center md:text-left max-w-xl">
            <p className="text-blue-900 mb-3 text-lg">
              Încarcă o fotografie profesională pentru profilul tău. Aceasta va
              fi vizibilă clienților în timpul procesului de programare.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow cursor-pointer flex items-center">
                <FaImage className="mr-2" />
                Selectează o imagine
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </label>

              {profileImage && (
                <button
                  type="button"
                  onClick={handleSaveProfileImageOnly}
                  disabled={uploadingProfileImage}
                  className={`px-4 py-2 rounded-md shadow flex items-center ${
                    uploadingProfileImage
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {uploadingProfileImage ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Salvare...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      Salvează poza
                    </>
                  )}
                </button>
              )}

              {profileImage && (
                <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md border border-green-200 flex items-center">
                  <span className="font-medium">Imagine selectată:</span>
                  <span className="ml-1">{profileImage.name}</span>
                </p>
              )}
            </div>

            {profileUploadSuccess && (
              <div className="mt-3 text-green-600 bg-green-50 border border-green-200 p-2 rounded-md flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Poza de profil a fost salvată cu succes și va apărea în pagina
                de programări!
              </div>
            )}

            {profileUploadError && (
              <div className="mt-3 text-red-600 bg-red-50 border border-red-200 p-2 rounded-md">
                {profileUploadError}
              </div>
            )}

            <p className="text-gray-600 mt-3 text-sm">
              Fotografia trebuie să fie sub 5MB și în format imagine (.jpg,
              .png, etc.)
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <FaUser className="mr-2 text-blue-600" />
          Despre mine
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descriere profesională
          </label>
          <textarea
            value={cvData.bio || ""}
            onChange={handleBioChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Scrie o descriere profesională despre tine și experiența ta..."
          ></textarea>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <FaBriefcase className="mr-2 text-blue-600" />
          Experiență profesională
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          {" "}
          <label
            htmlFor="experience-years"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ani de experiență
          </label>
          <input
            id="experience-years"
            type="number"
            value={cvData.experience || 0}
            onChange={handleExperienceChange}
            min="0"
            max="70"
            className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Experiență în detaliu</h4>
            <button
              type="button"
              onClick={() => setShowExperienceForm(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center"
            >
              <FaPlus className="mr-1" /> Adaugă
            </button>
          </div>

          {showExperienceForm && (
            <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h5 className="font-medium mb-3 text-gray-700">
                Adaugă experiență profesională
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poziție/Funcție *
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={newExperience.position}
                    onChange={handleExperienceDetailChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Psiholog clinician"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Companie/Organizație *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={newExperience.company}
                    onChange={handleExperienceDetailChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Spitalul Județean"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locație
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={newExperience.location || ""}
                    onChange={handleExperienceDetailChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: București, România"
                  />
                </div>

                <div>
                  {" "}
                  <label
                    htmlFor="exp-start-year"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    An început *
                  </label>
                  <input
                    id="exp-start-year"
                    type="number"
                    name="startYear"
                    value={newExperience.startYear || ""}
                    onChange={handleExperienceDetailChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="1950"
                    max={currentYear}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      name="current"
                      id="current-position"
                      checked={newExperience.current || false}
                      onChange={handleExperienceDetailChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="current-position"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Poziție curentă
                    </label>
                  </div>

                  {!newExperience.current && (
                    <div>
                      {" "}
                      <label
                        htmlFor="exp-end-year"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        An sfârșit
                      </label>
                      <input
                        id="exp-end-year"
                        type="number"
                        name="endYear"
                        value={newExperience.endYear || ""}
                        onChange={handleExperienceDetailChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min={newExperience.startYear}
                        max={currentYear}
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descriere
                  </label>
                  <textarea
                    name="description"
                    value={newExperience.description || ""}
                    onChange={handleExperienceDetailChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Descrie responsabilitățile și realizările tale în această poziție..."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowExperienceForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={addExperienceDetail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Adaugă experiență
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {cvData.experienceDetails.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Nu ai adăugat încă experiență profesională.
              </p>
            ) : (
              cvData.experienceDetails.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div>
                      <h5 className="font-medium text-gray-800">
                        {exp.position}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {exp.company}
                        {exp.location ? `, ${exp.location}` : ""}
                      </p>
                      <p className="text-sm text-gray-500">
                        {exp.startYear} -{" "}
                        {exp.current ? "Prezent" : exp.endYear}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeExperienceDetail(exp.id!)}
                      className="text-red-500 hover:text-red-700"
                      title="Șterge"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <FaGraduationCap className="mr-2 text-blue-600" />
          Educație
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Studii</h4>
            <button
              type="button"
              onClick={() => setShowEducationForm(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center"
            >
              <FaPlus className="mr-1" /> Adaugă
            </button>
          </div>

          {showEducationForm && (
            <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h5 className="font-medium mb-3 text-gray-700">Adaugă studii</h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instituție *
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={newEducation.institution}
                    onChange={handleEducationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Universitatea din București"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diplomă/Grad *
                  </label>
                  <input
                    type="text"
                    name="degree"
                    value={newEducation.degree}
                    onChange={handleEducationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Licență, Master, Doctorat"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domeniu
                  </label>
                  <input
                    type="text"
                    name="field"
                    value={newEducation.field}
                    onChange={handleEducationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Psihologie, Medicină"
                  />
                </div>{" "}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor="edu-start-year"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      An început *
                    </label>
                    <input
                      id="edu-start-year"
                      type="number"
                      name="startYear"
                      value={newEducation.startYear}
                      onChange={handleEducationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="1950"
                      max={currentYear}
                      required
                    />
                  </div>{" "}
                  <div>
                    <label
                      htmlFor="edu-end-year"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      An absolvire
                    </label>
                    <input
                      id="edu-end-year"
                      type="number"
                      name="endYear"
                      value={newEducation.endYear || ""}
                      onChange={handleEducationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min={newEducation.startYear}
                      max={currentYear + 10}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descriere
                  </label>
                  <textarea
                    name="description"
                    value={newEducation.description || ""}
                    onChange={handleEducationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Informații suplimentare despre studiile tale..."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEducationForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Adaugă educație
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {cvData.education.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Nu ai adăugat încă studii.
              </p>
            ) : (
              cvData.education.map((edu) => (
                <div
                  key={edu.id}
                  className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div>
                      <h5 className="font-medium text-gray-800">
                        {edu.degree} {edu.field && `în ${edu.field}`}
                      </h5>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">
                        {edu.startYear} - {edu.endYear || "În curs"}
                      </p>
                      {edu.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {edu.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeEducation(edu.id!)}
                      className="text-red-500 hover:text-red-700"
                      title="Șterge"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <FaCertificate className="mr-2 text-blue-600" />
          Certificări
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">
              Certificări profesionale
            </h4>
            <button
              type="button"
              onClick={() => setShowCertificationForm(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center"
            >
              <FaPlus className="mr-1" /> Adaugă
            </button>
          </div>

          {showCertificationForm && (
            <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h5 className="font-medium mb-3 text-gray-700">
                Adaugă certificare
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nume certificare *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newCertification.name}
                    onChange={handleCertificationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Terapie Cognitiv-Comportamentală"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organizație emitentă *
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={newCertification.organization}
                    onChange={handleCertificationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Asociația Română de Psihoterapie"
                    required
                  />
                </div>{" "}
                <div>
                  <label
                    htmlFor="cert-year"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    An obținere *
                  </label>
                  <input
                    id="cert-year"
                    type="number"
                    name="year"
                    value={newCertification.year}
                    onChange={handleCertificationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="1950"
                    max={currentYear}
                    required
                    placeholder="An obținere"
                    title="An obținere"
                    aria-label="An obținere"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    An expirare (dacă e cazul)
                  </label>
                  <input
                    type="number"
                    name="expiryYear"
                    value={newCertification.expiryYear || ""}
                    onChange={handleCertificationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min={newCertification.year}
                    placeholder="An expirare"
                    title="An expirare"
                    aria-label="An expirare"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descriere
                  </label>
                  <textarea
                    name="description"
                    value={newCertification.description || ""}
                    onChange={handleCertificationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Detalii despre certificare..."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCertificationForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={addCertification}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Adaugă certificare
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {cvData.certifications.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Nu ai adăugat încă certificări.
              </p>
            ) : (
              cvData.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div>
                      <h5 className="font-medium text-gray-800">{cert.name}</h5>
                      <p className="text-sm text-gray-600">
                        {cert.organization}
                      </p>
                      <p className="text-sm text-gray-500">
                        {cert.year}
                        {cert.expiryYear ? ` - ${cert.expiryYear}` : ""}
                      </p>
                      {cert.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {cert.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeCertification(cert.id!)}
                      className="text-red-500 hover:text-red-700"
                      title="Șterge"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <FaLanguage className="mr-2 text-blue-600" />
          Limbi străine
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Limbi cunoscute</h4>
            <button
              type="button"
              onClick={() => setShowLanguageForm(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center"
            >
              <FaPlus className="mr-1" /> Adaugă
            </button>
          </div>

          {showLanguageForm && (
            <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h5 className="font-medium mb-3 text-gray-700">Adaugă limbă</h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limba *
                  </label>
                  <input
                    type="text"
                    name="language"
                    value={newLanguage.language}
                    onChange={handleLanguageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Engleză, Franceză, Germană"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel *
                  </label>
                  <select
                    name="proficiency"
                    value={newLanguage.proficiency}
                    onChange={handleLanguageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    title="Nivel de cunoaștere a limbii"
                    aria-label="Nivel de cunoaștere a limbii"
                  >
                    <option value="basic">Nivel de bază</option>
                    <option value="intermediate">Nivel intermediar</option>
                    <option value="advanced">Nivel avansat</option>
                    <option value="native">Limbă maternă</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLanguageForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={addLanguage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Adaugă limbă
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {cvData.languages.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Nu ai adăugat încă limbi cunoscute.
              </p>
            ) : (
              cvData.languages.map((lang, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div>
                      <h5 className="font-medium text-gray-800">
                        {lang.language}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {getProficiencyLabel(lang.proficiency)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeLanguage(index)}
                      className="text-red-500 hover:text-red-700"
                      title="Șterge"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <FaAward className="mr-2 text-blue-600" />
          Premii și distincții
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Premii</h4>
            <button
              type="button"
              onClick={() => setShowAwardForm(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center"
            >
              <FaPlus className="mr-1" /> Adaugă
            </button>
          </div>

          {showAwardForm && (
            <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h5 className="font-medium mb-3 text-gray-700">Adaugă premiu</h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nume premiu *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newAward.name}
                    onChange={handleAwardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Premiul pentru excelență în terapie"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organizație *
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={newAward.organization}
                    onChange={handleAwardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Asociația Psihologilor din România"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    An *
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={newAward.year}
                    onChange={handleAwardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="1950"
                    max={currentYear}
                    required
                    placeholder="An premiu"
                    title="An premiu"
                    aria-label="An premiu"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descriere
                  </label>
                  <textarea
                    name="description"
                    value={newAward.description || ""}
                    onChange={handleAwardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Detalii despre premiul obținut..."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAwardForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={addAward}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Adaugă premiu
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {cvData.awards.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Nu ai adăugat încă premii.
              </p>
            ) : (
              cvData.awards.map((award) => (
                <div
                  key={award.id}
                  className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div>
                      <h5 className="font-medium text-gray-800">
                        {award.name}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {award.organization}
                      </p>
                      <p className="text-sm text-gray-500">{award.year}</p>
                      {award.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {award.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeAward(award.id!)}
                      className="text-red-500 hover:text-red-700"
                      title="Șterge"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
          <FaBook className="mr-2 text-blue-600" />
          Publicații
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">
              Articole și cărți publicate
            </h4>
            <button
              type="button"
              onClick={() => setShowPublicationForm(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center"
            >
              <FaPlus className="mr-1" /> Adaugă
            </button>
          </div>

          {showPublicationForm && (
            <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h5 className="font-medium mb-3 text-gray-700">
                Adaugă publicație
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titlu *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newPublication.title}
                    onChange={handlePublicationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Tehnici moderne de psihoterapie"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Editura/Jurnal *
                  </label>
                  <input
                    type="text"
                    name="publisher"
                    value={newPublication.publisher}
                    onChange={handlePublicationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Editura Medicală"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    An *
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={newPublication.year}
                    onChange={handlePublicationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="1950"
                    max={currentYear}
                    required
                    placeholder="An publicare"
                    title="An publicare"
                    aria-label="An publicare"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={newPublication.url || ""}
                    onChange={handlePublicationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: https://example.com/articol"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descriere
                  </label>
                  <textarea
                    name="description"
                    value={newPublication.description || ""}
                    onChange={handlePublicationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Scurtă descriere a publicației..."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPublicationForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={addPublication}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Adaugă publicație
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {cvData.publications.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Nu ai adăugat încă publicații.
              </p>
            ) : (
              cvData.publications.map((pub) => (
                <div
                  key={pub.id}
                  className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div>
                      <h5 className="font-medium text-gray-800">{pub.title}</h5>
                      <p className="text-gray-700">
                        {pub.publisher}, {pub.year}
                      </p>
                      {pub.url && (
                        <a
                          href={pub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Vezi publicația
                        </a>
                      )}
                      {pub.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {pub.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removePublication(pub.id!)}
                      className="text-red-500 hover:text-red-700"
                      title="Șterge"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={uploadingProfileImage}
        >
          Anulează
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={uploadingProfileImage}
          className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            uploadingProfileImage
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {uploadingProfileImage ? "Se salvează..." : "Salvează CV"}
        </button>
      </div>
    </div>
  );
};

export default CVEditForm;

export const SpecialistCVDisplay: React.FC<{
  cvData: CVData;
  specialist?: { name?: string; role?: string; email?: string };
}> = ({ cvData, specialist }) => {
  const getProficiencyLabel = (proficiency: string): string => {
    switch (proficiency) {
      case "basic":
        return "Nivel de bază";
      case "intermediate":
        return "Nivel intermediar";
      case "advanced":
        return "Nivel avansat";
      case "native":
        return "Limbă maternă";
      default:
        return proficiency;
    }
  };

  return (
    <div className="specialist-cv-display">
      <div className="flex flex-col md:flex-row items-start mb-6">
        {cvData.photoURL && (
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6 flex-shrink-0">
            <img
              src={cvData.photoURL}
              alt="Fotografie specialist"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            {specialist?.name || "Specialist"}
          </h3>
          <p className="text-lg text-blue-600 font-medium mb-2">
            {specialist?.role || "Specialist în sănătate"}
          </p>

          <div className="flex items-center text-gray-700 mb-3">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-full mr-2">
              <span className="mr-1">⭐</span>
              {cvData.experience} ani experiență
            </span>

            {specialist?.email && (
              <span className="text-sm ml-2">{specialist.email}</span>
            )}
          </div>

          {cvData.bio && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3">
              <p className="text-gray-700">{cvData.bio}</p>
            </div>
          )}
        </div>
      </div>

      <div className="cv-sections mb-6">
        <div className="border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
            <li className="mr-2">
              <button
                className="inline-block p-4 border-b-2 border-blue-600 rounded-t-lg active text-blue-600"
                aria-current="page"
              >
                Experiență profesională
              </button>
            </li>
            <li className="mr-2">
              <button className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300">
                Educație și calificări
              </button>
            </li>
            <li className="mr-2">
              <button className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300">
                Alte informații
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="cv-section mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Experiență profesională
        </h4>

        {cvData.experienceDetails && cvData.experienceDetails.length > 0 ? (
          <div className="space-y-4">
            {cvData.experienceDetails.map((exp, index) => (
              <div
                key={exp.id || index}
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <h5 className="font-semibold text-gray-800">{exp.position}</h5>
                <p className="text-gray-700">
                  {exp.company}
                  {exp.location ? `, ${exp.location}` : ""}
                </p>
                <p className="text-sm text-gray-600">
                  {exp.startYear} - {exp.current ? "Prezent" : exp.endYear}
                </p>
                {exp.description && (
                  <p className="mt-2 text-gray-700">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            Nu există informații despre experiența profesională.
          </p>
        )}
      </div>

      <div className="cv-section mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 14l9-5-9-5-9 5-9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
          Educație
        </h4>

        {cvData.education && cvData.education.length > 0 ? (
          <div className="space-y-4">
            {cvData.education.map((edu, index) => (
              <div
                key={edu.id || index}
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <h5 className="font-semibold text-gray-800">
                  {edu.degree} {edu.field && `în ${edu.field}`}
                </h5>
                <p className="text-gray-700">{edu.institution}</p>
                <p className="text-sm text-gray-600">
                  {edu.startYear} - {edu.endYear || "În curs"}
                </p>
                {edu.description && (
                  <p className="mt-2 text-gray-700">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            Nu există informații despre educație.
          </p>
        )}
      </div>

      {cvData.certifications && cvData.certifications.length > 0 && (
        <div className="cv-section mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            Certificări
          </h4>

          <div className="space-y-4">
            {cvData.certifications.map((cert, index) => (
              <div
                key={cert.id || index}
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <h5 className="font-semibold text-gray-800">{cert.name}</h5>
                <p className="text-gray-700">{cert.organization}</p>
                <p className="text-sm text-gray-600">
                  {cert.year}
                  {cert.expiryYear ? ` - ${cert.expiryYear}` : ""}
                </p>
                {cert.description && (
                  <p className="mt-2 text-gray-700">{cert.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {cvData.languages && cvData.languages.length > 0 && (
        <div className="cv-section mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            Limbi străine
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {cvData.languages.map((lang, index) => (
              <div
                key={index}
                className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <h5 className="font-semibold text-gray-800">{lang.language}</h5>
                <p className="text-sm text-gray-600">
                  {getProficiencyLabel(lang.proficiency)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {cvData.awards && cvData.awards.length > 0 && (
        <div className="cv-section mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            Premii și distincții
          </h4>

          <div className="space-y-4">
            {cvData.awards.map((award, index) => (
              <div
                key={award.id || index}
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <h5 className="font-semibold text-gray-800">{award.name}</h5>
                <p className="text-gray-700">{award.organization}</p>
                <p className="text-sm text-gray-600">{award.year}</p>
                {award.description && (
                  <p className="mt-2 text-gray-700">{award.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {cvData.publications && cvData.publications.length > 0 && (
        <div className="cv-section mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Publicații
          </h4>

          <div className="space-y-4">
            {cvData.publications.map((pub, index) => (
              <div
                key={pub.id || index}
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <h5 className="font-semibold text-gray-800">{pub.title}</h5>
                <p className="text-gray-700">
                  {pub.publisher}, {pub.year}
                </p>
                {pub.url && (
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm inline-block mt-1"
                  >
                    Accesează publicația
                  </a>
                )}
                {pub.description && (
                  <p className="mt-2 text-gray-700">{pub.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
