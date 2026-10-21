import Carpenter from "@mui/icons-material/Carpenter";
import ContentCut from "@mui/icons-material/ContentCut";
import Forest from "@mui/icons-material/Forest";
import Grain from "@mui/icons-material/Grain";
import Handyman from "@mui/icons-material/Handyman";
import TripOrigin from "@mui/icons-material/TripOrigin";
import React from "react";
import { Offer, OfferStatus, RequestStatus, ServiceType } from "../../types/dataTypes";
import { isDelivery, SERVICE_SHORT, sortServices, STATUS_LABEL } from "../../utils/requestFormat";

const ICONS: Record<ServiceType, React.ComponentType<{ fontSize?: "small" | "inherit" }>> = {
  chips: Grain,
  logs: Forest,
  removal: Carpenter,
  trim: ContentCut,
  stump: TripOrigin,
  other: Handyman,
};

export function ServiceIcon({ service, fontSize }: { service: ServiceType; fontSize?: "small" | "inherit" }) {
  const Icon = ICONS[service];
  return <Icon fontSize={fontSize} />;
}

/** CSS tone for a service: chips green, logs amber, tree work blue. */
export const serviceTone = (service: ServiceType) =>
  service === "chips" ? "chips" : service === "logs" ? "wood" : "work";

function tileTone(services: ServiceType[]) {
  const sorted = sortServices(services);
  if (sorted.length === 0) return "work";
  if (sorted.every(isDelivery)) return sorted.length > 1 ? "both" : serviceTone(sorted[0]);
  return "work";
}

/** Square tile showing the main service of a request. */
export function ServiceTile({ services, large = false }: { services: ServiceType[]; large?: boolean }) {
  const primary = sortServices(services)[0] ?? "other";
  return (
    <span className={`tile tile--${tileTone(services)}${large ? " tile--lg" : ""}`} aria-hidden="true">
      <ServiceIcon service={primary} />
    </span>
  );
}

export function ServicePills({ services }: { services: ServiceType[] }) {
  return (
    <span className="pill-row">
      {sortServices(services).map((service) => (
        <span key={service} className={`pill pill--${serviceTone(service)}`}>
          {SERVICE_SHORT[service]}
        </span>
      ))}
    </span>
  );
}

const REQUEST_STATUS_TONE: Record<RequestStatus, string> = {
  open: "open",
  accepted: "brand",
  completed: "plain",
  cancelled: "danger",
};

export function RequestStatusPill({ status }: { status: RequestStatus }) {
  return <span className={`pill pill--${REQUEST_STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>;
}

const OFFER_STATUS: Record<OfferStatus, { label: string; tone: string }> = {
  pending: { label: "Awaiting reply", tone: "open" },
  accepted: { label: "Accepted", tone: "brand" },
  declined: { label: "Declined", tone: "danger" },
  withdrawn: { label: "Withdrawn", tone: "plain" },
  closed: { label: "Not selected", tone: "plain" },
};

export function OfferStatusPill({ offer, gardenerView = false }: { offer: Pick<Offer, "status">; gardenerView?: boolean }) {
  const { label, tone } = OFFER_STATUS[offer.status];
  const text = gardenerView && offer.status === "pending" ? "New" : gardenerView && offer.status === "closed" ? "Closed" : label;
  return <span className={`pill pill--${tone}`}>{text}</span>;
}
