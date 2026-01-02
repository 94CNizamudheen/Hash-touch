import { createContext, useContext, useState, type ReactNode } from "react";

interface TempStyleContextType {
  tempStyle: boolean;
  setTempStyle: (value: boolean) => void;
}

const TempStyleContext = createContext<TempStyleContextType | undefined>(undefined);

export function TempStyleProvider({ children }: { children: ReactNode }) {
  const [tempStyle, setTempStyle] = useState(true);

  return (
    <TempStyleContext.Provider value={{ tempStyle, setTempStyle }}>
      {children}
    </TempStyleContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTempStyle() {
  const context = useContext(TempStyleContext);
  if (context === undefined) {
    throw new Error("useTempStyle must be used within a TempStyleProvider");
  }
  return context;
}
