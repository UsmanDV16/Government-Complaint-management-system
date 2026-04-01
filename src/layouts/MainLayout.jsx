import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

function MainLayout({ links, children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="content-shell">
        <Sidebar links={links} />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
