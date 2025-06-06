"use server";

import { db } from "@/db/drizzle";
import { utmSources, utmMediums, campaigns, utmUrls } from "@/db/schema";
import { eq,and } from "drizzle-orm";

export async function getUtmData() {
  try {
    const [sources, mediums, campaignList] = await Promise.all([
      db.select().from(utmSources),
      db.select().from(utmMediums),
      db.select().from(campaigns),
    ]);

    return {
      sources,
      mediums,
      campaigns: campaignList,
    };
  } catch (error) {
    console.error("Error fetching UTM data:", error);
    throw new Error("Failed to fetch UTM data");
  }
}

export async function insertUtmUrl(data: {
  baseUrl: string;
  sourceId: number;
  mediumId?: number;
  campaignId?: number;
  content?: string;
  generatedUrl: string;
}) {
  try {
    const result = await db.insert(utmUrls).values({
      id: Math.floor(Math.random() * 1000000), // Generate a random ID
      baseUrl: data.baseUrl,
      sourceId: data.sourceId,
      mediumId: data.mediumId,
      campaignId: data.campaignId,
      content: data.content,
      generatedUrl: data.generatedUrl,
    }).returning();
    
    return result[0];
  } catch (error) {
    console.error("Error inserting UTM URL:", error);
    throw error;
  }
}

export async function insertCampaign(name: string) {
  try {
    const result = await db.insert(campaigns).values({
      id: Math.floor(Math.random() * 1000000), // Generate a random ID
      name,
      isDefault: false,
    }).returning();
    
    return result[0];
  } catch (error) {
    console.error("Error inserting campaign:", error);
    throw error;
  }
} 

export async function removeCampaign(name: string) {
  try {
    const result = await db
      .delete(campaigns)
      .where(
        and(
          eq(campaigns.name, name),
          eq(campaigns.isDefault, false)
        )
      )
      .returning();

    if (result.length === 0) {
      throw new Error("Cannot delete default campaign or campaign not found.");
    }

    return result[0];
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw error;
  }
}

export async function insertUtmSource(name: string) {
  try {
    const result = await db.insert(utmSources).values({
      id: Math.floor(Math.random() * 1000000), // Generate a random ID
      name,
    }).returning();
    
    return result[0];
  } catch (error) {
    console.error("Error inserting UTM source:", error);
    throw error;
  }
}

export async function removeUtmSource(name: string) {
  try {
    const result = await db
      .delete(utmSources)
      .where(eq(utmSources.name, name))
      .returning();

    if (result.length === 0) {
      throw new Error("UTM source not found.");
    }

    return result[0];
  } catch (error) {
    console.error("Error deleting UTM source:", error);
    throw error;
  }
}

export async function insertUtmMedium(name: string) {
  try {
    const result = await db.insert(utmMediums).values({
      id: Math.floor(Math.random() * 1000000), // Generate a random ID
      name,
    }).returning();
    
    return result[0];
  } catch (error) {
    console.error("Error inserting UTM medium:", error);
    throw error;
  }
}

export async function removeUtmMedium(name: string) {
  try {
    const result = await db
      .delete(utmMediums)
      .where(eq(utmMediums.name, name))
      .returning();

    if (result.length === 0) {
      throw new Error("UTM medium not found.");
    }

    return result[0];
  } catch (error) {
    console.error("Error deleting UTM medium:", error);
    throw error;
  }
}

