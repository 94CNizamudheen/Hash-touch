import { Outlet } from "react-router-dom";
import MenuSelectionLayout from "./MenuSelectionLayout";

const MenuLayout = () => {
  return (
    <main className="absolute inset-0 safe-area " >
      <MenuSelectionLayout>
        <Outlet />
      </MenuSelectionLayout>
    </main>
  );
};

export default MenuLayout;
