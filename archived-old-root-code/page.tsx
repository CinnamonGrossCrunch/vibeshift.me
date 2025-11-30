'use client';

import ClientDashboard from "./components/ClientDashboard";

export default function Home() {
  // Client-side fetching - data will be pre-cached by cron jobs
  return <ClientDashboard initialData={null} />;
}
