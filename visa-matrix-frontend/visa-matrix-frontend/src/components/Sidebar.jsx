import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  CircleHelp,
  FileText,
  FolderOpen,
  Globe2,
  LayoutDashboard,
  Landmark,
  ListTodo,
  Receipt,
  Settings2,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import { navigationItems } from "../data/navigation";
import { useAuth } from "../context/AuthContext";

const primaryPaths = [
  "/dashboard",
  "/accounts",
  "/customers",
  "/applications",
  "/countries",
  "/documents",
  "/payments",
  "/communication",
  "/workflow",
  "/visa-question-flow",
  "/tasks",
  "/reports",
  "/admin",
  "/hr",
  "/settings",
];

const sidebarLabels = {
  "/dashboard": "Home",
  "/accounts": "Accounts",
  "/customers": "Customers",
  "/applications": "Applications",
  "/countries": "Countries",
  "/documents": "Documents",
  "/payments": "Payments",
  "/hr": "HR",
  "/communication": "Notifications",
  "/audit-logs": "Audit Logs",
  "/workflow": "Workflow",
  "/visa-question-flow": "Questions",
  "/tasks": "Tasks",
  "/reports": "Reports",
  "/admin": "Admin",
  "/settings": "Settings",
};

const menuIcons = {
  "/dashboard": <LayoutDashboard size={18} />,
  "/customers": <Users size={18} />,
  "/applications": <FileText size={18} />,
  "/countries": <Globe2 size={18} />,
  "/documents": <FolderOpen size={18} />,
  "/payments": <Receipt size={18} />,
  "/accounts": <Landmark size={18} />,
  "/hr": <BriefcaseBusiness size={18} />,
  "/communication": <BellRing size={18} />,
  "/audit-logs": <ShieldCheck size={18} />,
  "/workflow": <Workflow size={18} />,
  "/visa-question-flow": <CircleHelp size={18} />,
  "/tasks": <ListTodo size={18} />,
  "/reports": <BarChart3 size={18} />,
  "/admin": <ShieldCheck size={18} />,
  "/settings": <Settings2 size={18} />,
};

const sidebarSections = [
  { title: "CRM", paths: ["/dashboard", "/customers", "/applications", "/documents"] },
  { title: "Visa Operations", paths: ["/countries", "/workflow", "/visa-question-flow", "/tasks"] },
  { title: "Finance", paths: ["/payments", "/accounts"] },
  { title: "HR", paths: ["/hr"] },
  { title: "Administration", paths: ["/communication", "/audit-logs", "/reports", "/admin", "/settings"] },
];

export default function Sidebar() {
  const location = useLocation();
  const { canAccess } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (key) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const primaryNavigation = navigationItems.filter((item) => {
    if (item.children) {
      return !item.module || canAccess(item.module, "view");
    }
    return (
      primaryPaths.includes(item.path) &&
      (!item.module || canAccess(item.module, "view")) &&
      item.path !== "/settings"
    );
  });

  const visibleSectionItems = (sectionPaths) =>
    primaryNavigation.filter((item) => sectionPaths.includes(item.path));

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <Link className="sidebar__brand" to="/">
          <span className="sidebar__brand-mark">
            <img src="/logo.png" alt="Visa Matrix logo" className="sidebar__brand-image" />
          </span>
          <div className="sidebar__brand-copy">
            <h2>Visa Matrix</h2>
            <span>Enterprise Platform</span>
          </div>
        </Link>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        {sidebarSections.map((section) => {
          const items = visibleSectionItems(section.paths);

          if (!items.length) {
            return null;
          }

          return (
            <div key={section.title} className="sidebar__section">
              <p className="sidebar__section-title">{section.title}</p>
              {items.map((item) => {
                if (item.children) {
                  const hasActiveChild = item.children.some(
                    (child) => child.path && location.pathname.startsWith(child.path),
                  );
                  const isExpanded = expandedMenus[item.shortLabel] || hasActiveChild;

                  return (
                    <div key={item.shortLabel} className="sidebar__menu-group">
                      <button
                        onClick={() => toggleMenu(item.shortLabel)}
                        className={`sidebar__link sidebar__menu-toggle ${
                          hasActiveChild ? "sidebar__link--active" : ""
                        } ${isExpanded ? "sidebar__menu-toggle--expanded" : ""}`}
                        aria-expanded={isExpanded}
                      >
                        <span className="sidebar__icon" aria-hidden="true">
                          {menuIcons[item.path]}
                        </span>
                        <span className="sidebar__label">{item.shortLabel}</span>
                        <span className="sidebar__chevron" aria-hidden="true">
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <path
                              d="M7 8l3 3 3-3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="sidebar__submenu">
                          {item.children.map((child) => {
                            const isActive = child.path && location.pathname.startsWith(child.path);

                            return (
                              <Link
                                key={child.path}
                                to={child.path}
                                className={`sidebar__submenu-link ${isActive ? "sidebar__submenu-link--active" : ""}`}
                              >
                                <span className="sidebar__submenu-label">{child.shortLabel}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const isDashboardRoute =
                  item.path === "/dashboard" &&
                  (location.pathname === "/" || location.pathname === "/dashboard");
                const isActive =
                  isDashboardRoute ||
                  (item.path !== "/" && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    className={`sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
                    to={item.path}
                  >
                    <span className="sidebar__icon" aria-hidden="true">
                      {menuIcons[item.path]}
                    </span>
                    <span className="sidebar__label">
                      {sidebarLabels[item.path] ?? item.shortLabel ?? item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__footer-label">Operations Panel</span>
        <strong>Visa Matrix ERP</strong>
        <div className="sidebar__footer-meta">
          <span className="sidebar__footer-version">Version 2.0</span>
          <span className="sidebar__status-pill">
            <span className="sidebar__status-dot" />
            Online
          </span>
        </div>
        <p>System status and workspace access are synchronized in real time.</p>
      </div>
    </aside>
  );
}
