import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import {
  UserRole,
  requestRoleChange,
  checkPendingRoleRequests,
  isUserSpecialist,
} from "../utils/userRoles";
import { SpecializationCategories } from "../utils/specializationCategories";
import {} from /* doc, */
/* updateDoc, */
/* getFirestore */
"firebase/firestore";

interface SpecialistRoleRequestProps {
  user: User | null;
  userRole: UserRole | null;
  onRequestSuccess?: () => void;
}

const SpecialistRoleRequest: React.FC<SpecialistRoleRequestProps> = ({
  user,
  userRole,
  onRequestSuccess,
}) => {
  const [roleChangeReason, setRoleChangeReason] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [specializationCategory, setSpecializationCategory] = useState("");
  const [education, setEducation] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number | "">(0);
  const [_certificate, setCertificate] = useState<File | null>(null);
  const [certificateUrl, setCertificateUrl] = useState("");
  const [_uploadProgress, _setUploadProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [requestingRoleChange, setRequestingRoleChange] = useState(false);
  const [requestStatus, setRequestStatus] = useState<
    "none" | "success" | "error" | "existing"
  >("none");
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isSpecialist, setIsSpecialist] = useState<boolean>(false);

  // Check if user is already a specialist
  useEffect(() => {
    const checkIfSpecialist = async () => {
      if (!user?.uid) return;

      try {
        // Check if user's role is already SPECIALIST
        if (userRole === UserRole.SPECIALIST) {
          console.log("User already has SPECIALIST role");
          setIsSpecialist(true);
          return;
        }

        // Additional check in database
        const isSpec = await isUserSpecialist(user.uid);
        console.log("isUserSpecialist result:", isSpec);
        setIsSpecialist(isSpec);
      } catch (error) {
        console.error("Error checking specialist status:", error);
      }
    };

    checkIfSpecialist();
  }, [user, userRole]);

  // Check if user has pending role requests
  useEffect(() => {
    const checkPendingRequests = async () => {
      if (!user?.uid) return;
      try {
        const hasPending = await checkPendingRoleRequests(user.uid);
        setHasPendingRequest(hasPending);
      } catch (error) {
        console.error(
          "Eroare la verificarea cererilor de rol în așteptare:",
          error
        );
      }
    };

    checkPendingRequests();
  }, [user]);

  const handleRequestRoleChange = async () => {
    if (!user) return;

    try {
      setRequestingRoleChange(true);
      setErrorDetails(null);

      const result = await requestRoleChange(
        user.uid, // userId
        user.email || "", // userEmail
        user.displayName || "", // displayName
        specialization as unknown as UserRole, // Cast to UserRole
        certificateUrl as unknown as UserRole, // If this also needs to be UserRole
        "User request" // reason - add the missing required parameter
      );

      if (typeof result === "string" && result === "existing") {
        setRequestStatus("existing");
      } else if (
        typeof result === "boolean" ||
        (typeof result === "string" && result !== "existing")
      ) {
        setRequestStatus("success");
        setHasPendingRequest(true);
        if (onRequestSuccess) {
          onRequestSuccess();
        }
      }

      // Close modal after 3 seconds on success
      if (
        typeof result === "boolean" ||
        (typeof result === "string" && result !== "existing")
      ) {
        setTimeout(() => {
          setModalOpen(false);
          resetForm();
        }, 3000);
      }
    } catch (error) {
      console.error(
        "Eroare la trimiterea cererii de schimbare a rolului:",
        error
      );
      let errorMessage = "Eroare necunoscută";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object") {
        errorMessage = JSON.stringify(error);
      }

      setErrorDetails(errorMessage);
      setRequestStatus("error");
    } finally {
      setRequestingRoleChange(false);
    }
  };

  const resetForm = () => {
    setRoleChangeReason("");
    setSpecialization("");
    setSpecializationCategory("");
    setEducation("");
    setYearsOfExperience(0);
    setCertificate(null);
    setCertificateUrl("");
    setRequestStatus("none");
    setErrorDetails(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    if (requestStatus !== "existing") {
      resetForm();
    }
  };

  // Render the button section
  const renderRequestButton = () => {
    if (hasPendingRequest) {
      return (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Ai o cerere de schimbare a rolului în așteptare. Te vom anunța când
            va fi procesată.
          </p>
        </div>
      );
    }

    return (
      <button
        onClick={() => setModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Solicită rolul de specialist
      </button>
    );
  };

  // Render status message in the modal
  const renderStatusMessage = () => {
    if (requestStatus === "success") {
      return (
        <div className="p-4 bg-green-50 text-green-800 rounded-md">
          <p className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Cererea ta a fost trimisă cu succes! Te vom notifica când va fi
            procesată.
          </p>
        </div>
      );
    } else if (requestStatus === "error") {
      return (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <p className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
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
            A apărut o eroare la trimiterea cererii. Te rugăm să încerci din
            nou.
          </p>
          {errorDetails && (
            <p className="mt-2 text-xs border-t border-red-200 pt-2 font-mono">
              Detalii eroare: {errorDetails}
            </p>
          )}
        </div>
      );
    } else if (requestStatus === "existing") {
      return (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
          <p className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Ai deja o cerere de schimbare a rolului în așteptare.
          </p>
        </div>
      );
    }

    return null;
  };

  // If the user is already a specialist, don't show the request form
  if (isSpecialist || userRole === UserRole.SPECIALIST) {
    console.log(
      "User is a specialist, not showing specialist role request form"
    );
    return null;
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Devino specialist</h3>
        <p className="text-sm text-gray-600 mb-3">
          Dacă ai calificările necesare, poți solicita rolul de specialist
          pentru a oferi servicii și consultanță.
        </p>

        {renderRequestButton()}
      </div>

      {/* Modal pentru cererea de schimbare a rolului */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Solicită rolul de specialist
                    </h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Te rugăm să ne explici calificările și experiența ta
                        care te recomandă pentru rolul de specialist.
                      </p>

                      {renderStatusMessage()}

                      {requestStatus === "none" && (
                        <>
                          <div className="mb-4">
                            <label
                              htmlFor="specializationCategory"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Categoria de specializare
                            </label>
                            <select
                              id="specializationCategory"
                              name="specializationCategory"
                              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                              value={specializationCategory}
                              onChange={(e) =>
                                setSpecializationCategory(e.target.value)
                              }
                              disabled={requestingRoleChange}
                            >
                              <option value="">Selectează o categorie</option>
                              {SpecializationCategories.map((category) => (
                                <option
                                  key={String(category)}
                                  value={String(category)}
                                >
                                  {String(category)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="mb-4">
                            <label
                              htmlFor="specialization"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Specializarea
                            </label>
                            <input
                              type="text"
                              id="specialization"
                              name="specialization"
                              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                              placeholder="Ex: Nutriție, Psihoterapie, Masaj"
                              value={specialization}
                              onChange={(e) =>
                                setSpecialization(e.target.value)
                              }
                              disabled={requestingRoleChange}
                            />
                          </div>

                          <div className="mb-4">
                            <label
                              htmlFor="education"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Educație
                            </label>
                            <input
                              type="text"
                              id="education"
                              name="education"
                              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                              placeholder="Ex: Licență, Masterat, Doctorat"
                              value={education}
                              onChange={(e) => setEducation(e.target.value)}
                              disabled={requestingRoleChange}
                            />
                          </div>

                          <div className="mb-4">
                            <label
                              htmlFor="yearsOfExperience"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Ani de experiență
                            </label>
                            <input
                              type="number"
                              id="yearsOfExperience"
                              name="yearsOfExperience"
                              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                              placeholder="Ex: 5"
                              value={yearsOfExperience}
                              onChange={(e) =>
                                setYearsOfExperience(Number(e.target.value))
                              }
                              disabled={requestingRoleChange}
                            />
                          </div>

                          <div className="mb-4">
                            <label
                              htmlFor="certificate"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Certificat
                            </label>
                            <input
                              type="file"
                              id="certificate"
                              name="certificate"
                              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setCertificate(file);
                              }}
                              disabled={requestingRoleChange}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="roleChangeReason"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Calificări și experiență
                            </label>
                            <textarea
                              id="roleChangeReason"
                              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                              rows={5}
                              placeholder="Descrie experiența, calificările și motivul pentru care dorești să devii specialist..."
                              value={roleChangeReason}
                              onChange={(e) =>
                                setRoleChangeReason(e.target.value)
                              }
                              disabled={requestingRoleChange}
                            ></textarea>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {requestStatus === "none" && (
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${
                      requestingRoleChange ||
                      !roleChangeReason.trim() ||
                      !specialization.trim() ||
                      !specializationCategory.trim() ||
                      !education.trim() ||
                      !yearsOfExperience ||
                      !certificateUrl.trim()
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={handleRequestRoleChange}
                    disabled={
                      requestingRoleChange ||
                      !roleChangeReason.trim() ||
                      !specialization.trim() ||
                      !specializationCategory.trim() ||
                      !education.trim() ||
                      !yearsOfExperience ||
                      !certificateUrl.trim()
                    }
                  >
                    {requestingRoleChange ? "Se trimite..." : "Trimite cererea"}
                  </button>
                )}
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseModal}
                >
                  {requestStatus === "success" ? "Închide" : "Anulează"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialistRoleRequest;
