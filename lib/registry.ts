import registryData from "@/content/registry.json";

export type Collection = "business" | "creative" | "technical" | "media-kit";

export type PublishState =
  | "draft"
  | "review-queue"
  | "approved"
  | "live"
  | "archived";

export type CreatedByRole =
  | "claude-code"
  | "vibe-coded"
  | "human-only"
  | "hybrid";

export type AlignmentVerdict =
  | "aligned"
  | "needs-review"
  | "drift-flagged"
  | "never-checked";

export type ExternalLinkType =
  | "github"
  | "article"
  | "talk"
  | "interview"
  | "demo"
  | "press"
  | "other";

export type MediaType = "image" | "video" | "audio" | "pdf";

export interface ExternalLink {
  url: string;
  label: string;
  type?: ExternalLinkType;
}

export interface MediaRef {
  cdn_url: string;
  type: MediaType;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  duration_seconds?: number;
}

export interface AlignmentCheck {
  last_checked: string;
  verdict: AlignmentVerdict;
  diff_summary?: string;
  inputs_version?: string;
}

export interface RegistryItem {
  id: string;
  collection: Collection;
  slug: string;
  title: string;
  summary?: string;
  body_path?: string;
  topic_tags?: string[];
  model_used: string;
  model_version: string;
  models_secondary?: string[];
  created_by_role?: CreatedByRole;
  created_at: string;
  last_reviewed: string;
  related_items?: string[];
  external_links?: ExternalLink[];
  media?: MediaRef[];
  corporate_alignment_check?: AlignmentCheck;
  publish_state: PublishState;
}

export interface Registry {
  version: string;
  generated_at?: string;
  items: RegistryItem[];
}

const registry = registryData as Registry;

export function getRegistry(): Registry {
  return registry;
}

export function getLiveItems(): RegistryItem[] {
  return registry.items.filter((item) => item.publish_state === "live");
}

export function getItemsByCollection(collection: Collection): RegistryItem[] {
  return getLiveItems().filter((item) => item.collection === collection);
}

export function getItemById(id: string): RegistryItem | undefined {
  return registry.items.find((item) => item.id === id);
}

export function getItemBySlug(
  collection: Collection,
  slug: string
): RegistryItem | undefined {
  return registry.items.find(
    (item) => item.collection === collection && item.slug === slug
  );
}

export function getRelatedItems(id: string): RegistryItem[] {
  const item = getItemById(id);
  if (!item?.related_items) return [];
  return item.related_items
    .map((relatedId) => getItemById(relatedId))
    .filter((i): i is RegistryItem => i !== undefined);
}
