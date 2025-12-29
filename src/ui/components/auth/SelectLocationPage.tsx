import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { commonDataService } from "@/services/data/common.data.service";
import { decodeJWT, type JWTPayload } from "@/ui/utils/jwtUtils";

interface Location {
  id: string;
  brand_id: string;
  name: string;
  active: boolean;
}

export default function SelectLocationPage({
  onSelect,
  tenantDomain,
  accessToken,
}: {
  onSelect: (location: Location) => void;
  tenantDomain: string;
  accessToken: string;
}) {
  const [selected, setSelected] = useState<Location | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingLocations, setFetchingLocations] = useState(true);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     Fetch Locations on Mount
  ========================= */
  useEffect(() => {
    async function fetchLocations() {
      try {
        setFetchingLocations(true);
        setError(null);

        // Decode JWT to get location_ids
        const payload = decodeJWT<JWTPayload>(accessToken);
        if (!payload || !payload.location_ids) {
          throw new Error("Invalid token or missing location_ids");
        }

        // Fetch all locations from API
        const response = await commonDataService.getLocations(
          tenantDomain,
          accessToken
        );

        // Filter locations based on location_ids in token
        const filteredLocations = response
          .filter((loc: any) =>
            loc.active && payload.location_ids.includes(loc.id)
          )
          .map((loc: any) => ({
            id: loc.id,
            brand_id: loc.brand_id,
            name: loc.name,
            active: Boolean(loc.active),
          }));

        setAllLocations(filteredLocations);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch locations");
      } finally {
        setFetchingLocations(false);
      }
    }

    fetchLocations();
  }, [tenantDomain, accessToken]);

  const locations = useMemo(() => allLocations, [allLocations]);

  const handleLogin = async () => {
    if (!selected) {
      alert("Please select a location.");
      return;
    }

    try {
      setIsLoading(true);
      // simulate API / async work
      await new Promise((r) => setTimeout(r, 1000));
      onSelect(selected);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="max-w-sm mx-auto flex flex-col justify-center items-center gap-5 min-h-screen px-4">
      <h1 className="text-2xl font-semibold mb-2">Select Location</h1>

      {/* Error Message */}
      {error && (
        <div className="w-full p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {fetchingLocations ? (
        <div className="w-full flex flex-col items-center gap-3 py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading locations...</p>
        </div>
      ) : (
        <>
          {/* Dropdown */}
          <div className="relative w-full">
            <label className="absolute -top-2 left-3 bg-background text-primary text-sm px-1">
              Location
            </label>

            <button
              disabled={isLoading || locations.length === 0}
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between px-4 py-3 border rounded-md bg-background disabled:opacity-60"
            >
              {selected?.name || (locations.length === 0 ? "No locations available" : "Select Location")}
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <ul className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-md max-h-56 overflow-y-auto">
                {locations.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-muted-foreground">
                    No locations available
                  </li>
                ) : (
                  locations.map((loc) => (
                    <li
                      key={loc.id}
                      onClick={() => {
                        setSelected(loc);
                        setIsOpen(false);
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-primary/10 ${
                        selected?.id === loc.id
                          ? "bg-primary text-white"
                          : ""
                      }`}
                    >
                      {loc.name}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Confirm Button with fallback UI */}
          <button
            onClick={handleLogin}
            disabled={isLoading || !selected}
            className="w-full py-3 bg-primary text-white rounded-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              "Continue"
            )}
          </button>
        </>
      )}
    </section>
  );
}
