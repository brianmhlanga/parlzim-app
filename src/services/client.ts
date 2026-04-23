import { mockApi } from "./mock";
import {
  BillsQuery,
  BillsResult,
  CommitteesQuery,
  CommitteesResult,
  ConstituenciesQuery,
  ConstituenciesResult,
  EventsQuery,
  EventsResult,
  HansardsQuery,
  HansardsResult,
  MembersQuery,
  MembersResult,
  ParliamentDataService,
  VotesQuery,
  VotesResult,
} from "./types";
import { Bill, BillStatusDocument, ConstituencyProfile, HansardEntry, Member, MemberProfile, ParliamentEvent, VoteProceeding } from "../types/domain";
import { Committee, CommitteeDetail } from "../types/domain";

const HANSARD_API_URL = "https://e-portal.parlzim.gov.zw/api/hansard";
const MEMBERS_API_URL = "https://e-portal.parlzim.gov.zw/api/member";
const BILLS_API_URL = "https://e-portal.parlzim.gov.zw/api/bills";
const BILL_STATUS_DOCUMENTS_API_URL = "https://e-portal.parlzim.gov.zw/api/bill-status-documents";
const VOTES_API_URL = "https://e-portal.parlzim.gov.zw/api/vote";
const CONSTITUENCIES_API_URL = "https://e-portal.parlzim.gov.zw/api/constituency";
const COMMITTEES_API_URL = "https://e-portal.parlzim.gov.zw/api/committee";
const EVENTS_API_URL = "https://e-portal.parlzim.gov.zw/api/event";
const HANSARD_FALLBACK_COVER =
  "https://www.parlzim.gov.zw/wp-content/uploads/2025/05/ChatGPT-Image-May-2-2025-10_26_40-AM-min.png";
const MEMBERS_IMAGE_BASE_URL = "https://e-portal.parlzim.gov.zw/files/";

type ApiHansardItem = {
  id: number;
  title: string;
  abstract: string;
  parliamentSession: string;
  sittingDate: string;
  views: number;
  downloads: number;
  pdfPath: string;
  house: "NATIONAL_ASSEMBLY" | "SENATE";
  reference_number: string;
  volume: number;
  parliamentName: string;
  thumbnailPath: string | null;
  parl?: { number?: number | null };
};

type ApiHansardResponse = {
  hansards: ApiHansardItem[];
  success?: boolean;
  total?: number;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
    totalPages?: number;
  };
};

type ApiMemberItem = {
  id: number;
  fullName: string;
  email: string | null;
  contactNumber: string | null;
  image: string | null;
  house: "NATIONAL_ASSEMBLY" | "SENATE";
  gender: string | null;
  title: string | null;
  entryType: string | null;
  constituency: { name?: string | null } | null;
  party: { name?: string | null } | null;
  committeeMemberships?: Array<unknown>;
  parliamentMemberships?: Array<unknown>;
};

type ApiMembersResponse = {
  members: ApiMemberItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

type ApiMemberProfileResponse = {
  id: number;
  fullName: string;
  title: string | null;
  image: string | null;
  biography: string | null;
  house: "NATIONAL_ASSEMBLY" | "SENATE";
  contactNumber: string | null;
  email: string | null;
  dateOfBirth: string | null;
  placeOfBirth: string | null;
  maritalStatus: string | null;
  religion: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  entryType: string | null;
  constituency: { name?: string | null } | null;
  party: { name?: string | null } | null;
  committeeMemberships?: Array<{ committee?: { name?: string | null } | null }>;
  parliamentMemberships?: Array<{ parliament?: { number?: number | null } | null }>;
  education?: Array<{ institution?: string | null; qualification?: string | null }>;
  employment?: Array<{ institution?: string | null; position?: string | null }>;
};

type ApiBillItem = {
  id: number;
  title: string;
  ministry: string;
  billNumber: string | null;
  pdfUrl: string | null;
  dateAdded: string | null;
  createdAt: string;
};

type ApiBillsResponse = {
  success: boolean;
  data: ApiBillItem[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

type ApiBillStatusDocumentItem = {
  id: number;
  title: string;
  ministry: string;
  billNumber: string | null;
  status: string;
  statusDate: string | null;
  gazetteDate: string | null;
};

type ApiBillStatusDocumentsResponse = {
  success: boolean;
  data: ApiBillStatusDocumentItem[];
};

type ApiVoteItem = {
  id: number;
  name: string;
  pdfUrl: string | null;
  date: string | null;
  dateUploaded: string | null;
  house: "NATIONAL_ASSEMBLY" | "SENATE";
  session: string | null;
  parliament?: { number?: number | null } | null;
};

type ApiVotesResponse = {
  votes: ApiVoteItem[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
    totalPages?: number;
  };
};

type ApiConstituencyItem = {
  id: number;
  name: string;
  province: string;
  district: string | null;
  population: number | null;
  profilePdfPaths: string[] | null;
  _count?: { members?: number };
};

type ApiConstituenciesResponse = {
  constituencies: ApiConstituencyItem[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
    totalPages?: number;
  };
};

type ApiCommitteeMembership = {
  id: number;
  memberId: number;
  role: string | null;
  member?: {
    id: number;
    fullName: string;
    title: string | null;
    image: string | null;
    house: "NATIONAL_ASSEMBLY" | "SENATE";
    entryType: string | null;
    party?: { name?: string | null } | null;
  } | null;
};

type ApiCommitteeItem = {
  id: number;
  name: string;
  description: string;
  type: "PORTFOLIO" | "THEMATIC" | string;
  createdAt?: string;
  updatedAt?: string;
  memberships?: ApiCommitteeMembership[];
};

type ApiCommitteesResponse = {
  committees: ApiCommitteeItem[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
    totalPages?: number;
  };
};

type ApiEventItem = {
  id: number;
  title: string;
  description: string | null;
  date: string | null;
  location: string | null;
  house: "NATIONAL_ASSEMBLY" | "SENATE";
};

type ApiEventsResponse = {
  events: ApiEventItem[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
    totalPages?: number;
  };
};

function htmlToPlainText(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeQuarter(session: string): string {
  const clean = (session || "").trim().toUpperCase();
  if (!clean) return "Q1";
  if (clean.startsWith("Q")) return clean;
  if (/^\d+$/.test(clean)) return `Q${clean}`;
  return clean;
}

function mapHouseToChamber(house: ApiHansardItem["house"]): HansardEntry["chamber"] {
  return house === "SENATE" ? "Senate" : "National Assembly";
}

function mapMemberHouseToChamber(house: ApiMemberItem["house"]): Member["chamber"] {
  return house === "SENATE" ? "Senate" : "National Assembly";
}

function mapGenderToImageType(gender: string | null): Member["imageType"] {
  return (gender || "").toUpperCase() === "FEMALE" ? "female" : "male";
}

function getMemberDisplayName(item: Pick<ApiMemberItem, "title" | "fullName" | "entryType">): string {
  const rawTitle = item.title?.trim();
  const title =
    rawTitle && /^(honourable|honorable|hon)\.?$/i.test(rawTitle)
      ? "Hon."
      : rawTitle;
  const fullName = item.fullName?.trim() ?? "";
  if (!title) return fullName;
  if (!fullName) return title;

  const entryType = (item.entryType || "").toLowerCase();
  const titleLower = title.toLowerCase();
  if (entryType === "chief" || titleLower.startsWith("chief")) {
    // Some API rows send title as "CHIEF" and surname in fullName.
    // In those cases, combine them as "Chief Surname".
    if (/^chief\.?$/i.test(title)) {
      return `Chief ${fullName}`.trim();
    }
    // If title already contains the name (e.g. "Chief Mutasa"), keep it.
    if (titleLower.includes(fullName.toLowerCase())) return title;
    return `${title} ${fullName}`.trim();
  }

  if (titleLower.includes(fullName.toLowerCase())) return title;
  return `${title} ${fullName}`.trim();
}

function mapApiMember(item: ApiMemberItem): Member {
  const imageUrl = item.image ? `${MEMBERS_IMAGE_BASE_URL}${encodeURIComponent(item.image)}` : undefined;
  return {
    id: String(item.id),
    name: getMemberDisplayName(item),
    constituency: item.constituency?.name || item.entryType || "National List",
    chamber: mapMemberHouseToChamber(item.house),
    party: item.party?.name || "Independent",
    entryType: item.entryType || undefined,
    gender: item.gender || undefined,
    email: item.email || undefined,
    contactNumber: item.contactNumber || undefined,
    committeeCount: Array.isArray(item.committeeMemberships) ? item.committeeMemberships.length : 0,
    parliamentCount: Array.isArray(item.parliamentMemberships) ? item.parliamentMemberships.length : 0,
    imageType: mapGenderToImageType(item.gender),
    imageUrl,
  };
}

function mapApiMemberProfile(item: ApiMemberProfileResponse): MemberProfile {
  const imageUrl = item.image ? `${MEMBERS_IMAGE_BASE_URL}${encodeURIComponent(item.image)}` : undefined;
  const committees =
    item.committeeMemberships?.map((membership) => membership.committee?.name).filter((name): name is string => Boolean(name)) ?? [];
  const parliaments =
    item.parliamentMemberships
      ?.map((membership) => membership.parliament?.number)
      .filter((number): number is number => typeof number === "number")
      .map((number) => `Parliament ${number}`) ?? [];
  const education =
    item.education
      ?.map((entry) => [entry.qualification, entry.institution].filter(Boolean).join(" - "))
      .filter((line): line is string => Boolean(line)) ?? [];
  const employment =
    item.employment
      ?.map((entry) => [entry.position, entry.institution].filter(Boolean).join(" - "))
      .filter((line): line is string => Boolean(line)) ?? [];

  return {
    id: String(item.id),
    fullName: item.fullName,
    title: item.title ?? undefined,
    chamber: mapMemberHouseToChamber(item.house),
    entryType: item.entryType ?? undefined,
    party: item.party?.name ?? undefined,
    constituency: item.constituency?.name ?? undefined,
    imageUrl,
    biography: item.biography ? htmlToPlainText(item.biography) : undefined,
    email: item.email ?? undefined,
    contactNumber: item.contactNumber ?? undefined,
    dateOfBirth: item.dateOfBirth ? item.dateOfBirth.split("T")[0] : undefined,
    placeOfBirth: item.placeOfBirth ?? undefined,
    maritalStatus: item.maritalStatus ?? undefined,
    religion: item.religion ?? undefined,
    social: {
      facebookUrl: item.facebookUrl ?? undefined,
      linkedinUrl: item.linkedinUrl ?? undefined,
      twitterUrl: item.twitterUrl ?? undefined,
      instagramUrl: item.instagramUrl ?? undefined,
    },
    committees,
    parliaments,
    education,
    employment,
  };
}

async function getMembersFromApi(query?: MembersQuery): Promise<MembersResult> {
  const params = new URLSearchParams({
    page: String(query?.page ?? 1),
    limit: String(query?.limit ?? 8),
    search: query?.search ?? "",
    archived: String(query?.archived ?? false),
    parliaments: String(query?.parliaments ?? 1),
  });
  const response = await fetch(`${MEMBERS_API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Members API failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ApiMembersResponse;
  return {
    members: Array.isArray(payload.members) ? payload.members.map(mapApiMember) : [],
    pagination: payload.pagination ?? { total: 0, page: 1, limit: query?.limit ?? 8, pages: 1 },
  };
}

async function getMemberProfileFromApi(id: string): Promise<MemberProfile | null> {
  const response = await fetch(`${MEMBERS_API_URL}/${id}`);
  if (!response.ok) {
    throw new Error(`Member profile API failed with status ${response.status}`);
  }
  const payload = (await response.json()) as ApiMemberProfileResponse;
  if (!payload || typeof payload.id !== "number") return null;
  return mapApiMemberProfile(payload);
}

function mapApiHansard(item: ApiHansardItem): HansardEntry {
  return {
    id: String(item.id),
    title: item.title,
    sittingDate: (item.sittingDate || "").split("T")[0] || item.sittingDate,
    chamber: mapHouseToChamber(item.house),
    excerpt: htmlToPlainText(item.abstract || ""),
    referenceNumber: item.reference_number || `HANSARD-${item.id}`,
    volume: String(item.volume ?? ""),
    parliamentName: item.parliamentName || `Parliament ${item.parl?.number ?? ""}`.trim(),
    quarter: normalizeQuarter(item.parliamentSession),
    coverImageUrl: item.thumbnailPath || HANSARD_FALLBACK_COVER,
    views: item.views ?? 0,
    downloads: item.downloads ?? 0,
    pdfPath: item.pdfPath || "assets/hansard.pdf",
  };
}

async function getHansardsFromApi(query?: HansardsQuery): Promise<HansardsResult> {
  const page = Math.max(1, query?.page ?? 1);
  const limit = Math.max(1, query?.limit ?? 4);
  const search = query?.search?.trim() ?? "";
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  const response = await fetch(`${HANSARD_API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Hansard API failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ApiHansardResponse;
  if (!Array.isArray(payload.hansards)) {
    throw new Error("Hansard API returned unexpected payload.");
  }

  const hansards = payload.hansards.map(mapApiHansard);
  const total = payload.pagination?.total ?? payload.total ?? hansards.length;
  const pages = payload.pagination?.pages ?? payload.pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit));
  return {
    hansards,
    pagination: {
      total,
      page: payload.pagination?.page ?? page,
      limit: payload.pagination?.limit ?? limit,
      pages,
    },
  };
}

function inferBillStage(index: number): Bill["stage"] {
  const stages: Bill["stage"][] = ["Drafting", "Committee", "Second Reading", "Passed"];
  return stages[index % stages.length];
}

async function getBillsFromApi(query?: BillsQuery): Promise<BillsResult> {
  const params = new URLSearchParams({
    page: String(query?.page ?? 1),
    limit: String(query?.limit ?? 12),
  });
  const response = await fetch(`${BILLS_API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Bills API failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ApiBillsResponse;
  if (!payload.success || !Array.isArray(payload.data)) {
    throw new Error("Bills API returned unexpected payload.");
  }

  const mapped = payload.data.map((item, index) => ({
    id: String(item.id),
    title: item.title,
    sponsor: item.ministry || "Unknown",
    updatedAt: (item.dateAdded || item.createdAt || "").split("T")[0],
    stage: inferBillStage(index),
    billNumber: item.billNumber || undefined,
    pdfPath: item.pdfUrl || undefined,
  }));
  return {
    bills: mapped,
    pagination: {
      total: payload.pagination?.total ?? mapped.length,
      page: payload.pagination?.page ?? query?.page ?? 1,
      limit: payload.pagination?.limit ?? query?.limit ?? 12,
      pages: payload.pagination?.totalPages ?? 1,
    },
  };
}

function cleanStatusText(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function getBillStatusDocumentsFromApi(limit = 500): Promise<BillStatusDocument[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  const response = await fetch(`${BILL_STATUS_DOCUMENTS_API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Bill statuses API failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ApiBillStatusDocumentsResponse;
  if (!payload.success || !Array.isArray(payload.data)) {
    throw new Error("Bill statuses API returned unexpected payload.");
  }

  return payload.data.map((item) => ({
    id: String(item.id),
    title: item.title,
    ministry: item.ministry,
    billNumber: item.billNumber || undefined,
    status: cleanStatusText(item.status || ""),
    statusDate: item.statusDate ? item.statusDate.split("T")[0] : undefined,
    gazetteDate: item.gazetteDate ? item.gazetteDate.split("T")[0] : undefined,
  }));
}

function mapApiVote(item: ApiVoteItem): VoteProceeding {
  return {
    id: String(item.id),
    name: item.name,
    pdfPath: item.pdfUrl || "",
    house: item.house,
    session: item.session || undefined,
    date: item.date ? item.date.split("T")[0] : undefined,
    dateUploaded: item.dateUploaded ? item.dateUploaded.split("T")[0] : undefined,
    parliamentNumber: item.parliament?.number ?? undefined,
  };
}

async function getVotesFromApi(query?: VotesQuery): Promise<VotesResult> {
  const page = Math.max(1, query?.page ?? 1);
  const limit = Math.max(1, query?.limit ?? 12);
  const sort = query?.sort ?? "dateDesc";
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sort });
  const response = await fetch(`${VOTES_API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Votes API failed with status ${response.status}`);
  }
  const payload = (await response.json()) as ApiVotesResponse;
  if (!Array.isArray(payload.votes)) {
    throw new Error("Votes API returned unexpected payload.");
  }
  const votes = payload.votes.map(mapApiVote);
  return {
    votes,
    pagination: {
      total: payload.pagination?.total ?? votes.length,
      page: payload.pagination?.page ?? page,
      limit: payload.pagination?.limit ?? limit,
      pages: payload.pagination?.pages ?? payload.pagination?.totalPages ?? 1,
    },
  };
}

function mapApiConstituency(item: ApiConstituencyItem): ConstituencyProfile {
  return {
    id: String(item.id),
    name: item.name,
    province: item.province,
    district: item.district ?? undefined,
    population: item.population ?? undefined,
    profilePdfPaths: item.profilePdfPaths ?? [],
    memberCount: item._count?.members ?? 0,
  };
}

async function getConstituenciesFromApi(query?: ConstituenciesQuery): Promise<ConstituenciesResult> {
  const page = Math.max(1, query?.page ?? 1);
  const limit = Math.max(1, query?.limit ?? 12);
  const search = query?.search ?? "";
  const onlyWithRepresentative = query?.onlyWithRepresentative ?? true;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    onlyWithRepresentative: String(onlyWithRepresentative),
  });
  const response = await fetch(`${CONSTITUENCIES_API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Constituencies API failed with status ${response.status}`);
  }
  const payload = (await response.json()) as ApiConstituenciesResponse;
  if (!Array.isArray(payload.constituencies)) {
    throw new Error("Constituencies API returned unexpected payload.");
  }
  const constituencies = payload.constituencies.map(mapApiConstituency);
  return {
    constituencies,
    pagination: {
      total: payload.pagination?.total ?? constituencies.length,
      page: payload.pagination?.page ?? page,
      limit: payload.pagination?.limit ?? limit,
      pages: payload.pagination?.pages ?? payload.pagination?.totalPages ?? 1,
    },
  };
}

function mapCommitteeType(value?: string): Committee["type"] {
  if (value === "PORTFOLIO" || value === "THEMATIC") return value;
  return "OTHER";
}

function mapApiCommittee(item: ApiCommitteeItem): Committee {
  return {
    id: String(item.id),
    name: item.name,
    description: item.description,
    type: mapCommitteeType(item.type),
    memberCount: Array.isArray(item.memberships) ? item.memberships.length : 0,
  };
}

function mapApiCommitteeDetail(item: ApiCommitteeItem): CommitteeDetail {
  const members =
    item.memberships?.map((membership) => ({
      id: String(membership.id),
      memberId: String(membership.memberId),
      name: membership.member?.fullName || `Member ${membership.memberId}`,
      role: membership.role ?? undefined,
      house: membership.member?.house,
      entryType: membership.member?.entryType ?? undefined,
      party: membership.member?.party?.name ?? undefined,
      imageUrl: membership.member?.image ? `${MEMBERS_IMAGE_BASE_URL}${encodeURIComponent(membership.member.image)}` : undefined,
    })) ?? [];

  return {
    id: String(item.id),
    name: item.name,
    description: item.description,
    type: mapCommitteeType(item.type),
    memberCount: members.length,
    createdAt: item.createdAt ? item.createdAt.split("T")[0] : undefined,
    updatedAt: item.updatedAt ? item.updatedAt.split("T")[0] : undefined,
    members,
  };
}

async function getCommitteesFromApi(query?: CommitteesQuery): Promise<CommitteesResult> {
  const page = Math.max(1, query?.page ?? 1);
  const limit = Math.max(1, query?.limit ?? 9);
  const search = query?.search ?? "";
  const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
  const response = await fetch(`${COMMITTEES_API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Committees API failed with status ${response.status}`);
  }
  const payload = (await response.json()) as ApiCommitteesResponse;
  if (!Array.isArray(payload.committees)) {
    throw new Error("Committees API returned unexpected payload.");
  }
  const committees = payload.committees.map(mapApiCommittee);
  return {
    committees,
    pagination: {
      total: payload.pagination?.total ?? committees.length,
      page: payload.pagination?.page ?? page,
      limit: payload.pagination?.limit ?? limit,
      pages: payload.pagination?.pages ?? payload.pagination?.totalPages ?? 1,
    },
  };
}

async function getCommitteeDetailFromApi(id: string): Promise<CommitteeDetail | null> {
  const response = await fetch(`${COMMITTEES_API_URL}/${id}`);
  if (!response.ok) {
    throw new Error(`Committee detail API failed with status ${response.status}`);
  }
  const payload = (await response.json()) as ApiCommitteeItem;
  if (!payload || typeof payload.id !== "number") return null;
  return mapApiCommitteeDetail(payload);
}

function mapApiEvent(item: ApiEventItem): ParliamentEvent {
  return {
    id: String(item.id),
    title: item.title,
    description: item.description ?? undefined,
    date: item.date ? item.date.split("T")[0] : undefined,
    location: item.location ?? undefined,
    house: item.house,
  };
}

async function getEventsFromApi(query?: EventsQuery): Promise<EventsResult> {
  const page = Math.max(1, query?.page ?? 1);
  const limit = Math.max(1, query?.limit ?? 9);
  const search = query?.search ?? "";
  const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
  const response = await fetch(`${EVENTS_API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Events API failed with status ${response.status}`);
  }
  const payload = (await response.json()) as ApiEventsResponse;
  if (!Array.isArray(payload.events)) {
    throw new Error("Events API returned unexpected payload.");
  }
  const events = payload.events.map(mapApiEvent);
  return {
    events,
    pagination: {
      total: payload.pagination?.total ?? events.length,
      page: payload.pagination?.page ?? page,
      limit: payload.pagination?.limit ?? limit,
      pages: payload.pagination?.pages ?? payload.pagination?.totalPages ?? 1,
    },
  };
}

export const dataService: ParliamentDataService = {
  ...mockApi,
  getMembers: async (query) => {
    try {
      return await getMembersFromApi(query);
    } catch {
      return mockApi.getMembers(query);
    }
  },
  getMemberProfile: async (id) => {
    try {
      return await getMemberProfileFromApi(id);
    } catch {
      return mockApi.getMemberProfile(id);
    }
  },
  getHansards: async (query) => {
    try {
      return await getHansardsFromApi(query);
    } catch {
      return mockApi.getHansards(query);
    }
  },
  getBills: async (query) => {
    try {
      return await getBillsFromApi(query);
    } catch {
      return mockApi.getBills(query);
    }
  },
  getBillStatusDocuments: async (limit) => {
    try {
      return await getBillStatusDocumentsFromApi(limit);
    } catch {
      return mockApi.getBillStatusDocuments(limit);
    }
  },
  getVotes: async (query) => {
    try {
      return await getVotesFromApi(query);
    } catch {
      return mockApi.getVotes(query);
    }
  },
  getEvents: async (query) => {
    try {
      return await getEventsFromApi(query);
    } catch {
      return mockApi.getEvents(query);
    }
  },
  getConstituencies: async (query) => {
    try {
      return await getConstituenciesFromApi(query);
    } catch {
      return mockApi.getConstituencies(query);
    }
  },
  getCommittees: async (query) => {
    try {
      return await getCommitteesFromApi(query);
    } catch {
      return mockApi.getCommittees(query);
    }
  },
  getCommitteeDetail: async (id) => {
    try {
      return await getCommitteeDetailFromApi(id);
    } catch {
      return mockApi.getCommitteeDetail(id);
    }
  },
};
