
import { Button } from "@/ui/shadcn/components/ui/button";
import { useTranslation } from "react-i18next";
import { ImDrawer } from "react-icons/im";
import { MdOutlineDoneOutline } from "react-icons/md";
interface DrawerOpenedModalProps {
  isOpen: boolean;
  loading: boolean;
  onCompleteOrder: () => void;
}

export default function DrawerOpenedModal({
  isOpen,
  loading,
  onCompleteOrder,
}: DrawerOpenedModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-xl rounded-lg bg-white p-6 shadow-lg mx-4">
        {/* Icon */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md">
            <div className="w-14 h-14 rounded-full border-4 border-blue-600 flex items-center justify-center">
              {/* <Banknote className="w-7 h-7 text-blue-600" /> */}
              <ImDrawer className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-black font-medium text-2xl">
            {t("Drawer Opened")}
          </p>

        </div>

        {/* Action */}
        <div className="mt-8 w-full">
          <Button
            onClick={onCompleteOrder}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-3 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("Processing")}
              </>
            ) : (
              <>
                <MdOutlineDoneOutline className="w-5 h-5" />
                {t("Complete Order")}
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          {t("Ensure payment collected")}
        </p>
      </div>
    </div>
  );
}
