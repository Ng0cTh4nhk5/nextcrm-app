"use server";
import {
  requireAuthenticated,
  documentReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { prismadb } from "@/lib/prisma";

export interface DocumentSearchResult {
  id: string;
  name: string;
  summary: string | null;
  systemType: string | null;
  accountName: string | null;
}

export async function searchDocuments(
  query: string
): Promise<DocumentSearchResult[]> {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }
  if (!query || query.trim().length < 2) return [];

  // Keyword search only (semantic/AI search removed)
  const kwResults = await prismadb.documents.findMany({
    where: {
      parent_document_id: null,
      ...documentReadScopeWhere(user),
      AND: [
        {
          OR: [
            { document_name: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    take: 10,
    select: {
      id: true,
      document_name: true,
      summary: true,
      document_system_type: true,
      accounts: { select: { account: { select: { name: true } } }, take: 1 },
    },
  });

  return kwResults.map((r) => ({
    id: r.id,
    name: r.document_name,
    summary: r.summary,
    systemType: r.document_system_type,
    accountName: r.accounts?.[0]?.account?.name ?? null,
  }));
}
