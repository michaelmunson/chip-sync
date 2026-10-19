import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RoomIcon from "@mui/icons-material/Room";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Tab,
  Tabs,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { Marker, User } from "../../../../types/dataTypes";
import {
  Coordinates,
  ModalConfig,
  ToggleModal,
} from "../../../../types/generalTypes";
import { Geo } from "../../../../utils/location";
import "../../../../css/modalComponents/marker-list.css";
import { AddressLink } from "../../../utils/AddressLink";
import ModalContent from "./modalUtils/ModalContent";

interface MarkerListProps {
  userData: User;
  toggleModal: ToggleModal;
  currentLocation: Coordinates;
}

interface MarkerAccordianProps {
  tab: "all" | "wood" | "chips" | "both";
  userData: User;
  toggleModal: ToggleModal;
  currentLocation: Coordinates;
}

interface MarkerTabsProps {
  tab: "all" | "wood" | "chips" | "both";
  setTab: React.Dispatch<
    React.SetStateAction<"wood" | "chips" | "both" | "all">
  >;
}

function MarkerTabs({ tab, setTab }: MarkerTabsProps) {
  const handleChange = (event: any, newValue: any) => {
    setTab(newValue);
  };

  return (
    //maxWidth: { xs: 320, sm: 480 },
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Tabs
        value={tab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Filter drop sites by material"
      >
        <Tab label="All" value={"all"} />
        <Tab label="Chips" value={"chips"} />
        <Tab label="Wood" value={"wood"} />
        <Tab label="Both" value={"both"} />
      </Tabs>
    </Box>
  );
}

function MarkerAccordian({
  tab,
  userData,
  toggleModal,
  currentLocation,
}: MarkerAccordianProps) {
  const [expanded, setExpanded] = useState<string>();
  const markerArray = useMemo(
    () =>
      userData.organization.markers
        .filter((marker) => tab === "all" || marker.type === tab)
        .map((marker) => ({
          ...marker,
          distance: Geo.distance(marker, currentLocation),
        }))
        .sort((a, b) => a.distance - b.distance),
    [tab, userData.organization.markers, currentLocation],
  );

  return (
    <div>
      {markerArray.length > 0 ? (
        markerArray.map((marker, index) => (
          <Accordion
            expanded={marker.id === expanded}
            onChange={() => {
              setExpanded(expanded === marker.id ? undefined : marker.id);
            }}
            key={`accordian#${index}`}
            style={{ padding: "10px" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`site-${marker.id}-content`}
              id={`site-${marker.id}-header`}
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <b
                  style={{
                    textAlign: "left",
                    overflowWrap: "anywhere",
                    marginRight: 12,
                  }}
                >
                  {marker.name}
                </b>{" "}
                <span>{marker?.distance?.toFixed(2)} miles</span>
              </div>
            </AccordionSummary>
            <AccordionDetails id={`site-${marker.id}-content`}>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <AddressLink
                  mapChoice={userData.mapChoice}
                  address={marker.address}
                />
                <Button
                  variant="outlined"
                  style={{ marginTop: "15px" }}
                  onClick={() => {
                    const config: ModalConfig = {
                      type: "marker-details",
                      data: marker,
                      goBackLocation: "marker-list",
                    };
                    toggleModal(true, config);
                  }}
                >
                  Expand
                </Button>
              </div>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <div className="empty-sites">
          <RoomIcon color="primary" fontSize="large" />
          <h3>No drop sites found</h3>
          <p>
            {tab === "all"
              ? "Save your first site to help your crew find a place for chips and wood."
              : "Try another material filter or add a site for this material."}
          </p>
          <Button
            variant="contained"
            onClick={() => toggleModal(true, { type: "add-marker" })}
          >
            Add a drop site
          </Button>
        </div>
      )}
    </div>
  );
}

export default function MarkerList({
  userData,
  toggleModal,
  currentLocation,
}: MarkerListProps) {
  const [tab, setTab] = useState<"all" | "wood" | "chips" | "both">("all");

  return (
    <>
      <MarkerTabs tab={tab} setTab={setTab} />
      <ModalContent>
        <MarkerAccordian
          tab={tab}
          userData={userData}
          toggleModal={toggleModal}
          currentLocation={currentLocation}
        />
      </ModalContent>
    </>
  );
}
