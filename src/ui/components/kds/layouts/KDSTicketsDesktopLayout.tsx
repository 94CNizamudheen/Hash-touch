import { Outlet } from "react-router-dom";
import KDSTicketHeader from "./KDSTicketHeader";
import KDSTicketsFooter from "./KDSTicketsFooter";



const KDSTicketsDesktopLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <KDSTicketHeader />
      
      <main className="flex-1 overflow-auto p-4">
        <Outlet /> 
      </main>
      
      <KDSTicketsFooter />
    </div>
  );
}

export default KDSTicketsDesktopLayout
