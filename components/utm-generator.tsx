"use client";

import { useState, useEffect } from "react";
import { Copy, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  getUtmData, 
  removeCampaign as removeCampaignAction, 
  insertCampaign,
  insertUtmSource,
  removeUtmSource,
  insertUtmMedium,
  removeUtmMedium,
  insertUtmUrl
} from "@/app/actions";
import { config } from "dotenv";
const DEFAULT_CAMPAIGN = "live_by_design";
config({ path: '.env' });

export function UTMGenerator() {
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState(DEFAULT_CAMPAIGN);
  const [title, setTitle] = useState("");
  const [campaigns, setCampaigns] = useState([DEFAULT_CAMPAIGN]);
  const [newCampaign, setNewCampaign] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newMedium, setNewMedium] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [showCampaignInput, setShowCampaignInput] = useState(false);
  const [showSourceInput, setShowSourceInput] = useState(false);
  const [showMediumInput, setShowMediumInput] = useState(false);
  const [utmData, setUtmData] = useState<{
    sources: { id: number; name: string }[];
    mediums: { id: number; name: string }[];
    campaigns: { id: number; name: string; isDefault: boolean }[];
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUtmData();
        setUtmData(data);
        
        // Set default campaign from database
        const defaultCampaign = data.campaigns.find(c => c.isDefault);
        if (defaultCampaign) {
          setCampaign(defaultCampaign.name);
          setCampaigns(data.campaigns.map(c => c.name));
        }
      } catch (error) {
        console.error("Error fetching UTM data:", error);
        toast.error("Failed to load UTM data");
      }
    };
    
    fetchData();
  }, []);

  // Format title for UTM content
  const formatTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "") // Remove special characters
      .replace(/\s+/g, "_"); // Replace spaces with underscores
  };

  // Generate UTM URL
  const generateUtmUrl = async () => {
    if (!url) {
      toast.error("Url Is Required", {
        description: "Please enter a valid URL",
      });
      return;
    }

    if (!source) {
      toast.error("Source is required", {
        description: "Please select a UTM source",
      });
      return;
    }

    // Create URL object to handle query parameters properly
    let baseUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      baseUrl = "https://" + url;
    }

    try {
      const urlObj = new URL(baseUrl);

      // Add UTM parameters
      urlObj.searchParams.set("utm_source", source);

      if (medium) {
        urlObj.searchParams.set("utm_medium", medium);
      }

      if (campaign) {
        urlObj.searchParams.set("utm_campaign", campaign);
      }

      if (title) {
        urlObj.searchParams.set("utm_content", formatTitle(title));
      }

      const generatedUrlString = urlObj.toString();
      setGeneratedUrl(generatedUrlString);
      
      // Save to database
      try {
        const sourceData = utmData?.sources.find(s => s.name === source);
        const mediumData = utmData?.mediums.find(m => m.name === medium);
        const campaignData = utmData?.campaigns.find(c => c.name === campaign);

        await insertUtmUrl({
          baseUrl: url,
          sourceId: sourceData?.id || 0,
          mediumId: mediumData?.id,
          campaignId: campaignData?.id,
          content: title ? formatTitle(title) : undefined,
          generatedUrl: generatedUrlString,
        });

        toast.success("UTM URL generated and saved", {
          description: "Your UTM URL has been generated and saved to the database",
        });
      } catch (dbError) {
        console.error("Error saving to database:", dbError);
        toast.error("UTM URL generated but not saved", {
          description: "The URL was generated but couldn't be saved to the database",
        });
      }
      
      try {
        await fetch(process.env.NEXT_PUBLIC_WEBHOOK_URL || "", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            originalUrl: url,
            generatedUrl: generatedUrlString,
            source: source,       
            medium: medium,       
            campaign: campaign,   
            title: title          
          })
        });
      } catch (webhookError) {
        console.error("Webhook error:", webhookError);
      }
      
    } catch (error) {
      toast.error("Invalid URL", {
        description: "Please enter a valid URL",
      });
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      toast.success("Copied to clipboard", {
        description: "The UTM URL has been copied to your clipboard",
      });
    }
  };

  // Add new campaign
  const addCampaign = async () => {
    if (!showCampaignInput) {
      setShowCampaignInput(true);
      return;
    }

    if (newCampaign && !campaigns.includes(newCampaign)) {
      try {
        await insertCampaign(newCampaign);
        setCampaigns([...campaigns, newCampaign]);
        setCampaign(newCampaign);
        setNewCampaign("");
        setShowCampaignInput(false);
        toast.success("Campaign added", {
          description: `"${newCampaign}" has been added to campaigns`,
        });
      } catch (error) {
        toast.error("Failed to add campaign");
      }
    }
  };

  // Add new source
  const addSource = async () => {
    if (!showSourceInput) {
      setShowSourceInput(true);
      return;
    }

    if (newSource && utmData && !utmData.sources.some(s => s.name === newSource)) {
      try {
        const result = await insertUtmSource(newSource);
        setUtmData({
          ...utmData,
          sources: [...utmData.sources, result]
        });
        setSource(newSource);
        setNewSource("");
        setShowSourceInput(false);
        toast.success("Source added", {
          description: `"${newSource}" has been added to sources`,
        });
      } catch (error) {
        toast.error("Failed to add source");
      }
    }
  };

  // Add new medium
  const addMedium = async () => {
    if (!showMediumInput) {
      setShowMediumInput(true);
      return;
    }

    if (newMedium && utmData && !utmData.mediums.some(m => m.name === newMedium)) {
      try {
        const result = await insertUtmMedium(newMedium);
        setUtmData({
          ...utmData,
          mediums: [...utmData.mediums, result]
        });
        setMedium(newMedium);
        setNewMedium("");
        setShowMediumInput(false);
        toast.success("Medium added", {
          description: `"${newMedium}" has been added to mediums`,
        });
      } catch (error) {
        toast.error("Failed to add medium");
      }
    }
  };

  // Remove campaign
  const removeCampaign = async (campaignToRemove: string) => {
    if (campaignToRemove !== DEFAULT_CAMPAIGN) {
      try {
        await removeCampaignAction(campaignToRemove);
        const updatedCampaigns = campaigns.filter((c) => c !== campaignToRemove);
        setCampaigns(updatedCampaigns);

        // If the current campaign is being removed, reset to default
        if (campaign === campaignToRemove) {
          setCampaign(DEFAULT_CAMPAIGN);
        }

        toast.success("Campaign removed", {
          description: `"${campaignToRemove}" has been removed from campaigns`,
        });
      } catch (error) {
        toast.error("Failed to remove campaign");
      }
    } else {
      toast.error("Cannot remove default campaign", {
        description: `"${DEFAULT_CAMPAIGN}" is the default campaign and cannot be removed`,
      });
    }
  };

  // Remove source
  const removeSource = async (sourceToRemove: string) => {
    if (utmData) {
      try {
        await removeUtmSource(sourceToRemove);
        const updatedSources = utmData.sources.filter((s) => s.name !== sourceToRemove);
        setUtmData({
          ...utmData,
          sources: updatedSources
        });

        // If the current source is being removed, reset
        if (source === sourceToRemove) {
          setSource("");
        }

        toast.success("Source removed", {
          description: `"${sourceToRemove}" has been removed from sources`,
        });
      } catch (error) {
        toast.error("Failed to remove source");
      }
    }
  };

  // Remove medium
  const removeMedium = async (mediumToRemove: string) => {
    if (utmData) {
      try {
        await removeUtmMedium(mediumToRemove);
        const updatedMediums = utmData.mediums.filter((m) => m.name !== mediumToRemove);
        setUtmData({
          ...utmData,
          mediums: updatedMediums
        });

        // If the current medium is being removed, reset
        if (medium === mediumToRemove) {
          setMedium("");
        }

        toast.success("Medium removed", {
          description: `"${mediumToRemove}" has been removed from mediums`,
        });
      } catch (error) {
        toast.error("Failed to remove medium");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">URL *</Label>
          <Input
            id="url"
            placeholder="Enter the destination URL (e.g., www.fawazcentral.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">UTM Source *</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {utmData?.sources.map((src) => (
                    <SelectItem key={src.id} value={src.name}>
                      {src.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addSource}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {showSourceInput && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter new source name"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={addSource}>
                Add
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="medium">UTM Medium</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={medium} onValueChange={setMedium}>
                <SelectTrigger id="medium">
                  <SelectValue placeholder="Select medium" />
                </SelectTrigger>
                <SelectContent>
                  {utmData?.mediums.map((med) => (
                    <SelectItem key={med.id} value={med.name}>
                      {med.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addMedium}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {showMediumInput && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter new medium name"
                value={newMedium}
                onChange={(e) => setNewMedium(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={addMedium}>
                Add
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign">UTM Campaign</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={campaign} onValueChange={setCampaign}>
                <SelectTrigger id="campaign">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((camp) => (
                    <SelectItem key={camp} value={camp}>
                      {camp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addCampaign}
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {showCampaignInput && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter new campaign name"
                value={newCampaign}
                onChange={(e) => setNewCampaign(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={addCampaign}>
                Add
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title (for UTM Content)</Label>
          <Input
            id="title"
            placeholder="Enter content title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {title && (
            <p className="text-sm text-muted-foreground">
              Will be formatted as: <code>{formatTitle(title)}</code>
            </p>
          )}
        </div>

        <Button type="button" className="w-full mt-4" onClick={generateUtmUrl}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate UTM URL
        </Button>
      </div>

      {generatedUrl && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <Label>Generated UTM URL</Label>
            <div className="flex mt-2">
              <Textarea
                readOnly
                value={generatedUrl}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                className="ml-2"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 text-sm">
              <p className="font-medium">UTM Parameters:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li>
                  Source: <span className="font-mono">{source}</span>
                </li>
                {medium && (
                  <li>
                    Medium: <span className="font-mono">{medium}</span>
                  </li>
                )}
                {campaign && (
                  <li>
                    Campaign: <span className="font-mono">{campaign}</span>
                  </li>
                )}
                {title && (
                  <li>
                    Content:{" "}
                    <span className="font-mono">{formatTitle(title)}</span>
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
