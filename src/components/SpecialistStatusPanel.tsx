import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  doc,
  /* updateDoc, */
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
  getDoc, // Add missing import
} from "firebase/firestore";
import { firestore } from "../firebase";
import { toast } from "react-toastify";
import {
  FaBan,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

interface FirebaseTimestamp {
  toDate(): Date;
}

// Define a better type guard and utility function for handling Firestore timestamps
function isFirebaseTimestamp(value: unknown): value is FirebaseTimestamp {
  return Boolean(
    value &&
      typeof value === "object" &&
      "toDate" in value &&
      typeof (value as { toDate: unknown }).toDate === "function"
  );
}

// Helper function to safely get a date from a timestamp field
function getDateFromTimestamp(timestamp: unknown): Date {
  if (isFirebaseTimestamp(timestamp)) {
    return timestamp.toDate();
  }
  // Fallback for other timestamp types
  return new Date();
}

// Define a union type that can accept either FirebaseTimestamp or the server timestamp value
type TimestampField = FirebaseTimestamp | unknown;

interface SpecializationChange {
  id?: string;
  userId: string;
  oldSpecialization: string;
  oldCategory: string;
  newSpecialization: string;
  newCategory: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: TimestampField;
  reviewedAt?: TimestampField;
  reviewedBy?: string;
  comments?: string;
}

interface StatusDeactivationRequest {
  id?: string;
  userId: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: TimestampField;
  reviewedAt?: TimestampField;
  reviewedBy?: string;
  comments?: string;
}

interface SpecialistProfile {
  id: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  specializationCategory?: string;
  status?: string;
  [key: string]: unknown;
}

const SpecialistStatusPanel: React.FC = () => {
  const { user, refreshUserData: _refreshUserData } = useAuth();
  const [specialistData, setSpecialistData] =
    useState<SpecialistProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingRequests, setPendingRequests] = useState<
    SpecializationChange[]
  >([]);
  const [pendingDeactivation, setPendingDeactivation] =
    useState<StatusDeactivationRequest | null>(null);
  const [showDeactivationForm, setShowDeactivationForm] =
    useState<boolean>(false);
  const [deactivationReason, setDeactivationReason] = useState<string>("");
  const [submittingDeactivation, setSubmittingDeactivation] =
    useState<boolean>(false);

  // Fetch specialist data
  useEffect(() => {
    const fetchSpecialistData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const specialistDocRef = doc(firestore, "specialists", user.uid);
        const specialistDoc = await getDoc(specialistDocRef);

        if (specialistDoc.exists()) {
          setSpecialistData(specialistDoc.data() as SpecialistProfile);
        } else {
          console.error("Specialist document not found");
        }

        // Check for pending specialization change requests
        const changeRequestsRef = collection(
          firestore,
          "specializationChangeRequests"
        );
        const q = query(
          changeRequestsRef,
          where("userId", "==", user.uid),
          where("status", "==", "pending")
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const requests = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as SpecializationChange[];
          setPendingRequests(requests);
        }

        // Check for pending deactivation requests
        const deactivationRequestsRef = collection(
          firestore,
          "specialistDeactivationRequests"
        );
        const deactivationQuery = query(
          deactivationRequestsRef,
          where("userId", "==", user.uid),
          where("status", "==", "pending")
        );
        const deactivationSnapshot = await getDocs(deactivationQuery);

        if (!deactivationSnapshot.empty) {
          const deactivationRequest = {
            id: deactivationSnapshot.docs[0].id,
            ...deactivationSnapshot.docs[0].data(),
          } as StatusDeactivationRequest;
          setPendingDeactivation(deactivationRequest);
        }
      } catch (error) {
        console.error("Error fetching specialist data:", error);
        toast.error("Could not load specialist data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialistData();
  }, [user]);

  const handleDeactivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!deactivationReason.trim()) {
      toast.error("Please provide a reason for deactivation");
      return;
    }

    setSubmittingDeactivation(true);
    try {
      const deactivationRequest: Omit<StatusDeactivationRequest, "id"> = {
        userId: user.uid,
        reason: deactivationReason.trim(),
        status: "pending",
        submittedAt: serverTimestamp(),
      };

      await addDoc(
        collection(firestore, "specialistDeactivationRequests"),
        deactivationRequest
      );

      toast.success("Your deactivation request has been submitted for review");
      setPendingDeactivation({
        ...deactivationRequest,
        submittedAt: Timestamp.now(),
      });
      setShowDeactivationForm(false);
      setDeactivationReason("");
    } catch (error) {
      console.error("Error submitting deactivation request:", error);
      toast.error("Failed to submit deactivation request. Please try again.");
    } finally {
      setSubmittingDeactivation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <FaSpinner className="animate-spin text-3xl text-primary" />
      </div>
    );
  }

  if (!specialistData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="text-center py-4">
          <p className="text-gray-600">
            Specialist data not available. Please contact support if you believe
            this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
        Specialist Status
      </h2>

      {/* Display current specialization info */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Current Specialization</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="mb-1">
            <span className="font-medium">Category:</span>{" "}
            {String(specialistData.specializationCategory || "")}
          </p>
          <p className="mb-1">
            <span className="font-medium">Specialization:</span>{" "}
            {String(specialistData.specialization || "")}
          </p>
          <p className="mb-1">
            <span className="font-medium">Status:</span>
            <span
              className={`ml-2 px-2 py-1 rounded-full text-sm ${
                specialistData.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {specialistData.status === "active" ? "Active" : "Inactive"}
            </span>
          </p>
        </div>
      </div>

      {/* Show pending requests if any */}
      {pendingRequests.length > 0 && (
        <div className="mb-6 bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <div className="flex items-center mb-2">
            <FaExclamationTriangle className="text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium">
              Pending Specialization Change
            </h3>
          </div>
          <p className="text-gray-700 mb-2">
            You have a pending request to change your specialization from
            <span className="font-medium">
              {" "}
              {pendingRequests[0].oldCategory} -{" "}
              {pendingRequests[0].oldSpecialization}
            </span>{" "}
            to
            <span className="font-medium">
              {" "}
              {pendingRequests[0].newCategory} -{" "}
              {pendingRequests[0].newSpecialization}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Submitted on{" "}
            {getDateFromTimestamp(
              pendingRequests[0].submittedAt
            ).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Show pending deactivation request if any */}
      {pendingDeactivation && (
        <div className="mb-6 bg-red-50 p-4 rounded-md border border-red-200">
          <div className="flex items-center mb-2">
            <FaBan className="text-red-500 mr-2" />
            <h3 className="text-lg font-medium">
              Pending Deactivation Request
            </h3>
          </div>
          <p className="text-gray-700">
            You have requested to deactivate your specialist status. This
            request is currently under review.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Submitted on{" "}
            {getDateFromTimestamp(
              pendingDeactivation.submittedAt
            ).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Deactivation form */}
      {!pendingDeactivation && specialistData.status === "active" && (
        <>
          {!showDeactivationForm ? (
            <div className="mt-6">
              <button
                onClick={() => setShowDeactivationForm(true)}
                className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded border border-red-200 transition duration-150 flex items-center"
              >
                <FaBan className="mr-2" /> Request to Deactivate Specialist
                Status
              </button>
            </div>
          ) : (
            <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-lg font-medium mb-3">
                Request Specialist Status Deactivation
              </h3>
              <form onSubmit={handleDeactivationSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="deactivationReason"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Reason for deactivation
                  </label>
                  <textarea
                    id="deactivationReason"
                    value={deactivationReason}
                    onChange={(e) => setDeactivationReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    placeholder="Please explain why you want to deactivate your specialist status"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeactivationForm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center"
                    disabled={submittingDeactivation}
                  >
                    {submittingDeactivation ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaBan className="mr-2" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {specialistData.status !== "active" && (
        <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
          <div className="flex items-center">
            <FaCheckCircle className="text-blue-500 mr-2" />
            <p className="text-gray-700">
              Your specialist status is currently inactive. To reactivate,
              please contact support.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialistStatusPanel;
