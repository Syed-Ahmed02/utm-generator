"use server";

import { db } from "@/db/drizzle";
import { utmSources, utmMediums, campaigns, utmUrls } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    const result = await db.delete(campaigns).where(eq(campaigns.name,name)).returning();
    return result[0];
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw error;
  }
}
