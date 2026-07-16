jest.mock("react", () => ({
  ...jest.requireActual("react"),
  cache: <T extends (...a: unknown[]) => unknown>(fn: T) => fn,
}));
jest.mock("@/lib/auth-server", () => ({ getSession: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prismadb: {
    users: { findUnique: jest.fn() },
    documents: { findMany: jest.fn() },
    $queryRaw: jest.fn(),
  },
}));

import { prismadb } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { searchDocuments } from "@/actions/documents/search-documents";

const mockUser = (role: "user" | "manager" | "admin", id = "u1") => {
  (getSession as jest.Mock).mockResolvedValue({ user: { id } });
  (prismadb.users.findUnique as jest.Mock).mockResolvedValue({ id, role });
};

describe("searchDocuments scope", () => {
  beforeEach(() => jest.clearAllMocks());

  it("unauthenticated returns [] and does not query", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);
    const res = await searchDocuments("foo");
    expect(res).toEqual([]);
    expect(prismadb.documents.findMany).not.toHaveBeenCalled();
  });

  it("user role: keyword findMany where includes parent_document_id:null + deletedAt:null + OR scope + search OR", async () => {
    mockUser("user", "u1");
    (prismadb.documents.findMany as jest.Mock).mockResolvedValue([]);
    (prismadb.$queryRaw as jest.Mock).mockResolvedValue([]);
    await searchDocuments("invoice");
    const call = (prismadb.documents.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where.parent_document_id).toBeNull();
    expect(call.where.deletedAt).toBeNull();
    expect(Array.isArray(call.where.OR)).toBe(true);
    expect(call.where.AND).toBeDefined();
    // search OR must be inside AND so it doesn't replace scope OR
    const andClauses = call.where.AND as Array<{ OR?: unknown[] }>;
    const searchClause = andClauses.find((c) =>
      Array.isArray(c.OR) && c.OR.some((x: any) => x.document_name),
    );
    expect(searchClause).toBeDefined();
  });

  it("manager: keyword findMany where = parent_document_id:null + deletedAt:null + AND[search OR]", async () => {
    mockUser("manager", "m1");
    (prismadb.documents.findMany as jest.Mock).mockResolvedValue([]);
    (prismadb.$queryRaw as jest.Mock).mockResolvedValue([]);
    await searchDocuments("invoice");
    const call = (prismadb.documents.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where.parent_document_id).toBeNull();
    expect(call.where.deletedAt).toBeNull();
    expect(call.where.OR).toBeUndefined();
  });
});
