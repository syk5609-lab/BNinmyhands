import { PreviewRuntimeProvider } from "@/v3-port/src/app/preview-runtime";
import { Dashboard } from "@/v3-port/src/app/pages/Dashboard";

export default function DashboardV3PreviewPage() {
  return (
    <PreviewRuntimeProvider>
      <Dashboard />
    </PreviewRuntimeProvider>
  );
}
