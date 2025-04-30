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
import { getUtmData } from "@/app/actions";

// Default campaign
const DEFAULT_CAMPAIGN = "live_by_design";

export function UTMGenerator() {
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState(DEFAULT_CAMPAIGN);
  const [title, setTitle] = useState("");
  const [campaigns, setCampaigns] = useState([DEFAULT_CAMPAIGN]);
  const [newCampaign, setNewCampaign] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [showCampaignInput, setShowCampaignInput] = useState(false);
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
  const generateUtmUrl = () => {
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

      setGeneratedUrl(urlObj.toString());

      toast.success("UTM URL generated", {
        description: "Your UTM URL has been generated successfully",
      });
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
  const addCampaign = () => {
    if (!showCampaignInput) {
      setShowCampaignInput(true);
      return;
    }

    if (newCampaign && !campaigns.includes(newCampaign)) {
      setCampaigns([...campaigns, newCampaign]);
      setCampaign(newCampaign);
      setNewCampaign("");
      setShowCampaignInput(false);
      toast.success("Campaign added", {
        description: `"${newCampaign}" has been added to campaigns`,
      });
    }
  };

  // Remove campaign
  const removeCampaign = (campaignToRemove: string) => {
    if (campaignToRemove !== DEFAULT_CAMPAIGN) {
      const updatedCampaigns = campaigns.filter((c) => c !== campaignToRemove);
      setCampaigns(updatedCampaigns);

      // If the current campaign is being removed, reset to default
      if (campaign === campaignToRemove) {
        setCampaign(DEFAULT_CAMPAIGN);
      }

      toast.success("Campaign removed", {
        description: `"${campaignToRemove}" has been removed from campaigns`,
      });
    } else {
      toast.error("Cannot remove default campaign", {
        description: `"${DEFAULT_CAMPAIGN}" is the default campaign and cannot be removed`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">URL *</Label>
          <Input
            id="url"
            placeholder="Enter the destination URL (e.g., example.com/page)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">UTM Source *</Label>
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

        <div className="space-y-2">
          <Label htmlFor="medium">UTM Medium</Label>
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

          <div className="mt-2 flex flex-wrap gap-2">
            {campaigns.map((camp) => (
              <Badge
                key={camp}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {camp}
                {camp !== DEFAULT_CAMPAIGN && (
                  <button
                    onClick={() => removeCampaign(camp)}
                    className="ml-1 text-xs hover:text-destructive"
                  >
                    ×
                  </button>
                )}
              </Badge>
            ))}
          </div>
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
