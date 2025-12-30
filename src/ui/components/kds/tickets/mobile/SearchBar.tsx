
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="flex items-center shadow px-3 py-3 rounded border">
      <Search size={18} className="text-gray-500" />
      <input 
        className="ml-2 flex-1 outline-none text-sm"
        placeholder="search"
      />
    </div>
  );
};

export default SearchBar;
