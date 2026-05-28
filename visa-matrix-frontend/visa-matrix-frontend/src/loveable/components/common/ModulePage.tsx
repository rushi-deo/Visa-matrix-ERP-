import { PageHeader } from "./PageHeader";
import { DataTable, type Column } from "./DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter } from "lucide-react";

interface Props<T extends { id: string }> {
  title: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  primaryAction?: string;
  rowAction?: (row: T) => React.ReactNode;
}
export function ModulePage<T extends { id: string }>({ title, description, data, columns, searchKeys, primaryAction = "Add new", rowAction }: Props<T>) {
  return (
    <>
      <PageHeader title={title} description={description}
        actions={<>
          <Button variant="outline"><Filter className="size-4 mr-2" />Filters</Button>
          <Button variant="outline"><Download className="size-4 mr-2" />Export</Button>
          <Button><Plus className="size-4 mr-2" />{primaryAction}</Button>
        </>} />
      <DataTable data={data} columns={columns} searchKeys={searchKeys} rowAction={rowAction} />
    </>
  );
}
