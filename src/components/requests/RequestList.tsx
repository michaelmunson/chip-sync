import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { Alert, Button, InputAdornment, Skeleton, Tab, Tabs, TextField } from "@mui/material";
import React, { useMemo, useState } from "react";
import { Offer, ServiceRequest, User } from "../../types/dataTypes";
import { Coordinates, ToggleModal } from "../../types/generalTypes";
import { formatDistance, timeAgo } from "../../utils/format";
import { Geo } from "../../utils/location";
import { offerPrice, requestSummary, SERVICE_LABEL, shortAddress } from "../../utils/requestFormat";
import ModalContent from "../arborist/arboristComponents/modalComponents/modalUtils/ModalContent";
import EmptyState from "../utils/EmptyState";
import { useRequests } from "./RequestsContext";
import { OfferStatusPill, RequestStatusPill, ServiceTile } from "./ServiceVisuals";

function ListSkeleton() {
  return (
    <ul className="card-list" aria-busy="true" aria-label="Loading requests">
      {[0, 1, 2].map((i) => (
        <li key={i}>
          <Skeleton variant="rounded" height={76} />
        </li>
      ))}
    </ul>
  );
}

function RequestCard({
  request,
  meta,
  aside,
  onOpen,
}: {
  request: ServiceRequest;
  meta: React.ReactNode;
  aside?: React.ReactNode;
  onOpen: () => void;
}) {
  return (
    <li className="card">
      <button type="button" className="card-main" onClick={onOpen}>
        <ServiceTile services={request.services} />
        <span className="card-body">
          <span className="card-title truncate">{requestSummary(request)}</span>
          <span className="card-sub truncate">{meta}</span>
          {aside && <span className="pill-row">{aside}</span>}
        </span>
      </button>
    </li>
  );
}

const openDetails = (toggleModal: ToggleModal, request: ServiceRequest, back: "request-list") =>
  toggleModal(true, { type: "request-details", data: { requestId: request.id }, back: { type: back } });

/* ---------- Gardener ---------- */

export function GardenerRequestList({ toggleModal, onNewRequest }: { toggleModal: ToggleModal; onNewRequest: () => void }) {
  const store = useRequests();
  const [tab, setTab] = useState<"active" | "past">("active");
  const active = store.requests.filter((r) => r.status === "open" || r.status === "accepted");
  const past = store.requests.filter((r) => r.status === "completed" || r.status === "cancelled");
  const visible = tab === "active" ? active : past;

  const pendingCount = (request: ServiceRequest) =>
    store.offersFor(request.id).filter((o) => o.status === "pending").length;

  return (
    <>
      <div className="modal-toolbar">
        <Tabs
          className="segmented-tabs"
          value={tab}
          onChange={(_, value) => setTab(value)}
          aria-label="Filter your requests"
        >
          <Tab value="active" disableRipple label={<>Active<span className="tab-count">{active.length}</span></>} />
          <Tab value="past" disableRipple label={<>Past<span className="tab-count">{past.length}</span></>} />
        </Tabs>
      </div>
      <ModalContent flush>
        {store.error && (
          <Alert severity="warning" sx={{ m: 2 }}>
            {store.error}
          </Alert>
        )}
        {!store.ready ? (
          <ListSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<AssignmentOutlinedIcon />}
            title={tab === "active" ? "No active requests" : "No past requests"}
            description={
              tab === "active"
                ? "Need wood chips, logs, or tree work? Drop a pin and local crews will send you offers."
                : "Completed and cancelled requests will show up here."
            }
            action={
              tab === "active" ? (
                <Button variant="contained" startIcon={<AddLocationAltOutlined />} onClick={onNewRequest}>
                  Request a service
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="card-list">
            {visible.map((request) => {
              const pending = pendingCount(request);
              return (
                <RequestCard
                  key={request.id}
                  request={request}
                  meta={`${shortAddress(request.address)} · ${timeAgo(request.createdAt)}`}
                  aside={
                    <>
                      <RequestStatusPill status={request.status} />
                      {request.status === "open" && (
                        <span className={`pill ${pending ? "pill--work" : "pill--plain"}`}>
                          {pending ? `${pending} new ${pending === 1 ? "offer" : "offers"}` : "No offers yet"}
                        </span>
                      )}
                    </>
                  }
                  onOpen={() => openDetails(toggleModal, request, "request-list")}
                />
              );
            })}
          </ul>
        )}
      </ModalContent>
    </>
  );
}

/* ---------- Crew job board ---------- */

type BoardTab = "new" | "offered" | "booked";

export function CrewRequestBoard({
  userData,
  toggleModal,
  currentLocation,
}: {
  userData: User;
  toggleModal: ToggleModal;
  currentLocation: Coordinates;
}) {
  const store = useRequests();
  const [tab, setTab] = useState<BoardTab>("new");
  const [query, setQuery] = useState("");
  const orgId = userData.organization.id;

  const groups = useMemo(() => {
    const latestOffer = (request: ServiceRequest): Offer | undefined => store.offersFor(request.id)[0];
    const withDistance = store.requests.map((request) => ({
      request,
      distance: Geo.distance(request, currentLocation),
      offer: latestOffer(request),
    }));
    const open = withDistance.filter(({ request }) => request.status === "open");
    return {
      new: open.filter(({ offer }) => !offer || offer.status === "withdrawn" || offer.status === "closed"),
      offered: open.filter(({ offer }) => offer && (offer.status === "pending" || offer.status === "declined")),
      booked: withDistance.filter(({ request }) => request.acceptedOrganizationId === orgId),
    };
  }, [store, currentLocation, orgId]);

  const needle = query.trim().toLowerCase();
  const visible = groups[tab]
    .filter(
      ({ request }) =>
        !needle ||
        request.address.toLowerCase().includes(needle) ||
        request.services.some((s) => SERVICE_LABEL[s].toLowerCase().includes(needle)) ||
        (request.description ?? "").toLowerCase().includes(needle),
    )
    .sort((a, b) =>
      tab === "booked" ? b.request.createdAt.localeCompare(a.request.createdAt) : a.distance - b.distance,
    );

  const empty = () => {
    if (needle) {
      return (
        <EmptyState
          icon={<SearchOffOutlinedIcon />}
          title="No matching requests"
          description={`Nothing matches “${query.trim()}”.`}
          action={
            <Button variant="outlined" onClick={() => setQuery("")}>
              Clear search
            </Button>
          }
        />
      );
    }
    const copy: Record<BoardTab, [string, string]> = {
      new: ["No new requests", "When gardeners near you ask for chips, logs, or tree work, their requests appear here and on your map."],
      offered: ["No open offers", "Requests you’ve sent offers on will show here until the gardener responds."],
      booked: ["No booked jobs yet", "When a gardener accepts your offer, the job moves here and a chat opens."],
    };
    return <EmptyState icon={<AssignmentOutlinedIcon />} title={copy[tab][0]} description={copy[tab][1]} />;
  };

  return (
    <>
      <div className="modal-toolbar">
        <TextField
          className="search-field"
          size="small"
          type="search"
          placeholder="Search by service, street, or notes"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          inputProps={{ "aria-label": "Search requests" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Tabs className="segmented-tabs" value={tab} onChange={(_, value) => setTab(value)} aria-label="Request status">
          {(
            [
              ["new", "New"],
              ["offered", "Offered"],
              ["booked", "Booked"],
            ] as Array<[BoardTab, string]>
          ).map(([value, label]) => (
            <Tab
              key={value}
              value={value}
              disableRipple
              label={
                <>
                  {label}
                  <span className="tab-count">{groups[value].length}</span>
                </>
              }
            />
          ))}
        </Tabs>
      </div>
      <ModalContent flush>
        {store.error && (
          <Alert severity="warning" sx={{ m: 2 }}>
            {store.error}
          </Alert>
        )}
        {!store.ready ? (
          <ListSkeleton />
        ) : visible.length === 0 ? (
          empty()
        ) : (
          <ul className="card-list">
            {visible.map(({ request, distance, offer }) => (
              <RequestCard
                key={request.id}
                request={request}
                meta={`${shortAddress(request.address)} · ${formatDistance(distance)} · ${timeAgo(request.createdAt)}`}
                aside={
                  tab === "booked" ? (
                    <RequestStatusPill status={request.status} />
                  ) : offer && tab === "offered" ? (
                    <>
                      <span className="pill pill--plain">{offerPrice(offer)}</span>
                      <OfferStatusPill offer={offer} />
                    </>
                  ) : (
                    <>
                      {request.timing === "asap" && <span className="pill pill--open">ASAP</span>}
                      {request.images.length > 0 && (
                        <span className="pill pill--plain pill--icon">
                          <PhotoLibraryOutlinedIcon fontSize="inherit" /> {request.images.length}
                        </span>
                      )}
                    </>
                  )
                }
                onOpen={() => openDetails(toggleModal, request, "request-list")}
              />
            ))}
          </ul>
        )}
      </ModalContent>
    </>
  );
}
