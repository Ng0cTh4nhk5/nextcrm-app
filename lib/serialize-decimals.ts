/**
 * Convert Prisma Decimal fields to plain numbers for passing to Client Components.
 * Decimal objects are not serializable across the server/client boundary.
 *
 * Handles nested objects and arrays recursively to catch Decimal fields
 * inside relations (e.g. invoice.lineItems[0].unitPrice).
 */
export function serializeDecimals<T>(obj: T): T {
  // Primitives and null — return as-is
  if (obj === null || obj === undefined || typeof obj !== "object") return obj;

  // Arrays — recurse into each element
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeDecimals(item)) as unknown as T;
  }

  // Plain objects — walk every key
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj as object)) {
    const val = (obj as Record<string, unknown>)[key];

    if (
      val !== null &&
      val !== undefined &&
      typeof val === "object" &&
      "toNumber" in val &&
      typeof (val as { toNumber?: unknown }).toNumber === "function"
    ) {
      // Prisma Decimal → plain number
      result[key] = (val as { toNumber: () => number }).toNumber();
    } else {
      // Recurse into nested objects / arrays
      result[key] = serializeDecimals(val);
    }
  }
  return result as T;
}

export function serializeDecimalsList<T>(list: T[]): T[] {
  return list.map((item) => serializeDecimals(item));
}
