import { generateClient } from "aws-amplify/api";
import {
  Job,
  JobAssignment,
  JobLocation,
  JobLocationRole,
  JobStatus,
  LocationAssignment,
  Marker,
  MaterialType,
  RoutingPlan,
  User,
} from "../types/dataTypes";
import * as Q from "../graphql/jobs";
import { Geo } from "./location";
import {
  isDropSite,
  isFacility,
  isJobSite,
  materialFilterFromProduces,
  matchesMaterialFilter,
  markerKind,
} from "./markers";

const client = generateClient();
const PAGE = 200;
const MAX_PAGES = 10;
const NEAREST_DROPS = 5;

export interface JobAssigneeInput {
  userId: string;
  jobSiteMarkerId?: string | null;
}

export interface CreateJobInput {
  name: string;
  notes: string;
  produces: MaterialType[];
  status?: JobStatus;
  startDate?: string | null;
  endDate?: string | null;
  facilityMarkerIds: string[];
  jobSiteMarkerIds: string[];
  assignees: JobAssigneeInput[];
}

export interface JobBundle {
  job: Job;
  locations: JobLocation[];
  assignments: JobAssignment[];
  routingPlans: RoutingPlan[];
}

async function gql<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const res: any = await client.graphql({ query, variables });
  return res.data;
}

async function listAll<T>(query: string, field: string, variables: Record<string, any>): Promise<T[]> {
  const items: T[] = [];
  let nextToken: string | null | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await gql(query, { ...variables, limit: PAGE, nextToken });
    const result = data[field];
    items.push(...(result?.items ?? []).filter(Boolean));
    nextToken = result?.nextToken;
    if (!nextToken) break;
  }
  return items;
}

function toJob(raw: any): Job {
  return {
    ...raw,
    produces: (raw.produces ?? []).filter(Boolean) as MaterialType[],
    status: raw.status as JobStatus,
  };
}

function toRoutingPlan(raw: any): RoutingPlan {
  return {
    ...raw,
    dropSiteMarkerIds: (raw.dropSiteMarkerIds ?? []).filter(Boolean),
    materialFilter: raw.materialFilter as MaterialType,
  };
}

/** Pure: nearest drop sites from a point matching material filter. */
export function nearestDropSites({
  from,
  markers,
  filter,
  limit = NEAREST_DROPS,
}: {
  from: { latitude: number; longitude: number };
  markers: Marker[];
  filter: MaterialType;
  limit?: number;
}): Marker[] {
  return markers
    .filter((marker) => isDropSite(marker) && matchesMaterialFilter(marker.type, filter))
    .map((marker) => ({
      ...marker,
      distance: Geo.distance(marker, from),
    }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    .slice(0, limit);
}

/**
 * Resolve facility + job site + drop sites for one assignee.
 * Prefer the member's attached facility, then a job-linked facility.
 */
export function buildRoutingStops({
  assigneeUserId,
  jobSiteMarkerId,
  facilityMarkers,
  jobSiteMarkers,
  dropMarkers,
  locationAssignments,
  materialFilter,
}: {
  assigneeUserId: string;
  jobSiteMarkerId?: string | null;
  facilityMarkers: Marker[];
  jobSiteMarkers: Marker[];
  dropMarkers: Marker[];
  locationAssignments: LocationAssignment[];
  materialFilter: MaterialType;
}): {
  facilityMarkerId: string | null;
  jobSiteMarkerId: string | null;
  dropSiteMarkerIds: string[];
  materialFilter: MaterialType;
} {
  const attachedMarkerIds = new Set(
    locationAssignments.filter((a) => a.userId === assigneeUserId).map((a) => a.markerId),
  );

  const facility =
    facilityMarkers.find((m) => attachedMarkerIds.has(m.id)) ?? facilityMarkers[0] ?? null;

  const jobSite =
    (jobSiteMarkerId ? jobSiteMarkers.find((m) => m.id === jobSiteMarkerId) : undefined) ??
    jobSiteMarkers.find((m) => attachedMarkerIds.has(m.id)) ??
    jobSiteMarkers[0] ??
    null;

  const anchor = jobSite ?? facility;
  const drops = anchor
    ? nearestDropSites({ from: anchor, markers: dropMarkers, filter: materialFilter })
    : [];

  return {
    facilityMarkerId: facility?.id ?? null,
    jobSiteMarkerId: jobSite?.id ?? null,
    dropSiteMarkerIds: drops.map((d) => d.id),
    materialFilter,
  };
}

export const JobsAPI = {
  async listJobs(organizationId: string): Promise<Job[]> {
    const items = await listAll<any>(Q.jobsByOrganization, "jobsByOrganization", { organizationId });
    return items.map(toJob);
  },

  async getJobBundle(jobId: string): Promise<JobBundle | null> {
    const data = await gql(Q.getJob, { id: jobId });
    if (!data.getJob) return null;
    const [locations, assignments, routingPlans] = await Promise.all([
      listAll<JobLocation>(Q.jobLocationsByJob, "jobLocationsByJob", { jobId }),
      listAll<JobAssignment>(Q.jobAssignmentsByJob, "jobAssignmentsByJob", { jobId }),
      listAll<any>(Q.routingPlansByJob, "routingPlansByJob", { jobId }),
    ]);
    return {
      job: toJob(data.getJob),
      locations,
      assignments,
      routingPlans: routingPlans.map(toRoutingPlan),
    };
  },

  async updateJobStatus(jobId: string, status: JobStatus): Promise<Job> {
    const data = await gql(Q.updateJob, { input: { id: jobId, status } });
    return toJob(data.updateJob);
  },

  async listLocationAssignmentsForMarker(markerId: string): Promise<LocationAssignment[]> {
    return listAll(Q.locationAssignmentsByMarker, "locationAssignmentsByMarker", { markerId });
  },

  async listLocationAssignmentsForOrg(organizationId: string): Promise<LocationAssignment[]> {
    return listAll(Q.locationAssignmentsByOrganization, "locationAssignmentsByOrganization", {
      organizationId,
    });
  },

  async setLocationMembers({
    organizationId,
    markerId,
    userIds,
  }: {
    organizationId: string;
    markerId: string;
    userIds: string[];
  }): Promise<LocationAssignment[]> {
    const existing = await this.listLocationAssignmentsForMarker(markerId);
    const wanted = new Set(userIds);
    const keep = existing.filter((a) => wanted.has(a.userId));
    const keepIds = new Set(keep.map((a) => a.userId));
    await Promise.all(
      existing
        .filter((a) => !wanted.has(a.userId))
        .map((a) => gql(Q.deleteLocationAssignment, { input: { id: a.id } })),
    );
    const created = await Promise.all(
      userIds
        .filter((userId) => !keepIds.has(userId))
        .map(async (userId) => {
          const data = await gql(Q.createLocationAssignment, {
            input: {
              organizationId,
              markerId,
              userId,
              createdAt: new Date().toISOString(),
            },
          });
          return data.createLocationAssignment as LocationAssignment;
        }),
    );
    return [...keep, ...created];
  },

  async createJob(userData: User, input: CreateJobInput): Promise<JobBundle> {
    const organizationId = userData.organization.id;
    const now = new Date().toISOString();
    const produces = input.produces.length ? input.produces : (["both"] as MaterialType[]);
    const materialFilter = materialFilterFromProduces(produces);

    const created = await gql(Q.createJob, {
      input: {
        organizationId,
        name: input.name.trim(),
        status: input.status ?? "planned",
        produces,
        notes: input.notes.trim() || null,
        startDate: input.startDate || null,
        endDate: input.endDate || null,
        createdById: userData.id,
        createdAt: now,
      },
    });
    const job = toJob(created.createJob);

    const linkLocation = async (markerId: string, role: JobLocationRole) => {
      const data = await gql(Q.createJobLocation, {
        input: { jobId: job.id, markerId, organizationId, role },
      });
      return data.createJobLocation as JobLocation;
    };

    const locations = (
      await Promise.all([
        ...input.facilityMarkerIds.map((id) => linkLocation(id, "facility")),
        ...input.jobSiteMarkerIds.map((id) => linkLocation(id, "jobSite")),
      ])
    ).filter(Boolean);

    const assignments = await Promise.all(
      input.assignees.map(async ({ userId, jobSiteMarkerId }) => {
        const data = await gql(Q.createJobAssignment, {
          input: {
            jobId: job.id,
            userId,
            organizationId,
            jobSiteMarkerId: jobSiteMarkerId || null,
            createdAt: now,
          },
        });
        return data.createJobAssignment as JobAssignment;
      }),
    );

    const markers = userData.organization.markers.map((m) => ({
      ...m,
      kind: markerKind(m),
    }));
    const facilityMarkers = markers.filter(
      (m) => isFacility(m) && input.facilityMarkerIds.includes(m.id),
    );
    const jobSiteMarkers = markers.filter(
      (m) => isJobSite(m) && input.jobSiteMarkerIds.includes(m.id),
    );
    const dropMarkers = markers.filter(isDropSite);

    let locationAssignments: LocationAssignment[] = [];
    try {
      locationAssignments = await this.listLocationAssignmentsForOrg(organizationId);
    } catch (error) {
      console.warn("Could not load location assignments for routing", error);
    }

    const routingPlans = await Promise.all(
      assignments.map(async (assignment) => {
        const stops = buildRoutingStops({
          assigneeUserId: assignment.userId,
          jobSiteMarkerId: assignment.jobSiteMarkerId,
          facilityMarkers,
          jobSiteMarkers,
          dropMarkers,
          locationAssignments,
          materialFilter,
        });
        const data = await gql(Q.createRoutingPlan, {
          input: {
            jobId: job.id,
            userId: assignment.userId,
            organizationId,
            facilityMarkerId: stops.facilityMarkerId,
            jobSiteMarkerId: stops.jobSiteMarkerId,
            dropSiteMarkerIds: stops.dropSiteMarkerIds,
            materialFilter: stops.materialFilter,
            createdAt: now,
          },
        });
        return toRoutingPlan(data.createRoutingPlan);
      }),
    );

    return { job, locations, assignments, routingPlans };
  },
};
