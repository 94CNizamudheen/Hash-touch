export const PageContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="safe-area-wrapper flex flex-col min-h-screen bg-background">
    <div className="flex-1 overflow-y-auto pt-safe pb-safe">
      {children}
    </div>
  </div>
);