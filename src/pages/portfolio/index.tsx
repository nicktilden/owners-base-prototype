import dynamic from "next/dynamic";

const HomeContent = dynamic(() => import("@/components/HomeContent"), {
  ssr: false,
  loading: () => <p style={{ padding: 40 }}>Loading…</p>,
});

export default function PortfolioHub() {
  return <HomeContent />;
}
