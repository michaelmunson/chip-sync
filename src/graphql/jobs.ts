/* Hand-written operations for crew Jobs, location assignments, and routing plans. */

const LOCATION_ASSIGNMENT_FIELDS = `
  id
  organizationId
  markerId
  userId
  note
  createdAt
  updatedAt
`;

const JOB_FIELDS = `
  id
  organizationId
  name
  status
  produces
  notes
  startDate
  endDate
  createdById
  createdAt
  updatedAt
`;

const JOB_LOCATION_FIELDS = `
  id
  jobId
  markerId
  organizationId
  role
  createdAt
  updatedAt
`;

const JOB_ASSIGNMENT_FIELDS = `
  id
  jobId
  userId
  organizationId
  jobSiteMarkerId
  createdAt
  updatedAt
`;

const ROUTING_PLAN_FIELDS = `
  id
  jobId
  userId
  organizationId
  facilityMarkerId
  jobSiteMarkerId
  dropSiteMarkerIds
  materialFilter
  createdAt
  updatedAt
`;

/* ---------- Location assignments ---------- */
export const locationAssignmentsByMarker = /* GraphQL */ `
  query LocationAssignmentsByMarker($markerId: ID!, $limit: Int, $nextToken: String) {
    locationAssignmentsByMarker(markerId: $markerId, limit: $limit, nextToken: $nextToken) {
      items { ${LOCATION_ASSIGNMENT_FIELDS} }
      nextToken
    }
  }
`;
export const locationAssignmentsByUser = /* GraphQL */ `
  query LocationAssignmentsByUser($userId: ID!, $limit: Int, $nextToken: String) {
    locationAssignmentsByUser(userId: $userId, limit: $limit, nextToken: $nextToken) {
      items { ${LOCATION_ASSIGNMENT_FIELDS} }
      nextToken
    }
  }
`;
export const locationAssignmentsByOrganization = /* GraphQL */ `
  query LocationAssignmentsByOrganization($organizationId: ID!, $limit: Int, $nextToken: String) {
    locationAssignmentsByOrganization(organizationId: $organizationId, limit: $limit, nextToken: $nextToken) {
      items { ${LOCATION_ASSIGNMENT_FIELDS} }
      nextToken
    }
  }
`;
export const createLocationAssignment = /* GraphQL */ `
  mutation CreateLocationAssignment($input: CreateLocationAssignmentInput!) {
    createLocationAssignment(input: $input) { ${LOCATION_ASSIGNMENT_FIELDS} }
  }
`;
export const deleteLocationAssignment = /* GraphQL */ `
  mutation DeleteLocationAssignment($input: DeleteLocationAssignmentInput!) {
    deleteLocationAssignment(input: $input) { id }
  }
`;

/* ---------- Jobs ---------- */
export const getJob = /* GraphQL */ `
  query GetJob($id: ID!) {
    getJob(id: $id) { ${JOB_FIELDS} }
  }
`;
export const jobsByOrganization = /* GraphQL */ `
  query JobsByOrganization($organizationId: ID!, $limit: Int, $nextToken: String) {
    jobsByOrganization(organizationId: $organizationId, sortDirection: DESC, limit: $limit, nextToken: $nextToken) {
      items { ${JOB_FIELDS} }
      nextToken
    }
  }
`;
export const createJob = /* GraphQL */ `
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) { ${JOB_FIELDS} }
  }
`;
export const updateJob = /* GraphQL */ `
  mutation UpdateJob($input: UpdateJobInput!) {
    updateJob(input: $input) { ${JOB_FIELDS} }
  }
`;

/* ---------- Job locations ---------- */
export const jobLocationsByJob = /* GraphQL */ `
  query JobLocationsByJob($jobId: ID!, $limit: Int, $nextToken: String) {
    jobLocationsByJob(jobId: $jobId, limit: $limit, nextToken: $nextToken) {
      items { ${JOB_LOCATION_FIELDS} }
      nextToken
    }
  }
`;
export const createJobLocation = /* GraphQL */ `
  mutation CreateJobLocation($input: CreateJobLocationInput!) {
    createJobLocation(input: $input) { ${JOB_LOCATION_FIELDS} }
  }
`;
export const deleteJobLocation = /* GraphQL */ `
  mutation DeleteJobLocation($input: DeleteJobLocationInput!) {
    deleteJobLocation(input: $input) { id }
  }
`;

/* ---------- Job assignments ---------- */
export const jobAssignmentsByJob = /* GraphQL */ `
  query JobAssignmentsByJob($jobId: ID!, $limit: Int, $nextToken: String) {
    jobAssignmentsByJob(jobId: $jobId, limit: $limit, nextToken: $nextToken) {
      items { ${JOB_ASSIGNMENT_FIELDS} }
      nextToken
    }
  }
`;
export const createJobAssignment = /* GraphQL */ `
  mutation CreateJobAssignment($input: CreateJobAssignmentInput!) {
    createJobAssignment(input: $input) { ${JOB_ASSIGNMENT_FIELDS} }
  }
`;
export const deleteJobAssignment = /* GraphQL */ `
  mutation DeleteJobAssignment($input: DeleteJobAssignmentInput!) {
    deleteJobAssignment(input: $input) { id }
  }
`;

/* ---------- Routing plans ---------- */
export const routingPlansByJob = /* GraphQL */ `
  query RoutingPlansByJob($jobId: ID!, $limit: Int, $nextToken: String) {
    routingPlansByJob(jobId: $jobId, limit: $limit, nextToken: $nextToken) {
      items { ${ROUTING_PLAN_FIELDS} }
      nextToken
    }
  }
`;
export const routingPlansByUser = /* GraphQL */ `
  query RoutingPlansByUser($userId: ID!, $limit: Int, $nextToken: String) {
    routingPlansByUser(userId: $userId, limit: $limit, nextToken: $nextToken) {
      items { ${ROUTING_PLAN_FIELDS} }
      nextToken
    }
  }
`;
export const createRoutingPlan = /* GraphQL */ `
  mutation CreateRoutingPlan($input: CreateRoutingPlanInput!) {
    createRoutingPlan(input: $input) { ${ROUTING_PLAN_FIELDS} }
  }
`;
