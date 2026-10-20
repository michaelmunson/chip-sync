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
import { Marker, User } from "../../../../types/dataTypes";
import { Coordinates, ToggleModal } from "../../../../types/generalTypes";
import { Geo } from "../../../../utils/location";
import { formatDistance } from "../../../../utils/format";
import EmptyState from "../../../utils/EmptyState";
import { MaterialPills, MaterialTile } from "../../../utils/Material";
import ModalContent from "./modalUtils/ModalContent";

type Filter = "all" | "wood" | "chips" | "both";

interface MarkerListProps {
  userData: User;
  toggleModal: ToggleModal;
  currentLocation: Coordinates;
}

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "chips", label: "Chips" },
  { value: "wood", label: "Wood" },
  { value: "both", label: "Both" },
];

/** Street line only: "412 Maple Street, Brooklyn, NY" -> "412 Maple Street, Brooklyn". */
function shortAddress(address: string) {
  return address.split(",").slice(0, 2).join(",").trim();
}

export default function MarkerList({
  userData,
  toggleModal,
  currentLocation,
}: MarkerListProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const { markers } = userData.organization;

  const withDistance = useMemo(
    () =>
      markers
        .map((marker) => ({
          ...marker,
          distance: Geo.distance(marker, currentLocation),
        }))
        .sort((a, b) => a.distance - b.distance),
    [markers, currentLocation],
  );

  const counts = useMemo(() => {
    const result: Record<Filter, number> = { all: markers.length, chips: 0, wood: 0, both: 0 };
    markers.forEach((marker) => {
      result[marker.type] += 1;
    });
    return result;
  }, [markers]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return withDistance.filter(
      (marker) =>
        (filter === "all" || marker.type === filter) &&
        (!needle ||
          marker.name.toLowerCase().includes(needle) ||
          marker.address.toLowerCase().includes(needle)),
    );
  }, [withDistance, filter, query]);

  const open = (marker: Marker) =>
    toggleModal(true, {
      type: "marker-details",
      data: marker,
      goBackLocation: "marker-list",
    });

  const resetFilters = () => {
    setFilter("all");
    setQuery("");
  };

  const emptyState = () => {
    if (markers.length === 0) {
      return (
        <EmptyState
          icon={<RoomOutlinedIcon />}
          title="No drop sites found"
          description="Save your first site to help your crew find a place for chips and wood."
          action={
            <Button
              variant="contained"
              onClick={() => toggleModal(true, { type: "add-marker" })}
            >
              Add a drop site
            </Button>
          }
        />
      );
    }
    if (query.trim()) {
      return (
        <EmptyState
          icon={<SearchOffOutlinedIcon />}
          title="No matching sites"
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
        title="No drop sites found"
        description="Try another material filter or add a site for this material."
        action={
          <Button
            variant="contained"
            onClick={() => toggleModal(true, { type: "add-marker" })}
          >
            Add a drop site
          </Button>
        }
      />
    );
  };

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
          inputProps={{ "aria-label": "Search sites" }}
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
          value={filter}
          onChange={(_, value: Filter) => setFilter(value)}
          aria-label="Filter drop sites by material"
        >
          {FILTERS.map(({ value, label }) => (
            <Tab
              key={value}
              value={value}
              disableRipple
              label={
                <>
                  {label}
                  <span className="tab-count">{counts[value]}</span>
                </>
              }
            />
          ))}
        </Tabs>
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
                  <MaterialTile type={marker.type} />
                  <span className="card-body">
                    <span className="card-title truncate">{marker.name}</span>
                    <span className="card-sub truncate">
                      {shortAddress(marker.address)}
                    </span>
                    <MaterialPills type={marker.type} />
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
