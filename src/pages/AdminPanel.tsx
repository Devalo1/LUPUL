import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { MAIN_ADMIN_EMAIL } from "../utils/userRoles";
import AdminService from "../services/adminService";
import {
  collection,
  query,
  getDocs,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";
import {
  makeUserSpecialist,
  removeSpecialistRole,
  UserRole,
  processRoleChangeRequest,
} from "../utils/userRoles";

interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Date;
  lastLogin?: Date;
  role?: UserRole;
  specialization?: string;
}

const AdminPanel: React.FC = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [specialistActionInProgress, setSpecialistActionInProgress] = useState<
    string | null
  >(null);
  const [messageAlert, setMessageAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [roleChangeRequests, setRoleChangeRequests] = useState<
    Array<{
      id: string;
      userId: string;
      userEmail: string;
      userName: string;
      reason: string;
      specialization?: string;
      createdAt: Date;
      status: "pending" | "approved" | "rejected";
    }>
  >([]);
  const [loadingRoleRequests, setLoadingRoleRequests] = useState<boolean>(true);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        return;
      }

      try {
        if (user.email === MAIN_ADMIN_EMAIL) {
          setIsAdmin(true);
          await AdminService.verificaSiCorecteazaAdminPrincipal();
        } else {
          const isUserAdmin = await AdminService.verificaRolAdmin(
            user.email || ""
          );
          setIsAdmin(isUserAdmin);
        }
      } catch (error) {
        console.error("Eroare la verificarea statutului de admin:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && !checkingAdmin && !isAdmin && !user) {
      navigate("/login", { state: { from: "/admin" } });
    }
  }, [isAdmin, loading, checkingAdmin, user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchRoleChangeRequests();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    if (!user) return;

    setLoadingUsers(true);
    try {
      const usersRef = collection(firestore, "users");
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);

      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        usersData.push({
          id: doc.id,
          email: userData.email || "",
          displayName: userData.displayName || "",
          photoURL: userData.photoURL || "",
          createdAt: userData.createdAt?.toDate(),
          lastLogin: userData.lastLogin?.toDate(),
          role: userData.role as UserRole,
          specialization: userData.specialization || "",
        });
      });

      setUsers(usersData);
    } catch (error) {
      console.error("Eroare la încărcarea utilizatorilor:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRoleChangeRequests = useCallback(async () => {
    try {
      setLoadingRoleRequests(true);
      const requestsQuery = query(
        collection(firestore, "roleChangeRequests"),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(requestsQuery);
      const requestsList = [];

      for (const requestDoc of querySnapshot.docs) {
        const requestData = requestDoc.data();
        // Obțin datele utilizatorului care a făcut cererea
        const userDoc = await getDoc(
          doc(firestore, "users", requestData.userId)
        );

        if (userDoc.exists()) {
          requestsList.push({
            id: requestDoc.id,
            userId: requestData.userId,
            userEmail: requestData.userEmail || "",
            userName: requestData.userName || "",
            reason: requestData.reason || "",
            specialization: requestData.specialization || "",
            createdAt: requestData.createdAt?.toDate
              ? requestData.createdAt.toDate()
              : requestData.createdAt,
            status: requestData.status || "pending",
          });
        }
      }

      setRoleChangeRequests(requestsList);
    } catch (error) {
      console.error(
        "Eroare la încărcarea cererilor de schimbare a rolului:",
        error
      );
    } finally {
      setLoadingRoleRequests(false);
    }
  }, []);

  const handleMakeSpecialist = async (userId: string) => {
    setSpecialistActionInProgress(userId);

    try {
      const success = await makeUserSpecialist(userId);
      if (success) {
        setMessageAlert({
          type: "success",
          message: "Utilizatorul a fost setat ca specialist cu succes!",
        });
        fetchUsers(); // Reîncărcăm lista de utilizatori pentru a reflecta schimbarea
      } else {
        setMessageAlert({
          type: "error",
          message:
            "Nu s-a putut seta utilizatorul ca specialist. Încercați din nou.",
        });
      }
    } catch (error) {
      console.error("Eroare la setarea rolului de specialist:", error);
      setMessageAlert({
        type: "error",
        message:
          "Eroare la setarea rolului de specialist. Verificați consola pentru detalii.",
      });
    } finally {
      setSpecialistActionInProgress(null);

      // Ascundem mesajul după 5 secunde
      setTimeout(() => {
        setMessageAlert(null);
      }, 5000);
    }
  };

  const handleRemoveSpecialist = async (userId: string) => {
    setSpecialistActionInProgress(userId);

    try {
      const success = await removeSpecialistRole(userId);
      if (success) {
        setMessageAlert({
          type: "success",
          message: "Rolul de specialist a fost eliminat cu succes!",
        });
        fetchUsers(); // Reîncărcăm lista de utilizatori pentru a reflecta schimbarea
      } else {
        setMessageAlert({
          type: "error",
          message:
            "Nu s-a putut elimina rolul de specialist. Încercați din nou.",
        });
      }
    } catch (error) {
      console.error("Eroare la eliminarea rolului de specialist:", error);
      setMessageAlert({
        type: "error",
        message:
          "Eroare la eliminarea rolului de specialist. Verificați consola pentru detalii.",
      });
    } finally {
      setSpecialistActionInProgress(null);

      // Ascundem mesajul după 5 secunde
      setTimeout(() => {
        setMessageAlert(null);
      }, 5000);
    }
  };

  const handleApproveRoleChange = async (requestId: string) => {
    setProcessingRequestId(requestId);
    try {
      const request = roleChangeRequests.find((req) => req.id === requestId);
      if (!request) return;

      await processRoleChangeRequest(
        requestId,
        "approved",
        user?.email || undefined
      );

      setMessageAlert({
        type: "success",
        message:
          "Cererea a fost aprobată și utilizatorul a fost setat ca specialist!",
      });

      // Actualizăm lista de cereri și utilizatori
      fetchRoleChangeRequests();
      fetchUsers();
    } catch (error) {
      console.error("Eroare la aprobarea cererii:", error);
      setMessageAlert({
        type: "error",
        message: "A apărut o eroare la aprobarea cererii.",
      });
    } finally {
      setProcessingRequestId(null);

      // Ascundem mesajul după 5 secunde
      setTimeout(() => {
        setMessageAlert(null);
      }, 5000);
    }
  };

  const handleRejectRoleChange = async (requestId: string) => {
    setProcessingRequestId(requestId);
    try {
      await processRoleChangeRequest(requestId, "rejected");

      setMessageAlert({
        type: "success",
        message: "Cererea a fost respinsă.",
      });

      // Actualizăm lista de cereri
      fetchRoleChangeRequests();
    } catch (error) {
      console.error("Eroare la respingerea cererii:", error);
      setMessageAlert({
        type: "error",
        message: "A apărut o eroare la respingerea cererii.",
      });
    } finally {
      setProcessingRequestId(null);

      // Ascundem mesajul după 5 secunde
      setTimeout(() => {
        setMessageAlert(null);
      }, 5000);
    }
  };

  if (loading || checkingAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading">Se încarcă...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h2 className="text-lg font-semibold mb-2">Acces restricționat</h2>
          <p>Nu aveți permisiunea de a accesa această pagină.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Înapoi la pagina principală
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Panou de administrare
            </h1>
            <div className="text-sm text-gray-600">
              Utilizator:{" "}
              <span className="font-medium">
                {user?.displayName || user?.email}
              </span>
            </div>
          </div>

          {messageAlert && (
            <div
              className={`mb-6 p-4 rounded-md ${
                messageAlert.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {messageAlert.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-blue-800 mb-2">Produse</h3>
              <p className="text-sm mb-4">
                Gestionează produsele, categoriile și stocurile.
              </p>
              <div className="flex flex-col space-y-2">
                <a
                  href="/admin/add-product"
                  className="text-blue-600 hover:underline text-sm"
                >
                  ➕ Adaugă produs nou
                </a>
                <a
                  href="/admin/categories"
                  className="text-blue-600 hover:underline text-sm"
                >
                  🏷️ Gestionează categorii
                </a>
                <a
                  href="/admin/inventory"
                  className="text-blue-600 hover:underline text-sm"
                >
                  📦 Gestionează stocuri
                </a>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-green-800 mb-2">Evenimente</h3>
              <p className="text-sm mb-4">
                Gestionează evenimentele și programările.
              </p>
              <div className="flex flex-col space-y-2">
                <a
                  href="/admin/add-event"
                  className="text-green-600 hover:underline text-sm"
                >
                  ➕ Adaugă eveniment nou
                </a>
                <a
                  href="/admin/events"
                  className="text-green-600 hover:underline text-sm"
                >
                  📊 Toate evenimentele
                </a>
                <a
                  href="/admin/appointments"
                  className="text-green-600 hover:underline text-sm"
                >
                  📅 Gestionează programări
                </a>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-purple-800 mb-2">Utilizatori</h3>
              <p className="text-sm mb-4">
                Gestionează conturile utilizatorilor.
              </p>
              <div className="flex flex-col space-y-2">
                <a
                  href="/admin/users"
                  className="text-purple-600 hover:underline text-sm"
                >
                  👥 Gestionează utilizatori
                </a>
                <a
                  href="/admin/make-admin"
                  className="text-purple-600 hover:underline text-sm"
                >
                  🔑 Permisiuni admin
                </a>
                <a
                  href="#specialist-management"
                  className="text-purple-600 hover:underline text-sm"
                >
                  👨‍⚕️ Gestionare specialiști
                </a>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-yellow-800 mb-2">Conținut</h3>
              <p className="text-sm mb-4">
                Gestionează articolele și conținutul site-ului.
              </p>
              <div className="flex flex-col space-y-2">
                <a
                  href="/admin/articles"
                  className="text-yellow-600 hover:underline text-sm"
                >
                  📝 Gestionează articole
                </a>
                <a
                  href="/admin/articles/add"
                  className="text-yellow-600 hover:underline text-sm"
                >
                  ➕ Adaugă articol nou
                </a>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-red-800 mb-2">Comenzi</h3>
              <p className="text-sm mb-4">
                Gestionează comenzile și facturile.
              </p>
              <div className="flex flex-col space-y-2">
                <a
                  href="/admin/orders"
                  className="text-red-600 hover:underline text-sm"
                >
                  🛒 Toate comenzile
                </a>
                <a
                  href="/admin/invoices"
                  className="text-red-600 hover:underline text-sm"
                >
                  📃 Facturi
                </a>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-teal-800 mb-2">Contabilitate</h3>
              <p className="text-sm mb-4">
                Gestionează contabilitatea și rapoartele financiare.
              </p>
              <div className="flex flex-col space-y-2">
                <a
                  href="/admin/accounting"
                  className="text-teal-600 hover:underline text-sm"
                >
                  💰 Panou contabil
                </a>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-indigo-800 mb-2">Setări</h3>
              <p className="text-sm mb-4">Configurează setările aplicației.</p>
              <div className="flex flex-col space-y-2">
                <a
                  href="/admin/settings"
                  className="text-indigo-600 hover:underline text-sm"
                >
                  ⚙️ Setări generale
                </a>
                <a
                  href="/admin/settings/payment"
                  className="text-indigo-600 hover:underline text-sm"
                >
                  💳 Setări plăți
                </a>
              </div>
            </div>
          </div>

          {/* Secțiunea pentru Gestionare Specialiști */}
          <div
            id="specialist-management"
            className="bg-white rounded-lg shadow-md p-6 mt-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Gestionare Specialiști
            </h2>
            <p className="text-gray-600 mb-6">
              Alocați sau revocați rolul de specialist pentru utilizatori.
              Specialiștii pot vedea și gestiona programările atribuite lor și
              pot trimite mesaje către clienți.
            </p>

            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Se încarcă...</span>
                </div>
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
                        Utilizator
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Rol
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Data înregistrării
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
                    {users.map((userItem) => (
                      <tr key={userItem.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {userItem.photoURL ? (
                              <img
                                src={userItem.photoURL}
                                alt={userItem.displayName || "User"}
                                className="h-8 w-8 rounded-full mr-3"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <span className="text-gray-600 text-sm">
                                  {(
                                    userItem.displayName ||
                                    userItem.email ||
                                    "U"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="text-sm font-medium text-gray-900">
                              {userItem.displayName || "Utilizator fără nume"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {userItem.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              userItem.role === UserRole.ADMIN
                                ? "bg-red-100 text-red-800"
                                : userItem.role === UserRole.SPECIALIST
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {userItem.role === UserRole.ADMIN
                              ? "Admin"
                              : userItem.role === UserRole.SPECIALIST
                                ? "Specialist"
                                : "Utilizator"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {userItem.createdAt
                              ? userItem.createdAt.toLocaleDateString("ro-RO")
                              : "Necunoscut"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {userItem.role !== UserRole.SPECIALIST ? (
                            <button
                              onClick={() => handleMakeSpecialist(userItem.id)}
                              disabled={
                                specialistActionInProgress === userItem.id
                              }
                              className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50"
                            >
                              {specialistActionInProgress === userItem.id
                                ? "Se procesează..."
                                : "Setează ca specialist"}
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleRemoveSpecialist(userItem.id)
                              }
                              disabled={
                                specialistActionInProgress === userItem.id
                              }
                              className="text-red-600 hover:text-red-900 mr-4 disabled:opacity-50"
                            >
                              {specialistActionInProgress === userItem.id
                                ? "Se procesează..."
                                : "Elimină rol specialist"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Secțiunea pentru cererile de schimbare a rolului */}
          <div
            id="role-change-requests"
            className="bg-white rounded-lg shadow-md p-6 mt-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Cereri de schimbare a rolului
            </h2>
            <p className="text-gray-600 mb-6">
              Gestionați cererile utilizatorilor care doresc să devină
              specialiști pe platformă.
            </p>

            {loadingRoleRequests ? (
              <div className="text-center py-8">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Se încarcă...</span>
                </div>
              </div>
            ) : roleChangeRequests.length === 0 ? (
              <div className="bg-gray-50 p-6 text-center rounded-md">
                <p className="text-gray-600">
                  Nu există cereri de schimbare a rolului în așteptare.
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
                        Utilizator
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Specializare
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Motivul solicitării
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
                        Acțiuni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roleChangeRequests
                      .filter((request) => request.status === "pending")
                      .map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {request.userName || "Utilizator fără nume"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {request.userEmail}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700 font-medium">
                              {request.specialization || "Nespecificat"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                              {request.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {request.createdAt.toLocaleDateString("ro-RO")}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() =>
                                handleApproveRoleChange(request.id)
                              }
                              disabled={processingRequestId === request.id}
                              className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50"
                            >
                              {processingRequestId === request.id
                                ? "Se procesează..."
                                : "Aprobă"}
                            </button>
                            <button
                              onClick={() => handleRejectRoleChange(request.id)}
                              disabled={processingRequestId === request.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {processingRequestId === request.id
                                ? "Se procesează..."
                                : "Respinge"}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Dashboard section showing only specialists */}
          <div
            id="dashboard-specialists"
            className="bg-white rounded-lg shadow-md p-6 mt-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Specialiști activi
            </h2>
            <p className="text-gray-600 mb-6">
              Aceasta este lista specialiștilor activi pe platformă și
              specializările lor.
            </p>

            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Se încarcă...</span>
                </div>
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
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Specializare
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
                    {users
                      .filter(
                        (userItem) => userItem.role === UserRole.SPECIALIST
                      )
                      .map((userItem) => (
                        <tr key={userItem.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {userItem.photoURL ? (
                                <img
                                  src={userItem.photoURL}
                                  alt={userItem.displayName || "User"}
                                  className="h-8 w-8 rounded-full mr-3"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                  <span className="text-gray-600 text-sm">
                                    {(
                                      userItem.displayName ||
                                      userItem.email ||
                                      "U"
                                    )
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="text-sm font-medium text-gray-900">
                                {userItem.displayName || "Specialist fără nume"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {userItem.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">
                              {userItem.specialization || "Nespecificat"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() =>
                                handleRemoveSpecialist(userItem.id)
                              }
                              disabled={
                                specialistActionInProgress === userItem.id
                              }
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {specialistActionInProgress === userItem.id
                                ? "Se procesează..."
                                : "Elimină rol specialist"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    {users.filter((user) => user.role === UserRole.SPECIALIST)
                      .length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          Nu există specialiști activi pe platformă.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Produse
              </h4>
              <p className="text-2xl font-bold text-gray-800">126</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Comenzi
              </h4>
              <p className="text-2xl font-bold text-gray-800">43</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Utilizatori
              </h4>
              <p className="text-2xl font-bold text-gray-800">891</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Evenimente
              </h4>
              <p className="text-2xl font-bold text-gray-800">15</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
