import MyLocationIcon from "@mui/icons-material/MyLocation";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Autocomplete, Button, CircularProgress, InputAdornment, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Coordinates } from "../../types/generalTypes";
import { Geo } from "../../utils/location";

type Predictor = (input: string) => Promise<string[]>;

interface PlacementPanelProps {
  position: Coordinates;
  address: string;
  resolving: boolean;
  editing: boolean;
  locating: boolean;
  onSearch: (position: Coordinates, address: string) => void;
  onUseMyLocation: () => void;
  onCancel: () => void;
  onContinue: () => void;
}

export default function PlacementPanel({
  position,
  address,
  resolving,
  editing,
  locating,
  onSearch,
  onUseMyLocation,
  onCancel,
  onContinue,
}: PlacementPanelProps) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const predictor = useRef<Predictor>();
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    let cancelled = false;
    Geo.getPredictionFunction(position)
      .then((fn) => {
        if (!cancelled) predictor.current = fn as unknown as Predictor;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const suggest = (input: string) => {
    clearTimeout(debounce.current);
    if (input.trim().length < 3) return setOptions([]);
    debounce.current = setTimeout(() => {
      predictor.current?.(input).then(setOptions).catch(() => setOptions([]));
    }, 250);
  };

  async function search(value: string | null) {
    if (!value?.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      onSearch(await Geo.addressToCoords(value), value);
      setQuery("");
      setOptions([]);
    } catch {
      setSearchError("We couldn’t find that address.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <>
      <div className="placement-search">
        <Autocomplete
          freeSolo
          options={options}
          filterOptions={(all) => all}
          inputValue={query}
          onInputChange={(_, value, reason) => {
            setQuery(value);
            setSearchError("");
            if (reason === "input") suggest(value);
          }}
          onChange={(_, value) => search(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search an address"
              error={Boolean(searchError)}
              helperText={searchError || undefined}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !options.length) search(query);
              }}
              InputProps={{
                ...params.InputProps,
                "aria-label": "Search an address",
                startAdornment: (
                  <InputAdornment position="start">
                    {searching ? <CircularProgress size={18} /> : <SearchIcon fontSize="small" />}
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </div>

      <section className="placement-sheet" aria-labelledby="placement-title">
        <div className="placement-head">
          <h2 id="placement-title">{editing ? "Move your pin" : "Drop a pin where the work is"}</h2>
          <p>Tap the map or drag the pin to the exact spot — where chips should be dumped, or the tree that needs work.</p>
        </div>
        <div className="placement-address" aria-live="polite">
          <PlaceOutlinedIcon fontSize="small" />
          <span className="truncate">
            {resolving ? "Finding address…" : address || "Unnamed location — you can add details next"}
          </span>
        </div>
        <div className="placement-actions">
          <Button
            variant="outlined"
            onClick={onUseMyLocation}
            disabled={locating}
            startIcon={locating ? <CircularProgress size={16} /> : <MyLocationIcon />}
            className="placement-locate"
          >
            <span className="placement-locate-label">My location</span>
          </Button>
          <span className="grow" />
          <Button variant="text" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" onClick={onContinue}>
            {editing ? "Use this spot" : "Continue"}
          </Button>
        </div>
      </section>
    </>
  );
}
