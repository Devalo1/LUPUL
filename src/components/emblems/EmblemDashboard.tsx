import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { emblemService } from "../../services/emblemService";
import { communityEventService } from "../../services/communityEventService";
import { testDataService } from "../../services/testDataService";
import { Emblem, UserEmblemStatus, EVOLUTION_LEVELS } from "../../types/emblem";
import {
  CommunityEvent,
  EventRegistration,
} from "../../services/communityEventService";
import {
  FaCrown,
  FaCalendarAlt,
  FaTrophy,
  FaChartLine,
  FaUsers,
  FaGift,
  FaGem,
  FaMagic,
  FaHeart
} from "react-icons/fa";
import { collection, query, where, getDocs, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { firestore } from "../../firebase";
import "./EmblemDashboard.css";
import { isDev } from "../../utils/env";

const EmblemDashboard: React.FC = () => {
  const { user } = useAuth();
  const [emblemStatus, setEmblemStatus] = useState<UserEmblemStatus | null>(
    null
  );
  // Dev-only: emblems bought in development for testing
  const [devPurchasedEmblems, setDevPurchasedEmblems] = useState<Emblem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CommunityEvent[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<
    EventRegistration[]
  >([]);
  const [loading, setLoading] = useState(true);

  const emblemIcons = {
    lupul_intelept: <FaCrown className="text-yellow-500" />,
    corbul_mistic: <FaMagic className="text-purple-500" />,
    gardianul_wellness: <FaHeart className="text-red-500" />,
    cautatorul_lumina: <FaGem className="text-blue-500" />,
  };

  useEffect(() => {
    if (user) {
      loadEmblemData();
      loadUpcomingEvents();
      loadUserRegistrations();
    }
  }, [user]);

  const loadEmblemData = async () => {
    if (!user) return;

    try {
      console.log("🔍 Încep încărcarea datelor pentru user:", user.uid);
      
      const status = await emblemService.getUserEmblemStatus(user.uid);
      console.log("📊 Status emblemă primit:", status);
      
      setEmblemStatus(status);

      if (status.hasEmblem && status.emblem) {
        console.log("✅ Emblema găsită:", status.emblem);
      } else {
        console.log("❌ Nu s-a găsit nicio emblemă pentru user");
      }

      // Dev-only: load emblems the user bought (test purchases)
      try {
        if (isDev) {
          console.log("🧪 Încărcare embleme de test pentru development");
          const txQ = query(
            collection(firestore, "emblemTransactions"),
            where("buyerId", "==", user.uid),
            where("type", "==", "purchase")
          );
          const txSnap = await getDocs(txQ);
          console.log("📜 Tranzacții găsite:", txSnap.size);

          const emblemPromises = txSnap.docs.map(async (docSnap) => {
            const emblemId = docSnap.data().emblemId;
            if (!emblemId) return null;
            const emblemDoc = await getDoc(doc(firestore, "emblems", emblemId));
            return emblemDoc.exists() ? (emblemDoc.data() as Emblem) : null;
          });

          const results = (await Promise.all(emblemPromises)).filter(Boolean) as Emblem[];
          console.log("🎯 Embleme de test încărcate:", results.length);
          setDevPurchasedEmblems(results);
        }
      } catch (e) {
        console.warn("Nu am putut încărca emblemele de test (dev):", e);
      }

    } catch (error) {
      console.error("❌ Eroare la încărcarea datelor:", error);
    }
  };

  // Dev helper: create a test emblem + transaction for the current user
  const seedTestEmblem = async () => {
    if (!isDev || !user) return;
    try {
      await testDataService.createMultipleTestEmblems(user.uid, 3);
      await loadEmblemData(); // reload to show new emblems
      alert("Embleme de test create cu succes!");
    } catch (e) {
      console.error("Eroare la crearea emblemelor de test:", e);
      alert("Nu am putut crea embleme de test: " + (e as Error).message);
    }
  };

  const loadUpcomingEvents = async () => {
    if (!user) return;

    try {
      const events = await communityEventService.getUpcomingEvents();
      setUpcomingEvents(events.slice(0, 5)); // Show only next 5 events
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const loadUserRegistrations = async () => {
    if (!user) return;

    try {
      const registrations = await communityEventService.getUserRegistrations(
        user.uid
      );
      setUserRegistrations(registrations);
    } catch (error) {
      console.error("Error loading registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventRegistration = async (eventId: string) => {
    if (!user || !emblemStatus?.emblem) return;

    try {
      const result = await communityEventService.registerForEvent(
        user.uid,
        eventId
      );

      if (result.success) {
        await loadUserRegistrations();
        await loadUpcomingEvents();
        alert("Te-ai înregistrat cu succes la eveniment!");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      alert("Eroare la înregistrarea pentru eveniment");
    }
  };

  const getEvolutionProgress = (emblem: Emblem) => {
    const currentLevel = emblem.level;
    const nextLevelKey = getNextLevel(currentLevel);

    if (!nextLevelKey) return 100; // Max level

    const nextLevel =
      EVOLUTION_LEVELS[nextLevelKey as keyof typeof EVOLUTION_LEVELS];
    const progress = (emblem.engagement / nextLevel.engagement) * 100;

    return Math.min(progress, 100);
  };

  const getNextLevel = (currentLevel: string): string | null => {
    const levels = ["bronze", "silver", "gold", "platinum", "diamond"];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  // Helper to format prices consistently
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="emblem-dashboard loading">
        <div className="loading-spinner">Se încarcă...</div>
      </div>
    );
  }

  if (!emblemStatus?.hasEmblem) {
    return (
      <div className="emblem-dashboard no-emblem">
        <div className="no-emblem-message">
          <h2>Nu ai încă o emblemă</h2>
          <p>
            Dobândește o emblemă pentru a accesa această funcționalitate și
            pentru a te alătura comunității noastre exclusive!
          </p>
          <button
            className="get-emblem-btn"
            onClick={() => (window.location.href = "/emblems/mint")}
          >
            Cumpără Emblemă
          </button>
        </div>
      </div>
    );
  }

  const { emblem } = emblemStatus;
  if (!emblem) return null;

  return (
    <div className="emblem-dashboard">
      <div className="dashboard-header bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 p-8 rounded-lg shadow-lg mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-white mb-4 md:mb-0">
            <h1 className="text-3xl font-bold">{greeting}, <span className="text-yellow-300">{username}</span>!</h1>
            <p className="text-blue-100">Bun venit înapoi pe panoul tău de control personal.</p>
          </div>
          
          {emblemStatus?.hasEmblem && emblemStatus.emblem && (
            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-xl">
              <div className="mr-4 text-4xl">
                {emblemIcons[emblemStatus.emblem.type as keyof typeof emblemIcons] || <FaGem className="text-gray-300" />}
              </div>
              <div>
                <div className="text-yellow-300 font-semibold">
                  {emblemStatus.emblem.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold
                    ${emblemStatus.emblem.metadata?.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                    emblemStatus.emblem.metadata?.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                    emblemStatus.emblem.metadata?.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-gray-500/20 text-gray-300'}`}>
                    {emblemStatus.emblem.metadata?.rarity?.toUpperCase() || 'COMMON'}
                  </span>
                  <span className="text-xs">•</span>
                  <span className="text-sm font-medium">{emblemStatus.emblem.level.toUpperCase()}</span>
                </div>
                <div className="mt-1 text-xs text-blue-200">
                  #{emblemStatus.communityRank} în comunitate • {emblemStatus.emblem.engagement} puncte
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emblem Status Card */}
      <div className="emblem-status-card">
        <div className="emblem-visual">
          <div className={`emblem-icon ${emblem.type}`}>
            <FaCrown />
          </div>
          <div className="emblem-level">{emblem.level.toUpperCase()}</div>
        </div>

        <div className="emblem-details">
          <h3>{emblem.metadata.description}</h3>
          <div className="emblem-stats">
            <div className="stat">
              <span className="stat-label">Engagement</span>
              <span className="stat-value">{emblem.engagement}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Rang Comunitate</span>
              <span className="stat-value">#{emblemStatus.communityRank}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Evenimente Participări</span>
              <span className="stat-value">{emblemStatus.eventsAttended}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dev-only: afișează emblemele cumpărate în mediul de dezvoltare */}
      {isDev && (
        <div>
          {devPurchasedEmblems.length > 0 && (
            <div className="dev-purchased-emblems mt-6 bg-gray-50 rounded-md p-4">
              <h3 className="text-lg font-semibold">Embleme cumpărate (TEST - dev)</h3>
              <p className="text-sm text-gray-600 mb-3">Acestea sunt achiziții de test din mediul de dezvoltare — nu apar în producție.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {devPurchasedEmblems.map((e) => (
                  <div key={e.id} className="p-3 bg-white rounded shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={e.metadata?.image || '/images/emblem-placeholder.png'} alt={e.type} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <div className="font-semibold">{(e.type || 'unknown').replace('_', ' ').replace(/\b\w/g,m=>m.toUpperCase())}</div>
                        <div className="text-sm text-gray-500">{e.level?.toUpperCase() || '-'}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">Preț: {formatPrice(e.purchasePrice ?? 0)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <button onClick={seedTestEmblem} className="px-3 py-2 bg-yellow-500 text-white rounded">Seed emblemă de test</button>
          </div>
        </div>
      )}

      {/* Evolution Progress */}
      <div className="evolution-card">
        <h3>
          <FaChartLine /> Progres către următorul nivel
        </h3>
        <div className="evolution-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              ref={(el) => {
                if (el) {
                  el.style.width = `${getEvolutionProgress(emblem)}%`;
                }
              }}
            ></div>
          </div>
          <div className="progress-text">
            {getEvolutionProgress(emblem).toFixed(1)}%
          </div>
        </div>

        {emblemStatus.canEvolveTo && (
          <div className="evolution-info">
            <p>
              Următorul nivel: <strong>{emblemStatus.canEvolveTo}</strong>
            </p>
            <div className="next-level-benefits">
              <h4>Beneficii noi:</h4>
              <ul>
                {EVOLUTION_LEVELS[
                  emblemStatus.canEvolveTo as keyof typeof EVOLUTION_LEVELS
                ]?.benefits.map((benefit: string, index: number) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Benefits & Privileges */}
      <div className="benefits-card">
        <h3>
          <FaGift /> Beneficiile Tale Exclusive
        </h3>
        <div className="benefits-grid">
          {emblem.benefits.map((benefit, index) => (
            <div key={index} className="benefit-item">
              <span className="benefit-icon">✨</span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Marketplace Access */}
      <div className="marketplace-card">
        <h3>🏪 Marketplace Embleme NFT</h3>
        <p>
          Explorează și tranzacționează embleme rare cu alți membri ai
          comunității. Cumpără embleme unice sau listează emblema ta pentru
          vânzare.
        </p>
        <div className="marketplace-actions">
          <Link to="/emblems/marketplace" className="marketplace-btn primary">
            🔍 Explorează Marketplace-ul
          </Link>
          {emblem.isTransferable && (
            <span className="transfer-status">
              ✅ Emblema ta poate fi listată pentru vânzare
            </span>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="events-card">
        <h3>
          <FaCalendarAlt /> Evenimente Exclusive
        </h3>
        {upcomingEvents.length === 0 ? (
          <p>Nu sunt evenimente programate momentan.</p>
        ) : (
          <div className="events-list">
            {upcomingEvents.map((event) => {
              const isRegistered = userRegistrations.some(
                (reg) => reg.eventId === event.id
              );
              const canRegister =
                event.requiredTier <=
                (emblem.metadata.attributes.strength || 0);

              return (
                <div key={event.id} className="event-item">
                  <div className="event-header">
                    <h4>{event.title}</h4>
                    <span className="event-date">
                      {event.startDate.toDate().toLocaleDateString("ro-RO")}
                    </span>
                  </div>
                  <p className="event-description">{event.description}</p>

                  <div className="event-meta">
                    <span className="event-duration">{event.duration} min</span>
                    <span className="event-participants">
                      <FaUsers /> {event.registeredCount}/
                      {event.maxParticipants}
                    </span>
                  </div>

                  <div className="event-actions">
                    {isRegistered ? (
                      <span className="registered-badge">✅ Înregistrat</span>
                    ) : canRegister ? (
                      <button
                        className="register-btn"
                        onClick={() => handleEventRegistration(event.id)}
                        disabled={
                          (event.registeredCount || 0) >= event.maxParticipants
                        }
                      >
                        {(event.registeredCount || 0) >= event.maxParticipants
                          ? "Complet"
                          : "Înregistrează-te"}
                      </button>
                    ) : (
                      <span className="tier-required">
                        Necesită Tier {event.requiredTier}+
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Community Insights */}
      <div className="insights-card">
        <h3>
          <FaTrophy /> Statistici Comunitate
        </h3>
        <div className="insights-grid">
          <div className="insight-item">
            <div className="insight-number">{emblemStatus.communityRank}</div>
            <div className="insight-label">Rangul tău</div>
          </div>
          <div className="insight-item">
            <div className="insight-number">{emblemStatus.eventsAttended}</div>
            <div className="insight-label">Evenimente participări</div>
          </div>
          <div className="insight-item">
            <div className="insight-number">{emblem.engagement}</div>
            <div className="insight-label">Total Engagement</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmblemDashboard;
