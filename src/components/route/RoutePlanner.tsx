import CheckIcon from "@mui/icons-material/Check";
import DirectionsOutlined from "@mui/icons-material/DirectionsOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import MyLocationOutlined from "@mui/icons-material/MyLocationOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import { Button } from "@mui/material";
import React, { useMemo, useState } from "react";
import { Marker, MaterialType, User } from "../../types/dataTypes";
import { Coordinates, ToggleModal } from "../../types/generalTypes";
import { Geo } from "../../utils/location";
import { isFacility } from "../../utils/markers";
import { planRoute, planRoutesByFacility } from "../../utils/route";
import ModalContent from "../arborist/arboristComponents/modalComponents/modalUtils/ModalContent";
import EmptyState from "../utils/EmptyState";
import { MaterialIcon } from "../utils/Material";

const MATERIAL_OPTIONS: Array<{ value: MaterialType; title: string }> = [
  { value: "chips", title: "Chips" },
  { value: "wood", title: "Logs" },
  { value: "both", title: "Both" },
];

const miles = (value: number) => `${value < 10 ? value.toFixed(1) : Math.round(value)} mi`;

export default function RoutePlanner({
  userData,
  toggleModal,
  currentLocation,
  onAddLocation,
}: {
  userData: User;
  toggleModal: ToggleModal;
  currentLocation: Coordinates;
  onAddLocation: (opts?: { lockedKind?: "facility" }) => void;
}) {
  const markers: Marker[] = userData.organization.markers;
  const facilities = useMemo(() => markers.filter(isFacility), [markers]);
  const [material, setMaterial] = useState<MaterialType | null>(null);
  const [facilityId, setFacilityId] = useState<string | null>(null);

  // Shortest overall trip for each facility; the first is the default selection.
  const options = useMemo(
    () =>
      material
        ? planRoutesByFacility({ from: currentLocation, markers, filter: material })
        : [],
    [material, currentLocation, markers],
  );
  const route = useMemo(() => {
    if (!material) return null;
    const chosen = facilities.find((f) => f.id === facilityId);
    if (chosen) return planRoute({ from: currentLocation, facility: chosen, markers, filter: material });
    return options[0] ?? null;
  }, [material, facilityId, facilities, options, currentLocation, markers]);
  const selectedFacilityId = facilityId ?? route?.facility.id ?? null;

  if (facilities.length === 0) {
    return (
      <ModalContent>
        <EmptyState
          icon={<HomeOutlined />}
          title="Add your HQ first"
          description="Routes end at one of your facilities. Add your HQ or depot to start planning."
          action={
            <Button
              variant="contained"
              onClick={() => {
                toggleModal(false);
                onAddLocation({ lockedKind: "facility" });
              }}
            >
              Add a facility
            </Button>
          }
        />
      </ModalContent>
    );
  }

  const appName = userData.mapChoice === "google" ? "Google Maps" : "Apple Maps";
  const routeHref = route
    ? Geo.getRouteURL({
        mapChoice: userData.mapChoice,
        stops: [route.dropSite, route.facility].map((m) => ({
          latitude: m.latitude,
          longitude: m.longitude,
        })),
      })
    : null;

  return (
    <ModalContent>
      <section className="form-section">
        <div className="form-section-head">
          <h3>What are you hauling?</h3>
          <span>Chips, logs, or both</span>
        </div>
        <div className="choice-grid choice-grid--3">
          {MATERIAL_OPTIONS.map(({ value, title }) => (
            <button
              type="button"
              key={value}
              className="choice"
              aria-pressed={material === value}
              onClick={() => setMaterial(value)}
            >
              <span className={`tile tile--${value}`} aria-hidden="true">
                <MaterialIcon type={value} />
              </span>
              <span>
                <strong>{title}</strong>
              </span>
              <span className="choice-check" aria-hidden="true">
                <CheckIcon />
              </span>
            </button>
          ))}
        </div>
      </section>

      {material && facilities.length > 1 && (
        <section className="form-section">
          <div className="form-section-head">
            <h3>Finish at</h3>
            <span>Pick which facility</span>
          </div>
          <div className="choice-grid">
            {facilities.map((facility) => {
              const option = options.find((o) => o.facility.id === facility.id);
              return (
                <button
                  type="button"
                  key={facility.id}
                  className="choice"
                  aria-pressed={selectedFacilityId === facility.id}
                  onClick={() => setFacilityId(facility.id)}
                >
                  <span className="tile" aria-hidden="true">
                    <HomeOutlined />
                  </span>
                  <span>
                    <strong>{facility.name}</strong>
                    <small>
                      {option ? `${miles(option.totalMiles)} total` : "No drop site"}
                      {option && option === options[0] ? " · shortest" : ""}
                    </small>
                  </span>
                  <span className="choice-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {material && !route && (
        <EmptyState
          icon={<PlaceOutlined />}
          title="No drop site found"
          description={
            material === "both"
              ? "None of your drop sites accept both chips and logs. Try one material at a time."
              : `None of your drop sites accept ${material === "wood" ? "logs" : "chips"}.`
          }
        />
      )}

      {route && (
        <>
          <div className="section-label">Shortest route</div>
          <div className="group routing-plan">
            <ol className="routing-stops">
              <li>
                <MyLocationOutlined fontSize="small" />
                <span>Your current location</span>
              </li>
              <li>
                <PlaceOutlined fontSize="small" />
                <span>
                  {route.dropSite.name}
                  <small>Drop site · {miles(route.toDropMiles)}</small>
                </span>
              </li>
              <li>
                <HomeOutlined fontSize="small" />
                <span>
                  {route.facility.name}
                  <small>Facility · {miles(route.toFacilityMiles)}</small>
                </span>
              </li>
            </ol>
            <p className="muted">About {miles(route.totalMiles)} in a straight line; {appName} finds the roads.</p>
            {routeHref && (
              <Button
                variant="contained"
                startIcon={<DirectionsOutlined />}
                href={routeHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in {appName}
              </Button>
            )}
          </div>
        </>
      )}
    </ModalContent>
  );
}
