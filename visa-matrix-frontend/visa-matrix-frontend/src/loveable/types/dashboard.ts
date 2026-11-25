export type ActivityItem = {
  id: string | number;
  who: string;
  action: string;
  target: string;
  time: string;
  type: "success" | "info" | "warning" | "danger";
};
