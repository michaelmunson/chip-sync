import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import YardOutlinedIcon from "@mui/icons-material/YardOutlined";
import { Badge, Button, CssBaseline, IconButton } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../../css/controls.css";
import { User } from "../../types/dataTypes";
import { Coordinates, ModalConfig, SetUserData } from "../../types/generalTypes";
import { Geo } from "../../utils/location";
import { useNotificationSocket } from "../../utils/notificationFeed";
import Theme from "../../utils/theme";
import { DockItem, HeaderActions, unreadActivity } from "../arborist/arboristComponents/Controls";
import { RequestFormDraft } from "../requests/RequestForm";
import { RequestsProvider, useRequests } from "../requests/RequestsContext";
import Logo from "../utils/Logo";
import GardenerMap from "./GardenerMap";
import GardenerModal from "./GardenerModal";
import PlacementPanel from "./PlacementPanel";

/** Geographic center of the contiguous US, for gardeners without a known ZIP. */
const US_CENTER: Coordinates = { latitude: 39.83, longitude: -98.58 };
const HINT_KEY = "chipsync.gardenerHintDismissed";

interface Placement {
  position: Coordinates;
  requestId?: string;
  draft?: RequestFormDraft;
  /** Where to return if the gardener cancels a "Move pin" round trip. */
  origin?: { position: Coordinates; address: string };
}

function homeCenter(user: User): Coordinates {
  try {
    if (user.contact?.zip) return Geo.zipcodeToCoordinates(user.contact.zip);
  } catch {
    /* unknown ZIP */
  }
  return US_CENTER;
}

interface GardnerAppProps {
  userData: User;
  setUserData: SetUserData;
}

export default function GardnerApp({ userData, setUserData }: GardnerAppProps) {
  const [theme, setTheme] = useState<"light" | "dark">(Theme.decide());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [theme]);
  useNotificationSocket(setUserData);

  return (
    <ThemeProvider theme={Theme[theme]}>
      <CssBaseline />
      <RequestsProvider role="gardener" userData={userData} setUserData={setUserData}>
        <GardenerWorkspace userData={userData} setUserData={setUserData} theme={theme} setTheme={setTheme} />
      </RequestsProvider>
    </ThemeProvider>
  );
}

function GardenerWorkspace({
  userData,
  setUserData,
  theme,
  setTheme,
}: GardnerAppProps & { theme: "light" | "dark"; setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">> }) {
  const store = useRequests();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({ type: "request-list" });
  const [currentLocation, setCurrentLocation] = useState<Coordinates>();
  const [locating, setLocating] = useState(false);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [placementAddress, setPlacementAddress] = useState("");
  const [resolving, setResolving] = useState(false);
  const [focusKey, setFocusKey] = useState(0);
  const [hintDismissed, setHintDismissed] = useState(() => localStorage.getItem(HINT_KEY) === "1");
  const geocodeSeq = useRef(0);
  const center = useMemo(() => homeCenter(userData), [userData]);

  useEffect(() => {
    Geo.getCurrentLocation()
      .then(({ latitude, longitude }) => setCurrentLocation({ latitude, longitude }))
      .catch(() => {});
  }, []);

  const toggleModal = useCallback((isOpen: boolean, config?: ModalConfig) => {
    if (config) setModalConfig(config);
    setModalOpen(isOpen);
  }, []);

  const pendingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    store.offers.forEach((offer) => {
      if (offer.status === "pending") counts[offer.serviceRequestId] = (counts[offer.serviceRequestId] ?? 0) + 1;
    });
    return counts;
  }, [store.offers]);

  const openRequests = store.requests.filter((r) => r.status === "open" || r.status === "accepted");
  const pendingTotal = openRequests
    .filter((r) => r.status === "open")
    .reduce((sum, r) => sum + (pendingCounts[r.id] ?? 0), 0);
  const unreadChats = Object.keys(store.unreadByConversation).length;
  const unread = unreadActivity(userData);

  /* ---------- Pin placement ---------- */

  const resolveAddress = useCallback((position: Coordinates) => {
    const seq = ++geocodeSeq.current;
    setResolving(true);
    Geo.coordsToAddress(position)
      .then((address) => seq === geocodeSeq.current && setPlacementAddress(address))
      .catch(() => seq === geocodeSeq.current && setPlacementAddress(""))
      .finally(() => seq === geocodeSeq.current && setResolving(false));
  }, []);

  const movePlacement = useCallback(
    (position: Coordinates, knownAddress?: string) => {
      setPlacement((current) => (current ? { ...current, position } : current));
      if (knownAddress !== undefined) {
        geocodeSeq.current++;
        setResolving(false);
        setPlacementAddress(knownAddress);
      } else {
        resolveAddress(position);
      }
    },
    [resolveAddress],
  );

  function startPlacement(next: Placement, address?: string) {
    setModalOpen(false);
    setPlacement(next);
    setFocusKey((k) => k + 1);
    if (address !== undefined) setPlacementAddress(address);
    else resolveAddress(next.position);
  }

  const startNewRequest = () =>
    startPlacement({ position: currentLocation ?? center });

  function locateMe() {
    setLocating(true);
    Geo.getCurrentLocation()
      .then(({ latitude, longitude }) => {
        const position = { latitude, longitude };
        setCurrentLocation(position);
        movePlacement(position);
        setFocusKey((k) => k + 1);
      })
      .catch(() => {})
      .finally(() => setLocating(false));
  }

  function finishPlacement(cancelled: boolean) {
    if (!placement) return;
    const { requestId, draft, origin } = placement;
    setPlacement(null);
    if (cancelled && !origin) return;
    const target = cancelled && origin ? origin : { position: placement.position, address: placementAddress };
    toggleModal(true, {
      type: "request-form",
      data: { requestId, draft, position: target.position, address: target.address },
    });
  }

  const dismissHint = () => {
    localStorage.setItem(HINT_KEY, "1");
    setHintDismissed(true);
  };
  const open = (type: ModalConfig["type"]) => () => toggleModal(true, { type });
  const showHint = store.ready && !store.error && store.requests.length === 0 && !hintDismissed && !placement;

  return (
    <main className="workspace" aria-label="Your requests map">
      <GardenerMap
        theme={theme}
        center={center}
        currentLocation={currentLocation}
        requests={store.requests}
        pendingCounts={pendingCounts}
        onOpenRequest={(requestId) => toggleModal(true, { type: "request-details", data: { requestId } })}
        placement={placement?.position ?? null}
        onPlacementChange={(position) => movePlacement(position)}
        focusKey={focusKey}
      />

      {placement ? (
        <PlacementPanel
          position={placement.position}
          address={placementAddress}
          resolving={resolving}
          editing={Boolean(placement.requestId || placement.origin)}
          locating={locating}
          onSearch={(position, address) => {
            movePlacement(position, address);
            setFocusKey((k) => k + 1);
          }}
          onUseMyLocation={locateMe}
          onCancel={() => finishPlacement(true)}
          onContinue={() => finishPlacement(false)}
        />
      ) : (
        <>
          <header className="workspace-header">
            <Logo size="small" />
            <div className="workspace-header-text">
              <strong className="truncate">Hi, {userData.firstName}</strong>
              <span className="truncate">
                {openRequests.length === 0
                  ? "No active requests"
                  : `${openRequests.length} active ${openRequests.length === 1 ? "request" : "requests"}`}
                {pendingTotal > 0 && ` · ${pendingTotal} new ${pendingTotal === 1 ? "offer" : "offers"}`}
              </span>
            </div>
            <HeaderActions
              unread={unread}
              onActivity={open("notifications")}
              onSettings={open("settings")}
            />
          </header>

          {showHint && (
            <aside className="map-hint" aria-label="Getting started">
              <span className="tile tile--brand" aria-hidden="true">
                <YardOutlinedIcon />
              </span>
              <div>
                <strong>Get chips, logs, or tree work</strong>
                <p>Drop a pin where you need it. Local crews will see it and send you offers.</p>
                <Button size="small" variant="contained" onClick={startNewRequest}>
                  Request a service
                </Button>
              </div>
              <IconButton size="small" aria-label="Dismiss" onClick={dismissHint}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </aside>
          )}

          <nav className="workspace-dock" aria-label="Gardener tools">
            <DockItem
              icon={
                <Badge badgeContent={pendingTotal} color="error">
                  <AssignmentOutlined />
                </Badge>
              }
              label="Requests"
              ariaLabel={
                pendingTotal ? `Requests, ${pendingTotal} new ${pendingTotal === 1 ? "offer" : "offers"}` : "Requests"
              }
              onClick={open("request-list")}
            />
            <DockItem
              icon={
                <Badge badgeContent={unreadChats} color="error">
                  <ChatBubbleOutline />
                </Badge>
              }
              label="Messages"
              ariaLabel={unreadChats ? `Messages, ${unreadChats} unread` : "Messages"}
              onClick={open("messages")}
            />
            <DockItem
              primary
              icon={<AddLocationAltOutlined />}
              label="Request"
              ariaLabel="Request a service"
              onClick={startNewRequest}
            />
          </nav>
        </>
      )}

      <GardenerModal
        open={modalOpen}
        config={modalConfig}
        toggleModal={toggleModal}
        userData={userData}
        setUserData={setUserData}
        theme={theme}
        setTheme={setTheme}
        onNewRequest={startNewRequest}
        onMovePin={({ requestId, position, address, draft }) =>
          startPlacement({ position, requestId, draft, origin: { position, address } }, address)
        }
      />
    </main>
  );
}
