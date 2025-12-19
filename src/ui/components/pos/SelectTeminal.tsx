
import { useState } from "react";
import { terminals } from "../../mock-data/terminals";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

export default function SelectTerminalPage({
  onSelect,
}: {
  onSelect?: (terminal: any) => void;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (terminal: string) => {
    setSelected(terminal);
    setIsOpen(false);
  };

  const handleLogin = () => {
    if (!selected) {
      alert("Please select a terminal.");
      return;
    }
    if (onSelect) onSelect(selected);
    console.log("Selected Terminal:", selected);
  };

  return (
    <section className="max-w-sm md:max-w-md mx-auto flex flex-col justify-center items-center gap-5 min-h-screen  px-4">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        {t("Select Terminal")}
      </h1>

      {/* Dropdown */}
      <div className="relative w-full">
        <label
          htmlFor="terminal"
          className="absolute -top-2 left-3 bg-gray-50 text-blue-600 text-sm px-1"
        >
          {t("Terminal")}
        </label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 border border-blue-600 rounded-md text-gray-800 bg-white focus:outline-none"
        >
          {selected || t("Select Terminal")}
          <ChevronDown
            className={`w-5 h-5 text-gray-600 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-56 overflow-y-auto">
            {terminals.map((t) => (
              <li
                key={t.id}
                onClick={() => handleSelect(t.name)}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                  selected === t.name ? "bg-blue-600 text-white" : ""
                }`}
              >
                {t.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Login Button */}
      <button
        onClick={handleLogin}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-all shadow-sm"
      >
        {t("Log In")}
      </button>
    </section>
  );
}
