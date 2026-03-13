/**
 * Determines feature limits based on plan name.
 * Used when activating/changing subscriptions to apply the correct limits to a club.
 */
export function getPlanFeatures(planName: string) {
       const name = planName.toLowerCase()

       // Defaults for 'Inicial' or unknown
       let features = {
              maxCourts: 2,
              maxUsers: 3,
              hasKiosco: false,
              hasOnlinePayments: false,
              hasAdvancedReports: false,
              hasTournaments: false,
              hasCustomDomain: false
       }

       if (name.includes("profesional") || name.includes("pro")) {
              features = {
                     maxCourts: 8,
                     maxUsers: 10,
                     hasKiosco: true,
                     hasOnlinePayments: true,
                     hasAdvancedReports: true,
                     hasTournaments: true,
                     hasCustomDomain: false
              }
       } else if (name.includes("empresarial") || name.includes("enterprise") || name.includes("unlimited")) {
              features = {
                     maxCourts: 99,
                     maxUsers: 99,
                     hasKiosco: true,
                     hasOnlinePayments: true,
                     hasAdvancedReports: true,
                     hasTournaments: true,
                     hasCustomDomain: true
              }
       }

       return features
}
