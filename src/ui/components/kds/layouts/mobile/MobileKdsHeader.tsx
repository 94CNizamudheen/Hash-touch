import RightMenuBar from "../../tickets/mobile/RightMenuBar";
// import SearchBar from "../../tickets/mobile/SearchBar";
import LeftSidebar from "../../tickets/mobile/LeftSidebar";
import logo from '@/assets/logo.png';

const MobileKdsHeader = () => {
  return (
    <div className="w-full bg-white border-b shadow-sm">
      
      <div className="flex items-center justify-between px-3 py-2">
        <LeftSidebar />
        <div className="flex-1 flex justify-center pointer-events-none">
          <img src={logo} className="h-8 object-contain" />
        </div>

        <RightMenuBar />
      </div>
      {/* <div className="px-5 pb-2">
        <SearchBar />
      </div> */}

    </div>
  );
};

export default MobileKdsHeader;
