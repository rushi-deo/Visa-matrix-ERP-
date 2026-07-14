import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { profileDetailService } from "@/services/profile-detail.service";
import type {
  ProfileAction,
  ProfileActionField,
  ProfileDetail,
  ProfileEntityType,
  ProfileMetric,
  ProfileSection,
  ProfileTable,
  ProfileTimelineItem,
} from "@/types/profile-detail";

interface ProfileDetailPageProps {
  entity: ProfileEntityType;
  id: string;
  backTo: string;
  backLabel: string;
}

interface DrawerState {
  action: ProfileAction;
  values: Record<string, string>;
  errors: Record<string, string>;
}

function canSeeAction(
  action: ProfileAction,
  canAccess: (moduleName: string, action?: string) => boolean,
) {
  return canAccess(action.module, action.permission);
}

function makeInitialValues(fields: ProfileActionField[] = []) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.name] = field.defaultValue ?? "";
    return acc;
  }, {});
}

function validateFields(
  fields: ProfileActionField[] = [],
  values: Record<string, string>,
) {
  const errors: Record<string, string> = {};

  fields.forEach((field) => {
    const value = values[field.name]?.trim() ?? "";
    if (field.required && !value) {
      errors[field.name] = `${field.label} is required`;
      return;
    }

    if (
      field.type === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      errors[field.name] = "Enter a valid email address";
    }
  });

  return errors;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[28rem] rounded-xl" />
    </div>
  );
}

function MetricGrid({ metrics }: { metrics?: ProfileMetric[] }) {
  if (!metrics?.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>{metric.label}</CardDescription>
            <CardTitle className="text-2xl">{metric.value}</CardTitle>
          </CardHeader>
          {metric.description && (
            <CardContent className="text-sm text-muted-foreground">
              {metric.description}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

function SectionGrid({ sections }: { sections?: ProfileSection[] }) {
  if (!sections?.length) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {sections.map((section) => (
        <Card key={section.title} className="shadow-sm">
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
            {section.description && (
              <CardDescription>{section.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div
                  key={`${section.title}-${field.label}`}
                  className="min-w-0"
                >
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {field.label}
                  </dt>
                  <dd className="mt-1 break-words text-sm font-medium">
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DetailTable({ table }: { table: ProfileTable }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{table.title}</CardTitle>
        {table.description && (
          <CardDescription>{table.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {table.rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={table.emptyTitle ?? "No records found"}
            description={table.emptyDescription}
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {table.columns.map((column) => (
                    <TableHead key={column.key}>{column.header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.rows.map((row, index) => (
                  <TableRow key={`${table.title}-${index}`}>
                    {table.columns.map((column) => {
                      const value = row[column.key] ?? "";
                      const isStatus = column.key
                        .toLowerCase()
                        .includes("status");
                      return (
                        <TableCell key={`${column.key}-${index}`}>
                          {isStatus ? <StatusBadge value={value} /> : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Timeline({ items }: { items?: ProfileTimelineItem[] }) {
  if (!items?.length) {
    return (
      <EmptyState
        icon={Clock3}
        title="No activity yet"
        description="Activity will appear here as the record changes."
      />
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>
          Operational and audit events for this profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1rem_1fr] gap-3">
              <span
                className={cn(
                  "mt-1 size-2.5 rounded-full bg-info",
                  item.type === "success" && "bg-success",
                  item.type === "warning" && "bg-warning",
                  item.type === "danger" && "bg-destructive",
                )}
              />
              <div className="min-w-0 border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{item.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  By {item.actor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Notes({
  notes,
}: {
  notes?: { id: string; author: string; body: string; createdAt: string }[];
}) {
  if (!notes?.length) {
    return (
      <EmptyState
        title="No notes yet"
        description="Team notes will appear here."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {notes.map((note) => (
        <Card key={note.id} className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{note.author}</p>
              <span className="text-xs text-muted-foreground">
                {note.createdAt}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{note.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ActionInput({
  field,
  value,
  error,
  onChange,
}: {
  field: ProfileActionField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const inputId = `action-${field.name}`;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </label>
      {field.type === "textarea" ? (
        <Textarea
          id={inputId}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.type === "select" ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={inputId}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={inputId}
          type={field.type ?? "text"}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

export function ProfileDetailPage({
  entity,
  id,
  backTo,
  backLabel,
}: ProfileDetailPageProps) {
  const { canAccess } = useAuth();
  const [profile, setProfile] = React.useState<ProfileDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [drawer, setDrawer] = React.useState<DrawerState | null>(null);
  const [confirmAction, setConfirmAction] =
    React.useState<ProfileAction | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const result = await profileDetailService.getProfile(entity, id);
        if (!cancelled) {
          setProfile(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load profile.",
          );
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [entity, id]);

  const runAction = async (action: ProfileAction) => {
    if (action.kind === "drawer") {
      setDrawer({
        action,
        values: makeInitialValues(action.fields),
        errors: {},
      });
      return;
    }

    if (action.kind === "confirm") {
      setConfirmAction(action);
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    setSubmitting(false);
    toast.success(`${action.label} completed`);
  };

  const submitDrawer = async () => {
    if (!drawer) return;
    const errors = validateFields(drawer.action.fields, drawer.values);
    if (Object.keys(errors).length > 0) {
      setDrawer({ ...drawer, errors });
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    setSubmitting(false);
    setDrawer(null);
    toast.success(`${drawer.action.label} saved`);
  };

  const visibleActions =
    profile?.actions.filter((action) => canSeeAction(action, canAccess)) ?? [];

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Profile could not be loaded"
        description={error}
        actionLabel="Back to list"
        onAction={() => window.history.back()}
      />
    );
  }

  if (!profile) {
    return (
      <EmptyState
        icon={FileText}
        title="Profile not found"
        description="The requested record does not exist or is unavailable."
        actionLabel="Back to list"
        onAction={() => window.history.back()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={profile.title}
        description={profile.subtitle}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={backTo as any}>
                <ArrowLeft className="mr-2 size-4" />
                {backLabel}
              </Link>
            </Button>
            {visibleActions.map((action) => {
              const Icon = action.icon ?? Download;
              return (
                <Button
                  key={action.key}
                  variant={action.variant ?? "default"}
                  onClick={() => runAction(action)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Icon className="mr-2 size-4" />
                  )}
                  {action.label}
                </Button>
              );
            })}
          </>
        }
      />

      <Card className="shadow-sm">
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-16 border">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback>{profile.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {profile.eyebrow}
              </p>
              <h2 className="truncate text-xl font-semibold">
                {profile.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile.subtitle}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((badge) => (
              <StatusBadge
                key={`${badge.label}-${badge.value}`}
                value={badge.value}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <MetricGrid metrics={profile.metrics} />

      <Tabs
        defaultValue={profile.tabs[0]?.value ?? "overview"}
        className="space-y-4"
      >
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-auto min-w-max justify-start">
            {profile.tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {profile.tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            <MetricGrid metrics={tab.metrics} />
            <SectionGrid sections={tab.sections} />
            {tab.tables?.map((table) => (
              <DetailTable key={table.title} table={table} />
            ))}
            {tab.notes && <Notes notes={tab.notes} />}
            {tab.timeline && <Timeline items={tab.timeline} />}
          </TabsContent>
        ))}
      </Tabs>

      <Timeline items={profile.auditLog} />

      <Sheet
        open={Boolean(drawer)}
        onOpenChange={(open) => !open && setDrawer(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {drawer && (
            <>
              <SheetHeader>
                <SheetTitle>{drawer.action.label}</SheetTitle>
                <SheetDescription>
                  {drawer.action.description ??
                    "Complete the required fields to continue."}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 grid gap-4">
                {(drawer.action.fields ?? []).map((field) => (
                  <ActionInput
                    key={field.name}
                    field={field}
                    value={drawer.values[field.name] ?? ""}
                    error={drawer.errors[field.name]}
                    onChange={(value) =>
                      setDrawer({
                        ...drawer,
                        values: { ...drawer.values, [field.name]: value },
                        errors: { ...drawer.errors, [field.name]: "" },
                      })
                    }
                  />
                ))}
              </div>
              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={() => setDrawer(null)}>
                  Cancel
                </Button>
                <Button onClick={submitDrawer} disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Save
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.label ?? "Confirm action"}
        description={
          confirmAction?.description ??
          "This action will be recorded in the audit log."
        }
        confirmLabel={confirmAction?.confirmLabel ?? "Confirm"}
        destructive={confirmAction?.destructive}
        onConfirm={() => {
          if (!confirmAction) return;
          toast.success(`${confirmAction.label} completed`);
          setConfirmAction(null);
        }}
      />
    </div>
  );
}
