
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Location {
  id: string;
  brand_id: string;
  name: string;
  active: boolean;
}

export default function SelectLocationPage({
  onSelect,
}: {
  onSelect: (location: Location) => void;
}) {
  const [selected, setSelected] = useState<Location | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  /* =========================
     Mock source data
  ========================= */
  const sourceData = useMemo(
    () => [
      {
        id: "ad98450c-a4da-4971-870e-295d33e1904b",
        brand_id: "95e0791c-6cd2-4c4f-a77e-4f62eeb3573d",
        name: "Port Lewisview",
        active: 1,
        selected: 0,
      },
      {
        id: "22b19a2b-b3ae-45d3-baa2-e0cf52206081",
        brand_id: "4478e3f2-3fa4-47d5-9391-3f975ac70d71",
        name: "Ocean Side",
        active: 1,
        selected: 0,
      },
      {
        id: "b5d06614-db41-4ddf-9eed-35d52ebbe3f5",
        brand_id: "29303023-9f25-4179-b08e-6364f59687b4",
        name: "Hill Top",
        active: 1,
        selected: 0,
      },
    ],
    []
  );


  const locations = useMemo(
    () =>
      sourceData
        .filter((l) => l.active)
        .map((l) => ({ id: l.id,brand_id:l.brand_id , name: l.name, active: Boolean(l.active) })),
    [sourceData]
  );

  const handleLogin = () => {
    if (!selected) {
      alert("Please select a location.");
      return;
    }
    onSelect(selected);
  };

  return (
    <section className="max-w-sm mx-auto flex flex-col justify-center items-center gap-5 min-h-screen px-4">
      <h1 className="text-2xl font-semibold mb-2">Select Location</h1>

      {/* Dropdown */}
      <div className="relative w-full">
        <label className="absolute -top-2 left-3 bg-white text-primary text-sm px-1">
          Location
        </label>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 border rounded-md bg-white"
        >
          {selected?.name || "Select Location"}
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {isOpen && (
          <ul className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-md max-h-56 overflow-y-auto">
            {locations.map((loc) => (
              <li
                key={loc.id}
                onClick={() => {
                  setSelected(loc);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer hover:bg-primary/10 ${selected?.id === loc.id ? "bg-primary text-white" : ""
                  }`}
              >
                {loc.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleLogin}
        className="w-full py-3 bg-primary text-white rounded-md"
      >
        Continue
      </button>
    </section>
  );
}
