import { useTheme } from "@/ui/context/theme/useTheme"; 
import Logo from "../../../assets/logo_2.png";
import LogoDark from "../../../assets/logo_dark_2.png";

const SplashScreen = ({ type = 1 }: { type?: number }) => {
  const { theme } = useTheme();
  // const deviceName = localStorage.getItem("device-name");

  switch (type) {
    case 1:
      return (
        <div className="min-h-screen flex relative items-center justify-center max-w-md mx-auto">
          {theme === "light" ? (
            <img
              src={Logo}
              alt="Logo"
              width={300}
              height={50}
              className="h-auto animate-pulse"
            />
          ) : (
            <img
              src={LogoDark}
              alt="Logo"
              width={300}
              height={50}
              className="h-auto animate-pulse"
            />
          )}
        </div>
      );

    case 2:
      return (
        <div className="min-h-screen flex relative items-center justify-center text-center flex-col gap-10">
          {theme === "light" ? (
            <img
              src={Logo}
              alt="Logo"
              width={300}
              height={50}
              className="h-auto animate-pulse"
            />
          ) : (
            <img
              src={LogoDark}
              alt="Logo"
              width={300}
              height={50}
              className="h-auto animate-pulse"
            />
          )}
          {/* <h1 className="text-xl font-normal text-black animate-pulse">
            License registration successful. Device is registered with name{" "}
            <span className="font-semibold">{deviceName}</span>. Waiting for
            tenant administrator's approval
          </h1> */}
        </div>
      );
    default:
      break;
  }
};

export default SplashScreen;
