import React, { useCallback, useEffect, useRef, useState } from "react";
import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
import ArrowForward from "@mui/icons-material/ArrowForward";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import Carpenter from "@mui/icons-material/Carpenter";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import CheckIcon from "@mui/icons-material/Check";
import ContentCut from "@mui/icons-material/ContentCut";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import DirectionsOutlined from "@mui/icons-material/DirectionsOutlined";
import EventAvailableOutlined from "@mui/icons-material/EventAvailableOutlined";
import Forest from "@mui/icons-material/Forest";
import Grain from "@mui/icons-material/Grain";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import Layers from "@mui/icons-material/Layers";
import LocalOfferOutlined from "@mui/icons-material/LocalOfferOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import NotificationsActiveOutlined from "@mui/icons-material/NotificationsActiveOutlined";
import PhotoCameraOutlined from "@mui/icons-material/PhotoCameraOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import SmartphoneOutlined from "@mui/icons-material/SmartphoneOutlined";
import TripOrigin from "@mui/icons-material/TripOrigin";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import YardOutlined from "@mui/icons-material/YardOutlined";
import { useLanding } from "./LandingContext";
import { SiteFooter, SiteLink, SiteNav } from "./SiteChrome";

/* ---------------------------------------------------------------- data */

export type Audience = "companies" | "customers";

interface Feature { icon: React.ReactNode; tone: string; title: string; text: string }

interface AudienceContent {
  eyebrow: { icon: React.ReactNode; text: string };
  title: React.ReactNode;
  lead: string;
  notes: string[];
  strip: Array<{ tone: string; icon: React.ReactNode; label: string }>;
  featuresHead: { kicker: string; title: string; text: string };
  features: Feature[];
  stepsTitle: string;
  steps: Array<{ title: string; text: string }>;
  faq: Array<{ q: string; a: string }>;
  final: { title: string; text: string };
}

const CONTENT: Record<Audience, AudienceContent> = {
  companies: {
    eyebrow: { icon: <Forest fontSize="inherit" />, text: "For tree companies" },
    title: (
      <>
        Know where every load <em>can go.</em>
      </>
    ),
    lead: "Create and track your own drop sites, see your customers’ drop sites on the same map, plan the shortest route home, and pick up new work — all from one crew workspace.",
    notes: ["Share one map with your whole crew", "Phone-first for the field", "Light & dark mode"],
    strip: [
      { tone: "brand", icon: <PlaceOutlined fontSize="inherit" />, label: "Your drop sites" },
      { tone: "chips", icon: <VisibilityOutlined fontSize="inherit" />, label: "Customer drop sites" },
      { tone: "work", icon: <DirectionsOutlined fontSize="inherit" />, label: "Route planning" },
      { tone: "open", icon: <LocalOfferOutlined fontSize="inherit" />, label: "Offers" },
      { tone: "wood", icon: <EventAvailableOutlined fontSize="inherit" />, label: "Crew jobs" },
    ],
    featuresHead: {
      kicker: "For tree companies",
      title: "Stop guessing where the chips go",
      text: "Dumping fees, long hauls and a truck full of wood with nowhere to put it. Chip Sync keeps every option on one map.",
    },
    features: [
      {
        icon: <AddLocationAltOutlined />,
        tone: "brand",
        title: "Create your own drop sites",
        text: "Pin your yards, facilities and job sites at the exact spot. Mark what each one takes — chips, wood or both — and add photos.",
      },
      {
        icon: <PlaceOutlined />,
        tone: "chips",
        title: "Track every site",
        text: "See every location on a live map and in a searchable list. Edit details, move a pin or delete a site whenever things change.",
      },
      {
        icon: <VisibilityOutlined />,
        tone: "wood",
        title: "See customers’ drop sites",
        text: "Customers add places that welcome chips or logs. They show up on your map, so you can find a nearby home for a load.",
      },
      {
        icon: <DirectionsOutlined />,
        tone: "work",
        title: "Plan routes",
        text: "Pick the material and Chip Sync finds the drop site that makes the whole trip to your yard shortest — not just the nearest one.",
      },
      {
        icon: <AssignmentOutlined />,
        tone: "open",
        title: "Browse requests, send offers",
        text: "Customers post what they need — chips, logs, removal, trimming, stump grinding. Reply with a price, quantity and available date.",
      },
      {
        icon: <EventAvailableOutlined />,
        tone: "brand",
        title: "Run crew jobs",
        text: "Tie a job site to a facility and track it from planned to active to done, so the whole crew sees where the day is going.",
      },
      {
        icon: <NotificationsActiveOutlined />,
        tone: "chips",
        title: "Know when something’s new",
        text: "Live in-app updates, plus optional text and email when a new request, drop site or message comes in.",
      },
      {
        icon: <GroupsOutlined />,
        tone: "work",
        title: "Built for crews",
        text: "Create a crew or join one. Admins and members share the same sites, jobs and requests.",
      },
    ],
    stepsTitle: "From a full truck to an empty one",
    steps: [
      { title: "Pin your sites", text: "Add your yard, facilities and drop sites. Customers’ drop sites appear alongside them." },
      { title: "Plan the route", text: "Choose what you’re hauling and let Chip Sync pick the drop site that shortens the trip." },
      { title: "Win the work", text: "Send offers on nearby requests, run the job with your crew and keep everyone notified." },
    ],
    faq: [
      { q: "How do I get started as a tree company?", a: "Create an account, choose “Arborist”, then either create your crew or join an existing one. Add your yard and drop sites and you’re on the map." },
      { q: "Can my whole crew use it?", a: "Yes. Crews have admins and members who share the same sites, jobs and requests." },
      { q: "Whose drop sites can I see?", a: "Your own sites, plus drop sites that customers have added to accept chips or logs." },
      { q: "How does route planning work?", a: "Choose chips, logs or both. Chip Sync finds the accepting drop site that minimises the whole trip from where you are to your facility, using straight-line estimates, then opens your maps app for real directions." },
      { q: "Does it work on my phone?", a: "Chip Sync is designed phone-first for the field, works in any modern browser, and follows your device’s light or dark setting." },
    ],
    final: {
      title: "Stop hauling chips farther than you have to.",
      text: "Set up your crew’s workspace in a couple of minutes — pick Arborist, drop your first pin and see who’s nearby.",
    },
  },

  customers: {
    eyebrow: { icon: <YardOutlined fontSize="inherit" />, text: "For customers" },
    title: (
      <>
        Wood chips, logs & tree work, <em>from local crews.</em>
      </>
    ),
    lead: "Tell Chip Sync what you need — wood chips, logs, tree removal, trimming or stump grinding. Nearby tree companies send you offers, and you pick the one that fits.",
    notes: ["Post a request in minutes", "Compare offers side by side", "Light & dark mode"],
    strip: [
      { tone: "chips", icon: <Grain fontSize="inherit" />, label: "Wood chips" },
      { tone: "wood", icon: <Forest fontSize="inherit" />, label: "Logs" },
      { tone: "work", icon: <Carpenter fontSize="inherit" />, label: "Tree removal" },
      { tone: "work", icon: <ContentCut fontSize="inherit" />, label: "Trimming" },
      { tone: "work", icon: <TripOrigin fontSize="inherit" />, label: "Stump grinding" },
    ],
    featuresHead: {
      kicker: "For customers",
      title: "Ask once. Let the crews come to you.",
      text: "No more calling around or waiting on a callback. Post what you need and see who can help.",
    },
    features: [
      {
        icon: <AssignmentOutlined />,
        tone: "chips",
        title: "Request what you need",
        text: "Wood chips, logs, removal, trimming, stump grinding — or something else. Say how much and when.",
      },
      {
        icon: <LocalOfferOutlined />,
        tone: "open",
        title: "Compare offers",
        text: "Crews reply with a fixed price, free, or “after a site visit”, plus quantities and an available date.",
      },
      {
        icon: <ChatBubbleOutline />,
        tone: "work",
        title: "Chat before you commit",
        text: "Every request has its own conversation. Sort out access, timing and details in the app.",
      },
      {
        icon: <LockOutlined />,
        tone: "brand",
        title: "Your details stay private",
        text: "Your contact details are only shared with crews you book.",
      },
      {
        icon: <AddLocationAltOutlined />,
        tone: "wood",
        title: "Share your own drop site",
        text: "Got room for chips or logs? Drop a pin so nearby crews know your yard is a place to unload.",
      },
      {
        icon: <NotificationsActiveOutlined />,
        tone: "open",
        title: "Alerts that find you",
        text: "Live in-app updates, plus optional text or email when an offer or message arrives. You choose what to hear about.",
      },
      {
        icon: <PhotoCameraOutlined />,
        tone: "work",
        title: "Show the spot",
        text: "Add photos to your locations so crews know exactly where to go.",
      },
      {
        icon: <SmartphoneOutlined />,
        tone: "chips",
        title: "Phone-first",
        text: "Safe-area aware layouts and a bottom dock built for one-handed use.",
      },
    ],
    stepsTitle: "From a request to a delivery",
    steps: [
      { title: "Post a request", text: "Choose chips, logs or tree work, add a few details and drop a pin where it’s needed." },
      { title: "Compare offers", text: "Nearby crews send offers with price, quantity and timing. Ask questions in chat." },
      { title: "Accept and relax", text: "Pick the offer that fits. Your crew shows up and you stay in the loop with alerts." },
    ],
    faq: [
      { q: "How do I get started as a customer?", a: "Create an account and choose “Gardener” when you set up your workspace. Then post your first request." },
      { q: "What can I ask for?", a: "Wood chips and logs, plus tree removal, trimming, stump grinding and other tree work." },
      { q: "Does it cost anything to post a request?", a: "Offers show their own price — fixed, free, or confirmed after a site visit — so you see what a crew is asking before you accept." },
      { q: "Who sees my contact details?", a: "Only crews you book. Nearby crews see your request and pins so they can send you offers." },
      { q: "Does it work on my phone?", a: "Yes — Chip Sync is designed phone-first, works in any modern browser, and follows your device’s light or dark setting." },
    ],
    final: {
      title: "Get your chips, logs and tree work sorted.",
      text: "Set up your workspace in a couple of minutes — pick Gardener and post your first request.",
    },
  },
};

const TABS: Array<{ id: Audience; label: string; icon: React.ReactNode }> = [
  { id: "companies", label: "For Tree Companies", icon: <Forest fontSize="small" /> },
  { id: "customers", label: "For Customers", icon: <YardOutlined fontSize="small" /> },
];

function audienceFromUrl(): Audience {
  try {
    const value = new URLSearchParams(window.location.search).get("for");
    if (value === "customers" || value === "companies") return value;
  } catch {
    /* ignore */
  }
  return "companies";
}

/* ------------------------------------------------------------- helpers */

function useReveal(dep: unknown) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = Array.from(el.querySelectorAll<HTMLElement>(".lp-reveal"));
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      targets.forEach((t) => t.classList.add("is-in"));
      return;
    }
    el.classList.add("lp-js");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [dep]);
  return root;
}

function Tile({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={`lp-tile lp-tile--${tone}`} aria-hidden="true">
      {children}
    </span>
  );
}

function Pin({
  x,
  y,
  tone,
  label,
  children,
  delay = 0,
}: {
  x: number;
  y: number;
  tone: "chips" | "wood" | "brand" | "work";
  label: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <span
      className={`lp-pin lp-pin--${tone}`}
      style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}ms` }}
      role="img"
      aria-label={label}
    >
      <span>{children}</span>
    </span>
  );
}

/* ------------------------------------------------------------ mockups */

function MapMockup({ audience }: { audience: Audience }) {
  const companies = audience === "companies";
  return (
    <div className="lp-map" role="img" aria-label={companies ? "Map showing your drop sites, customers’ drop sites and a planned route" : "Map showing nearby crews, an offer and a booked delivery"}>
      <svg viewBox="0 0 400 480" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <rect width="400" height="480" className="m-land" />
        <path className="m-park" d="M-10 330 C 60 300 120 340 150 400 L 150 500 L -10 500 Z" />
        <path className="m-park" d="M260 -10 L 420 -10 L 420 90 C 360 110 300 80 260 -10 Z" />
        <path className="m-water" d="M-10 120 C 70 150 120 90 200 120 S 340 190 420 150 L 420 210 C 330 250 250 190 190 180 S 60 210 -10 180 Z" />
        <g className="m-road-casing" fill="none">
          <path d="M-10 270 C 90 250 160 300 240 280 S 360 230 420 260" />
          <path d="M120 -10 C 140 100 100 200 150 300 S 200 420 190 500" />
          <path d="M290 -10 C 280 90 330 200 300 300 S 340 420 360 500" />
          <path d="M-10 410 C 100 400 220 430 420 380" />
        </g>
        <g className="m-road" fill="none">
          <path d="M-10 270 C 90 250 160 300 240 280 S 360 230 420 260" />
          <path d="M120 -10 C 140 100 100 200 150 300 S 200 420 190 500" />
          <path d="M290 -10 C 280 90 330 200 300 300 S 340 420 360 500" />
          <path d="M-10 410 C 100 400 220 430 420 380" />
        </g>
        <path
          className="m-route"
          fill="none"
          d="M70 372 C 100 330 150 310 175 292 S 262 262 300 218"
        />
      </svg>

      <Pin x={17} y={78} tone="work" label="Your location" delay={100}><TripOrigin fontSize="inherit" /></Pin>
      <Pin x={44} y={60} tone="chips" label="Chips drop site" delay={250}><Grain fontSize="inherit" /></Pin>
      <Pin x={75} y={45} tone="brand" label="Crew yard" delay={400}><HomeOutlined fontSize="inherit" /></Pin>
      <Pin x={26} y={54} tone="wood" label="Logs drop site" delay={550}><Forest fontSize="inherit" /></Pin>
      <Pin x={82} y={73} tone="chips" label="Chips drop site" delay={700}><Grain fontSize="inherit" /></Pin>
      <Pin x={86} y={22} tone="wood" label="Chips and logs drop site" delay={850}><Layers fontSize="inherit" /></Pin>

      {companies ? (
        <div className="lp-float lp-float--offer">
          <div className="lp-offer-head">
            <span className="lp-avatar lp-avatar--alt">JM</span>
            <div>
              <strong>New request nearby</strong>
              <small>2.1 mi · posted 4m ago</small>
            </div>
          </div>
          <div className="lp-offer-price">5 yd <span>of wood chips wanted</span></div>
          <div className="lp-offer-actions">
            <span className="lp-btn lp-btn--primary lp-btn--xs">Send offer</span>
            <span className="lp-btn lp-btn--ghost lp-btn--xs">View</span>
          </div>
        </div>
      ) : (
        <div className="lp-float lp-float--offer">
          <div className="lp-offer-head">
            <span className="lp-avatar">OT</span>
            <div>
              <strong>Oak &amp; Timber Tree Care</strong>
              <small>sent you an offer · 2m</small>
            </div>
          </div>
          <div className="lp-offer-price">$80 <span>for 4 yards of chips</span></div>
          <div className="lp-offer-actions">
            <span className="lp-btn lp-btn--primary lp-btn--xs">Accept</span>
            <span className="lp-btn lp-btn--ghost lp-btn--xs">Decline</span>
          </div>
        </div>
      )}

      <div className="lp-float lp-float--job">
        <Tile tone="chips"><Grain fontSize="small" /></Tile>
        <div>
          <strong>{companies ? "Maple St. removal" : "Chip delivery"}</strong>
          <small>{companies ? "Chips · 3.2 mi to drop site" : "Oak & Timber · arriving Thursday"}</small>
        </div>
        <span className="lp-pill lp-pill--chips">{companies ? "Active" : "Booked"}</span>
      </div>
    </div>
  );
}

function CrewOfferMockup() {
  return (
    <div className="lp-panel" role="img" aria-label="Example customer request with your crew's offer">
      <div className="lp-panel-head">
        <Tile tone="chips"><Grain fontSize="small" /></Tile>
        <div>
          <strong>Wants 5 yards of wood chips</strong>
          <small>J. Moreno · 2.1 mi away · 4 min ago</small>
        </div>
        <span className="lp-pill lp-pill--open">Open</span>
      </div>
      <div className="lp-services">
        <span className="lp-pill lp-pill--chips"><Grain fontSize="inherit" /> Chips</span>
        <span className="lp-pill lp-pill--work"><EventAvailableOutlined fontSize="inherit" /> Flexible timing</span>
      </div>

      <article className="lp-offer lp-offer--hl">
        <header>
          <span className="lp-avatar">You</span>
          <div><strong>Your crew’s offer</strong><small>Draft</small></div>
          <span className="lp-pill lp-pill--chips">Fixed price</span>
        </header>
        <div className="lp-offer-price">$80 <span>for 5 yd of chips</span></div>
        <ul>
          <li><Grain fontSize="inherit" /> 5 yd of chips</li>
          <li><EventAvailableOutlined fontSize="inherit" /> Available Thu</li>
        </ul>
        <p>“We’re clearing a lot two streets over — can drop it this week.”</p>
        <div className="lp-offer-actions">
          <span className="lp-btn lp-btn--primary lp-btn--xs">Send offer</span>
          <span className="lp-btn lp-btn--ghost lp-btn--xs"><ChatBubbleOutline fontSize="inherit" /> Message</span>
        </div>
      </article>

      <div className="lp-privacy"><PlaceOutlined fontSize="small" /> Nearby requests appear on your map next to your drop sites.</div>
    </div>
  );
}

function RequestMockup() {
  return (
    <div className="lp-panel" role="img" aria-label="Example gardener request with two crew offers">
      <div className="lp-panel-head">
        <Tile tone="chips"><Grain fontSize="small" /></Tile>
        <div>
          <strong>Need 5 yards of wood chips</strong>
          <small>Posted by you · Hudson Valley</small>
        </div>
        <span className="lp-pill lp-pill--open">2 offers</span>
      </div>
      <div className="lp-services">
        <span className="lp-pill lp-pill--chips"><Grain fontSize="inherit" /> Chips</span>
        <span className="lp-pill lp-pill--wood"><Forest fontSize="inherit" /> Logs</span>
        <span className="lp-pill lp-pill--work"><Carpenter fontSize="inherit" /> Removal</span>
        <span className="lp-pill lp-pill--work"><ContentCut fontSize="inherit" /> Trim</span>
        <span className="lp-pill lp-pill--work"><TripOrigin fontSize="inherit" /> Stump</span>
      </div>

      <article className="lp-offer lp-offer--hl">
        <header>
          <span className="lp-avatar">OT</span>
          <div><strong>Oak &amp; Timber Tree Care</strong><small>2 min ago</small></div>
          <span className="lp-pill lp-pill--open">New</span>
        </header>
        <div className="lp-offer-price">$80 <span>fixed price</span></div>
        <ul>
          <li>5 yd of chips</li>
          <li><EventAvailableOutlined fontSize="inherit" /> Available Thu</li>
        </ul>
        <p>“We’re clearing a lot two streets over — can drop it this week.”</p>
        <div className="lp-offer-actions">
          <span className="lp-btn lp-btn--primary lp-btn--xs">Accept offer</span>
          <span className="lp-btn lp-btn--ghost lp-btn--xs">Decline</span>
          <span className="lp-btn lp-btn--ghost lp-btn--xs"><ChatBubbleOutline fontSize="inherit" /> Message</span>
        </div>
      </article>

      <article className="lp-offer">
        <header>
          <span className="lp-avatar lp-avatar--alt">GR</span>
          <div><strong>Green Ridge Arborists</strong><small>1 hour ago</small></div>
          <span className="lp-pill lp-pill--chips">Free</span>
        </header>
        <div className="lp-offer-price">No charge <span>delivered with a job nearby</span></div>
      </article>
    </div>
  );
}

function RouteMockup() {
  return (
    <div className="lp-panel" role="img" aria-label="Example route from your location to a drop site to your yard">
      <div className="lp-panel-title">What are you hauling?</div>
      <div className="lp-seg">
        <span className="is-on"><Grain fontSize="small" /> Chips</span>
        <span><Forest fontSize="small" /> Logs</span>
        <span><Layers fontSize="small" /> Both</span>
      </div>

      <div className="lp-route">
        <div className="lp-route-stop">
          <span className="lp-route-dot lp-route-dot--start" />
          <div><strong>You are here</strong><small>Current location</small></div>
        </div>
        <div className="lp-route-leg">3.2 mi</div>
        <div className="lp-route-stop">
          <span className="lp-route-dot lp-route-dot--chips"><Grain fontSize="inherit" /></span>
          <div><strong>Fenton Ave. drop site</strong><small>Accepts chips · photo on file</small></div>
        </div>
        <div className="lp-route-leg">4.8 mi</div>
        <div className="lp-route-stop">
          <span className="lp-route-dot lp-route-dot--yard"><HomeOutlined fontSize="inherit" /></span>
          <div><strong>Main yard</strong><small>Your facility</small></div>
        </div>
      </div>

      <div className="lp-route-total">
        <div><small>Total trip</small><strong>8.0 mi</strong></div>
        <span className="lp-btn lp-btn--primary lp-btn--sm"><DirectionsOutlined fontSize="small" /> Start route</span>
      </div>
    </div>
  );
}

function DropSitesMockup() {
  const rows = [
    { tone: "brand", icon: <HomeOutlined fontSize="small" />, name: "Main yard", sub: "Your facility · Putnam Valley", tag: "Yours", tagTone: "brand", dist: "—" },
    { tone: "chips", icon: <Grain fontSize="small" />, name: "Fenton Ave.", sub: "Your drop site · accepts chips", tag: "Yours", tagTone: "brand", dist: "3.2 mi" },
    { tone: "wood", icon: <Layers fontSize="small" />, name: "Hillcrest Gardens", sub: "Customer drop site · chips & logs", tag: "Customer", tagTone: "work", dist: "4.1 mi" },
    { tone: "chips", icon: <Grain fontSize="small" />, name: "Oak Lane", sub: "Customer drop site · accepts chips", tag: "Customer", tagTone: "work", dist: "5.8 mi" },
  ];
  return (
    <div className="lp-panel" role="img" aria-label="Example list of your drop sites and customers’ drop sites">
      <div className="lp-panel-head">
        <div>
          <strong>Sites on your map</strong>
          <small>Yours and your customers’</small>
        </div>
        <span className="lp-btn lp-btn--primary lp-btn--xs"><AddLocationAltOutlined fontSize="inherit" /> Add site</span>
      </div>
      <div className="lp-seg">
        <span className="is-on">All</span>
        <span><Grain fontSize="small" /> Chips</span>
        <span><Forest fontSize="small" /> Logs</span>
      </div>
      <ul className="lp-sites">
        {rows.map((r) => (
          <li key={r.name}>
            <Tile tone={r.tone}>{r.icon}</Tile>
            <div>
              <strong>{r.name}</strong>
              <small>{r.sub}</small>
            </div>
            <div className="lp-site-meta">
              <span className={`lp-pill lp-pill--${r.tagTone === "brand" ? "chips" : "work"}`}>{r.tag}</span>
              <small>{r.dist}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChatMockup() {
  return (
    <div className="lp-panel" role="img" aria-label="Example chat between a customer and a tree crew, with a new offer alert">
      <div className="lp-toast">
        <Tile tone="open"><NotificationsActiveOutlined fontSize="small" /></Tile>
        <div>
          <strong>New offer from Oak &amp; Timber</strong>
          <small>$80 · 5 yd of chips · just now</small>
        </div>
      </div>
      <div className="lp-chat">
        <p className="lp-bubble lp-bubble--them">Hi! We’re clearing a lot two streets over. Can we drop the chips Thursday?</p>
        <p className="lp-bubble lp-bubble--me">Thursday works. Gate’s on the left of the driveway.</p>
        <p className="lp-bubble lp-bubble--them">Perfect — see you then.</p>
      </div>
      <div className="lp-privacy"><LockOutlined fontSize="small" /> Your contact details are only shared with crews you book.</div>
    </div>
  );
}

/* ---------------------------------------------------------------- page */

function AudienceTabs({ audience, onChange }: { audience: Audience; onChange: (a: Audience) => void }) {
  const refs = useRef<Record<Audience, HTMLButtonElement | null>>({ companies: null, customers: null });

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = TABS.findIndex((t) => t.id === audience);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    onChange(TABS[next].id);
    refs.current[TABS[next].id]?.focus();
  };

  return (
    <div className="lp-tabs" role="tablist" aria-label="Choose your view" onKeyDown={onKeyDown}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => { refs.current[tab.id] = el; }}
          role="tab"
          type="button"
          id={`tab-${tab.id}`}
          aria-selected={audience === tab.id}
          aria-controls="lp-panel"
          tabIndex={audience === tab.id ? 0 : -1}
          className={audience === tab.id ? "is-active" : ""}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const { appUrl } = useLanding();
  const [audience, setAudience] = useState<Audience>(audienceFromUrl);
  const root = useReveal(audience);
  const content = CONTENT[audience];
  const companies = audience === "companies";

  const choose = useCallback((next: Audience) => {
    setAudience(next);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("for", next);
      window.history.replaceState(window.history.state, "", url);
    } catch {
      /* ignore */
    }
  }, []);

  const other: Audience = companies ? "customers" : "companies";

  return (
    <div className="lp" ref={root}>
      <a className="lp-skip" href="#main">Skip to content</a>
      <SiteNav onHome tabs={<AudienceTabs audience={audience} onChange={choose} />} />

      <main id="main" role="tabpanel" aria-labelledby={`tab-${audience}`}>
        <div id="lp-panel" key={audience} className="lp-view">
          {/* ---------- Hero ---------- */}
          <section className="lp-hero">
            <div className="lp-hero-glow" aria-hidden="true" />
            <div className="lp-container lp-hero-grid">
              <div className="lp-hero-copy">
                <span className="lp-eyebrow">{content.eyebrow.icon} {content.eyebrow.text}</span>
                <h1>{content.title}</h1>
                <p className="lp-lead">{content.lead}</p>
                <div className="lp-cta-row">
                  <a className="lp-btn lp-btn--primary lp-btn--lg" href={appUrl}>
                    {companies ? "Open Chip Sync" : "Post a request"} <ArrowForward fontSize="small" />
                  </a>
                  <SiteLink page="home" hash="how" className="lp-btn lp-btn--ghost lp-btn--lg">
                    See how it works
                  </SiteLink>
                </div>
                <ul className="lp-hero-notes">
                  {content.notes.map((n) => (
                    <li key={n}><CheckIcon fontSize="inherit" /> {n}</li>
                  ))}
                </ul>
              </div>
              <div className="lp-hero-visual">
                <MapMockup audience={audience} />
              </div>
            </div>
          </section>

          {/* ---------- Strip ---------- */}
          <section className="lp-strip" aria-label="Highlights">
            <div className="lp-container lp-strip-inner">
              {content.strip.map((s) => (
                <span key={s.label} className={`lp-pill lp-pill--${s.tone === "brand" ? "chips" : s.tone} lp-pill--lg`}>
                  {s.icon} {s.label}
                </span>
              ))}
            </div>
          </section>

          {/* ---------- Features ---------- */}
          <section className="lp-section" id="features">
            <div className="lp-container">
              <header className="lp-section-head lp-reveal">
                <span className="lp-kicker">{content.featuresHead.kicker}</span>
                <h2>{content.featuresHead.title}</h2>
                <p>{content.featuresHead.text}</p>
              </header>
              <div className="lp-feature-grid">
                {content.features.map((f, i) => (
                  <article className="lp-feature lp-reveal" key={f.title} style={{ transitionDelay: `${(i % 4) * 60}ms` }}>
                    <Tile tone={f.tone}>{f.icon}</Tile>
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ---------- How it works ---------- */}
          <section className="lp-section lp-section--tint" id="how">
            <div className="lp-container">
              <header className="lp-section-head lp-reveal">
                <span className="lp-kicker">How it works</span>
                <h2>{content.stepsTitle}</h2>
              </header>
              <ol className="lp-steps">
                {content.steps.map((s, i) => (
                  <li className="lp-step lp-reveal" key={s.title} style={{ transitionDelay: `${i * 80}ms` }}>
                    <span className="lp-step-num">{i + 1}</span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ---------- Showcases ---------- */}
          <section className="lp-section">
            <div className="lp-container lp-showcase">
              {companies ? (
                <>
                  <div className="lp-showcase-row">
                    <div className="lp-showcase-copy lp-reveal">
                      <span className="lp-kicker">Drop sites</span>
                      <h2>Your sites and your customers’, on one map.</h2>
                      <p>
                        Create and track your own drop sites and facilities, then see the places customers have opened up
                        for chips and logs. Filter by material and find a home for the load in seconds.
                      </p>
                      <ul className="lp-checks">
                        <li><CheckIcon fontSize="inherit" /> Pin the exact spot, add photos and details</li>
                        <li><CheckIcon fontSize="inherit" /> Edit, move or delete a site any time</li>
                        <li><CheckIcon fontSize="inherit" /> Customers’ drop sites appear next to yours</li>
                      </ul>
                    </div>
                    <div className="lp-reveal"><DropSitesMockup /></div>
                  </div>

                  <div className="lp-showcase-row lp-showcase-row--flip">
                    <div className="lp-showcase-copy lp-reveal">
                      <span className="lp-kicker">Route planner</span>
                      <h2>The shortest way home, with a drop on the way.</h2>
                      <p>
                        Choose chips, logs or both and Chip Sync picks the drop site that minimises your <em>whole</em> trip
                        to the yard — not just the one nearest to you. Then hand it off to your maps app.
                      </p>
                      <ul className="lp-checks">
                        <li><CheckIcon fontSize="inherit" /> Only suggests sites that accept your material</li>
                        <li><CheckIcon fontSize="inherit" /> Multiple facilities? Compare routes to each</li>
                        <li><CheckIcon fontSize="inherit" /> Opens in your maps app for turn-by-turn directions</li>
                      </ul>
                    </div>
                    <div className="lp-reveal"><RouteMockup /></div>
                  </div>

                  <div className="lp-showcase-row">
                    <div className="lp-showcase-copy lp-reveal">
                      <span className="lp-kicker">Requests &amp; offers</span>
                      <h2>Fill your calendar with nearby work.</h2>
                      <p>
                        Customers post what they need; you answer with an offer. Fixed price, free, or confirmed after a
                        site visit — with quantities and an available date so they can say yes quickly.
                      </p>
                      <ul className="lp-checks">
                        <li><CheckIcon fontSize="inherit" /> Chips, logs, removal, trimming and stump grinding</li>
                        <li><CheckIcon fontSize="inherit" /> Chat with the customer before you commit</li>
                        <li><CheckIcon fontSize="inherit" /> Turn an accepted offer into a crew job</li>
                      </ul>
                    </div>
                    <div className="lp-reveal"><CrewOfferMockup /></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="lp-showcase-row">
                    <div className="lp-showcase-copy lp-reveal">
                      <span className="lp-kicker">Requests &amp; offers</span>
                      <h2>Request wood chips, logs or tree work.</h2>
                      <p>
                        Describe what you need and nearby crews respond with offers you can read at a glance — price,
                        quantity and when they can deliver. Then accept the one that fits.
                      </p>
                      <ul className="lp-checks">
                        <li><CheckIcon fontSize="inherit" /> Wood chips, logs, removal, trimming, stump grinding</li>
                        <li><CheckIcon fontSize="inherit" /> Fixed price, free, or confirmed after a site visit</li>
                        <li><CheckIcon fontSize="inherit" /> Edit your request whenever plans change</li>
                      </ul>
                    </div>
                    <div className="lp-reveal"><RequestMockup /></div>
                  </div>

                  <div className="lp-showcase-row lp-showcase-row--flip">
                    <div className="lp-showcase-copy lp-reveal">
                      <span className="lp-kicker">Chat &amp; alerts</span>
                      <h2>Talk it through. Hear about it first.</h2>
                      <p>
                        Message a crew before you commit and get alerted the moment an offer lands — in the app, by text
                        or by email. You choose what you hear about.
                      </p>
                      <ul className="lp-checks">
                        <li><CheckIcon fontSize="inherit" /> A conversation for every request</li>
                        <li><CheckIcon fontSize="inherit" /> Optional text and email notifications</li>
                        <li><CheckIcon fontSize="inherit" /> Contact details shared only with crews you book</li>
                      </ul>
                    </div>
                    <div className="lp-reveal"><ChatMockup /></div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ---------- Extras ---------- */}
          <section className="lp-section lp-section--tint">
            <div className="lp-container">
              <div className="lp-extras">
                <div className="lp-extra lp-reveal">
                  <Tile tone="brand"><AddLocationAltOutlined /></Tile>
                  <h3>Pin placement</h3>
                  <p>Drop the pin right on the gate or the pile, not just the nearest address.</p>
                </div>
                <div className="lp-extra lp-reveal">
                  <Tile tone="work"><PhotoCameraOutlined /></Tile>
                  <h3>Photos on locations</h3>
                  <p>Show crews exactly where to unload, and keep the map current.</p>
                </div>
                <div className="lp-extra lp-reveal">
                  <Tile tone="open"><SmartphoneOutlined /></Tile>
                  <h3>Phone-first</h3>
                  <p>Safe-area aware layouts and a bottom dock built for one-handed use.</p>
                </div>
                <div className="lp-extra lp-reveal">
                  <Tile tone="chips"><DarkModeOutlined /></Tile>
                  <h3>Light &amp; dark</h3>
                  <p>Easy on the eyes at 6 a.m. or after sunset. Follows your device.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- FAQ ---------- */}
          <section className="lp-section" id="faq">
            <div className="lp-container lp-faq-wrap">
              <header className="lp-section-head lp-reveal">
                <span className="lp-kicker">FAQ</span>
                <h2>Good questions</h2>
              </header>
              <div className="lp-faq lp-reveal">
                {content.faq.map((item) => (
                  <details key={item.q}>
                    <summary>{item.q}</summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ---------- Final CTA ---------- */}
          <section className="lp-final">
            <div className="lp-container lp-final-inner lp-reveal">
              <Forest className="lp-final-ghost" aria-hidden="true" />
              <h2>{content.final.title}</h2>
              <p>{content.final.text}</p>
              <a className="lp-btn lp-btn--light lp-btn--lg" href={appUrl}>
                {companies ? "Open Chip Sync" : "Post a request"} <ArrowForward fontSize="small" />
              </a>
              <button type="button" className="lp-final-switch" onClick={() => { choose(other); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                {companies ? "Looking for chips or tree work? See For Customers" : "Run a tree company? See For Tree Companies"} →
              </button>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
