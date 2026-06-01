import type { LucideIcon } from "lucide-react";

export type ProfileEntityType = "employee" | "customer" | "lead" | "invoice" | "payment";

export interface ProfileBadge {
  label: string;
  value: string;
}

export interface ProfileMetric {
  label: string;
  value: string;
  description?: string;
}

export interface ProfileField {
  label: string;
  value: string;
}

export interface ProfileSection {
  title: string;
  description?: string;
  fields: ProfileField[];
}

export interface ProfileTableColumn {
  key: string;
  header: string;
}

export interface ProfileTable {
  title: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  columns: ProfileTableColumn[];
  rows: Record<string, string>[];
}

export interface ProfileTimelineItem {
  id: string;
  title: string;
  description: string;
  actor: string;
  time: string;
  type?: "success" | "info" | "warning" | "danger";
}

export interface ProfileNote {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface ProfileTab {
  value: string;
  label: string;
  metrics?: ProfileMetric[];
  sections?: ProfileSection[];
  tables?: ProfileTable[];
  notes?: ProfileNote[];
  timeline?: ProfileTimelineItem[];
}

export type ProfileActionKind = "drawer" | "confirm" | "download" | "success";

export interface ProfileActionField {
  name: string;
  label: string;
  type?: "text" | "email" | "date" | "number" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
}

export interface ProfileAction {
  key: string;
  label: string;
  icon: LucideIcon;
  kind: ProfileActionKind;
  module: string;
  permission: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
  description?: string;
  fields?: ProfileActionField[];
  confirmLabel?: string;
  destructive?: boolean;
}

export interface ProfileDetail {
  id: string;
  entity: ProfileEntityType;
  title: string;
  subtitle: string;
  eyebrow: string;
  avatar?: string;
  initials: string;
  badges: ProfileBadge[];
  metrics: ProfileMetric[];
  actions: ProfileAction[];
  tabs: ProfileTab[];
  auditLog: ProfileTimelineItem[];
}
