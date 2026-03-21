import { PreviewRuntimeProvider } from "@/v3-port/src/app/preview-runtime";
import { CoinDetail } from "@/v3-port/src/app/pages/CoinDetail";

export default function CoinV3PreviewPage() {
  return (
    <PreviewRuntimeProvider>
      <CoinDetail />
    </PreviewRuntimeProvider>
  );
}
