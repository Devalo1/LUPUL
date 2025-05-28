import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  DollarSign,
  Package,
} from "lucide-react";
import { DocumentAttachment, ZReport } from "../../types/accounting";
import { Settlement, Invoice, StockMovement } from "../../types/accounting";
import { AccountingService } from "../../services/accountingService";
import DocumentUpload from "./DocumentUpload";

interface AccountingCalendarProps {
  canEdit: boolean;
}

interface CalendarData {
  zReports: ZReport[];
  settlements: Settlement[];
  invoices: Invoice[];
  stockMovements: StockMovement[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEvents: boolean;
  events: {
    zReports: number;
    settlements: number;
    invoices: number;
    stockMovements: number;
  };
}

const AccountingCalendar: React.FC<AccountingCalendarProps> = ({ canEdit }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData>({
    zReports: [],
    settlements: [],
    invoices: [],
    stockMovements: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<"month" | "week">("month");
  const [calendarAttachments, setCalendarAttachments] = useState<
    DocumentAttachment[]
  >([]);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  useEffect(() => {
    const loadAttachments = async () => {
      if (!selectedDate) {
        setCalendarAttachments([]);
        return;
      }
      const dateId = selectedDate.toISOString();
      const atts = await AccountingService.getCalendarAttachments(dateId);
      setCalendarAttachments(atts);
    };
    loadAttachments();
  }, [selectedDate]);

  const loadCalendarData = async () => {
    try {
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const [zReports, settlements, invoices, stockMovements] =
        await Promise.all([
          AccountingService.getZReportsByDateRange(startOfMonth, endOfMonth),
          AccountingService.getSettlementsByDateRange(startOfMonth, endOfMonth),
          AccountingService.getInvoicesByDateRange(startOfMonth, endOfMonth),
          AccountingService.getStockMovements(),
        ]);

      setCalendarData({
        zReports,
        settlements,
        invoices,
        stockMovements: stockMovements.filter((movement: StockMovement) => {
          const movementDate = new Date(movement.createdAt);
          return movementDate >= startOfMonth && movementDate <= endOfMonth;
        }),
      });
    } catch (error) {
      console.error("Error loading calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();

    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        hasEvents: false,
        events: { zReports: 0, settlements: 0, invoices: 0, stockMovements: 0 },
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toDateString();

      const dayEvents = {
        zReports: calendarData.zReports.filter(
          (item) => new Date(item.date).toDateString() === dateStr
        ).length,
        settlements: calendarData.settlements.filter(
          (item) => new Date(item.date).toDateString() === dateStr
        ).length,
        invoices: calendarData.invoices.filter(
          (item) =>
            new Date(item.date).toDateString() === dateStr ||
            new Date(item.dueDate).toDateString() === dateStr
        ).length,
        stockMovements: calendarData.stockMovements.filter(
          (item) => new Date(item.createdAt).toDateString() === dateStr
        ).length,
      };

      const hasEvents = Object.values(dayEvents).some((count) => count > 0);

      days.push({
        date,
        isCurrentMonth: true,
        isToday: dateStr === today.toDateString(),
        hasEvents,
        events: dayEvents,
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        hasEvents: false,
        events: { zReports: 0, settlements: 0, invoices: 0, stockMovements: 0 },
      });
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getDayEvents = (date: Date) => {
    const dateStr = date.toDateString();

    return {
      zReports: calendarData.zReports.filter(
        (item) => new Date(item.date).toDateString() === dateStr
      ),
      settlements: calendarData.settlements.filter(
        (item) => new Date(item.date).toDateString() === dateStr
      ),
      invoices: calendarData.invoices.filter(
        (item) =>
          new Date(item.date).toDateString() === dateStr ||
          new Date(item.dueDate).toDateString() === dateStr
      ),
      stockMovements: calendarData.stockMovements.filter(
        (item) => new Date(item.createdAt).toDateString() === dateStr
      ),
    };
  };

  const handleAttachmentUpload = async (files: File[]) => {
    if (!selectedDate) return;
    const dateId = selectedDate.toISOString();
    await AccountingService.uploadCalendarAttachments(dateId, files);
    const atts = await AccountingService.getCalendarAttachments(dateId);
    setCalendarAttachments(atts);
    await loadCalendarData();
  };

  const handleAttachmentDelete = async (attachmentId: string) => {
    if (!selectedDate) return;
    const dateId = selectedDate.toISOString();
    await AccountingService.deleteCalendarAttachment(dateId, attachmentId);
    const atts = await AccountingService.getCalendarAttachments(dateId);
    setCalendarAttachments(atts);
    await loadCalendarData();
  };

  const handleViewAttachment = (attachment: DocumentAttachment) => {
    window.open(attachment.url, "_blank");
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
  ];
  const dayNames = ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Calendar contabil</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedView("month")}
            className={`px-3 py-2 rounded-lg text-sm ${
              selectedView === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Luna
          </button>
          <button
            onClick={() => setSelectedView("week")}
            className={`px-3 py-2 rounded-lg text-sm ${
              selectedView === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Săptămâna
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-sm text-gray-600">Rapoarte Z</div>
              <div className="text-2xl font-bold text-blue-600">
                {calendarData.zReports.length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-sm text-gray-600">Decontări</div>
              <div className="text-2xl font-bold text-green-600">
                {calendarData.settlements.length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-sm text-gray-600">Facturi</div>
              <div className="text-2xl font-bold text-purple-600">
                {calendarData.invoices.length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <div className="text-sm text-gray-600">Mișcări stoc</div>
              <div className="text-2xl font-bold text-orange-600">
                {calendarData.stockMovements.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {" "}
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Luna anterioară"
                title="Luna anterioară"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Luna următoare"
                title="Luna următoare"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Astăzi
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                onClick={() => setSelectedDate(day.date)}
                className={`
                  p-2 min-h-[80px] border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors
                  ${!day.isCurrentMonth ? "text-gray-400 bg-gray-50" : ""}
                  ${day.isToday ? "bg-blue-50 border-blue-200" : ""}
                  ${selectedDate?.toDateString() === day.date.toDateString() ? "bg-blue-100 border-blue-300" : ""}
                `}
              >
                <div className="text-sm font-medium mb-1">
                  {day.date.getDate()}
                </div>

                {day.hasEvents && day.isCurrentMonth && (
                  <div className="space-y-1">
                    {day.events.zReports > 0 && (
                      <div className="text-xs bg-blue-500 text-white px-1 rounded">
                        {day.events.zReports} Z
                      </div>
                    )}
                    {day.events.settlements > 0 && (
                      <div className="text-xs bg-green-500 text-white px-1 rounded">
                        {day.events.settlements} D
                      </div>
                    )}
                    {day.events.invoices > 0 && (
                      <div className="text-xs bg-purple-500 text-white px-1 rounded">
                        {day.events.invoices} F
                      </div>
                    )}
                    {day.events.stockMovements > 0 && (
                      <div className="text-xs bg-orange-500 text-white px-1 rounded">
                        {day.events.stockMovements} S
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span>Rapoarte Z</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span>Decontări</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
              <span>Facturi</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
              <span>Mișcări stoc</span>
            </div>
          </div>
        </div>

        {/* Day Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedDate ? (
              <>
                Detalii pentru {selectedDate.toLocaleDateString("ro-RO")}
                {selectedDate.toDateString() === new Date().toDateString() && (
                  <span className="text-sm text-blue-600 ml-2">(Astăzi)</span>
                )}
              </>
            ) : (
              "Selectați o zi pentru detalii"
            )}
          </h3>

          {selectedDate ? (
            <DayEventsList
              events={getDayEvents(selectedDate)}
              date={selectedDate}
            />
          ) : (
            <div className="text-gray-500 text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                Faceți clic pe o zi din calendar pentru a vedea detaliile
                evenimentelor contabile.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Details and document upload for selected date */}
      {selectedDate && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">
            Detalii pentru {selectedDate.toLocaleDateString("ro-RO")}
          </h3>
          <div className="mt-4">
            <DocumentUpload
              documentType="calendar"
              attachments={calendarAttachments}
              canEdit={canEdit}
              onUpload={handleAttachmentUpload}
              onDelete={handleAttachmentDelete}
              onView={handleViewAttachment}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Day Events List Component
interface DayEventsListProps {
  events: {
    zReports: ZReport[];
    settlements: Settlement[];
    invoices: Invoice[];
    stockMovements: StockMovement[];
  };
  date: Date;
}

const DayEventsList: React.FC<DayEventsListProps> = ({
  events,
  date: _date,
}) => {
  const hasAnyEvents = Object.values(events).some((arr) => arr.length > 0);

  if (!hasAnyEvents) {
    return (
      <div className="text-gray-500 text-center py-8">
        <p>Nu există evenimente contabile în această zi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Z Reports */}
      {events.zReports.length > 0 && (
        <div>
          <h4 className="font-medium text-blue-600 mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Rapoarte Z ({events.zReports.length})
          </h4>
          <div className="space-y-2">
            {" "}
            {events.zReports.map((report) => (
              <div key={report.id} className="p-2 bg-blue-50 rounded text-sm">
                <div className="font-medium">{report.cashRegisterId}</div>
                <div className="text-gray-600">
                  Casa: {report.cashRegisterName}
                </div>
                <div className="text-gray-600">
                  Total: {report.totalSales.toFixed(2)} RON
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settlements */}
      {events.settlements.length > 0 && (
        <div>
          <h4 className="font-medium text-green-600 mb-2 flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Decontări ({events.settlements.length})
          </h4>
          <div className="space-y-2">
            {" "}
            {events.settlements.map((settlement) => (
              <div
                key={settlement.id}
                className="p-2 bg-green-50 rounded text-sm"
              >
                <div className="font-medium">Decontare {settlement.type}</div>
                <div className="text-gray-600">
                  Casa: {settlement.cashRegisterId}
                </div>
                <div className="text-gray-600">
                  Sumă: {settlement.totalAmount.toFixed(2)} RON
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices */}
      {events.invoices.length > 0 && (
        <div>
          <h4 className="font-medium text-purple-600 mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Facturi ({events.invoices.length})
          </h4>
          <div className="space-y-2">
            {events.invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-2 bg-purple-50 rounded text-sm"
              >
                <div className="font-medium">{invoice.invoiceNumber}</div>
                <div className="text-gray-600">
                  Client: {invoice.clientName}
                </div>
                <div className="text-gray-600">
                  Valoare: {invoice.totalAmount.toFixed(2)} RON
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Movements */}
      {events.stockMovements.length > 0 && (
        <div>
          <h4 className="font-medium text-orange-600 mb-2 flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Mișcări stoc ({events.stockMovements.length})
          </h4>
          <div className="space-y-2">
            {events.stockMovements.map((movement) => (
              <div
                key={movement.id}
                className="p-2 bg-orange-50 rounded text-sm"
              >
                <div className="font-medium">{movement.productName}</div>
                <div className="text-gray-600">
                  Tip: {movement.type === "in" ? "Intrare" : "Ieșire"}
                </div>
                <div className="text-gray-600">
                  Cantitate: {movement.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingCalendar;
