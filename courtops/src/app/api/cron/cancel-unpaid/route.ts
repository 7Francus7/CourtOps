import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { nowInArg } from "@/lib/date-utils";
import { BookingService } from "@/services/booking.service";
import { shouldExpirePendingBooking } from "@/lib/booking-status";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Basic auth check for cron (using a secret in headers if available)
    const authHeader = request.headers.get('authorization');
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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

        let expiredCount = 0;

        for (const booking of pendingBookings) {
            if (shouldExpirePendingBooking({
                status: booking.status,
                paymentStatus: booking.paymentStatus,
                createdAt: booking.createdAt,
                depositTimeLimitHours: booking.club.depositTimeLimitHours,
                now,
            })) {
                console.log(`[Cron] Expiring unpaid booking ${booking.id} for club ${booking.club.id}`);
                await BookingService.expirePendingBooking(booking.id, booking.clubId);
                expiredCount++;
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Processed ${pendingBookings.length} bookings, expired ${expiredCount}.` 
        });

    } catch (error) {
        console.error("[Cron] Error in cancel-unpaid job:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
