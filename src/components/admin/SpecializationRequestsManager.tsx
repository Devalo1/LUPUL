import React, { useState, useEffect } from "react";
// Fix import function names to match exported functions
import {
  submitSpecializationChangeRequest as processSpecializationChangeRequest,
  getAllSpecializationRequests,
} from "../../utils/specializationUtils";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";
import { SpecializationRequest } from "../../types/models";

const SpecializationRequestsManager: React.FC<{ adminId: string }> = ({
  adminId,
}) => {
  const [requests, setRequests] = useState<SpecializationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<SpecializationRequest | null>(null);
  const [processingRequest, setProcessingRequest] = useState(false);
  const [adminComment, setAdminComment] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Call without parameters if the function doesn't accept any
      const response = await getAllSpecializationRequests();
      // Properly type or cast the response
      setRequests(
        (response.requests || []) as unknown as SpecializationRequest[]
      );
    } catch (error) {
      console.error("Error loading specialization requests:", error);
      setAlertMessage({
        type: "error",
        message: "A apărut o eroare la încărcarea cererilor de schimbare.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request: SpecializationRequest) => {
    setSelectedRequest(request);
    setAdminComment(request.comments || "");
  };

  const handleProcessRequest = async (status: "approved" | "rejected") => {
    if (!selectedRequest || !adminId) return;

    setProcessingRequest(true);
    try {
      const success = await processSpecializationChangeRequest(
        selectedRequest.id || "",
        status,
        adminComment,
        selectedRequest.specializationDetails || "",
        selectedRequest.userId,
        "admin approval" // Reason
      );

      if (success) {
        setAlertMessage({
          type: "success",
          message: `Cererea a fost ${status === "approved" ? "aprobată" : "respinsă"} cu succes.`,
        });

        // Update the request in the local state
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === selectedRequest.id
              ? {
                  ...req,
                  status,
                  comments: adminComment,
                  processedAt: new Date(),
                }
              : req
          )
        );

        // Close the modal after success
        setSelectedRequest(null);
        setAdminComment("");
      } else {
        setAlertMessage({
          type: "error",
          message: "A apărut o eroare la procesarea cererii.",
        });
      }
    } catch (error) {
      console.error("Error processing request:", error);
      setAlertMessage({
        type: "error",
        message: "A apărut o eroare la procesarea cererii.",
      });
    } finally {
      setProcessingRequest(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        Cereri de schimbare a specializării
      </h2>

      {alertMessage && (
        <div
          className={`mb-4 p-3 rounded ${
            alertMessage.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {alertMessage.message}
        </div>
      )}

      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setFilter("pending")}
          className={`px-3 py-1 text-sm rounded ${
            filter === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          În așteptare
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-3 py-1 text-sm rounded ${
            filter === "approved"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Aprobate
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`px-3 py-1 text-sm rounded ${
            filter === "rejected"
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Respinse
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 text-sm rounded ${
            filter === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Toate
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2">Se încarcă...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FaInfoCircle className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-gray-600">
            {filter === "pending"
              ? "Nu există cereri în așteptare."
              : filter === "approved"
                ? "Nu există cereri aprobate."
                : filter === "rejected"
                  ? "Nu există cereri respinse."
                  : "Nu există cereri de schimbare a specializării."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Specialist
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Specializări
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Data cererii
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.displayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.userEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Veche:</span>{" "}
                        {request.oldSpecialization || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Nouă:</span>{" "}
                        {request.newSpecialization}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.submittedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status === "pending"
                        ? "În așteptare"
                        : request.status === "approved"
                          ? "Aprobat"
                          : "Respins"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewRequest(request)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      title="Vezi detalii cerere"
                      aria-label="Vezi detalii cerere"
                    >
                      Detalii
                    </button>
                    {request.status === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            handleViewRequest(request);
                            // Set timeout to allow modal to show before focusing on textarea
                            setTimeout(() => {
                              const commentTextarea =
                                document.getElementById("adminComment");
                              if (commentTextarea) {
                                (
                                  commentTextarea as HTMLTextAreaElement
                                ).focus();
                              }
                            }, 100);
                          }}
                          className="text-green-600 hover:text-green-900 mr-2"
                          title="Aprobă cererea"
                          aria-label="Aprobă cererea"
                        >
                          Aprobă
                        </button>
                        <button
                          onClick={() => {
                            handleViewRequest(request);
                            // Set timeout to allow modal to show before focusing on textarea
                            setTimeout(() => {
                              const commentTextarea =
                                document.getElementById("adminComment");
                              if (commentTextarea) {
                                (
                                  commentTextarea as HTMLTextAreaElement
                                ).focus();
                              }
                            }, 100);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Respinge cererea"
                          aria-label="Respinge cererea"
                        >
                          Respinge
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Detalii cerere
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700"
                title="Închide detalii cerere"
                aria-label="Închide detalii cerere"
              >
                <FaTimesCircle />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Specialist
                  </h4>
                  <p className="text-base font-medium text-gray-900">
                    {selectedRequest.displayName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.userEmail}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Data cererii
                  </h4>
                  <p className="text-sm text-gray-800">
                    {formatDate(selectedRequest.submittedAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Specializare actuală
                  </h4>
                  <p className="text-sm text-gray-800">
                    {selectedRequest.oldSpecialization || "Nespecificată"}
                  </p>
                  {selectedRequest.oldCategory && (
                    <p className="text-xs text-gray-600">
                      Categoria: {selectedRequest.oldCategory}
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Specializare solicitată
                  </h4>
                  <p className="text-sm text-gray-800 font-medium">
                    {selectedRequest.newSpecialization}
                  </p>
                  {selectedRequest.newCategory && (
                    <p className="text-xs text-gray-600">
                      Categoria: {selectedRequest.newCategory}
                    </p>
                  )}
                </div>
              </div>

              {selectedRequest.specializationDetails && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Detalii specializare
                  </h4>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                    {selectedRequest.specializationDetails}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Motivul solicitării
                </h4>
                <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                  {selectedRequest.reason}
                </p>
              </div>

              {selectedRequest.status !== "pending" && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Status
                  </h4>
                  <p
                    className={`text-sm font-medium ${
                      selectedRequest.status === "approved"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {selectedRequest.status === "approved"
                      ? "Aprobat"
                      : "Respins"}
                    {selectedRequest.processedAt &&
                      ` la ${formatDate(selectedRequest.processedAt as Date)}`}
                  </p>
                  {selectedRequest.comments && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Comentarii admin
                      </h4>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                        {selectedRequest.comments}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedRequest.status === "pending" && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Comentarii (opțional)
                  </h4>
                  <textarea
                    id="adminComment"
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Adaugă comentarii pentru specialist..."
                  ></textarea>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-4">
                {selectedRequest.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleProcessRequest("rejected")}
                      disabled={processingRequest}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
                    >
                      {processingRequest ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Se procesează...
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="mr-2" /> Respinge cererea
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleProcessRequest("approved")}
                      disabled={processingRequest}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
                    >
                      {processingRequest ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Se procesează...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="mr-2" /> Aprobă cererea
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Închide
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecializationRequestsManager;
