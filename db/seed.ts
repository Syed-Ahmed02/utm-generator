import { db } from "./drizzle";
import { campaigns, utmSources, utmMediums } from "./schema";

async function seed() {
  try {
    // Insert UTM sources
    const sources = [
      "youtube",
      "instagram",
      "ghl_emails",
      "twitter",
      "linkedin",
      "facebook",
      "tiktok",
      "google",
      "bing",
      "newsletter",
      "direct",
    ];

    for (const source of sources) {
      await db.insert(utmSources).values({
        id: Math.floor(Math.random() * 1000000),
        name: source,
      }).onConflictDoNothing();
    }

    // Insert UTM mediums
    const mediums = [
      "social",
      "email",
      "cpc",
      "organic",
      "referral",
      "display",
      "video",
      "paid_social",
      "affiliate",
    ];

    for (const medium of mediums) {
      await db.insert(utmMediums).values({
        id: Math.floor(Math.random() * 1000000),
        name: medium,
      }).onConflictDoNothing();
    }

    // Insert default campaign
    await db.insert(campaigns).values({
      id: Math.floor(Math.random() * 1000000),
      name: "live_by_design",
      isDefault: true,
    }).onConflictDoNothing();

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed(); 