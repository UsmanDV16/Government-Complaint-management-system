import { NavLink } from "react-router-dom";

function Sidebar({ links }) {
  return (
    <aside className="sidebar">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}

export default Sidebar;
