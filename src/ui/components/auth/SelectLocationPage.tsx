import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { commonDataService } from "@/services/data/common.data.service";
import { decodeJWT, type JWTPayload } from "@/ui/utils/jwtUtils";
import { cn } from "@/lib/utils";
import logo from "@assets/logo.png"

interface Location {
  id: string;
  brand_id: string;
  name: string;
  active: boolean;
  code:string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingLocations, setFetchingLocations] = useState(true);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     Fetch Locations
  ========================= */
  useEffect(() => {
    async function fetchLocations() {
      try {
        setFetchingLocations(true);
        setError(null);

        const payload = decodeJWT<JWTPayload>(accessToken);
        if (!payload?.location_ids) {
          throw new Error("Invalid token or missing location_ids");
        }

        const response = await commonDataService.getLocations(
          tenantDomain,
          accessToken
        );

        const filtered = response
          .filter(
            (loc: any) =>
              loc.active && payload.location_ids.includes(loc.id)
          )
          .map((loc: any) => ({
            id: loc.id,
            brand_id: loc.brand_id,
            name: loc.name,
            active: Boolean(loc.active),
            code:loc.code,
          }));

        setAllLocations(filtered);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch locations"
        );
      } finally {
        setFetchingLocations(false);
      }
    }

    fetchLocations();
  }, [tenantDomain, accessToken]);

  const locations = useMemo(() => allLocations, [allLocations]);

  const handleContinue = async () => {
    if (!selected) return;

    try {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 800));
      onSelect(selected);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-background rounded-xl shadow-lg p-6 space-y-6">
        {/* Logo */}
        <img
          src={logo}
          alt="Hashmato"
          className="h-10 md:h-12 w-auto object-contain"
        />

        {/* Title */}
        <div className="flex items-center justify-center gap-2 text-primary font-medium">
          <MapPin className="w-5 h-5" />
          <span>Location</span>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {fetchingLocations ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Loading locations...
            </span>
          </div>
        ) : (
          <>
            {/* Location Grid */}
            <div className="grid grid-cols-2 gap-3">
              {locations.map((loc) => {
                const isActive = selected?.id === loc.id;

                return (
                  <button
                    key={loc.id}
                    onClick={() => setSelected(loc)}
                    className={cn(
                      "rounded-lg border px-3 py-4 text-center transition-all",
                      "hover:border-primary",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-secondary-foreground text-foreground"
                    )}
                  >
                    <div className="font-medium">{loc.name}</div>
                    <div className="text-xs opacity-80 mt-1">
                      {`(${loc.code})`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!selected || isLoading}
              className="w-full mt-4 h-11 rounded-lg bg-primary text-primary-foreground font-medium
                         flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
