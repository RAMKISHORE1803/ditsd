import dynamic from 'next/dynamic';

// Dynamically import MapComponent with SSR disabled
const DynamicMapComponent = dynamic(
  () => import('@/components/MapComponent'),
  { ssr: false }
);

export default function MapPage() {
  // Use the dynamic component instead of the direct import
  return <DynamicMapComponent />;
}