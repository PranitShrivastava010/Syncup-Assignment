export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  candidate: "/candidate",
  candidateJobs: "/candidate/jobs",
  candidateJob: (jobId: string) => `/candidate/jobs/${jobId}`,
  candidateApplications: "/candidate/applications",
  recruiter: "/recruiter",
  recruiterNewJob: "/recruiter/jobs/new",
  recruiterJob: (jobId: string) => `/recruiter/jobs/${jobId}`,
} as const;
