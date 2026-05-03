import { useState } from "react";
import { NavLink } from "react-router-dom";

const iconPaths = {
  dashboard: "M4 11.5V20h6v-6h4v6h6v-8.5L12 4 4 11.5Z",
  submit: "M12 5v14m-7-7h14",
  complaints: "M5 6h14v12H5zM8 10h8M8 14h5",
  notifications: "M12 22a2.5 2.5 0 0 0 2.4-1.8H9.6A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2h18Z",
  departments: "M4 7h16v10H4zM8 7v10M16 7v10",
  users: "M12 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-5 7a5 5 0 0 1 10 0",
  feedback: "M5 6h14v10H8l-3 3V6Zm4 4h6M9 13h4",
  types: "M7 5h10v14H7zM10 8h4M10 12h4"
};

function getIconKey(link) {
  if (link.to.includes("/dashboard")) return "dashboard";
  if (link.to.includes("/submit")) return "submit";
  if (link.to.includes("/complaints") && !link.to.includes("/review") && !link.to.includes("/types")) return "complaints";
  if (link.to.includes("/notifications")) return "notifications";
  if (link.to.includes("/departments")) return "departments";
  if (link.to.includes("/users")) return "users";
  if (link.to.includes("/feedback")) return "feedback";
  if (link.to.includes("/types")) return "types";
  return "dashboard";
}

function SidebarIcon({ name }) {
  return (
    <svg className="sidebar-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  );
}

function Sidebar({ links }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <button
        type="button"
        className="sidebar-toggle btn btn-ghost"
        onClick={() => setIsCollapsed((prev) => !prev)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span aria-hidden="true">{isCollapsed ? "»" : "«"}</span>
      </button>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
          title={link.label}
        >
          <SidebarIcon name={getIconKey(link)} />
          <span className="sidebar-label">{link.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}

export default Sidebar;
