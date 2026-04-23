export type Chamber = "National Assembly" | "Senate";

export interface Member {
  id: string;
  name: string;
  constituency: string;
  chamber: Chamber;
  party: string;
  entryType?: string;
  gender?: string;
  email?: string;
  contactNumber?: string;
  committeeCount?: number;
  parliamentCount?: number;
  imageType: "male" | "female";
  imageUrl?: string;
}

export interface MemberProfile {
  id: string;
  fullName: string;
  title?: string;
  chamber: Chamber;
  entryType?: string;
  party?: string;
  constituency?: string;
  imageUrl?: string;
  biography?: string;
  email?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  maritalStatus?: string;
  religion?: string;
  social: {
    facebookUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
  };
  committees: string[];
  parliaments: string[];
  education: string[];
  employment: string[];
}

export type BillStage = "Drafting" | "Committee" | "Second Reading" | "Passed";

export interface Bill {
  id: string;
  title: string;
  sponsor: string;
  updatedAt: string;
  stage: BillStage;
  billNumber?: string;
  pdfPath?: string;
}

export interface BillStatusDocument {
  id: string;
  title: string;
  ministry: string;
  billNumber?: string;
  status: string;
  statusDate?: string;
  gazetteDate?: string;
}

export interface HansardEntry {
  id: string;
  title: string;
  sittingDate: string;
  chamber: Chamber;
  excerpt: string;
  referenceNumber: string;
  volume: string;
  parliamentName: string;
  quarter: string;
  coverImageUrl: string;
  views: number;
  downloads: number;
  pdfPath: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
}

export interface VoteProceeding {
  id: string;
  name: string;
  pdfPath: string;
  house: "NATIONAL_ASSEMBLY" | "SENATE";
  session?: string;
  date?: string;
  dateUploaded?: string;
  parliamentNumber?: number;
}

export interface ParliamentEvent {
  id: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  house: "NATIONAL_ASSEMBLY" | "SENATE";
}

export interface ConstituencyProfile {
  id: string;
  name: string;
  province: string;
  district?: string;
  population?: number;
  profilePdfPaths: string[];
  memberCount: number;
}

export type CommitteeType = "PORTFOLIO" | "THEMATIC" | "OTHER";

export interface Committee {
  id: string;
  name: string;
  description: string;
  type: CommitteeType;
  memberCount: number;
}

export interface CommitteeMember {
  id: string;
  memberId: string;
  name: string;
  role?: string;
  house?: "NATIONAL_ASSEMBLY" | "SENATE";
  entryType?: string;
  party?: string;
  imageUrl?: string;
}

export interface CommitteeDetail extends Committee {
  createdAt?: string;
  updatedAt?: string;
  members: CommitteeMember[];
}
