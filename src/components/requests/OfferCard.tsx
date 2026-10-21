import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import React from "react";
import { Offer } from "../../types/dataTypes";
import { nameInitials, timeAgo } from "../../utils/format";
import { formatDate, offerPrice, offerQuantities } from "../../utils/requestFormat";
import { OfferStatusPill } from "./ServiceVisuals";

/** One crew's offer. `gardenerView` phrases things for the person receiving it. */
export default function OfferCard({
  offer,
  gardenerView,
  highlight = false,
  children,
}: {
  offer: Offer;
  gardenerView: boolean;
  highlight?: boolean;
  /** Action row (accept/decline, edit/withdraw…). */
  children?: React.ReactNode;
}) {
  const quantities = offerQuantities(offer);
  const muted = ["declined", "withdrawn", "closed"].includes(offer.status);

  return (
    <article
      className={`offer-card${highlight ? " offer-card--highlight" : ""}${muted ? " offer-card--muted" : ""}`}
      aria-label={`Offer from ${offer.organizationName}`}
    >
      <header className="offer-card-head">
        <span className="avatar">{nameInitials(offer.organizationName)}</span>
        <div className="card-body">
          <span className="card-title truncate">{gardenerView ? offer.organizationName : "Your crew’s offer"}</span>
          <span className="card-sub">
            {gardenerView ? "" : `${offer.createdByName ?? "Sent"} · `}
            {timeAgo(offer.createdAt)}
          </span>
        </div>
        <OfferStatusPill offer={offer} gardenerView={gardenerView} />
      </header>

      <div className="offer-price">
        <strong>{offerPrice(offer)}</strong>
        {offer.pricing === "unknown" && <span>Price confirmed after a site visit</span>}
        {offer.pricing === "free" && <span>No charge</span>}
      </div>

      {(quantities.length > 0 || offer.availableDate) && (
        <ul className="offer-facts">
          {quantities.map((q) => (
            <li key={q}>{q}</li>
          ))}
          {offer.availableDate && (
            <li>
              <EventAvailableOutlinedIcon fontSize="inherit" /> Available {formatDate(offer.availableDate)}
            </li>
          )}
        </ul>
      )}

      {offer.message && <p className="offer-message">{offer.message}</p>}

      {offer.status === "declined" && offer.responseNote && (
        <p className="offer-note">
          <span>{gardenerView ? "Your note" : "Gardener’s note"}</span>
          {offer.responseNote}
        </p>
      )}

      {children && <div className="offer-actions">{children}</div>}
    </article>
  );
}
