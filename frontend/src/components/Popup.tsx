import { useEffect } from "react";
import AddServer from "./popups/AddServer";
import AddService from "./popups/AddService";

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
    default:
      return <></>;
  }
}

export default Popup;
