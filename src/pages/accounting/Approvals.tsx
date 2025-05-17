import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAccountingPermissions } from "../../contexts/AccountingPermissionsContext";
import { FaCheck, FaTimes, FaClock, FaInfoCircle } from "react-icons/fa";
import { getAuth } from "firebase/auth";

interface ApprovalItem {
  id: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  requestedBy: string;
  requestedAt: Timestamp;
  description: string;
  entityId: string;
  entityType: string;
  amount?: number;
  details?: any;
}

/**
 * Componentă pentru gestionarea aprobărilor contabile
 * Doar administratorii pot aproba sau respinge cereri
 */
const AccountingApprovals: React.FC = () => {
  const { isAdmin } = useAccountingPermissions();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchApprovals = async () => {
      if (!isAdmin) return;
      
      setLoading(true);
      try {
        const approvalsQuery = query(
          collection(db, "accounting_approvals"),
          where("status", "==", "pending")
        );
        
        const querySnapshot = await getDocs(approvalsQuery);
        const approvalsData: ApprovalItem[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<ApprovalItem, "id">
        }));
        
        // Sortează după dată, cele mai noi primele
        approvalsData.sort((a, b) => {
          return b.requestedAt.toMillis() - a.requestedAt.toMillis();
        });
        
        setApprovals(approvalsData);
      } catch (err) {
        console.error("Error fetching approvals:", err);
        setError("Nu s-au putut încărca aprobările pendinte. Vă rugăm să încercați din nou.");
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, [isAdmin]);

  const handleApproval = async (approvalId: string, approved: boolean) => {
    try {
      setLoading(true);
      
      // Actualizăm starea aprobării
      const approvalRef = doc(db, "accounting_approvals", approvalId);
      await updateDoc(approvalRef, {
        status: approved ? "approved" : "rejected",
        processedAt: Timestamp.now(),
        processedBy: auth.currentUser?.uid
      });
      
      // Actualizăm lista de aprobări
      setApprovals(prev => prev.filter(item => item.id !== approvalId));
      
      // Afișăm un mesaj de succes
      setSuccessMessage(`Cererea a fost ${approved ? "aprobată" : "respinsă"} cu succes!`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error("Error processing approval:", err);
      setError(`Nu s-a putut ${approved ? "aproba" : "respinge"} cererea. Vă rugăm să încercați din nou.`);
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru a formata data
  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  // Funcție pentru a determina titlul aprobării bazat pe tip
  const getApprovalTitle = (approval: ApprovalItem) => {
    switch (approval.type) {
      case "invoice":
        return `Aprobare factură #${approval.details?.number || ""}`;
      case "transaction":
        return `Aprobare tranzacție ${approval.amount ? new Intl.NumberFormat("ro-RO", {
          style: "currency",
          currency: "RON"
        }).format(approval.amount) : ""}`;
      case "report":
        return `Aprobare raport financiar`;
      default:
        return `Aprobare ${approval.type}`;
    }
  };

  // Afișare control de acces
  if (!isAdmin) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
        <p className="flex items-center">
          <FaTimes className="mr-2" /> Nu aveți permisiunea de a accesa această pagină.
        </p>
      </div>
    );
  }

  if (loading && approvals.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Aprobări Contabilitate</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 my-4">
          <p>{successMessage}</p>
        </div>
      )}

      {approvals.length === 0 && !loading ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <FaCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nicio aprobare în așteptare</h3>
          <p className="mt-2 text-gray-500">Toate cererile au fost procesate.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {approvals.map(approval => (
              <li key={approval.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium text-gray-900">
                      {getApprovalTitle(approval)}
                    </h3>
                    
                    <p className="mt-1 text-sm text-gray-500">
                      {approval.description}
                    </p>
                    
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <FaClock className="mr-1" /> Solicitată la: {formatDate(approval.requestedAt)}
                      <span className="mx-2">•</span>
                      <FaInfoCircle className="mr-1" /> De către: {approval.requestedBy}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApproval(approval.id, false)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      disabled={loading}
                    >
                      <FaTimes className="mr-1" /> Respinge
                    </button>
                    
                    <button
                      onClick={() => handleApproval(approval.id, true)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      disabled={loading}
                    >
                      <FaCheck className="mr-1" /> Aprobă
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AccountingApprovals;