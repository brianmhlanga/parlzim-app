import { Bill, Committee, CommitteeDetail, ConstituencyProfile, HansardEntry, Member, NewsItem, ParliamentEvent, VoteProceeding } from "../../types/domain";
import {
  BillsResult,
  CommitteesQuery,
  CommitteesResult,
  ConstituenciesQuery,
  ConstituenciesResult,
  EventsQuery,
  EventsResult,
  HansardsQuery,
  HansardsResult,
  MembersResult,
  ParliamentDataService,
  VotesQuery,
  VotesResult,
} from "../types";

const members: Member[] = [
  { id: "m1", name: "Hon. T. Moyo", constituency: "Bulawayo South", chamber: "National Assembly", party: "ZANU-PF", imageType: "male" },
  { id: "m2", name: "Hon. R. Ncube", constituency: "Harare East", chamber: "National Assembly", party: "CCC", imageType: "female" },
  { id: "m3", name: "Sen. P. Dube", constituency: "Matabeleland North", chamber: "Senate", party: "ZANU-PF", imageType: "male" },
  { id: "m4", name: "Hon. L. Nyathi", constituency: "Gweru Urban", chamber: "National Assembly", party: "CCC", imageType: "female" },
  { id: "m5", name: "Hon. M. Chikwinya", constituency: "Mutare Central", chamber: "National Assembly", party: "CCC", imageType: "male" },
  { id: "m6", name: "Hon. V. Mhlanga", constituency: "Lupane East", chamber: "National Assembly", party: "ZANU-PF", imageType: "female" },
  { id: "m7", name: "Hon. P. Marufu", constituency: "Masvingo North", chamber: "National Assembly", party: "ZANU-PF", imageType: "male" },
  { id: "m8", name: "Hon. A. Dube", constituency: "Nkayi South", chamber: "National Assembly", party: "CCC", imageType: "female" },
  { id: "m9", name: "Hon. C. Chari", constituency: "Marondera West", chamber: "National Assembly", party: "ZANU-PF", imageType: "male" },
  { id: "m10", name: "Hon. S. Zuze", constituency: "Chiredzi Central", chamber: "National Assembly", party: "ZANU-PF", imageType: "female" },
  { id: "m11", name: "Hon. K. Matanhire", constituency: "Kwekwe Central", chamber: "National Assembly", party: "CCC", imageType: "male" },
  { id: "m12", name: "Hon. E. Mavhunga", constituency: "Bindura South", chamber: "National Assembly", party: "ZANU-PF", imageType: "female" },
  { id: "m13", name: "Hon. J. Hove", constituency: "Chegutu East", chamber: "National Assembly", party: "ZANU-PF", imageType: "male" },
  { id: "m14", name: "Hon. D. Moyo", constituency: "Hwange Central", chamber: "National Assembly", party: "CCC", imageType: "female" },
  { id: "m15", name: "Sen. B. Chisvo", constituency: "Mashonaland East", chamber: "Senate", party: "ZANU-PF", imageType: "male" },
  { id: "m16", name: "Sen. T. Gono", constituency: "Harare Metropolitan", chamber: "Senate", party: "CCC", imageType: "female" },
  { id: "m17", name: "Sen. R. Nkomo", constituency: "Matabeleland South", chamber: "Senate", party: "ZANU-PF", imageType: "male" },
  { id: "m18", name: "Sen. F. Chikore", constituency: "Manicaland", chamber: "Senate", party: "CCC", imageType: "female" },
  { id: "m19", name: "Hon. G. Chakanda", constituency: "Epworth North", chamber: "National Assembly", party: "CCC", imageType: "male" },
  { id: "m20", name: "Hon. N. Dzingirai", constituency: "Rushinga South", chamber: "National Assembly", party: "ZANU-PF", imageType: "female" },
];

const bills: Bill[] = [
  { id: "b1", title: "Public Finance Accountability Bill", sponsor: "Ministry of Finance", updatedAt: "2026-03-28", stage: "Committee" },
  { id: "b2", title: "Digital Services and Data Governance Bill", sponsor: "Ministry of ICT", updatedAt: "2026-03-30", stage: "Second Reading" },
  { id: "b3", title: "Public Health Amendment Bill", sponsor: "Ministry of Health", updatedAt: "2026-03-19", stage: "Drafting" },
];

const hansards: HansardEntry[] = [
  {
    id: "518",
    title: "NATIONAL ASSEMBLY HANSARD 09 APRIL 2026 Vol. 52 No. 35",
    sittingDate: "2026-04-09",
    chamber: "National Assembly",
    excerpt:
      "Items on the Order Paper: Presentation of points of national interest; approval for accession of the Fund for Export Development in Africa; ministerial statements on hospital infrastructure and progress in utilisation of the sugar tax.",
    referenceNumber: "ZPH-929632-518",
    volume: "52",
    parliamentName: "10th Parliament",
    quarter: "Q3",
    coverImageUrl: "https://www.parlzim.gov.zw/wp-content/uploads/2025/05/ChatGPT-Image-May-2-2025-10_26_40-AM-min.png",
    views: 0,
    downloads: 1,
    pdfPath: "assets/hansard.pdf",
  },
  {
    id: "h2",
    title: "Senate Questions Without Notice",
    sittingDate: "2026-03-26",
    chamber: "Senate",
    excerpt: "Questions focused on water infrastructure, roads, and drought mitigation financing.",
    referenceNumber: "ZPH-929632-519",
    volume: "52",
    parliamentName: "10th Parliament",
    quarter: "Q3",
    coverImageUrl: "https://www.parlzim.gov.zw/wp-content/uploads/2025/05/ChatGPT-Image-May-2-2025-10_26_40-AM-min.png",
    views: 2,
    downloads: 4,
    pdfPath: "assets/hansard.pdf",
  },
  {
    id: "h3",
    title: "NATIONAL ASSEMBLY HANSARD 02 APRIL 2026 Vol. 52 No. 34",
    sittingDate: "2026-04-02",
    chamber: "National Assembly",
    excerpt: "Debate on the Budget Statement resumed with focus on schools infrastructure, roads rehabilitation, and devolution funding.",
    referenceNumber: "ZPH-929632-520",
    volume: "52",
    parliamentName: "10th Parliament",
    quarter: "Q2",
    coverImageUrl: "https://www.parlzim.gov.zw/wp-content/uploads/2025/05/ChatGPT-Image-May-2-2025-10_26_40-AM-min.png",
    views: 5,
    downloads: 6,
    pdfPath: "assets/hansard.pdf",
  },
  {
    id: "h4",
    title: "SENATE HANSARD 31 MARCH 2026 Vol. 52 No. 12",
    sittingDate: "2026-03-31",
    chamber: "Senate",
    excerpt: "Questions without notice covered agricultural inputs, irrigation rehabilitation, and medicines supply chains in districts.",
    referenceNumber: "ZPH-929632-521",
    volume: "52",
    parliamentName: "10th Parliament",
    quarter: "Q2",
    coverImageUrl: "https://www.parlzim.gov.zw/wp-content/uploads/2025/05/ChatGPT-Image-May-2-2025-10_26_40-AM-min.png",
    views: 3,
    downloads: 2,
    pdfPath: "assets/hansard.pdf",
  },
  {
    id: "h5",
    title: "NATIONAL ASSEMBLY HANSARD 27 MARCH 2026 Vol. 52 No. 33",
    sittingDate: "2026-03-27",
    chamber: "National Assembly",
    excerpt: "Ministerial statement on power supply projects and deliberations on the Public Procurement Amendment framework.",
    referenceNumber: "ZPH-929632-522",
    volume: "52",
    parliamentName: "10th Parliament",
    quarter: "Q2",
    coverImageUrl: "https://www.parlzim.gov.zw/wp-content/uploads/2025/05/ChatGPT-Image-May-2-2025-10_26_40-AM-min.png",
    views: 8,
    downloads: 10,
    pdfPath: "assets/hansard.pdf",
  },
  {
    id: "h6",
    title: "SENATE HANSARD 24 MARCH 2026 Vol. 52 No. 11",
    sittingDate: "2026-03-24",
    chamber: "Senate",
    excerpt: "Debate on drought mitigation financing and updates on the implementation of social protection grants.",
    referenceNumber: "ZPH-929632-523",
    volume: "52",
    parliamentName: "10th Parliament",
    quarter: "Q2",
    coverImageUrl: "https://www.parlzim.gov.zw/wp-content/uploads/2025/05/ChatGPT-Image-May-2-2025-10_26_40-AM-min.png",
    views: 1,
    downloads: 1,
    pdfPath: "assets/hansard.pdf",
  },
  {
    id: "h7",
    title: "NATIONAL ASSEMBLY HANSARD 20 MARCH 2026 Vol. 52 No. 32",
    sittingDate: "2026-03-20",
    chamber: "National Assembly",
    excerpt: "Committee reports tabled on public accounts, local authorities service delivery, and education outcomes.",
    referenceNumber: "ZPH-929632-524",
    volume: "52",
    parliamentName: "10th Parliament",
    quarter: "Q1",
    coverImageUrl: "https://www.parlzim.gov.zw/wp-content/uploads/2025/05/ChatGPT-Image-May-2-2025-10_26_40-AM-min.png",
    views: 4,
    downloads: 9,
    pdfPath: "assets/hansard.pdf",
  },
  {
    id: "h8",
    title: "SENATE HANSARD 18 MARCH 2026 Vol. 52 No. 10",
    sittingDate: "2026-03-18",
    chamber: "Senate",
    excerpt: "Members raised concerns on artisanal mining safety and environmental rehabilitation in affected communities.",
    referenceNumber: "ZPH-929632-525",
    volume: "52",
    parliamentName: "10th Parliament",
    quarter: "Q1",
    coverImageUrl: "https://www.parlzim.gov.zw/wp-content/uploads/2025/05/ChatGPT-Image-May-2-2025-10_26_40-AM-min.png",
    views: 2,
    downloads: 3,
    pdfPath: "assets/hansard.pdf",
  },
  {
    id: "h9",
    title: "NATIONAL ASSEMBLY HANSARD 14 MARCH 2026 Vol. 52 No. 31",
    sittingDate: "2026-03-14",
    chamber: "National Assembly",
    excerpt: "Questions on youth employment facilities, entrepreneurship hubs, and digital skills initiatives were answered.",
    referenceNumber: "ZPH-929632-526",
    volume: "52",
    parliamentName: "10th Parliament",
    quarter: "Q1",
    coverImageUrl: "https://www.parlzim.gov.zw/wp-content/uploads/2025/05/ChatGPT-Image-May-2-2025-10_26_40-AM-min.png",
    views: 6,
    downloads: 7,
    pdfPath: "assets/hansard.pdf",
  },
  {
    id: "h10",
    title: "SENATE HANSARD 10 MARCH 2026 Vol. 52 No. 09",
    sittingDate: "2026-03-10",
    chamber: "Senate",
    excerpt: "Debate on provincial health staffing, medicine procurement, and ambulance fleet recapitalisation.",
    referenceNumber: "ZPH-929632-527",
    volume: "52",
    parliamentName: "10th Parliament",
    quarter: "Q1",
    coverImageUrl: "https://www.parlzim.gov.zw/wp-content/uploads/2025/05/ChatGPT-Image-May-2-2025-10_26_40-AM-min.png",
    views: 7,
    downloads: 11,
    pdfPath: "assets/hansard.pdf",
  },
];

const news: NewsItem[] = [
  { id: "n1", title: "Speaker Launches Youth Parliament Outreach", date: "2026-03-31", category: "Outreach", excerpt: "The initiative broadens civic participation among young citizens." },
  { id: "n2", title: "Committee Hearings on Digital Economy Continue", date: "2026-03-28", category: "Committees", excerpt: "Stakeholders submitted evidence on innovation and privacy safeguards." },
];

const votes: VoteProceeding[] = [
  {
    id: "v1",
    name: "SENATE VOTES 09 APRIL 2026 NO 35",
    pdfPath: "VOTE-1775805574963.pdf",
    house: "SENATE",
    session: "03",
    date: "2026-04-08",
    dateUploaded: "2026-04-10",
    parliamentNumber: 10,
  },
  {
    id: "v2",
    name: "NATIONAL ASSEMBLY VOTES 09 APRIL 2026 NO 35",
    pdfPath: "VOTE-1775805758008.pdf",
    house: "NATIONAL_ASSEMBLY",
    session: "03",
    date: "2026-04-08",
    dateUploaded: "2026-04-10",
    parliamentNumber: 10,
  },
];

const events: ParliamentEvent[] = [
  {
    id: "1",
    title: "NATIONAL ASSEMBLY SESSION",
    description: "The National Assembly will resume at 2:15 pm in the National Assembly chamber",
    date: "2026-03-23",
    location: "PARLIAMENT BUILDING MT HAMPDEN",
    house: "NATIONAL_ASSEMBLY",
  },
];

const constituencies: ConstituencyProfile[] = [
  {
    id: "1",
    name: "Harare Central",
    province: "Harare",
    district: "Harare",
    profilePdfPaths: ["CONST-PROFILE-1769771197707-0.pdf"],
    memberCount: 3,
  },
  {
    id: "2",
    name: "Harare East",
    province: "Harare",
    district: "Harare",
    profilePdfPaths: ["CONST-PROFILE-1772433231245-0.pdf"],
    memberCount: 4,
  },
];

const committees: CommitteeDetail[] = [
  {
    id: "69",
    name: "Budget and Finance and Investment Promotion",
    description:
      "Examines the expenditure, administration and policy of budget, finance and investment promotion and related matters as Parliament may determine.",
    type: "PORTFOLIO",
    memberCount: 28,
    createdAt: "2026-02-27",
    updatedAt: "2026-02-27",
    members: [
      { id: "1", memberId: "1389", name: "Clemence Chiduwa", role: "Member", house: "NATIONAL_ASSEMBLY" },
      { id: "2", memberId: "1283", name: "Lincoln Dhliwayo", role: "Chairperson", house: "NATIONAL_ASSEMBLY" },
      { id: "3", memberId: "1238", name: "Prince Dube", role: "Member", house: "SENATE" },
    ],
  },
  {
    id: "79",
    name: "Climate Change",
    description:
      "Examines Government policies that fall under or relate to climate change, or any other matters falling under its jurisdiction.",
    type: "THEMATIC",
    memberCount: 17,
    createdAt: "2026-02-27",
    updatedAt: "2026-02-27",
    members: [
      { id: "4", memberId: "1545", name: "Hon. Chairperson", role: "Chairperson", house: "NATIONAL_ASSEMBLY" },
      { id: "5", memberId: "1548", name: "Hon. Member", role: "Member", house: "NATIONAL_ASSEMBLY" },
    ],
  },
];

export const mockApi: ParliamentDataService = {
  getMembers: async (): Promise<MembersResult> => ({
    members,
    pagination: {
      total: members.length,
      page: 1,
      limit: members.length,
      pages: 1,
    },
  }),
  getMemberProfile: async (id: string) => {
    const item = members.find((member) => member.id === id);
    if (!item) return null;
    return {
      id: item.id,
      fullName: item.name,
      chamber: item.chamber,
      entryType: item.entryType,
      party: item.party,
      constituency: item.constituency,
      imageUrl: item.imageUrl,
      email: undefined,
      contactNumber: undefined,
      social: {},
      committees: [],
      parliaments: ["Parliament 10"],
      education: [],
      employment: [],
    };
  },
  getBills: async (): Promise<BillsResult> => ({
    bills,
    pagination: {
      total: bills.length,
      page: 1,
      limit: bills.length,
      pages: 1,
    },
  }),
  getBillStatusDocuments: async () =>
    bills.map((bill) => ({
      id: bill.id,
      title: bill.title,
      ministry: bill.sponsor,
      billNumber: bill.billNumber,
      status: bill.stage,
      statusDate: bill.updatedAt,
      gazetteDate: undefined,
    })),
  getHansards: async (query?: HansardsQuery): Promise<HansardsResult> => {
    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.max(1, query?.limit ?? hansards.length);
    const search = (query?.search ?? "").trim().toLowerCase();
    const filtered = search
      ? hansards.filter(
          (item) =>
            item.title.toLowerCase().includes(search) ||
            item.excerpt.toLowerCase().includes(search) ||
            item.referenceNumber.toLowerCase().includes(search),
        )
      : hansards;
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, pages);
    const start = (currentPage - 1) * limit;
    return {
      hansards: filtered.slice(start, start + limit),
      pagination: { total, page: currentPage, limit, pages },
    };
  },
  getVotes: async (query?: VotesQuery): Promise<VotesResult> => {
    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.max(1, query?.limit ?? votes.length);
    const total = votes.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, pages);
    const start = (currentPage - 1) * limit;
    return {
      votes: votes.slice(start, start + limit),
      pagination: { total, page: currentPage, limit, pages },
    };
  },
  getEvents: async (query?: EventsQuery): Promise<EventsResult> => {
    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.max(1, query?.limit ?? events.length);
    const search = (query?.search ?? "").trim().toLowerCase();
    const filtered = search
      ? events.filter(
          (item) =>
            item.title.toLowerCase().includes(search) ||
            (item.description || "").toLowerCase().includes(search) ||
            (item.location || "").toLowerCase().includes(search),
        )
      : events;
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, pages);
    const start = (currentPage - 1) * limit;
    return {
      events: filtered.slice(start, start + limit),
      pagination: { total, page: currentPage, limit, pages },
    };
  },
  getConstituencies: async (query?: ConstituenciesQuery): Promise<ConstituenciesResult> => {
    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.max(1, query?.limit ?? constituencies.length);
    const search = (query?.search ?? "").trim().toLowerCase();
    const filtered = search
      ? constituencies.filter(
          (item) =>
            item.name.toLowerCase().includes(search) ||
            item.province.toLowerCase().includes(search) ||
            (item.district || "").toLowerCase().includes(search),
        )
      : constituencies;
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, pages);
    const start = (currentPage - 1) * limit;
    return {
      constituencies: filtered.slice(start, start + limit),
      pagination: { total, page: currentPage, limit, pages },
    };
  },
  getCommittees: async (query?: CommitteesQuery): Promise<CommitteesResult> => {
    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.max(1, query?.limit ?? committees.length);
    const search = (query?.search ?? "").trim().toLowerCase();
    const simplified: Committee[] = committees.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      memberCount: item.memberCount,
    }));
    const filtered = search
      ? simplified.filter((item) => item.name.toLowerCase().includes(search) || item.description.toLowerCase().includes(search))
      : simplified;
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, pages);
    const start = (currentPage - 1) * limit;
    return {
      committees: filtered.slice(start, start + limit),
      pagination: { total, page: currentPage, limit, pages },
    };
  },
  getCommitteeDetail: async (id: string) => {
    return committees.find((item) => item.id === id) ?? null;
  },
  getNews: async (): Promise<NewsItem[]> => news,
};
