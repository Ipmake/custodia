import { useEffect } from "react";
import AddServer from "./popups/AddServer";
import AddService from "./popups/AddService";
import EditServer from "./popups/EditServer";
import EditService from "./popups/EditService";
import Settings from "./popups/Settings";
import Media from "./popups/Media";
import Password from "./popups/Password";

function Popup({
  popUpState,
  setPopUpState,
  popUpTarget,
  setPopUpTarget,
}: {
  popUpState: string;
  setPopUpState: React.Dispatch<React.SetStateAction<string>>;
  popUpTarget: string | null;
  setPopUpTarget: React.Dispatch<React.SetStateAction<string | null>>;
}): JSX.Element {
  useEffect(() => {
    if (popUpState === "none") {
      setPopUpTarget(null);
    }
  }, [popUpState, setPopUpTarget]);

  switch (popUpState) {
    case "none":
      return <></>;
    case "addServer":
      return <AddServer closePopUp={() => setPopUpState("none")} />;
    case "addService":
      return (
        <AddService
          closePopUp={() => setPopUpState("none")}
          popUpTarget={popUpTarget}
          setPopUpTarget={setPopUpTarget}
        />
      );
    case "editServer":
      return (
        <EditServer
          closePopUp={() => setPopUpState("none")}
          popUpTarget={popUpTarget}
          setPopUpTarget={setPopUpTarget}
        />
      );
    case "editService":
      return (
        <EditService
          closePopUp={() => setPopUpState("none")}
          popUpTarget={popUpTarget}
          setPopUpTarget={setPopUpTarget}
        />
      );
    case "settings":
      return <Settings closePopUp={() => setPopUpState("none")} />;
    case "media":
      return <Media closePopUp={() => setPopUpState("none")} />;
    case "password":
      return (
        <Password
          closePopUp={() => setPopUpState("none")}
          popUpTarget={popUpTarget}
          setPopUpTarget={setPopUpTarget}
        />
      );
    default:
      return <></>;
  }
}

export default Popup;
