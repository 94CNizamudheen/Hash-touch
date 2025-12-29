import { Outlet } from "react-router-dom";
import MenuSelectionLayout from "./MenuSelectionLayout";

const MenuLayout = () => {
  return (
    <main className="absolute inset-0 z-40 bg-black/40 backdrop-blur-md">
      <MenuSelectionLayout>
        <Outlet />
      </MenuSelectionLayout>
    </main>
  );
};

export default MenuLayout;
