import DineIn from "../_components/DineIn";
import Products from "./Products";
import { useCart } from "@/ui/context/CartContext";
import MenuSelectionSidebar from "./MenuSelectionSidebar";

const MenuSelectionPage = ({ tempStyle }: { tempStyle: boolean }) => {
  const { addItem } = useCart();

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Left Sidebar - Menu Selection */}
      <div className="h-full overflow-hidden border-r border-border flex-shrink-0 bg-background">
        <MenuSelectionSidebar 
          onChangeStyle={(value) => {
            console.log("Change style to:", value);
          }} 
          style={tempStyle} 
        />
      </div>

      {/* Middle Panel - Dine In */}
      <div className="flex-[4] h-full overflow-hidden border-r border-border">
        <DineIn />
      </div>

      {/* Right Panel - Products */}
      <div className="flex-[8] h-full overflow-hidden">
        <Products onAddToOrder={addItem} tempStyle={tempStyle} />
      </div>
    </div>
  );
};

export default MenuSelectionPage;