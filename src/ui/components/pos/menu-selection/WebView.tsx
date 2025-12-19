import { type ReactNode } from "react";

const WebView = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="w-full h-full overflow-hidden">
      {children}
    </div>
  );
};

export default WebView;