import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";

const defaultSkeletonRows = 5;

export default function DataTable({
  columns,
  rows,
  rowKey = "id",
  emptyMessage = "No records available.",
  caption,
  onRowClick,
  title,
  subtitle,
  search,
  filters,
  actions,
  loading = false,
  error,
  pagination,
  selectedRows = [],
  onSelectionChange,
  showSelection = false,
  rowActions,
  stickyHeader = true,
  density = "comfortable",
  emptyState,
  toolbarActions,
  showColumnVisibility = false,
  showExport = false,
  showDensity = false,
  showSavedFilters = false,
  onColumnVisibilityClick,
  onExportClick,
  onDensityClick,
  onSavedFiltersClick,
}) {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeRows = Array.isArray(rows) ? rows : [];
  const [openActionMenu, setOpenActionMenu] = useState(null);

  const resolveRowKey = (row, index) => {
    if (typeof rowKey === "function") {
      return rowKey(row, index);
    }

    return row[rowKey] ?? `${index}`;
  };

  const normalizeSelectionValue = (value) => {
    if (value && typeof value === "object" && "id" in value) {
      return value.id;
    }

    return value;
  };

  const selectedValueSet = useMemo(() => {
    return new Set((Array.isArray(selectedRows) ? selectedRows : []).map(normalizeSelectionValue));
  }, [selectedRows]);

  const isSelected = (row, index) => {
    const rowId = resolveRowKey(row, index);
    return selectedValueSet.has(rowId);
  };

  const toggleRowSelection = (row, index) => {
    if (!onSelectionChange) {
      return;
    }

    const rowId = resolveRowKey(row, index);
    const nextSelection = selectedValueSet.has(rowId)
      ? (Array.isArray(selectedRows) ? selectedRows.filter((value) => normalizeSelectionValue(value) !== rowId) : [])
      : [...(Array.isArray(selectedRows) ? selectedRows : []), rowId];

    onSelectionChange(nextSelection);
  };

  const toggleAllSelection = () => {
    if (!onSelectionChange) {
      return;
    }

    if (safeRows.length > 0 && safeRows.every((row, index) => isSelected(row, index))) {
      onSelectionChange([]);
      return;
    }

    onSelectionChange(safeRows.map((row, index) => resolveRowKey(row, index)));
  };

  const renderRowActions = (row, index) => {
    if (!rowActions) {
      return null;
    }

    if (typeof rowActions === "function") {
      return rowActions(row, index);
    }

    if (Array.isArray(rowActions)) {
      return rowActions.map((action) => (
        <button
          key={action.label}
          type="button"
          className="table-action-menu__item"
          onClick={(event) => {
            event.stopPropagation();
            setOpenActionMenu(null);
            action.onClick?.(row, index);
          }}
        >
          {action.icon ? <span className="table-action-menu__icon">{action.icon}</span> : null}
          <span>{action.label}</span>
        </button>
      ));
    }

    return rowActions;
  };

  const headers = (
    <tr>
      {showSelection ? (
        <th className="table-cell--checkbox">
          <input
            aria-label="Select all rows"
            checked={safeRows.length > 0 && safeRows.every((row, index) => isSelected(row, index))}
            className="table-checkbox"
            onChange={toggleAllSelection}
            type="checkbox"
          />
        </th>
      ) : null}
      {safeColumns.map((column) => (
        <th key={column.key}>{column.label}</th>
      ))}
      {rowActions ? <th className="table-cell--actions">Actions</th> : null}
    </tr>
  );

  const contentRows = loading
    ? Array.from({ length: defaultSkeletonRows }).map((_, index) => (
        <tr key={`table-skeleton-${index}`} className="table-row--loading">
          {showSelection ? <td className="table-cell--checkbox"><span className="table-skeleton" /></td> : null}
          {safeColumns.map((column) => (
            <td key={column.key}><span className="table-skeleton table-skeleton--wide" /></td>
          ))}
          {rowActions ? <td><span className="table-skeleton table-skeleton--compact" /></td> : null}
        </tr>
      ))
    : safeRows.length > 0
      ? safeRows.map((row, index) => {
          const rowId = resolveRowKey(row, index);
          const isRowSelected = isSelected(row, index);
          const rowActionsContent = renderRowActions(row, index);

          return (
            <tr
              className={`data-table__row ${onRowClick ? "data-table__row--clickable" : ""} ${isRowSelected ? "data-table__row--selected" : ""}`.trim()}
              key={rowId}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
            >
              {showSelection ? (
                <td className="table-cell--checkbox">
                  <input
                    aria-label={`Select ${rowId}`}
                    checked={isRowSelected}
                    className="table-checkbox"
                    onChange={() => toggleRowSelection(row, index)}
                    onClick={(event) => event.stopPropagation()}
                    type="checkbox"
                  />
                </td>
              ) : null}
              {safeColumns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
              {rowActions ? (
                <td className="table-cell--actions">
                  <div className="table-action-menu">
                    <button
                      aria-label="Open row actions"
                      className="table-action-menu__trigger"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenActionMenu(openActionMenu === rowId ? null : rowId);
                      }}
                      type="button"
                    >
                      <span aria-hidden="true">⋯</span>
                    </button>
                    {openActionMenu === rowId ? <div className="table-action-menu__panel">{rowActionsContent}</div> : null}
                  </div>
                </td>
              ) : null}
            </tr>
          );
        })
      : null;

  const bodyContent = loading ? (
    contentRows
  ) : error ? (
    <tr>
      <td className="data-table__empty data-table__empty--error" colSpan={safeColumns.length + (showSelection ? 1 : 0) + (rowActions ? 1 : 0)}>
        <strong>{typeof error === "string" ? error : "Unable to load this table right now."}</strong>
      </td>
    </tr>
  ) : safeRows.length > 0 ? (
    contentRows
  ) : (
    <tr>
      <td className="data-table__empty" colSpan={safeColumns.length + (showSelection ? 1 : 0) + (rowActions ? 1 : 0)}>
        {emptyState || emptyMessage}
      </td>
    </tr>
  );

  return (
    <section className="enterprise-table">
      {(title || subtitle || search || filters || actions || toolbarActions || showColumnVisibility || showExport || showDensity || showSavedFilters) ? (
        <div className="table-toolbar">
          <div className="table-toolbar__heading">
            {title ? <h3 className="table-toolbar__title">{title}</h3> : null}
            {subtitle ? <p className="table-toolbar__subtitle">{subtitle}</p> : null}
          </div>
          <div className="table-toolbar__controls">
            <div className="table-toolbar__group table-toolbar__group--future">
              {showColumnVisibility ? (
                <Button onClick={onColumnVisibilityClick} size="sm" type="button" variant="outline">
                  Columns
                </Button>
              ) : null}
              {showExport ? (
                <Button onClick={onExportClick} size="sm" type="button" variant="outline">
                  Export
                </Button>
              ) : null}
              {showDensity ? (
                <Button onClick={onDensityClick} size="sm" type="button" variant="outline">
                  Density
                </Button>
              ) : null}
              {showSavedFilters ? (
                <Button onClick={onSavedFiltersClick} size="sm" type="button" variant="outline">
                  Saved filters
                </Button>
              ) : null}
            </div>
            {search ? <div className="table-toolbar__search">{search}</div> : null}
            {filters ? <div className="table-toolbar__filters">{filters}</div> : null}
            {actions ? <div className="table-toolbar__actions">{actions}</div> : null}
            {toolbarActions ? <div className="table-toolbar__actions">{toolbarActions}</div> : null}
          </div>
        </div>
      ) : null}

      <div className={`table-shell ${stickyHeader ? "table-shell--sticky" : ""}`}>
        <div className="table-scroll">
          <table className={`data-table data-table--${density}`}>{caption ? <caption className="sr-only">{caption}</caption> : null}<thead>{headers}</thead><tbody>{bodyContent}</tbody></table>
        </div>
      </div>

      {pagination ? <div className="table-footer">{pagination}</div> : null}
    </section>
  );
}
