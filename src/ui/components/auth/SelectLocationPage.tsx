
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Location {
  id: string;
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
        serverId: "8c1e9c3a-1a2b-4f2a-9f7d-1a2c9e4b1234",
        name: "Green Valley",
        active: 1,
        selected: 0,
      },
      {
        serverId: "f4a9d8e1-55cc-4a11-9c77-8899aa112233",
        name: "Ocean Side",
        active: 1,
        selected: 0,
      },
      {
        serverId: "d9e2b1c4-7777-4e99-8888-abcdef123456",
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
        .map((l) => ({ id: l.serverId, name: l.name, active: Boolean(l.active) })),
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
