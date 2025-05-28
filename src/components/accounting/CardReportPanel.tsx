import React, { useEffect, useState } from "react";
import {
  CardReportService,
  CardReport,
} from "../../services/cardReportService";
import { useAuth } from "../../contexts/AuthContext";

const CardReportPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<CardReport[]>([]);
  const [date, setDate] = useState("");
  const [totalCard, setTotalCard] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Debug: verificare autentificare
  useEffect(() => {
    if (!currentUser) {
      console.warn("[CardReportPanel] Utilizatorul NU este autentificat!");
    } else {
      console.info(
        "[CardReportPanel] Utilizator autentificat:",
        currentUser.email || currentUser.uid
      );
    }
  }, [currentUser]);

  // Debug: afișează currentUser și request.auth
  useEffect(() => {
    console.log("[CardReportPanel] currentUser:", currentUser);
  }, [currentUser]);

  // Debug: prinde și afișează erorile de permisiuni
  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await CardReportService.getCardReports();
      setReports(data);
    } catch (error) {
      console.error("[CardReportPanel] Eroare la fetchReports:", error);
      alert("Eroare la accesarea rapoartelor de card: " + error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !totalCard) return;
    await CardReportService.createCardReport({
      date: new Date(date),
      totalCard: parseFloat(totalCard),
      notes,
      createdBy: currentUser?.email || "",
    });
    setDate("");
    setTotalCard("");
    setNotes("");
    fetchReports();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Raport Card pe Zile</h2>
      <form onSubmit={handleAdd} className="mb-4 flex gap-2 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="border p-1"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Total Card"
          value={totalCard}
          onChange={(e) => setTotalCard(e.target.value)}
          required
          className="border p-1"
        />
        <input
          type="text"
          placeholder="Notițe"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border p-1"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Adaugă
        </button>
      </form>
      {loading ? (
        <div>Se încarcă...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2">Data</th>
              <th className="border px-2">Total Card</th>
              <th className="border px-2">Notițe</th>
              <th className="border px-2">Adăugat de</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td className="border px-2">
                  {new Date(r.date).toLocaleDateString()}
                </td>
                <td className="border px-2">{r.totalCard.toFixed(2)} lei</td>
                <td className="border px-2">{r.notes}</td>
                <td className="border px-2">{r.createdBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CardReportPanel;
