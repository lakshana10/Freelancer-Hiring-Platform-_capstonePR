import { api } from "./client";

export const otpApi = {
  // POST /api/otp/generate -> { message } (JSON)
  generate: (email) => api.post("/api/otp/generate", { email }),
  // POST /api/otp/verify -> plain text
  verify: (email, otp) =>
    api.post("/api/otp/verify", { email, otp }, { responseType: "text" }),
};

export const authApi = {
  // POST /api/users/signup -> UserResponse (201)
  signup: (payload) => api.post("/api/users/signup", payload),
  // POST /api/users/login -> { message, token, user }
  login: (payload) => api.post("/api/users/login", payload),
};

export const usersApi = {
  // GET /api/users (public directory, no passwords)
  list: () => api.get("/api/users"),
  // PUT /api/users/{email}
  update: (email, payload) =>
    api.put(`/api/users/${encodeURIComponent(email)}`, payload),
};

export const jobsApi = {
  // POST /api/jobs (CLIENT, ADMIN)
  create: (payload) => api.post("/api/jobs", payload),
  // GET /api/jobs (public)
  list: () => api.get("/api/jobs"),
  // GET /api/jobs/{id} (public)
  get: (id) => api.get(`/api/jobs/${id}`),
  // PUT /api/jobs/{id} (CLIENT, ADMIN)
  update: (id, payload) => api.put(`/api/jobs/${id}`, payload),
  // DELETE /api/jobs/{id} (CLIENT, ADMIN)
  remove: (id) => api.delete(`/api/jobs/${id}`),
};

// NOTE: no /api prefix on this controller (backend quirk, kept as-is).
export const applicationsApi = {
  // POST /applications/apply (FREELANCER, ADMIN)
  apply: (payload) => api.post("/applications/apply", payload),
  // GET /applications
  list: () => api.get("/applications"),
  // GET /applications/freelancer/{email}
  byFreelancer: (email) =>
    api.get(`/applications/freelancer/${encodeURIComponent(email)}`),
  // PUT /applications/{id}/status?status= (CLIENT, ADMIN)
  setStatus: (id, status) =>
    api.put(
      `/applications/${id}/status?status=${encodeURIComponent(status)}`,
    ),
};

export const contractsApi = {
  // POST /api/contracts (CLIENT, ADMIN)
  create: (payload) => api.post("/api/contracts", payload),
  // GET /api/contracts
  list: () => api.get("/api/contracts"),
  // GET /api/contracts/client/{email}
  byClient: (email) =>
    api.get(`/api/contracts/client/${encodeURIComponent(email)}`),
  // GET /api/contracts/freelancer/{email}
  byFreelancer: (email) =>
    api.get(`/api/contracts/freelancer/${encodeURIComponent(email)}`),
};

export const milestonesApi = {
  // POST /api/milestones (CLIENT, ADMIN)
  create: (payload) => api.post("/api/milestones", payload),
  // GET /api/milestones/contract/{contractId}
  byContract: (contractId) =>
    api.get(`/api/milestones/contract/${contractId}`),
  // PUT /api/milestones/{id}/submit (FREELANCER, ADMIN)
  submit: (id, submission) =>
    api.put(`/api/milestones/${id}/submit`, { submission }),
  // PUT /api/milestones/{id}/review?status= (CLIENT, ADMIN)
  review: (id, status) =>
    api.put(
      `/api/milestones/${id}/review?status=${encodeURIComponent(status)}`,
    ),
};

export const paymentsApi = {  // POST /api/payments (CLIENT, ADMIN)
  create: (payload) => api.post("/api/payments", payload),
  // GET /api/payments
  list: () => api.get("/api/payments"),
  // GET /api/payments/client/{email}
  byClient: (email) =>
    api.get(`/api/payments/client/${encodeURIComponent(email)}`),
  // GET /api/payments/freelancer/{email}
  byFreelancer: (email) =>
    api.get(`/api/payments/freelancer/${encodeURIComponent(email)}`),
  // GET /api/payments/contract/{contractId}
  byContract: (contractId) =>
    api.get(`/api/payments/contract/${contractId}`),
  // PUT /api/payments/{id}/status?status= (CLIENT, ADMIN)
  setStatus: (id, status) =>
    api.put(`/api/payments/${id}/status?status=${encodeURIComponent(status)}`),
};

export const messagesApi = {
  // POST /api/messages
  send: (payload) => api.post("/api/messages", payload),
  // GET /api/messages/conversation?senderEmail=&receiverEmail=
  conversation: (senderEmail, receiverEmail) =>
    api.get("/api/messages/conversation", {
      params: { senderEmail, receiverEmail },
    }),
  // GET /api/messages/job/{jobId} — project room history
  historyByJob: (jobId) => api.get(`/api/messages/job/${jobId}`),
  // GET /api/messages (ADMIN)
  list: () => api.get("/api/messages"),
  // PUT /api/messages/{id}/read
  markRead: (id) => api.put(`/api/messages/${id}/read`),
};

export const notificationsApi = {
  // POST /api/notifications
  create: (payload) => api.post("/api/notifications", payload),
  // GET /api/notifications/{email}
  byUser: (email) =>
    api.get(`/api/notifications/${encodeURIComponent(email)}`),
  // PUT /api/notifications/{id}/read
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
  // DELETE /api/notifications/{id}
  remove: (id) => api.delete(`/api/notifications/${id}`),
};

export const reviewsApi = {
  // POST /api/reviews
  create: (payload) => api.post("/api/reviews", payload),
  // GET /api/reviews
  list: () => api.get("/api/reviews"),
  // GET /api/reviews/freelancer/{email}
  byFreelancer: (email) =>
    api.get(`/api/reviews/freelancer/${encodeURIComponent(email)}`),
  // GET /api/reviews/client/{email}
  byClient: (email) =>
    api.get(`/api/reviews/client/${encodeURIComponent(email)}`),
  // GET /api/reviews/job/{jobId}
  byJob: (jobId) => api.get(`/api/reviews/job/${jobId}`),
};
