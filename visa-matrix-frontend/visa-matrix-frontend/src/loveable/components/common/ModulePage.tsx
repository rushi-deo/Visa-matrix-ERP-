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
  onPrimaryAction?: () => void;
  rowAction?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
}
export function ModulePage<T extends { id: string }>({
  title,
  description,
  data,
  columns,
  searchKeys,
  primaryAction = "Add new",
  rowAction,
  onRowClick,
  onPrimaryAction,
}: Props<T>) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button variant="outline">
              <Filter className="size-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="size-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => {
                console.log("ModulePage primary action clicked");
                onPrimaryAction?.();
              }}
            >
              <Plus className="size-4 mr-2" />
              {primaryAction}
            </Button>
          </>
        }
      />
      <DataTable
        data={data}
        columns={columns}
        searchKeys={searchKeys}
        rowAction={rowAction}
        onRowClick={onRowClick}
      />
    </>
  );
}
