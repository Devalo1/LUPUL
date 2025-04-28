import React, { useState, useEffect } from "react";
import { 
  getSpecializationChangeRequests, 
  processSpecializationChangeRequest 
} from "../../utils/roleUtils";
import { 
  FaCheck, 
  FaTimes, 
  FaSpinner, 
  FaClock, 
  FaFilter, 
  FaExclamationTriangle 
} from "react-icons/fa";
import { toast } from "react-toastify";

interface SpecializationRequest {
  id: string;
  userId: string;
  displayName?: string;
  userEmail: string;
  oldSpecialization: string;
  oldCategory: string;
  newSpecialization: string;
  newCategory: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date | null;
  reviewedBy?: string;
  adminComment?: string;
}

const SpecializationRequestsPanel: React.FC = () => {
  const [requests, setRequests] = useState<SpecializationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [commentText, setCommentText] = useState<string>("");
  const [commentingId, setCommentingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const statusFilter = filter === "all" ? undefined : filter;
      const data = await getSpecializationChangeRequests(statusFilter);
      setRequests(data);
    } catch (error) {
      console.error("Error loading specialization requests:", error);
      toast.error("Could not load specialization change requests");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (requestId: string, approved: boolean) => {
    if (processingId) return;
    
    setProcessingId(requestId);
    try {
      await processSpecializationChangeRequest(
        requestId, 
        approved, 
        commentText.trim() || undefined
      );
      
      toast.success(`Request ${approved ? "approved" : "rejected"} successfully`);
      
      // Update the list of requests
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId
            ? { 
                ...req, 
                status: approved ? "approved" : "rejected",
                reviewedAt: new Date(),
                adminComment: commentText.trim() || undefined
              }
            : req
        )
      );
      
      setCommentText("");
      setCommentingId(null);
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error(`Failed to ${approved ? "approve" : "reject"} request`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Specialization Change Requests</h2>
      
      {/* Filter buttons */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-gray-700 flex items-center">
          <FaFilter className="mr-2" /> Filter:
        </span>
        <button
          onClick={() => setFilter("pending")}
          className={`px-3 py-1.5 rounded text-sm ${
            filter === "pending" 
              ? "bg-yellow-100 text-yellow-800 border border-yellow-300" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FaClock className="inline mr-1" /> Pending
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-3 py-1.5 rounded text-sm ${
            filter === "approved" 
              ? "bg-green-100 text-green-800 border border-green-300" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FaCheck className="inline mr-1" /> Approved
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`px-3 py-1.5 rounded text-sm ${
            filter === "rejected" 
              ? "bg-red-100 text-red-800 border border-red-300" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FaTimes className="inline mr-1" /> Rejected
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded text-sm ${
            filter === "all" 
              ? "bg-blue-100 text-blue-800 border border-blue-300" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Requests
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-blue-500 mr-2" size={24} />
          <span className="text-gray-600">Loading requests...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaExclamationTriangle className="mx-auto text-gray-400 mb-3" size={24} />
          <p className="text-gray-600">No {filter !== "all" ? filter : ""} specialization change requests found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Specialist
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Current Specialization
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Requested Specialization
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{request.displayName || "Unknown Name"}</div>
                      <div className="text-sm text-gray-500">{request.userEmail}</div>
                      <div className="text-xs text-gray-400">ID: {request.userId}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.oldSpecialization || "Not set"}</div>
                    {request.oldCategory && (
                      <div className="text-xs text-gray-500">Category: {request.oldCategory}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{request.newSpecialization}</div>
                    {request.newCategory && (
                      <div className="text-xs text-gray-500">Category: {request.newCategory}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.status === "pending" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Submitted: {formatDate(request.submittedAt)}</div>
                    {request.reviewedAt && (
                      <div>Reviewed: {formatDate(request.reviewedAt)}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {request.status === "pending" ? (
                      <div className="flex items-center justify-end space-x-2">
                        {commentingId === request.id ? (
                          <div className="flex flex-col items-end mb-2">
                            <textarea 
                              className="p-2 border border-gray-300 rounded w-64 text-sm"
                              placeholder="Add a comment (optional)"
                              rows={2}
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                            />
                            <div className="mt-1 space-x-1">
                              <button 
                                className="text-xs text-blue-600 hover:text-blue-800"
                                onClick={() => setCommentingId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCommentingId(request.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Add comment
                          </button>
                        )}
                        <button
                          onClick={() => handleProcessRequest(request.id, true)}
                          disabled={processingId === request.id}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                        >
                          {processingId === request.id ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                        </button>
                        <button
                          onClick={() => handleProcessRequest(request.id, false)}
                          disabled={processingId === request.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {processingId === request.id ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        {request.adminComment ? request.adminComment : "No comment"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SpecializationRequestsPanel;
