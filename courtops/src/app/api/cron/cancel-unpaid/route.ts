import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { nowInArg } from "@/lib/date-utils";
import { BookingService } from "@/services/booking.service";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Basic auth check for cron (using a secret in headers if available)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const now = nowInArg();
        
        // Find bookings that are PENDING and UNPAID
        // We include the club to get the depositTimeLimitHours
        const pendingBookings = await prisma.booking.findMany({
            where: {
                status: "PENDING",
                paymentStatus: "UNPAID",
                deletedAt: null
            },
            include: {
                club: {
                    select: {
                        id: true,
                        depositTimeLimitHours: true
                    }
                }
            }
        });

        let canceledCount = 0;

        for (const booking of pendingBookings) {
            const limitHours = booking.club.depositTimeLimitHours || 2;
            const expirationDate = new Date(booking.createdAt.getTime() + limitHours * 60 * 60 * 1000);

            if (now > expirationDate) {
                console.log(`[Cron] Canceling expired booking ${booking.id} for club ${booking.club.id}`);
                
                await BookingService.cancel(booking.id, booking.clubId, { 
                    id: "SYSTEM_CRON", 
                    role: "GOD" // Using GOD role to bypass any permission checks
                });

                // Also update the cancel reason
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: {
                        cancelReason: "EXPIRED_UNPAID"
                    }
                });

                canceledCount++;
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Processed ${pendingBookings.length} bookings, canceled ${canceledCount}.` 
        });

    } catch (error) {
        console.error("[Cron] Error in cancel-unpaid job:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
