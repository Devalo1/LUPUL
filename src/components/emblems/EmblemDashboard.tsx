import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { emblemService } from "../../services/emblemService";
import { communityEventService } from "../../services/communityEventService";
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
} from "react-icons/fa";
import "./EmblemDashboard.css";

const EmblemDashboard: React.FC = () => {
  const { user } = useAuth();
  const [emblemStatus, setEmblemStatus] = useState<UserEmblemStatus | null>(
    null
  );
  const [upcomingEvents, setUpcomingEvents] = useState<CommunityEvent[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<
    EventRegistration[]
  >([]);
  const [loading, setLoading] = useState(true);

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
      const status = await emblemService.getUserEmblemStatus(user.uid);
      setEmblemStatus(status);
    } catch (error) {
      console.error("Error loading emblem data:", error);
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
      <div className="dashboard-header">
        <h1>🔮 Dashboardul Tău Exclusiv</h1>
        <p>Bine ai venit în comunitatea selectă de deținători de embleme!</p>
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
