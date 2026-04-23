import {
  Bill,
  BillStatusDocument,
  Committee,
  CommitteeDetail,
  ConstituencyProfile,
  HansardEntry,
  Member,
  MemberProfile,
  NewsItem,
  ParliamentEvent,
  VoteProceeding,
} from "../types/domain";

export interface MembersQuery {
  page?: number;
  limit?: number;
  search?: string;
  archived?: boolean;
  parliaments?: number;
}

export interface MembersResult {
  members: Member[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface BillsQuery {
  page?: number;
  limit?: number;
}

export interface BillsResult {
  bills: Bill[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface HansardsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface HansardsResult {
  hansards: HansardEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface VotesQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface VotesResult {
  votes: VoteProceeding[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface EventsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface EventsResult {
  events: ParliamentEvent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ConstituenciesQuery {
  page?: number;
  limit?: number;
  search?: string;
  onlyWithRepresentative?: boolean;
}

export interface ConstituenciesResult {
  constituencies: ConstituencyProfile[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CommitteesQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CommitteesResult {
  committees: Committee[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ParliamentDataService {
  getMembers(query?: MembersQuery): Promise<MembersResult>;
  getMemberProfile(id: string): Promise<MemberProfile | null>;
  getBills(query?: BillsQuery): Promise<BillsResult>;
  getBillStatusDocuments(limit?: number): Promise<BillStatusDocument[]>;
  getHansards(query?: HansardsQuery): Promise<HansardsResult>;
  getVotes(query?: VotesQuery): Promise<VotesResult>;
  getEvents(query?: EventsQuery): Promise<EventsResult>;
  getConstituencies(query?: ConstituenciesQuery): Promise<ConstituenciesResult>;
  getCommittees(query?: CommitteesQuery): Promise<CommitteesResult>;
  getCommitteeDetail(id: string): Promise<CommitteeDetail | null>;
  getNews(): Promise<NewsItem[]>;
}
