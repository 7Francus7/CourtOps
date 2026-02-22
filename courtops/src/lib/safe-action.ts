import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export type ActionResponse<T> =
       | { success: true; data: T }
       | { success: false; error: string; code?: string };

type ActionCallback<T, Args extends any[]> = (
       ctx: { clubId: string; userId: string; role: string },
       ...args: Args
) => Promise<T>;

/**
 * Higher-order function to ensure Server Actions are secure and tenant-aware.
 * It automatically extracts the clubId and userId from the session.
 */
export function createSafeAction<T, Args extends any[]>(
       callback: ActionCallback<T, Args>
) {
       return async (...args: Args): Promise<ActionResponse<T>> => {
              try {
                     const session = await getServerSession(authOptions);

                     if (!session?.user?.id || !session?.user?.clubId) {
                            // We throw a specific redirect error that Next.js handles
                            // But for server actions, sometimes returning a clear error is better if we want to handle it in UI
                            return { success: false, error: "No autorizado", code: "UNAUTHORIZED" };
                     }

                     const ctx = {
                            clubId: session.user.clubId,
                            userId: session.user.id,
                            role: session.user.role || 'USER'
                     };

                     const result = await callback(ctx, ...args);
                     return { success: true, data: result };

              } catch (error: any) {
                     console.error("❌ [SafeAction Error]:", error);

                     // Handle Next.js redirects gracefully
                     if (error?.digest?.startsWith('NEXT_REDIRECT')) {
                            throw error;
                     }

                     return {
                            success: false,
                            error: error instanceof Error ? error.message : "Error inesperado en la operación",
                            code: "INTERNAL_ERROR"
                     };
              }
       };
}
