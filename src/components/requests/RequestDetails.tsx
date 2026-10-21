import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DirectionsOutlinedIcon from "@mui/icons-material/DirectionsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { Alert, Button, CircularProgress, Skeleton, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { Offer, ServiceRequest, User } from "../../types/dataTypes";
import { Coordinates, ModalConfig, ToggleModal } from "../../types/generalTypes";
import { formatDistance, formatPhone, timeAgo } from "../../utils/format";
import { Geo } from "../../utils/location";
import { capitalize, describeOffer, formatTiming, possessive, offerPrice, requestSummary } from "../../utils/requestFormat";
import { RequestsAPI } from "../../utils/serviceRequests";
import ModalButtons from "../arborist/arboristComponents/modalComponents/modalUtils/ModalButtons";
import ModalContent from "../arborist/arboristComponents/modalComponents/modalUtils/ModalContent";
import ConfirmDialog from "../utils/ConfirmDialog";
import EmptyState from "../utils/EmptyState";
import PhotoGallery from "../utils/PhotoGallery";
import OfferCard from "./OfferCard";
import { useRequests } from "./RequestsContext";
import { RequestStatusPill, ServicePills, ServiceTile } from "./ServiceVisuals";

interface RequestDetailsProps {
  requestId: string;
  userData: User;
  toggleModal: ToggleModal;
  currentLocation?: Coordinates;
  /** Where this screen's back button goes; kept when sub-screens return here. */
  back?: ModalConfig;
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="info-row">
      {icon}
      <div className="info-row-body">
        <div className="info-row-label">{label}</div>
        <div className="info-row-value">{children}</div>
      </div>
    </div>
  );
}

const OFFER_ORDER: Record<Offer["status"], number> = { accepted: 0, pending: 1, declined: 2, withdrawn: 3, closed: 4 };

/** "Jordan Lee" -> "Jordan L." until the request is booked with your crew. */
const privateName = (name: string) => {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.pop();
  return last ? `${first} ${last.charAt(0)}.` : first;
};

export default function RequestDetails({ requestId, userData, toggleModal, currentLocation, back }: RequestDetailsProps) {
  const store = useRequests();
  const stored = store.findRequest(requestId);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!stored) {
      store
        .fetchRequest(requestId)
        .then((request) => !request && setMissing(true))
        .catch(() => setMissing(true));
    }
    store.loadOffersFor(requestId).catch(() => {});
    store.markRequestSeen(requestId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  if (!stored) {
    return (
      <ModalContent>
        {missing ? (
          <EmptyState
            icon={<SearchOffOutlinedIcon />}
            title="Request unavailable"
            description="This request was removed or is no longer visible to you."
          />
        ) : (
          <div className="detail-loading" role="status" aria-label="Loading request">
            <Skeleton variant="rounded" height={64} />
            <Skeleton variant="rounded" height={160} />
          </div>
        )}
      </ModalContent>
    );
  }

  const self: ModalConfig = { type: "request-details", data: { requestId }, back };
  return store.role === "gardener" ? (
    <GardenerRequestView request={stored} userData={userData} toggleModal={toggleModal} self={self} />
  ) : (
    <CrewRequestView
      request={stored}
      userData={userData}
      toggleModal={toggleModal}
      currentLocation={currentLocation}
      self={self}
    />
  );
}

function RequestOverview({
  request,
  meta,
  requester,
}: {
  request: ServiceRequest;
  meta?: string;
  requester?: React.ReactNode;
}) {
  return (
    <>
      <div className="detail-hero">
        <ServiceTile services={request.services} large />
        <div>
          <h3>{requestSummary(request)}</h3>
          <div className="detail-hero-meta">
            <RequestStatusPill status={request.status} />
            <span>
              Posted {timeAgo(request.createdAt).toLowerCase()}
              {meta ? ` · ${meta}` : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="group">
        <InfoRow icon={<LocalOfferOutlinedIcon />} label="Services">
          <ServicePills services={request.services} />
        </InfoRow>
        <InfoRow icon={<PlaceOutlinedIcon />} label="Address">
          {request.address}
        </InfoRow>
        <InfoRow icon={<EventOutlinedIcon />} label="When">
          {formatTiming(request)}
        </InfoRow>
        {requester && (
          <InfoRow icon={<PersonOutlineIcon />} label="Requested by">
            {requester}
          </InfoRow>
        )}
        {request.description && (
          <InfoRow icon={<NotesOutlinedIcon />} label="Notes">
            <span className="pre-wrap">{request.description}</span>
          </InfoRow>
        )}
      </div>

      <PhotoGallery keys={request.images} label={requestSummary(request)} />
    </>
  );
}

/* ========================================================================== */
/* Gardener: review offers, accept / decline, manage the request              */
/* ========================================================================== */

function GardenerRequestView({
  request,
  userData,
  toggleModal,
  self,
}: {
  request: ServiceRequest;
  userData: User;
  toggleModal: ToggleModal;
  self: ModalConfig;
}) {
  const store = useRequests();
  const offers = useMemo(
    () =>
      [...store.offersFor(request.id)].sort(
        (a, b) => OFFER_ORDER[a.status] - OFFER_ORDER[b.status] || b.createdAt.localeCompare(a.createdAt),
      ),
    [store, request.id],
  );
  const conversation = store.conversationFor(request.id);
  const [accepting, setAccepting] = useState<Offer>();
  const [decliningId, setDecliningId] = useState<string>();
  const [declineNote, setDeclineNote] = useState("");
  const [confirm, setConfirm] = useState<"cancel" | "complete">();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showEarlier, setShowEarlier] = useState(false);

  const openChat = (conversationId: string) =>
    toggleModal(true, { type: "chat", data: { conversationId }, back: self });

  const active = offers.filter((o) => o.status === "pending" || o.status === "accepted");
  const earlier = offers.filter((o) => o.status !== "pending" && o.status !== "accepted");

  async function accept(offer: Offer) {
    setBusy(true);
    setError("");
    try {
      const result = await RequestsAPI.acceptOffer(userData, request, offer, offers);
      store.upsertRequest(result.request);
      store.upsertOffers(result.offers);
      store.upsertConversation(result.conversation);
      setAccepting(undefined);
      openChat(result.conversation.id);
    } catch (err) {
      console.error(err);
      setAccepting(undefined);
      setError("We couldn’t accept that offer. It may have just been withdrawn — refresh and try again.");
      store.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function decline(offer: Offer) {
    setBusy(true);
    setError("");
    try {
      store.upsertOffers([await RequestsAPI.declineOffer(request, offer, declineNote)]);
      setDecliningId(undefined);
      setDeclineNote("");
    } catch {
      setError(`We couldn’t decline ${possessive(offer.organizationName)} offer. Please try again.`);
      store.loadOffersFor(request.id).catch(() => {});
    } finally {
      setBusy(false);
    }
  }

  async function runConfirm() {
    if (!confirm) return;
    setBusy(true);
    setError("");
    try {
      const updated =
        confirm === "cancel" ? await RequestsAPI.cancel(request, offers) : await RequestsAPI.complete(request);
      store.upsertRequest(updated);
      if (confirm === "cancel") {
        store.upsertOffers(offers.filter((o) => o.status === "pending").map((o) => ({ ...o, status: "closed" })));
      }
      setConfirm(undefined);
    } catch {
      setConfirm(undefined);
      setError(confirm === "cancel" ? "We couldn’t cancel this request." : "We couldn’t mark this job complete.");
    } finally {
      setBusy(false);
    }
  }

  const renderOffer = (offer: Offer) => (
    <OfferCard key={offer.id} offer={offer} gardenerView highlight={offer.status === "accepted"}>
      {offer.status === "pending" && request.status === "open" && decliningId !== offer.id && (
        <>
          <Button variant="outlined" color="error" onClick={() => setDecliningId(offer.id)} disabled={busy}>
            Decline
          </Button>
          <Button variant="contained" onClick={() => setAccepting(offer)} disabled={busy}>
            Accept
          </Button>
        </>
      )}
      {decliningId === offer.id && (
        <div className="decline-box">
          <TextField
            size="small"
            fullWidth
            multiline
            maxRows={4}
            label="Reason (optional)"
            placeholder="e.g. Price is above my budget"
            value={declineNote}
            onChange={(event) => setDeclineNote(event.target.value)}
            helperText={`${offer.organizationName} can send you a new offer.`}
          />
          <div className="decline-actions">
            <Button
              variant="outlined"
              onClick={() => {
                setDecliningId(undefined);
                setDeclineNote("");
              }}
              disabled={busy}
            >
              Keep offer
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => decline(offer)}
              disabled={busy}
              startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              Decline offer
            </Button>
          </div>
        </div>
      )}
      {offer.status === "accepted" && conversation && (
        <Button variant="contained" startIcon={<ChatBubbleOutlineIcon />} onClick={() => openChat(conversation.id)}>
          Message {offer.organizationName}
        </Button>
      )}
    </OfferCard>
  );

  const footer = () => {
    if (request.status === "open") {
      return (
        <ModalButtons split>
          <Button color="error" onClick={() => setConfirm("cancel")} disabled={busy}>
            Cancel request
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => toggleModal(true, { type: "request-form", data: { requestId: request.id } })}
            disabled={busy}
          >
            Edit
          </Button>
        </ModalButtons>
      );
    }
    if (request.status === "accepted") {
      return (
        <ModalButtons split>
          <Button color="error" onClick={() => setConfirm("cancel")} disabled={busy}>
            Cancel job
          </Button>
          <Button variant="contained" startIcon={<TaskAltIcon />} onClick={() => setConfirm("complete")} disabled={busy}>
            Mark complete
          </Button>
        </ModalButtons>
      );
    }
    return null;
  };

  const acceptedOffer = offers.find((o) => o.status === "accepted");

  return (
    <>
      <ModalContent>
        <RequestOverview request={request} />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <div className="section-label section-label--row">
          <span>Offers</span>
          {active.length > 0 && <span className="tab-count">{active.length}</span>}
        </div>

        {request.status === "open" && active.length === 0 && (
          <div className="callout">
            <strong>Waiting for offers</strong>
            <p>
              Crews near you can see your pin and have been notified. You’ll get a notification as soon as an offer
              comes in.
            </p>
          </div>
        )}
        {request.status === "accepted" && acceptedOffer && (
          <div className="callout callout--brand">
            <strong>Booked with {acceptedOffer.organizationName}</strong>
            <p>
              {capitalize(describeOffer(acceptedOffer))}. Your pin is hidden from other crews. Use the chat to plan the visit, then
              mark the job complete when it’s done.
            </p>
          </div>
        )}
        {(request.status === "completed" || request.status === "cancelled") && (
          <div className="callout">
            <strong>{request.status === "completed" ? "Job complete" : "Request cancelled"}</strong>
            <p>
              {request.status === "completed"
                ? "Thanks for using Chip Sync. Your chat history stays available in Messages."
                : "Crews can no longer see this request."}
            </p>
          </div>
        )}

        <div className="offer-list">{active.map(renderOffer)}</div>

        {earlier.length > 0 && (
          <>
            <Button size="small" className="earlier-toggle" onClick={() => setShowEarlier((v) => !v)}>
              {showEarlier ? "Hide" : "Show"} {earlier.length} earlier {earlier.length === 1 ? "offer" : "offers"}
            </Button>
            {showEarlier && <div className="offer-list">{earlier.map(renderOffer)}</div>}
          </>
        )}
      </ModalContent>

      {footer()}

      <ConfirmDialog
        open={Boolean(accepting)}
        title={accepting ? `Accept ${possessive(accepting.organizationName)} offer?` : ""}
        confirmLabel="Accept offer"
        busy={busy}
        onCancel={() => setAccepting(undefined)}
        onConfirm={() => accepting && accept(accepting)}
      >
        {accepting && (
          <>
            <p className="confirm-lead">{capitalize(describeOffer(accepting))}</p>
            <p>
              We’ll open a chat with {accepting.organizationName} so you can plan the visit.{" "}
              {active.length > 1 ? "Your other offers will be closed, and your" : "Your"} pin will be hidden from
              other crews.
            </p>
          </>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm === "complete" ? "Mark this job complete?" : request.status === "accepted" ? "Cancel this job?" : "Cancel this request?"}
        confirmLabel={confirm === "complete" ? "Mark complete" : "Cancel request"}
        tone={confirm === "complete" ? "primary" : "error"}
        busy={busy}
        onCancel={() => setConfirm(undefined)}
        onConfirm={runConfirm}
      >
        <p>
          {confirm === "complete"
            ? "Let the crew know the work is done. You can still read the chat afterwards."
            : request.status === "accepted"
              ? "The crew you booked will be notified. This can’t be undone — you’d need to post a new request."
              : "Your pin will be removed from the map and any pending offers will be closed."}
        </p>
      </ConfirmDialog>
    </>
  );
}

/* ========================================================================== */
/* Crew: review the request and make / manage an offer                         */
/* ========================================================================== */

function CrewRequestView({
  request,
  userData,
  toggleModal,
  currentLocation,
  self,
}: {
  request: ServiceRequest;
  userData: User;
  toggleModal: ToggleModal;
  currentLocation?: Coordinates;
  self: ModalConfig;
}) {
  const store = useRequests();
  const offers = store.offersFor(request.id);
  const latest = offers[0];
  const isAdmin = userData.role === "admin";
  const bookedWithUs = request.acceptedOrganizationId === userData.organization.id;
  const conversation = store.conversationFor(request.id);
  const [withdrawing, setWithdrawing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const distance = currentLocation ? formatDistance(Geo.distance(request, currentLocation)) : "";
  const directionsUrl = Geo.getAddressURL({ mapChoice: userData.mapChoice, address: request.address });
  const openOfferForm = (offer?: Offer, editing = false) =>
    toggleModal(true, {
      type: "offer-form",
      data: { requestId: request.id, offerId: offer?.id, editing },
      back: self,
    });

  async function withdraw() {
    if (!latest) return;
    setBusy(true);
    setError("");
    try {
      store.upsertOffers([await RequestsAPI.withdrawOffer(request, latest)]);
      setWithdrawing(false);
    } catch {
      setWithdrawing(false);
      setError("We couldn’t withdraw the offer. It may have just been answered.");
      store.loadOffersFor(request.id).catch(() => {});
    } finally {
      setBusy(false);
    }
  }

  const requester = bookedWithUs ? (
    <>
      <div>{request.requesterName}</div>
      {request.contact?.phone && <a href={`tel:${request.contact.phone}`}>{formatPhone(request.contact.phone)}</a>}
    </>
  ) : (
    <>
      {privateName(request.requesterName)}
      <div className="info-row-hint">Contact details are shared once your offer is accepted.</div>
    </>
  );

  let status: React.ReactNode = null;
  let primary: React.ReactNode = null;
  if (bookedWithUs) {
    status =
      request.status === "accepted" ? (
        <div className="callout callout--brand">
          <strong>Booked with your crew</strong>
          <p>The gardener accepted your offer. Coordinate the visit in the chat.</p>
        </div>
      ) : (
        <div className="callout">
          <strong>{request.status === "completed" ? "Job complete" : "Job cancelled by the gardener"}</strong>
          <p>The chat history is still available in Messages.</p>
        </div>
      );
    if (conversation) {
      primary = (
        <Button
          variant="contained"
          startIcon={<ChatBubbleOutlineIcon />}
          onClick={() => toggleModal(true, { type: "chat", data: { conversationId: conversation.id }, back: self })}
        >
          Open chat
        </Button>
      );
    }
  } else if (request.status !== "open") {
    status = (
      <div className="callout">
        <strong>No longer available</strong>
        <p>
          {request.status === "accepted"
            ? "The gardener booked another crew for this request."
            : "The gardener closed this request."}
        </p>
      </div>
    );
  } else if (!latest || latest.status !== "pending") {
    const resubmit = latest && ["declined", "withdrawn"].includes(latest.status);
    if (isAdmin) {
      primary = (
        <Button variant="contained" startIcon={<LocalOfferOutlinedIcon />} onClick={() => openOfferForm(resubmit ? latest : undefined)}>
          {resubmit ? "Send a new offer" : "Make an offer"}
        </Button>
      );
    }
    if (latest?.status === "declined") {
      status = (
        <div className="callout callout--warn">
          <strong>Your offer was declined</strong>
          <p>{isAdmin ? "You can send a revised offer while the request is open." : "An admin can send a revised offer."}</p>
        </div>
      );
    } else if (!isAdmin) {
      status = (
        <div className="callout">
          <strong>Only admins can send offers</strong>
          <p>Ask an admin on your crew to price this job.</p>
        </div>
      );
    }
  } else if (isAdmin) {
    primary = (
      <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={() => openOfferForm(latest, true)}>
        Edit offer
      </Button>
    );
  }

  return (
    <>
      <ModalContent>
        <RequestOverview request={request} meta={distance ? `${distance} away` : undefined} requester={requester} />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <div className="section-label">Your offer</div>
        {status}
        {latest ? (
          <div className="offer-list">
            <OfferCard offer={latest} gardenerView={false} highlight={latest.status === "accepted"}>
              {latest.status === "pending" && isAdmin && !withdrawing && (
                <Button color="error" onClick={() => setWithdrawing(true)} disabled={busy}>
                  Withdraw
                </Button>
              )}
              {withdrawing && (
                <div className="inline-confirm" role="alertdialog" aria-label="Withdraw this offer?">
                  <p>Withdraw this offer?</p>
                  <Button size="small" variant="outlined" onClick={() => setWithdrawing(false)} disabled={busy}>
                    Keep
                  </Button>
                  <Button size="small" variant="contained" color="error" onClick={withdraw} disabled={busy}>
                    Withdraw
                  </Button>
                </div>
              )}
            </OfferCard>
            {offers.length > 1 && (
              <>
                <Button size="small" className="earlier-toggle" onClick={() => setShowHistory((v) => !v)}>
                  {showHistory ? "Hide" : "Show"} {offers.length - 1} earlier{" "}
                  {offers.length - 1 === 1 ? "offer" : "offers"}
                </Button>
                {showHistory &&
                  offers.slice(1).map((offer) => <OfferCard key={offer.id} offer={offer} gardenerView={false} />)}
              </>
            )}
          </div>
        ) : (
          !status && (
            <p className="muted">
              No offer yet. Quote a price, offer it free, or choose “Not sure yet” if you need to see the site first.
            </p>
          )
        )}
        {latest?.status === "pending" && (
          <p className="muted offer-waiting">
            Waiting for {privateName(request.requesterName)} to respond. You’ll be notified either way.
          </p>
        )}
      </ModalContent>

      <ModalButtons>
        <Button
          variant="outlined"
          component="a"
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          startIcon={<DirectionsOutlinedIcon />}
        >
          Directions
        </Button>
        {primary}
      </ModalButtons>
    </>
  );
}
