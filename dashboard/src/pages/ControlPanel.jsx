import React, { useState } from "react";

import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Banner from "../partials/Banner";

function ControlPanel({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-black text-zinc-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="dashboard-content-scroll relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-gradient-to-b from-zinc-950 via-black to-black">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="mx-auto w-full max-w-9xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>

        <Banner />
      </div>
    </div>
  );
}

export default ControlPanel;
