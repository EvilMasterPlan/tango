import { Helmet } from 'react-helmet-async';
import { AdminSubpageHeader } from '@/pages/Admin/AdminSubpageHeader';
import { RadarChartPreview } from '@/pages/Admin/RadarChartPreview';
import '@/pages/Admin/Admin.scss';

export function AdminRadarPage() {
  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Radar Charts</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="admin-page">
        <AdminSubpageHeader title="Radar Charts" />
        <RadarChartPreview />
      </div>
    </>
  );
}
