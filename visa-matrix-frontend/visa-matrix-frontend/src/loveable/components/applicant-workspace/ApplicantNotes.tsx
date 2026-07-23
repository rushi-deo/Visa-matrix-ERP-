import * as React from "react";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ApplicantNotesProps {
  applicant: any;
  loading: boolean;
}

const getInitialNotes = (applicant: any) => {
  const notes = applicant?.notes ?? applicant?.applicationNotes ?? applicant?.application_notes;
  return Array.isArray(notes) ? notes : [];
};

const getValue = (note: any, keys: string[], fallback = "-") => {
  for (const key of keys) {
    if (note?.[key] !== undefined && note?.[key] !== null && note?.[key] !== "") return String(note[key]);
  }
  return fallback;
};

export function ApplicantNotes({ applicant, loading }: ApplicantNotesProps) {
  const [notes, setNotes] = React.useState<any[]>(() => getInitialNotes(applicant));
  const [content, setContent] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setNotes(getInitialNotes(applicant));
    setContent("");
    setError(null);
  }, [applicant]);

  const sortedNotes = [...notes].sort((first, second) => {
    const firstDate = new Date(getValue(first, ["createdAt", "created_at", "date", "updated_at"], "")).getTime();
    const secondDate = new Date(getValue(second, ["createdAt", "created_at", "date", "updated_at"], "")).getTime();
    return (Number.isNaN(secondDate) ? 0 : secondDate) - (Number.isNaN(firstDate) ? 0 : firstDate);
  });

  const handleSave = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Note content is required.");
      return;
    }

    const currentUser = applicant?.currentUserName ?? applicant?.userName ?? "Current user";
    setNotes((currentNotes) => [
      {
        id: `local-note-${Date.now()}`,
        author: currentUser,
        createdAt: new Date().toISOString(),
        body: trimmedContent,
      },
      ...currentNotes,
    ]);
    setContent("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      {loading ? <p className="text-sm text-muted-foreground">Loading notes...</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Plus className="size-4" />Add Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              if (error) setError(null);
            }}
            placeholder="Write an internal note..."
            rows={4}
            aria-label="Note content"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="button" onClick={handleSave}>
            <MessageSquare className="size-4" />
            Save
          </Button>
        </CardContent>
      </Card>

      {!loading && sortedNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes available.</p>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note, index) => (
            <Card key={note.id ?? `${getValue(note, ["createdAt", "created_at"], "note")}-${index}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{getValue(note, ["author", "authorName", "author_name", "createdBy", "created_by"], "Unknown author")}</p>
                  <p className="text-xs text-muted-foreground">{getValue(note, ["createdAt", "created_at", "date", "updated_at"])}</p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{getValue(note, ["body", "content", "note", "text"], "")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
