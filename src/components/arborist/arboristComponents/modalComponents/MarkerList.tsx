import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import ForestOutlined from "@mui/icons-material/ForestOutlined";
import ConstructionOutlined from "@mui/icons-material/ConstructionOutlined";
import DirectionsOutlinedIcon from "@mui/icons-material/DirectionsOutlined";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import {
  Button,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { Marker, MarkerKind, User } from "../../../../types/dataTypes";
import { Coordinates, ToggleModal } from "../../../../types/generalTypes";
import { formatDistance } from "../../../../utils/format";
import { Geo } from "../../../../utils/location";
import { KIND_LABEL, markerKind } from "../../../../utils/markers";
import EmptyState from "../../../utils/EmptyState";
import { MaterialPills, MaterialTile } from "../../../utils/Material";
import ModalContent from "./modalUtils/ModalContent";

type KindFilter = "all" | MarkerKind;
type MaterialFilter = "all" | "wood" | "chips" | "both";

interface MarkerListProps {
  userData: User;
  toggleModal: ToggleModal;
  currentLocation: Coordinates;
  onAddLocation: () => void;
}

const KIND_FILTERS: Array<{ value: KindFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "dropSite", label: "Drops" },
  { value: "facility", label: "Facilities" },
  { value: "jobSite", label: "Job sites" },
];

const MATERIAL_FILTERS: Array<{ value: MaterialFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "chips", label: "Chips" },
  { value: "wood", label: "Wood" },
  { value: "both", label: "Both" },
];

/** Street line only: "412 Maple Street, Brooklyn, NY" -> "412 Maple Street, Brooklyn". */
function shortAddress(address: string) {
  return address.split(",").slice(0, 2).join(",").trim();
}

function KindTile({ kind }: { kind: MarkerKind }) {
  const icon =
    kind === "facility" ? (
      <ApartmentOutlined fontSize="small" />
    ) : kind === "jobSite" ? (
      <ConstructionOutlined fontSize="small" />
    ) : (
      <ForestOutlined fontSize="small" />
    );
  return (
    <span className={`tile tile--${kind}`} aria-hidden="true">
      {icon}
    </span>
  );
}

export default function MarkerList({
  userData,
  toggleModal,
  currentLocation,
  onAddLocation,
}: MarkerListProps) {
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [materialFilter, setMaterialFilter] = useState<MaterialFilter>("all");
  const [query, setQuery] = useState("");
  const { markers } = userData.organization;

  const withDistance = useMemo(
    () =>
      markers
        .map((marker) => ({
          ...marker,
          kind: markerKind(marker),
          distance: Geo.distance(marker, currentLocation),
        }))
        .sort((a, b) => a.distance - b.distance),
    [markers, currentLocation],
  );

  const kindCounts = useMemo(() => {
    const result: Record<KindFilter, number> = {
      all: markers.length,
      dropSite: 0,
      facility: 0,
      jobSite: 0,
    };
    markers.forEach((marker) => {
      result[markerKind(marker)] += 1;
    });
    return result;
  }, [markers]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return withDistance.filter((marker) => {
      if (kindFilter !== "all" && marker.kind !== kindFilter) return false;
      if (materialFilter !== "all") {
        if (marker.kind !== "dropSite" || marker.type !== materialFilter) return false;
      }
      if (!needle) return true;
      return (
        marker.name.toLowerCase().includes(needle) ||
        marker.address.toLowerCase().includes(needle)
      );
    });
  }, [withDistance, kindFilter, materialFilter, query]);

  const open = (marker: Marker) =>
    toggleModal(true, {
      type: "marker-details",
      data: marker,
      goBackLocation: "marker-list",
    });

  const resetFilters = () => {
    setKindFilter("all");
    setMaterialFilter("all");
    setQuery("");
  };

  const emptyState = () => {
    if (markers.length === 0) {
      return (
        <EmptyState
          icon={<RoomOutlinedIcon />}
          title="No locations yet"
          description="Add drop sites, facilities, or job sites so your crew knows where to go."
          action={
            <Button variant="contained" onClick={onAddLocation}>
              Add a location
            </Button>
          }
        />
      );
    }
    if (query.trim()) {
      return (
        <EmptyState
          icon={<SearchOffOutlinedIcon />}
          title="No matching locations"
          description={`Nothing matches “${query.trim()}”. Try a different name or street.`}
          action={
            <Button variant="outlined" onClick={resetFilters}>
              Clear search
            </Button>
          }
        />
      );
    }
    return (
      <EmptyState
        icon={<RoomOutlinedIcon />}
        title="No locations found"
        description="Try another filter or add a location of this type."
        action={
          <Button variant="contained" onClick={onAddLocation}>
            Add a location
          </Button>
        }
      />
    );
  };

  const showMaterialTabs = kindFilter === "dropSite" || kindFilter === "all";

  return (
    <>
      <div className="modal-toolbar">
        <TextField
          className="search-field"
          size="small"
          type="search"
          placeholder="Search by name or address"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          inputProps={{ "aria-label": "Search locations" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Tabs
          className="segmented-tabs"
          value={kindFilter}
          onChange={(_, value: KindFilter) => {
            setKindFilter(value);
            if (value !== "dropSite" && value !== "all") setMaterialFilter("all");
          }}
          aria-label="Filter locations by type"
        >
          {KIND_FILTERS.map(({ value, label }) => (
            <Tab
              key={value}
              value={value}
              disableRipple
              label={
                <>
                  {label}
                  <span className="tab-count">{kindCounts[value]}</span>
                </>
              }
            />
          ))}
        </Tabs>
        {showMaterialTabs && (
          <Tabs
            className="segmented-tabs"
            value={materialFilter}
            onChange={(_, value: MaterialFilter) => setMaterialFilter(value)}
            aria-label="Filter drop sites by material"
          >
            {MATERIAL_FILTERS.map(({ value, label }) => (
              <Tab key={value} value={value} disableRipple label={label} />
            ))}
          </Tabs>
        )}
      </div>

      <ModalContent flush>
        {visible.length === 0 ? (
          emptyState()
        ) : (
          <ul className="card-list">
            {visible.map((marker) => (
              <li className="card" key={marker.id}>
                <button
                  type="button"
                  className="card-main"
                  onClick={() => open(marker)}
                >
                  {marker.kind === "dropSite" ? (
                    <MaterialTile type={marker.type} />
                  ) : (
                    <KindTile kind={marker.kind} />
                  )}
                  <span className="card-body">
                    <span className="card-title truncate">{marker.name}</span>
                    <span className="card-sub truncate">
                      {KIND_LABEL[marker.kind]} · {shortAddress(marker.address)}
                    </span>
                    {marker.kind === "dropSite" ? (
                      <MaterialPills type={marker.type} />
                    ) : marker.kind === "jobSite" && marker.startDate ? (
                      <span className="pill-row">
                        <span className="pill">
                          {marker.startDate}
                          {marker.endDate && marker.endDate !== marker.startDate
                            ? ` – ${marker.endDate}`
                            : ""}
                        </span>
                      </span>
                    ) : null}
                  </span>
                  <span className="card-meta">
                    {formatDistance(marker.distance)}
                  </span>
                </button>
                <Tooltip title="Directions">
                  <IconButton
                    className="card-action"
                    component="a"
                    href={Geo.getAddressURL({
                      mapChoice: userData.mapChoice,
                      address: marker.address,
                    })}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Directions to ${marker.name}`}
                  >
                    <DirectionsOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </li>
            ))}
          </ul>
        )}
      </ModalContent>
    </>
  );
}
