"use server";
import { getSession } from "@/lib/auth-server";

export async function sendFeedback(data: { feedback: string }) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const { feedback } = data;
  if (!feedback) return { error: "Missing feedback" };

  // Email sending removed — feedback is acknowledged but not transmitted
  console.log("[FEEDBACK]", feedback.slice(0, 100));
  return { success: true };
}
