import React from "react";

import { Bell, CheckCheck } from "lucide-react";

import { Button } from "../../components/ui/button";

export default function NotificationCenter() {
  const notifications = [
    {
      id: 1,
      title: "New visa application received",
      desc: "Rahul Sharma submitted a Canada PR application.",
      time: "2m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Document verified",
      desc: "Passport verification completed successfully.",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      title: "Payment received",
      desc: "Invoice #VM-204 has been paid.",
      time: "3h ago",
      unread: false,
    },
  ];

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
      >
        <Bell className="h-5 w-5" />

        {unread > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </Button>

      <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-3">
          <div>
            <p className="text-sm font-medium">
              Notifications
            </p>

            <p className="text-xs text-slate-500">
              {unread} unread
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        </div>

        <ul className="max-h-80 overflow-y-auto">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex gap-3 border-b p-3 hover:bg-slate-50 ${
                n.unread ? "bg-slate-100" : ""
              }`}
            >
              <span
                className={`mt-2 h-2 w-2 rounded-full ${
                  n.unread ? "bg-blue-500" : "bg-slate-300"
                }`}
              />

              <div className="flex-1">
                <p className="text-sm font-medium">
                  {n.title}
                </p>

                <p className="text-xs text-slate-500">
                  {n.desc}
                </p>
              </div>

              <span className="text-[10px] text-slate-400">
                {n.time}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t p-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
          >
            View all notifications
          </Button>
        </div>
      </div>
    </div>
  );
}