import { type Notification } from "@/types/common";
import NotificationItem from "./Notification";

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: number) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-3 pointer-events-none">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
