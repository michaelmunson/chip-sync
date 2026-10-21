import { Loader } from "@googlemaps/js-api-loader";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import { CircularProgress } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import "../../css/map.css";
import { ServiceRequest } from "../../types/dataTypes";
import { Coordinates } from "../../types/generalTypes";
import { darkStyle, getMapOptions, lightStyle } from "../../utils/map";
import { buildRequestPin } from "../../utils/requestPins";
import { requestSummary } from "../../utils/requestFormat";
import { getGoogleMapsApiKey } from "../../utils/secrets";

interface GardenerMapProps {
  theme: "light" | "dark";
  center: Coordinates;
  currentLocation?: Coordinates;
  requests: ServiceRequest[];
  pendingCounts: Record<string, number>;
  onOpenRequest: (requestId: string) => void;
  /** Pin being placed for a new/edited request; null when not placing. */
  placement: Coordinates | null;
  onPlacementChange: (position: Coordinates) => void;
  /** Bumped whenever the map should pan to `placement` (e.g. after an address search). */
  focusKey: number;
}

const toLatLng = ({ latitude, longitude }: Coordinates) => ({ lat: latitude, lng: longitude });

export default function GardenerMap({
  theme,
  center,
  currentLocation,
  requests,
  pendingCounts,
  onOpenRequest,
  placement,
  onPlacementChange,
  focusKey,
}: GardenerMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const [loader, setLoader] = useState<Loader>();
  const [map, setMap] = useState<any>();
  const [loadError, setLoadError] = useState(false);
  const requestMarkers = useRef<any[]>([]);
  const draftMarker = useRef<any>();
  const meMarker = useRef<any>();
  const placing = useRef(false);
  const onPlace = useRef(onPlacementChange);
  placing.current = placement !== null;
  onPlace.current = onPlacementChange;

  useEffect(() => {
    try {
      setLoader(new Loader({ apiKey: getGoogleMapsApiKey(), version: "weekly" }));
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    if (!loader || map || !container.current) return;
    (async () => {
      const { Map, StyledMapType } = await loader.importLibrary("maps");
      const instance = new Map(container.current, getMapOptions(center));
      instance.mapTypes.set("styled_map", new StyledMapType(theme === "dark" ? darkStyle : lightStyle));
      instance.setMapTypeId("styled_map");
      instance.addListener("click", (event: any) => {
        if (!placing.current || !event.latLng) return;
        onPlace.current({ latitude: event.latLng.lat(), longitude: event.latLng.lng() });
      });
      setMap(instance);
    })().catch(() => setLoadError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader]);

  useEffect(() => {
    if (!loader || !map) return;
    loader.importLibrary("maps").then(({ StyledMapType }) => {
      map.mapTypes.set("styled_map", new StyledMapType(theme === "dark" ? darkStyle : lightStyle));
      map.setMapTypeId("styled_map");
    });
  }, [theme, loader, map]);

  // The gardener's own active requests.
  useEffect(() => {
    if (!loader || !map) return;
    let cancelled = false;
    loader.importLibrary("marker").then(({ AdvancedMarkerElement }) => {
      if (cancelled) return;
      requestMarkers.current.forEach((marker) => (marker.map = null));
      requestMarkers.current = requests
        .filter((r) => r.status === "open" || r.status === "accepted")
        .map((request) => {
          const marker = new AdvancedMarkerElement({
            map,
            position: { lat: request.latitude, lng: request.longitude },
            title: requestSummary(request),
            content: buildRequestPin({
              services: request.services,
              tone: request.status === "accepted" ? "booked" : "open",
              badge: request.status === "open" ? pendingCounts[request.id] ?? 0 : 0,
            }),
          });
          marker.addListener("click", () => {
            if (!placing.current) onOpenRequest(request.id);
          });
          return marker;
        });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader, map, requests, pendingCounts]);

  // Draft pin while placing; draggable, and moves wherever the map is tapped.
  useEffect(() => {
    if (!loader || !map) return;
    if (!placement) {
      if (draftMarker.current) draftMarker.current.map = null;
      draftMarker.current = undefined;
      return;
    }
    loader.importLibrary("marker").then(({ AdvancedMarkerElement }) => {
      if (!draftMarker.current) {
        const marker = new AdvancedMarkerElement({
          map,
          position: toLatLng(placement),
          gmpDraggable: true,
          title: "Drag to the exact spot",
          content: buildRequestPin({ services: ["other"], tone: "draft", label: "Your request" }),
          zIndex: 100,
        });
        marker.addListener("dragend", () => {
          const position = marker.position;
          const lat = typeof position.lat === "function" ? position.lat() : position.lat;
          const lng = typeof position.lng === "function" ? position.lng() : position.lng;
          onPlace.current({ latitude: lat, longitude: lng });
        });
        draftMarker.current = marker;
      } else {
        draftMarker.current.position = toLatLng(placement);
      }
    });
  }, [loader, map, placement]);

  const isPlacing = placement !== null;
  useEffect(() => {
    map?.setOptions({ draggableCursor: isPlacing ? "crosshair" : null });
  }, [map, isPlacing]);

  useEffect(() => {
    if (!map || !placement) return;
    map.panTo(toLatLng(placement));
    if (map.getZoom() < 16) map.setZoom(17);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, focusKey]);

  useEffect(() => {
    if (!loader || !map || !currentLocation) return;
    loader.importLibrary("marker").then(({ AdvancedMarkerElement }) => {
      if (meMarker.current) {
        meMarker.current.position = toLatLng(currentLocation);
        return;
      }
      const dot = document.createElement("div");
      dot.className = "me-dot";
      meMarker.current = new AdvancedMarkerElement({ map, position: toLatLng(currentLocation), content: dot, title: "You" });
    });
  }, [loader, map, currentLocation]);

  return (
    <div ref={container} className="map">
      <div className="map-spinner-container">
        {loadError ? (
          <div className="map-status" role="alert">
            <span className="tile tile--brand" aria-hidden="true">
              <MapOutlinedIcon />
            </span>
            <h2>Map unavailable</h2>
            <p>Check your connection and reload. You can still see your requests and messages below.</p>
          </div>
        ) : (
          <div className="map-status" role="status">
            <CircularProgress size={30} thickness={4} />
            <p>Loading your map…</p>
          </div>
        )}
      </div>
    </div>
  );
}
