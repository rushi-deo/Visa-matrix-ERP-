import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip } from "lucide-react";
import { employees } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export const Route = createFileRoute("/_app/chat")({ component: () => (
  <>
    <PageHeader title="Team Chat" description="Internal messaging across teams." />
    <Card className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-[60vh] overflow-hidden">
      <div className="border-r divide-y max-h-[60vh] overflow-y-auto">{employees.slice(0,8).map((e) => (
        <button key={e.id} className="flex items-center gap-2 p-3 hover:bg-muted/50 w-full text-left">
          <Avatar className="size-8"><AvatarImage src={e.avatar} /><AvatarFallback>{e.name[0]}</AvatarFallback></Avatar>
          <div className="min-w-0"><p className="text-sm font-medium truncate">{e.name}</p><p className="text-xs text-muted-foreground truncate">Hey, did you check VM-20247?</p></div>
        </button>
      ))}</div>
      <div className="flex flex-col">
        <div className="border-b p-3 font-medium">Priya Sharma</div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-muted/20">
          {[{me:false,t:"Hi! Quick question on VM-20247"},{me:true,t:"Sure, what's up?"},{me:false,t:"Embassy is asking for an updated bank statement."},{me:true,t:"I'll request it from the client now."}].map((m, i) => (
            <div key={i} className={"max-w-xs " + (m.me ? "ml-auto text-right" : "")}>
              <div className={"inline-block rounded-lg px-3 py-2 text-sm " + (m.me ? "bg-primary text-primary-foreground" : "bg-card border")}>{m.t}</div>
            </div>
          ))}
        </div>
        <div className="border-t p-3 flex gap-2">
          <Button variant="ghost" size="icon"><Paperclip className="size-4" /></Button>
          <Input placeholder="Type a message…" /><Button><Send className="size-4" /></Button>
        </div>
      </div>
    </Card>
  </>
) });
