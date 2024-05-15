import {
  Box,
  Divider,
  Grid,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SettingsLayout from '../SettingsLayout';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import CustomSwitch from '../../components/form/CustomSwitch';
import useAuth from '../../../../hooks/useAuth';
import internationalization from '../../../../i18n/i18n';
import { useDispatch, useSelector } from '../../../../store';
import { getCurrencies } from '../../../../slices/currency';
import { useEffect } from 'react';
import { GeneralPreferences } from '../../../../models/owns/generalPreferences';

function GeneralSettings() {
  const { t }: { t: any } = useTranslation();
  const switchLanguage = ({ lng }: { lng: any }) => {
    internationalization.changeLanguage(lng);
  };
  const { patchGeneralPreferences, companySettings } = useAuth();
  const { generalPreferences } = companySettings;
  const dispatch = useDispatch();
  const { currencies } = useSelector((state) => state.currencies);

  useEffect(() => {
    dispatch(getCurrencies());
  }, []);

  const switches: {
    title: string;
    description: string;
    name: keyof GeneralPreferences;
  }[] = [
    {
      title: t('auto_assign_wo'),
      description: t('auto_assign_wo_description'),
      name: 'autoAssignWorkOrders'
    },
    {
      title: t('auto_assign_requests'),
      description: t('auto_assign_requests_description'),
      name: 'autoAssignRequests'
    },
    {
      title: t('disable_closed_wo_notification'),
      description: t('disable_closed_wo_notification_description'),
      name: 'disableClosedWorkOrdersNotif'
    },
    {
      title: t('ask_feedback_wo_closed'),
      description: t('ask_feedback_wo_closed_description'),
      name: 'askFeedBackOnWOClosed'
    },
    {
      title: t('include_labor_in_total_cost'),
      description: t('include_labor_in_total_cost_description'),
      name: 'laborCostInTotalCost'
    },
    {
      title: t('enable_wo_updates_requesters'),
      description: t('enable_wo_updates_requesters_description'),
      name: 'woUpdateForRequesters'
    },
    {
      title: t('simplify_wo'),
      description: t('simplify_wo_description'),
      name: 'simplifiedWorkOrder'
    }
  ];
  const onSubmit = async (
    _values,
    { resetForm, setErrors, setStatus, setSubmitting }
  ) => {};
  return (
    <SettingsLayout tabIndex={0}>
      <Grid item xs={12}>
        <Box p={4}>
          <Formik
            initialValues={generalPreferences}
            validationSchema={Yup.object().shape({
              language: Yup.string(),
              dateFormat: Yup.string(),
              currency: Yup.string(),
              businessType: Yup.string(),
              autoAssignWorkOrders: Yup.bool(),
              autoAssignRequests: Yup.bool(),
              disableClosedWorkOrdersNotif: Yup.bool(),
              askFeedBackOnWOClosed: Yup.bool(),
              laborCostInTotalCost: Yup.bool(),
              woUpdateForRequesters: Yup.bool()
            })}
            onSubmit={onSubmit}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                          {t('language')}
                        </Typography>
                        <Field
                          onChange={(event) => {
                            patchGeneralPreferences({
                              language: event.target.value
                            });
                            switchLanguage({
                              lng: event.target.value.toLowerCase()
                            });
                          }}
                          value={generalPreferences.language}
                          as={Select}
                          name="language"
                        >
                          <MenuItem value="EN">English</MenuItem>
                          <MenuItem value="FR">Français</MenuItem>
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                          {t('date_format')}
                        </Typography>
                        <Field
                          onChange={(event) =>
                            patchGeneralPreferences({
                              dateFormat: event.target.value
                            })
                          }
                          value={generalPreferences.dateFormat}
                          as={Select}
                          name="dateFormat"
                        >
                          <MenuItem value="MMDDYY">MM/DD/YY</MenuItem>
                          <MenuItem value="DDMMYY">DD/MM/YY</MenuItem>
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                          {t('currency')}
                        </Typography>
                        <Field
                          onChange={(event) =>
                            patchGeneralPreferences({
                              currency: currencies.find(
                                (currency) =>
                                  currency.id === Number(event.target.value)
                              )
                            })
                          }
                          value={generalPreferences.currency?.id}
                          as={Select}
                          name="currency"
                        >
                          {currencies.map((currency) => (
                            <MenuItem
                              key={currency.id}
                              value={currency.id}
                            >{`${currency.name} - ${currency.code}`}</MenuItem>
                          ))}
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                          {t('business_type')}
                        </Typography>
                        <Field
                          onChange={(event) =>
                            patchGeneralPreferences({
                              businessType: event.target.value
                            })
                          }
                          value={generalPreferences.businessType}
                          as={Select}
                          name="businessType"
                        >
                          <MenuItem value="GENERAL_ASSET_MANAGEMENT">
                            {t('general_asset_management')}
                          </MenuItem>
                          <MenuItem value="PHYSICAL_ASSET_MANAGEMENT">
                            {t('physical_asset_management')}
                          </MenuItem>
                        </Field>
                      </Grid>
                    </Grid>
                    <Divider sx={{ mt: 3 }} />
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {switches.map((element) => (
                        <CustomSwitch
                          key={element.name}
                          title={element.title}
                          description={element.description}
                          checked={values[element.name]}
                          name={element.name}
                          handleChange={(event) => {
                            handleChange(event);
                            patchGeneralPreferences({
                              [element.name]: event.target.checked
                            });
                          }}
                        />
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </Box>
      </Grid>
    </SettingsLayout>
  );
}

export default GeneralSettings;
