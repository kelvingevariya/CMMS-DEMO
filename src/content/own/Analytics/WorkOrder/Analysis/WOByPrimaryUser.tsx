import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import AnalyticsCard from '../../AnalyticsCard';
import { Filter } from '../WOModal';
import { useDispatch, useSelector } from '../../../../../store';
import { useEffect } from 'react';
import { getCountsByUser } from '../../../../../slices/analytics/workOrder';
import { getRandomColor } from '../../../../../utils/overall';
import Loading from '../../Loading';

interface WOByPrimaryUserProps {
  handleOpenModal: (
    columns: string[],
    filters: Filter[],
    title: string
  ) => void;
}
function WOByPrimaryUser({ handleOpenModal }: WOByPrimaryUserProps) {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { completeByPrimaryUser, loading } = useSelector(
    (state) => state.woAnalytics
  );

  useEffect(() => {
    dispatch(getCountsByUser());
  }, []);

  const columns = ['id'];

  const formattedData = completeByPrimaryUser.map((user) => {
    return {
      label: `${user.firstName} ${user.lastName}`,
      value: user.count,
      color: getRandomColor(),
      filters: [{ key: 'primaryUser', value: user.id }]
    };
  });
  const title = t('grouped_by_assigned_to');
  return (
    <AnalyticsCard title={title}>
      {loading.completeByPrimaryUser ? (
        <Loading />
      ) : (
        <PieChart width={200} height={300}>
          <Pie
            data={formattedData}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            fill="#8884d8"
          >
            {formattedData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                onClick={() => {
                  handleOpenModal(columns, entry.filters, title);
                }}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      )}
    </AnalyticsCard>
  );
}

export default WOByPrimaryUser;
