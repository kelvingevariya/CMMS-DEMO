import { Helmet } from 'react-helmet-async';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect } from 'react';
import { TitleContext } from '../../../../../contexts/TitleContext';
import Overview from './Overview';
import { Filter } from '../WOModal';
import RequestStatsByPriority from './RequestStatsByPriority';
import RequestsByMonth from './RequestsByMonth';

interface WOStatusStatsProps {
  handleOpenWOModal: (
    columns: string[],
    filters: Filter[],
    title: string
  ) => void;
}
function RequestAnalysis({ handleOpenWOModal }: WOStatusStatsProps) {
  const { t }: { t: any } = useTranslation();
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle(t('requests_analysis'));
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('requests_analysis')}</title>
      </Helmet>
      <Grid
        container
        justifyContent="center"
        alignItems="stretch"
        spacing={1}
        my={2}
        paddingX={1}
      >
        <Grid item xs={12}>
          <Overview handleOpenModal={handleOpenWOModal} />
        </Grid>
        <Grid item xs={12}>
          <RequestStatsByPriority handleOpenModal={handleOpenWOModal} />
        </Grid>
        <Grid item xs={12}>
          <RequestsByMonth handleOpenModal={handleOpenWOModal} />
        </Grid>
      </Grid>
    </>
  );
}

export default RequestAnalysis;
