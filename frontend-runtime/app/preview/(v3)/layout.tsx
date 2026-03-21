import "@/v3-port/src/styles/fonts.css";
import "@/v3-port/src/styles/theme.css";

export default function PreviewV3Layout({ children }: { children: React.ReactNode }) {
  return <div className="dark min-h-screen">{children}</div>;
}
