/**
 * Determines feature limits based on plan name.
 * Plans: Arranque (basic) | Élite / Elite / Profesional (mid) | VIP / Empresarial / Enterprise (top)
 */
export function getPlanFeatures(planName: string) {
       const name = planName.toLowerCase()

       const isElite = name.includes("élite") || name.includes("elite") || name.includes("profesional") || name.includes("pro")
       const isVip   = name.includes("vip") || name.includes("empresarial") || name.includes("enterprise") || name.includes("unlimited")

       // Arranque — defaults
       let features = {
              maxCourts: 2,
              maxUsers: 3,
              hasKiosco: false,
              hasOnlinePayments: false,
              hasAdvancedReports: false,
              hasTournaments: false,
              hasWhatsApp: false,
              hasWaivers: false,
              hasCustomDomain: false,
       }

       if (isElite) {
              features = {
                     maxCourts: 8,
                     maxUsers: 10,
                     hasKiosco: true,
                     hasOnlinePayments: true,
                     hasAdvancedReports: true,
                     hasTournaments: true,
                     hasWhatsApp: true,
                     hasWaivers: true,
                     hasCustomDomain: false,
              }
       } else if (isVip) {
              features = {
                     maxCourts: 99,
                     maxUsers: 99,
                     hasKiosco: true,
                     hasOnlinePayments: true,
                     hasAdvancedReports: true,
                     hasTournaments: true,
                     hasWhatsApp: true,
                     hasWaivers: true,
                     hasCustomDomain: true,
              }
       }

       return features
}
