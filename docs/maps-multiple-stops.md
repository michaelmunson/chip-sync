Yes, you can pre-populate a route with multiple stops in Google Maps using a URL. There are two main methods: the official **Google Maps Universal URL parameter format** and the **slash-delimited path format**.

---

### Method 1: Official Maps URL (`waypoints` parameter)

Google's universal cross-platform format works reliably on web browsers, iOS, and Android.

* **Base URL:** `[https://www.google.com/maps/dir/?api=1](https://www.google.com/maps/dir/?api=1)`
* **`origin`**: The starting location (address, landmark, or `lat,lng`). If omitted, it defaults to the user's current GPS location.
* **`destination`**: The final stopping point.
* **`waypoints`**: Intermediate stops separated by a pipe character (`|`), URL-encoded as `%7C`.

#### Example

Route starting in Boston, stopping in Hartford and New Haven, ending in New York City:

```text
https://www.google.com/maps/dir/?api=1&origin=Boston,MA&destination=New+York,NY&waypoints=Hartford,CT%7CNew+Haven,CT

```

*Optional parameter:* Add `&travelmode=driving` (or `walking`, `bicycling`, `transit`) to enforce the travel mode.

---

### Method 2: Slash-Delimited Path Format

This is the compact format Google Maps generates when you share a directions link from a desktop browser. Each stop is appended sequentially with a forward slash `/`.

#### Structure

```text
https://www.google.com/maps/dir/Origin/Stop1/Stop2/Stop3/FinalDestination

```

#### Example

```text
https://www.google.com/maps/dir/Seattle,+WA/Portland,+OR/Eugene,+OR/Sacramento,+CA/San+Francisco,+CA

```

*Tip:* If you want the first stop to default to the user's live location in this format, leave the origin empty with two consecutive slashes:

```text
https://www.google.com/maps/dir//Portland,+OR/Eugene,+OR/San+Francisco,+CA

```

---

### Key Limitations & Tips

* **Stop Limits:** The standard Google Maps consumer interface caps routes at **10 points total** (1 origin + 8 intermediate stops + 1 destination).
* **URL Encoding:** Always replace spaces with `+` or `%20`, commas with `%2C`, and pipes with `%7C` to prevent broken links across different messaging apps and platforms.
* **Exact Coordinates:** If addresses are ambiguous, you can pass raw coordinates (e.g., `40.7128,-74.0060`) directly in place of address text.




Apple Maps supports multi-stop directions links via Apple's official **Unified Maps URL** specification.

---

### The Unified Apple Maps Directions Format

* **Base URL:** `[https://maps.apple.com/directions](https://maps.apple.com/directions)`
* **`destination`**: The final destination (an address, business name, or `lat,lng` pair).
* **`origin`**: *(Optional)* The starting point. If omitted, Apple Maps defaults to the user's current GPS location.
* **`waypoint`**: Intermediate stops between the origin and destination. For multiple stops, **repeat the `waypoint` query parameter** sequentially for each stop.

#### Example

A route starting in Boston, stopping in Hartford and New Haven, ending in New York City:

```text
https://maps.apple.com/directions?origin=Boston,MA&destination=New+York,NY&waypoint=Hartford,CT&waypoint=New+Haven,CT

```

To have it start from the user's current location instead, omit the `origin`:

```text
https://maps.apple.com/directions?destination=New+York,NY&waypoint=Hartford,CT&waypoint=New+Haven,CT

```

---

### Useful Optional Parameters

| Parameter | Values / Description |
| --- | --- |
| `transport` | `driving`, `walking`, `transit`, `cycling` |
| `avoid` | Comma-delimited list: `tolls`, `highways`, `busy-roads`, `stairs` |
| `start` | Delay in seconds before immediately launching turn-by-turn navigation (e.g., `start=0`) |

#### Example with Modes and Avoidances

```text
https://maps.apple.com/directions?destination=New+York,NY&waypoint=Hartford,CT&waypoint=New+Haven,CT&transport=driving&avoid=tolls

```

---

### Differences from Google Maps

* **Repeated Keys vs. Pipes:** Google uses a single `waypoints=A|B` parameter, whereas Apple Maps requires repeated keys (`&waypoint=A&waypoint=B`).
* **Legacy Parameter Note:** The legacy Apple Maps scheme (`maps://?saddr=...&daddr=...`) does **not** support intermediate stops—only point-to-point routes. You must use the `[https://maps.apple.com/directions](https://maps.apple.com/directions)` path structure.
* **Stop Capacity:** Apple Maps natively supports up to **14 intermediate stops** (15 stops total including the destination).
