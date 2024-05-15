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
import { getIncompleteByAsset } from '../../../../../slices/analytics/workOrder';
import Loading from '../../Loading';
import { getRandomColor } from '../../../../../utils/overall';

interface WOStatusIncompleteProps {
  handleOpenModal: (
    columns: string[],
    filters: Filter[],
    title: string
  ) => void;
}
function IncompleteWOByAsset({ handleOpenModal }: WOStatusIncompleteProps) {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const { incompleteByAsset, loading } = useSelector(
    (state) => state.woAnalytics
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getIncompleteByAsset());
  }, []);

  const columns: string[] = ['id'];

  const formattedData: {
    label: string;
    count: number;
    color: string;
    filters: Filter[];
  }[] = incompleteByAsset.map((asset) => {
    return {
      label: asset.name,
      count: asset.count,
      averageAge: asset.averageAge,
      color: getRandomColor(),
      filters: [{ key: 'asset', value: asset.id }]
    };
  });
  const title = t('assets');
  return (
    <AnalyticsCard title={title} description="wo_age_description">
      {loading.incompleteByAsset ? (
        <Loading />
      ) : (
        <ComposedChart width={508} height={508} data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name={t('work_orders')}>
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
            name={t('average_age')}
            type="monotone"
            dataKey="averageAge"
            stroke="#ff7300"
          />
        </ComposedChart>
      )}
    </AnalyticsCard>
  );
}

export default IncompleteWOByAsset;
