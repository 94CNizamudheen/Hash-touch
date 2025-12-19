import type { ReactNode } from "react";


type IconWithActionProps = {
  icon: ReactNode;
  onClick?: () => void;
};


const IconWithAction = ({ icon, onClick }: IconWithActionProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-background border rounded-lg p-3 min-h-12 flex items-center justify-center hover:bg-primary-hover   "
    >
      {icon}
    </button>
  );
};

export default IconWithAction;
