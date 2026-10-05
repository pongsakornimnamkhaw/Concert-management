import { Box } from '@mui/material';
import CustomerHeader from '@/layouts/customer/CustomerHeader';
import EventList from '@/features/concert/components/PosterShow';
import { useSearchParams } from 'react-router-dom';

export default function EventsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <CustomerHeader />
      <EventList title={query ? `ผลการค้นหา: ${query}` : 'ทุกงานแสดง'} query={query} />
    </Box>
  );
}
