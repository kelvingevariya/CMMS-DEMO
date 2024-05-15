import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IField } from '../type';
import Location from '../../../models/owns/location';
import * as React from 'react';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { TitleContext } from '../../../contexts/TitleContext';
import {
  addLocation,
  deleteLocation,
  editLocation,
  getLocationChildren,
  getLocations
} from '../../../slices/location';
import ConfirmDialog from '../components/ConfirmDialog';
import { useDispatch, useSelector } from '../../../store';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import { GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import CustomDataGrid from '../components/CustomDatagrid';
import {
  GridActionsCellItem,
  GridEventListener,
  GridRenderCellParams,
  GridRowParams,
  GridToolbar,
  GridValueGetterParams
} from '@mui/x-data-grid';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import Form from '../components/form';
import * as Yup from 'yup';
import { isNumeric } from '../../../utils/validators';
import LocationDetails from './LocationDetails';
import { useNavigate, useParams } from 'react-router-dom';
import Map from '../components/Map';
import { formatSelect, formatSelectMultiple } from '../../../utils/formatters';
import { CustomSnackBarContext } from 'src/contexts/CustomSnackBarContext';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { DataGridProProps, useGridApiRef } from '@mui/x-data-grid-pro';
import { GroupingCellWithLazyLoading } from '../Assets/GroupingCellWithLazyLoading';
import { AssetRow } from '../../../models/owns/asset';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import PermissionErrorMessage from '../components/PermissionErrorMessage';
import NoRowsMessageWrapper from '../components/NoRowsMessageWrapper';
import { getImageAndFiles } from '../../../utils/overall';
import { getLocationUrl } from '../../../utils/urlPaths';
import { exportEntity } from '../../../slices/exports';
import MoreVertTwoToneIcon from '@mui/icons-material/MoreVertTwoTone';
import { PlanFeature } from '../../../models/owns/subscriptionPlan';

function Locations() {
  const { t }: { t: any } = useTranslation();
  const [currentTab, setCurrentTab] = useState<string>('list');
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const { locationsHierarchy, locations, loadingGet } = useSelector(
    (state) => state.locations
  );
  const { loadingExport } = useSelector((state) => state.exports);
  const apiRef = useGridApiRef();
  const tabs = [
    { value: 'list', label: t('list_view') },
    { value: 'map', label: t('map_view') }
  ];
  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const { setTitle } = useContext(TitleContext);
  const { locationId } = useParams();
  const { uploadFiles } = useContext(CompanySettingsContext);
  const {
    hasViewPermission,
    hasViewOtherPermission,
    hasEditPermission,
    hasCreatePermission,
    hasDeletePermission,
    hasFeature
  } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<Location>();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const handleOpenUpdate = () => {
    setOpenUpdateModal(true);
  };
  const onOpenDeleteDialog = () => {
    setOpenDelete(true);
  };

  const changeCurrentLocation = (id: number) => {
    setCurrentLocation(locations.find((location) => location.id === id));
  };
  const handleDelete = (id: number) => {
    handleCloseDetails();
    dispatch(deleteLocation(id)).then(onDeleteSuccess).catch(onDeleteFailure);
    setOpenDelete(false);
  };
  const onCreationSuccess = () => {
    setOpenAddModal(false);
    showSnackBar(t('location_create_success'), 'success');
  };
  const onCreationFailure = (err) =>
    showSnackBar(t('location_create_failure'), 'error');
  const onEditSuccess = () => {
    setOpenUpdateModal(false);
    showSnackBar(t('changes_saved_success'), 'success');
  };
  const onEditFailure = (err) =>
    showSnackBar(t('location_edit_failure'), 'error');
  const onDeleteSuccess = () => {
    showSnackBar(t('location_delete_success'), 'success');
  };
  const onDeleteFailure = (err) =>
    showSnackBar(t('location_delete_failure'), 'error');

  const handleOpenDetails = (id: number) => {
    const foundLocation = locations.find((location) => location.id === id);
    if (foundLocation) {
      setCurrentLocation(foundLocation);
      window.history.replaceState(null, 'Location details', getLocationUrl(id));
      setOpenDrawer(true);
    }
  };
  const handleCloseDetails = () => {
    window.history.replaceState(null, 'Location', `/app/locations`);
    setOpenDrawer(false);
  };
  useEffect(() => {
    setTitle(t('locations'));
    if (hasViewPermission(PermissionEntity.LOCATIONS)) {
      dispatch(getLocations());
      dispatch(getLocationChildren(0, []));
    }
  }, []);

  useEffect(() => {
    if (apiRef.current.getRow) {
      const handleRowExpansionChange: GridEventListener<
        'rowExpansionChange'
      > = async (node) => {
        const row = apiRef.current.getRow(node.id) as AssetRow | null;
        if (!node.childrenExpanded || !row || row.childrenFetched) {
          return;
        }
        apiRef.current.updateRows([
          {
            id: `Loading Locations under ${row.name} #${node.id}`,
            hierarchy: [...row.hierarchy, '']
          }
        ]);
        dispatch(getLocationChildren(row.id, row.hierarchy));
      };
      /**
       * By default, the grid does not toggle the expansion of rows with 0 children
       * We need to override the `cellKeyDown` event listener to force the expansion if there are children on the server
       */
      const handleCellKeyDown: GridEventListener<'cellKeyDown'> = (
        params,
        event
      ) => {
        const cellParams = apiRef.current.getCellParams(
          params.id,
          params.field
        );
        if (cellParams.colDef.type === 'treeDataGroup' && event.key === ' ') {
          event.stopPropagation();
          event.preventDefault();
          event.defaultMuiPrevented = true;

          apiRef.current.setRowChildrenExpansion(
            params.id,
            !params.rowNode.childrenExpanded
          );
        }
      };

      apiRef.current.subscribeEvent(
        'rowExpansionChange',
        handleRowExpansionChange
      );
      apiRef.current.subscribeEvent('cellKeyDown', handleCellKeyDown, {
        isFirst: true
      });
    }
  }, [apiRef]);

  useEffect(() => {
    if (locations?.length && locationId && isNumeric(locationId)) {
      handleOpenDetails(Number(locationId));
    }
  }, [locations]);

  const formatValues = (values) => {
    const newValues = { ...values };
    newValues.customers = formatSelectMultiple(newValues.customers);
    newValues.vendors = formatSelectMultiple(newValues.vendors);
    newValues.workers = formatSelectMultiple(newValues.workers);
    newValues.teams = formatSelectMultiple(newValues.teams);
    newValues.parentLocation = formatSelect(newValues.parentLocation);
    newValues.longitude = newValues.coordinates?.lng;
    newValues.latitude = newValues.coordinates?.lat;
    return newValues;
  };
  const columns: GridEnrichedColDef[] = [
    {
      field: 'name',
      headerName: t('name'),
      description: t('name'),
      width: 150,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Box sx={{ fontWeight: 'bold' }}>{params.value}</Box>
      )
    },
    {
      field: 'address',
      headerName: t('address'),
      description: t('address'),
      width: 150
    },
    {
      field: 'createdAt',
      headerName: t('created_at'),
      description: t('created_at'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<string>) =>
        getFormattedDate(params.value)
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('actions'),
      description: t('actions'),
      getActions: (params: GridRowParams) => {
        let actions = [
          <GridActionsCellItem
            key="edit"
            icon={<EditTwoToneIcon fontSize="small" color="primary" />}
            onClick={() => {
              changeCurrentLocation(Number(params.id));
              handleOpenUpdate();
            }}
            label={t('edit')}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteTwoToneIcon fontSize="small" color="error" />}
            onClick={() => {
              changeCurrentLocation(Number(params.id));
              setOpenDelete(true);
            }}
            label={'to_delete'}
          />
        ];
        if (!hasEditPermission(PermissionEntity.LOCATIONS, params.row)) {
          actions.shift();
        }
        if (!hasDeletePermission(PermissionEntity.LOCATIONS, params.row)) {
          actions.pop();
        }
        return actions;
      }
    }
  ];

  const fields: Array<IField> = [
    {
      name: 'name',
      type: 'text',
      label: t('name'),
      placeholder: t('enter_location_name'),
      required: true
    },
    {
      name: 'address',
      type: 'text',
      label: t('address'),
      placeholder: 'Casa, Maroc',
      required: true
    },
    {
      name: 'parentLocation',
      type: 'select',
      type2: 'parentLocation',
      label: t('parent_location'),
      placeholder: t('select_location')
    },
    {
      name: 'workers',
      multiple: true,
      type: 'select',
      type2: 'user',
      label: t('workers'),
      placeholder: t('select_workers')
    },
    {
      name: 'teams',
      multiple: true,
      type: 'select',
      type2: 'team',
      label: t('teams'),
      placeholder: 'Select teams'
    },
    {
      name: 'vendors',
      multiple: true,
      type: 'select',
      type2: 'vendor',
      label: t('vendors'),
      placeholder: 'Select vendors'
    },
    {
      name: 'customers',
      multiple: true,
      type: 'select',
      type2: 'customer',
      label: t('customers'),
      placeholder: 'Select customers'
    },
    {
      name: 'mapTitle',
      type: 'titleGroupField',
      label: t('map_coordinates')
    },
    {
      name: 'coordinates',
      type: 'coordinates',
      label: t('map_coordinates')
    },
    {
      name: 'image',
      type: 'file',
      fileType: 'image',
      label: t('image')
    },
    {
      name: 'files',
      type: 'file',
      multiple: true,
      label: t('files'),
      fileType: 'file'
    }
  ];

  const getEditFields = () => {
    const fieldsClone = [...fields];
    const parentLocationIndex = fieldsClone.findIndex(
      (field) => field.name === 'parentLocation'
    );
    fieldsClone.splice(parentLocationIndex, 1);
    return fieldsClone;
  };
  const shape = {
    name: Yup.string().required(t('required_location_name')),
    address: Yup.string().required(t('required_location_address'))
  };

  const renderLocationAddModal = () => (
    <Dialog
      fullWidth
      maxWidth="md"
      open={openAddModal}
      onClose={() => setOpenAddModal(false)}
    >
      <DialogTitle
        sx={{
          p: 3
        }}
      >
        <Typography variant="h4" gutterBottom>
          {t('add_location')}
        </Typography>
        <Typography variant="subtitle2">
          {t('add_location_description')}
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        <Box>
          <Form
            fields={fields}
            validation={Yup.object().shape(shape)}
            submitText={t('add')}
            values={{}}
            onChange={({ field, e }) => {}}
            onSubmit={async (values) => {
              let formattedValues = formatValues(values);
              return new Promise<void>((resolve, rej) => {
                uploadFiles(formattedValues.files, formattedValues.image)
                  .then((files) => {
                    const imageAndFiles = getImageAndFiles(files);
                    formattedValues = {
                      ...formattedValues,
                      image: imageAndFiles.image,
                      files: imageAndFiles.files
                    };
                    dispatch(addLocation(formattedValues))
                      .then(onCreationSuccess)
                      .then(() => {
                        resolve();
                        dispatch(getLocationChildren(0, []));
                      })
                      .catch((err) => {
                        onCreationFailure(err);
                        rej(err);
                      });
                  })
                  .catch((err) => {
                    onCreationFailure(err);
                    rej(err);
                  });
              });
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
  const groupingColDef: DataGridProProps['groupingColDef'] = {
    headerName: t('hierarchy'),
    renderCell: (params) => <GroupingCellWithLazyLoading {...params} />
  };
  const renderMenu = () => (
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={openMenu}
      onClose={handleCloseMenu}
      MenuListProps={{
        'aria-labelledby': 'basic-button'
      }}
    >
      {hasViewOtherPermission(PermissionEntity.LOCATIONS) && (
        <MenuItem
          disabled={loadingExport['locations']}
          onClick={() => {
            dispatch(exportEntity('locations')).then((url: string) => {
              window.open(url);
            });
          }}
        >
          <Stack spacing={2} direction="row">
            {loadingExport['locations'] && <CircularProgress size="1rem" />}
            <Typography>{t('to_export')}</Typography>
          </Stack>
        </MenuItem>
      )}
      {hasViewPermission(PermissionEntity.SETTINGS) && (
        <MenuItem
          onClick={() => navigate('/app/imports/locations')}
          disabled={!hasFeature(PlanFeature.IMPORT_CSV)}
        >
          {t('to_import')}
        </MenuItem>
      )}
    </Menu>
  );
  const renderLocationUpdateModal = () => (
    <Dialog
      fullWidth
      maxWidth="md"
      open={openUpdateModal}
      onClose={() => setOpenUpdateModal(false)}
    >
      <DialogTitle
        sx={{
          p: 3
        }}
      >
        <Typography variant="h4" gutterBottom>
          {t('edit_location')}
        </Typography>
        <Typography variant="subtitle2">
          {t('edit_location_description')}
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        <Box>
          <Form
            fields={getEditFields()}
            validation={Yup.object().shape(shape)}
            submitText={t('save')}
            values={{
              ...currentLocation,
              title: currentLocation?.name,
              workers: currentLocation?.workers.map((worker) => {
                return {
                  label: `${worker.firstName} ${worker.lastName}`,
                  value: worker.id
                };
              }),
              teams: currentLocation?.teams.map((team) => {
                return {
                  label: team.name,
                  value: team.id
                };
              }),
              vendors: currentLocation?.vendors.map((vendor) => {
                return {
                  label: vendor.companyName,
                  value: vendor.id
                };
              }),
              customers: currentLocation?.customers.map((customer) => {
                return {
                  label: customer.name,
                  value: customer.id
                };
              }),
              coordinates: currentLocation?.longitude
                ? {
                    lng: currentLocation.longitude,
                    lat: currentLocation.latitude
                  }
                : null
            }}
            onChange={({ field, e }) => {}}
            onSubmit={async (values) => {
              let formattedValues = formatValues(values);
              //differentiate files from api and formattedValues
              const files = formattedValues.files.find((file) => file.id)
                ? []
                : formattedValues.files;
              return new Promise<void>((resolve, rej) => {
                uploadFiles(files, formattedValues.image)
                  .then((files) => {
                    const imageAndFiles = getImageAndFiles(
                      files,
                      currentLocation.image
                    );
                    formattedValues = {
                      ...formattedValues,
                      image: imageAndFiles.image,
                      files: [...currentLocation.files, ...imageAndFiles.files]
                    };
                    dispatch(editLocation(currentLocation.id, formattedValues))
                      .then(() => {
                        resolve();
                        onEditSuccess();
                      })
                      .catch((err) => {
                        onEditFailure(err);
                        rej(err);
                      });
                  })
                  .catch((err) => {
                    onEditFailure(err);
                    rej(err);
                  });
              });
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
  if (hasViewPermission(PermissionEntity.LOCATIONS))
    return (
      <>
        <Helmet>
          <title>{t('locations')}</title>
        </Helmet>
        <Grid
          container
          justifyContent="center"
          alignItems="stretch"
          spacing={1}
          paddingX={4}
        >
          <Grid
            item
            xs={12}
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Tabs
              onChange={handleTabsChange}
              value={currentTab}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
            >
              {tabs.map((tab) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </Tabs>
            <Stack direction={'row'} alignItems="center" spacing={1}>
              <IconButton onClick={handleOpenMenu} color="primary">
                <MoreVertTwoToneIcon />
              </IconButton>
              {hasCreatePermission(PermissionEntity.LOCATIONS) && (
                <Button
                  onClick={() => setOpenAddModal(true)}
                  startIcon={<AddTwoToneIcon />}
                  sx={{ mx: 6, my: 1 }}
                  variant="contained"
                >
                  {t('location')}
                </Button>
              )}
            </Stack>
          </Grid>
          {currentTab === 'list' && (
            <Grid item xs={12}>
              <Card
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ width: '95%' }}>
                  <CustomDataGrid
                    treeData
                    columns={columns}
                    rows={locationsHierarchy}
                    loading={loadingGet}
                    apiRef={apiRef}
                    getTreeDataPath={(row) =>
                      row.hierarchy.map((id) => id.toString())
                    }
                    groupingColDef={groupingColDef}
                    components={{
                      Toolbar: GridToolbar,
                      NoRowsOverlay: () => (
                        <NoRowsMessageWrapper
                          message={t('noRows.location.message')}
                          action={t('noRows.location.action')}
                        />
                      )
                    }}
                    onRowClick={(params) =>
                      handleOpenDetails(Number(params.id))
                    }
                    initialState={{
                      columns: {
                        columnVisibilityModel: {}
                      }
                    }}
                  />
                </Box>
              </Card>
            </Grid>
          )}
          {currentTab === 'map' && (
            <Grid item xs={12}>
              <Card
                sx={{
                  p: 2,
                  justifyContent: 'center'
                }}
              >
                <Map
                  dimensions={{ width: 1000, height: 500 }}
                  locations={locations
                    .filter((location) => location.longitude)
                    .map(({ name, longitude, latitude, address, id }) => {
                      return {
                        title: name,
                        coordinates: {
                          lng: longitude,
                          lat: latitude
                        },
                        address,
                        id
                      };
                    })}
                />
              </Card>
            </Grid>
          )}
        </Grid>
        {renderLocationAddModal()}
        {renderLocationUpdateModal()}
        <Drawer
          anchor="right"
          open={openDrawer}
          onClose={handleCloseDetails}
          PaperProps={{
            sx: { width: '50%' }
          }}
        >
          <LocationDetails
            location={currentLocation}
            handleOpenUpdate={handleOpenUpdate}
            handleOpenDelete={onOpenDeleteDialog}
          />
        </Drawer>
        <ConfirmDialog
          open={openDelete}
          onCancel={() => {
            setOpenDelete(false);
          }}
          onConfirm={() => handleDelete(currentLocation?.id)}
          confirmText={t('to_delete')}
          question={t('confirm_delete_location')}
        />
        {renderMenu()}
      </>
    );
  else return <PermissionErrorMessage message={'no_access_location'} />;
}

export default Locations;
