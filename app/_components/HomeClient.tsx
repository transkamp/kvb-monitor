"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Stop, Departure } from "@/lib/types";
import { useDepartures } from "@/hooks/useDepartures";
import { searchStops } from "@/lib/api";
import { slugify } from "@/lib/utils/slug";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import DepartureList from "@/components/DepartureList";
import FavoritesOverlay from "@/components/FavoritesOverlay";
import TripDetailsModal from "@/components/TripDetailsModal";
import Toast from "@/components/Toast";

interface HomeClientProps {
  initialStop?: Stop | null;
  /** When true, do NOT auto-load from favorites (a stop slug is in URL). */
  suppressFavoritesAutoload?: boolean;
}

export default function HomeClient({
  initialStop = null,
  suppressFavoritesAutoload = false,
}: HomeClientProps) {
  const router = useRouter();
  const [currentStop, setCurrentStop] = useState<Stop | null>(initialStop);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [selectedDeparture, setSelectedDeparture] = useState<Departure | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialMountRef = useRef<boolean>(true);

  const { departures, loading, error, lastUpdated, refresh } = useDepartures(currentStop);

  // Centralized stop setter with toast feedback + URL sync
  const selectStop = useCallback(
    (stop: Stop) => {
      setCurrentStop((prev) => {
        if (prev && prev.id === stop.id) {
          return prev;
        }
        if (!isInitialMountRef.current) {
          setToastMessage(`${stop.name} ausgewählt`);
        }
        // Sync URL
        const slug = slugify(stop.name);
        if (slug) {
          router.replace(`/${slug}`, { scroll: false });
        }
        return stop;
      });
    },
    [router]
  );

  // Initial load from favorites — only if no initialStop and not suppressed
  useEffect(() => {
    if (!suppressFavoritesAutoload && !currentStop) {
      const favorites = localStorage.getItem("kvb-favorites");
      if (favorites) {
        try {
          const parsed = JSON.parse(favorites);
          if (parsed.length > 0) {
            setCurrentStop(parsed[0]);
          }
        } catch {
          // ignore
        }
      }
    }
    isInitialMountRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStopSelect = useCallback(
    (stop: Stop) => {
      selectStop(stop);
    },
    [selectStop]
  );

  const handleMenuClick = useCallback(() => {
    setShowFavorites(true);
  }, []);

  const handleCloseFavorites = useCallback(() => {
    setShowFavorites(false);
  }, []);

  const handleFavoriteSelect = useCallback(
    (stop: Stop) => {
      selectStop(stop);
    },
    [selectStop]
  );

  const handleDepartureClick = useCallback((departure: Departure) => {
    setSelectedDeparture(departure);
  }, []);

  const handleCloseTripDetails = useCallback(() => {
    setSelectedDeparture(null);
  }, []);

  const handleSelectStopFromModal = useCallback(
    async (stopName: string) => {
      setSelectedDeparture(null);

      try {
        const results = await searchStops(stopName);
        if (results.length > 0) {
          const exact = results.find(
            (s) => s.name.toLowerCase().trim() === stopName.toLowerCase().trim()
          );
          selectStop(exact ?? results[0]);
          return;
        }
      } catch {
        // fall through
      }
      selectStop({ id: stopName, name: stopName });
    },
    [selectStop]
  );

  const handleDismissToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch.clientX > 50) {
      setIsSwipeActive(true);
      setTouchStartX(touch.clientX);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isSwipeActive) return;
      const touch = e.touches[0];
      const diff = touchStartX - touch.clientX;
      if (diff > 100) {
        setShowFavorites(true);
        setIsSwipeActive(false);
      }
    },
    [isSwipeActive, touchStartX]
  );

  const handleTouchEnd = useCallback(() => {
    setIsSwipeActive(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Header onMenuClick={handleMenuClick} currentStop={currentStop} />

      <main className="max-w-xl mx-auto px-4 py-6">
        <div className="mb-6">
          <SearchBar onSelect={handleStopSelect} />
        </div>

        {currentStop ? (
          <DepartureList
            departures={departures}
            loading={loading}
            error={error}
            onRefresh={refresh}
            lastUpdated={lastUpdated}
            onDepartureClick={handleDepartureClick}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-secondary mb-2">Wähle eine Haltestelle aus</div>
            <div className="text-sm text-secondary">
              oder öffne das Menü (☰) für deine Favoriten
            </div>
          </div>
        )}
      </main>

      <FavoritesOverlay
        isOpen={showFavorites}
        onClose={handleCloseFavorites}
        onSelect={handleFavoriteSelect}
        currentStopId={currentStop?.id || null}
      />

      {selectedDeparture && (
        <TripDetailsModal
          departure={selectedDeparture}
          currentStopName={currentStop?.name || ""}
          onClose={handleCloseTripDetails}
          onStopSelect={handleSelectStopFromModal}
        />
      )}

      <Toast
        message={toastMessage ?? ""}
        visible={!!toastMessage}
        onDismiss={handleDismissToast}
      />
    </div>
  );
}
