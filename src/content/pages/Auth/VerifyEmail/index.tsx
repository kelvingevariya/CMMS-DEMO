import { Box, Card, Container, styled, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';

import { useTranslation } from 'react-i18next';
import Logo from 'src/components/LogoSign';

const MainContent = styled(Box)(
  () => `
    height: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`
);

function VerifyEmail() {
  const { t }: { t: any } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('verify_email_title')}</title>
      </Helmet>
      <MainContent>
        <Container maxWidth="sm">
          <Logo />
          <Card
            sx={{
              mt: 3,
              p: 4
            }}
          >
            <Box>
              <Typography
                variant="h2"
                sx={{
                  mb: 1
                }}
              >
                {t('verify_email_title')}
              </Typography>
              <Typography
                variant="h4"
                color="text.secondary"
                fontWeight="normal"
                sx={{
                  mb: 3
                }}
              >
                {t('verify_email_description')}
              </Typography>
            </Box>
          </Card>
        </Container>
      </MainContent>
    </>
  );
}

export default VerifyEmail;
