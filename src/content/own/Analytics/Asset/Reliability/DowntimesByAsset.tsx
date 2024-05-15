import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import AnalyticsCard from '../../AnalyticsCard';
import { Filter } from '../WOModal';
import { useDispatch, useSelector } from '../../../../../store';
import { useEffect } from 'react';
import Loading from '../../Loading';
import { getDowntimesByAsset } from '../../../../../slices/analytics/asset';
import { getRandomColor } from '../../../../../utils/overall';

interface WOStatusIncompleteProps {
  handleOpenModal: (
    columns: string[],
    filters: Filter[],
    title: string
  ) => void;
}
function DowntimesByAsset({ handleOpenModal }: WOStatusIncompleteProps) {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const { downtimesByAsset, loading } = useSelector(
    (state) => state.assetAnalytics
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getDowntimesByAsset());
  }, []);

  const columns: string[] = ['id'];

  const formattedData: {
    label: string;
    count: number;
    color: string;
    percent: number;
    filters: Filter[];
  }[] = downtimesByAsset.map((asset) => {
    return {
      label: asset.name,
      count: asset.count,
      percent: asset.percent,
      color: getRandomColor(),
      filters: [{ key: 'asset', value: asset.id }]
    };
  });

  const title = t('downtime_by_asset');
  return (
    <AnalyticsCard title={title}>
      {loading.downtimesByAsset ? (
        <Loading />
      ) : (
        <ComposedChart width={508} height={508} data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name={t('downtime_events')}>
            {formattedData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                onClick={() => {
                  handleOpenModal(columns, entry.filters, t(title));
                }}
              />
            ))}
          </Bar>
          <Line
            name={t('percent_downtime')}
            type="monotone"
            dataKey="percent"
            stroke="#ff7300"
          />
        </ComposedChart>
      )}
    </AnalyticsCard>
  );
}

export default DowntimesByAsset;
