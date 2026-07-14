import React from "react";
import { Button } from "./ui/button";

export default function TablePagination({
  page,
  pageCount,
  onPrevious,
  onNext,
  itemLabel = "records",
  className = "",
}) {
  return (
    <div className={`table-pagination ${className}`.trim()}>
      <span className="table-pagination__info">
        Page {page} of {pageCount || 1} for {itemLabel}
      </span>
      <div className="button-row">
        <Button disabled={page <= 1} onClick={onPrevious} size="sm" type="button" variant="outline">
          Previous
        </Button>
        <Button disabled={page >= pageCount} onClick={onNext} size="sm" type="button" variant="outline">
          Next
        </Button>
      </div>
    </div>
  );
}
