import { Outlet } from "react-router-dom";
import MenuSelectionLayout from "./MenuSelectionLayout";

const MenuLayout = () => {
  return (
    <main className="w-full h-screen overflow-hidden bg-background text-foreground">
      <MenuSelectionLayout>
        <Outlet />
      </MenuSelectionLayout>
    </main>
  );
};

export default MenuLayout;
