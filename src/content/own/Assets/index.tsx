import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  debounce,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IField } from '../type';
import { addAsset, getAssetChildren, getAssets } from '../../../slices/asset';
import { useDispatch, useSelector } from '../../../store';
import * as React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { TitleContext } from '../../../contexts/TitleContext';
import { GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import CustomDataGrid from '../components/CustomDatagrid';
import {
  GridEventListener,
  GridRenderCellParams,
  GridToolbar,
  GridValueGetterParams
} from '@mui/x-data-grid';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { AssetDTO, AssetMiniDTO, AssetRow } from '../../../models/owns/asset';
import Form from '../components/form';
import * as Yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DataGridProProps, useGridApiRef } from '@mui/x-data-grid-pro';
import { formatAssetValues } from '../../../utils/formatters';
import { GroupingCellWithLazyLoading } from './GroupingCellWithLazyLoading';
import { UserMiniDTO } from '../../../models/user';
import UserAvatars from '../components/UserAvatars';
import { enumerate } from '../../../utils/displayers';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { getAssetUrl } from '../../../utils/urlPaths';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import PermissionErrorMessage from '../components/PermissionErrorMessage';
import NoRowsMessageWrapper from '../components/NoRowsMessageWrapper';
import { isNumeric } from '../../../utils/validators';
import { getSingleLocation } from '../../../slices/location';
import { LocationMiniDTO } from '../../../models/owns/location';
import { TeamMiniDTO } from '../../../models/owns/team';
import { VendorMiniDTO } from '../../../models/owns/vendor';
import Category from '../../../models/owns/category';
import { exportEntity } from '../../../slices/exports';
import MoreVertTwoToneIcon from '@mui/icons-material/MoreVertTwoTone';
import { FilterField, SearchCriteria } from '../../../models/owns/page';
import Filters from './Filters';
import { onSearchQueryChange } from '../../../utils/overall';
import SearchInput from '../components/SearchInput';
import File from '../../../models/owns/file';
import { PlanFeature } from '../../../models/owns/subscriptionPlan';

function Assets() {
  const { t }: { t: any } = useTranslation();
  const { setTitle } = useContext(TitleContext);
  const { uploadFiles } = useContext(CompanySettingsContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const locationParam = searchParams.get('location');
  const navigate = useNavigate();
  const {
    hasViewPermission,
    hasCreatePermission,
    hasViewOtherPermission,
    getFilteredFields,
    hasFeature
  } = useAuth();
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const dispatch = useDispatch();
  const { assetsHierarchy, loadingGet, assets } = useSelector(
    (state) => state.assets
  );
  const { loadingExport } = useSelector((state) => state.exports);
  const apiRef = useGridApiRef();
  const { getFormattedDate } = useContext(CompanySettingsContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { locations } = useSelector((state) => state.locations);
  const locationParamObject = locations.find(
    (location) => location.id === Number(locationParam)
  );
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  type ViewType = 'hierarchy' | 'list';
  const [view, setView] = useState<ViewType>('hierarchy');
  const initialCriteria: SearchCriteria = {
    filterFields: [
      {
        field: 'archived',
        operation: 'eq',
        value: false
      }
    ],
    pageSize: 10,
    pageNum: 0,
    direction: 'DESC'
  };
  const [criteria, setCriteria] = useState<SearchCriteria>(initialCriteria);
  const onQueryChange = (event) => {
    setView(event.target.value ? 'list' : 'hierarchy');
    onSearchQueryChange<AssetDTO>(event, criteria, setCriteria, [
      'name',
      'description',
      'model',
      'additionalInfos',
      'barCode',
      'area'
    ]);
  };
  const debouncedQueryChange = useMemo(() => debounce(onQueryChange, 1300), []);
  const onFilterChange = (newFilters: FilterField[]) => {
    const newCriteria = { ...criteria };
    newCriteria.filterFields = newFilters;
    setCriteria(newCriteria);
  };
  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const [openFilterDrawer, setOpenFilterDrawer] = useState<boolean>(false);
  useEffect(() => {
    setTitle(t('assets'));
    if (hasViewPermission(PermissionEntity.ASSETS)) {
      dispatch(getAssetChildren(0, []));
    }
  }, []);

  useEffect(() => {
    if (locationParam) {
      if (locationParam && isNumeric(locationParam)) {
        dispatch(getSingleLocation(Number(locationParam)));
      }
    }
  }, []);
  useEffect(() => {
    let shouldOpen1 = locationParam && locationParamObject;
    if (shouldOpen1) {
      setOpenAddModal(true);
    }
  }, [locationParamObject]);

  useEffect(() => {
    if (hasViewPermission(PermissionEntity.ASSETS))
      dispatch(getAssets(criteria));
  }, [criteria]);

  const onCreationSuccess = () => {
    setOpenAddModal(false);
    showSnackBar(t('asset_create_success'), 'success');
  };
  const onCreationFailure = (err) =>
    showSnackBar(t('asset_create_failure'), 'error');
  const handleCloseFilterDrawer = () => setOpenFilterDrawer(false);
  const onPageSizeChange = (size: number) => {
    setCriteria({ ...criteria, pageSize: size });
  };
  const onPageChange = (number: number) => {
    setCriteria({ ...criteria, pageNum: number });
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
      {hasViewOtherPermission(PermissionEntity.ASSETS) && (
        <MenuItem
          disabled={loadingExport['assets']}
          onClick={() => {
            dispatch(exportEntity('assets')).then((url: string) => {
              window.open(url);
            });
          }}
        >
          <Stack spacing={2} direction="row">
            {loadingExport['assets'] && <CircularProgress size="1rem" />}
            <Typography>{t('to_export')}</Typography>
          </Stack>
        </MenuItem>
      )}
      {hasViewPermission(PermissionEntity.SETTINGS) && (
        <MenuItem
          onClick={() => navigate('/app/imports/assets')}
          disabled={!hasFeature(PlanFeature.IMPORT_CSV)}
        >
          {t('to_import')}
        </MenuItem>
      )}
      <MenuItem
        onClick={() => {
          setOpenFilterDrawer(true);
          handleCloseMenu();
        }}
      >
        {t('to_filter')}
      </MenuItem>
    </Menu>
  );
  const columns: GridEnrichedColDef[] = [
    {
      field: 'id',
      headerName: t('id'),
      description: t('id'),
      width: 150
    },
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
      field: 'location',
      headerName: t('location'),
      description: t('location'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<LocationMiniDTO>) =>
        params.value?.name
    },
    {
      field: 'image',
      headerName: t('image'),
      description: t('image'),
      width: 150,
      renderCell: (params: GridRenderCellParams<any, any, File>) =>
        params.value && (
          <img width="100%" height="100%" src={params.value.url} />
        )
    },
    {
      field: 'area',
      headerName: t('area'),
      description: t('area'),
      width: 150
    },
    {
      field: 'model',
      headerName: t('model'),
      description: t('model'),
      width: 150
    },
    {
      field: 'barCode',
      headerName: t('barcode'),
      description: t('barcode'),
      width: 150
    },
    {
      field: 'category',
      headerName: t('category'),
      description: t('category'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<Category>) =>
        params.value?.name
    },
    {
      field: 'description',
      headerName: t('description'),
      description: t('description'),
      width: 150
    },
    {
      field: 'primaryUser',
      headerName: t('primary_worker'),
      description: t('primary_worker'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<UserMiniDTO>) =>
        params.value
          ? `${params.value.firstName} ${params.value.lastName}`
          : null
    },
    {
      field: 'assignedTo',
      headerName: t('assigned_to'),
      description: t('assigned_to'),
      width: 170,
      renderCell: (params: GridRenderCellParams<UserMiniDTO[]>) => (
        <UserAvatars users={params.value ?? []} />
      )
    },
    {
      field: 'teams',
      headerName: t('teams'),
      description: t('teams'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<TeamMiniDTO[]>) =>
        enumerate(params.value?.map((team) => team.name) ?? [])
    },
    {
      field: 'vendors',
      headerName: t('vendors'),
      description: t('vendors'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<VendorMiniDTO[]>) =>
        enumerate(params.value?.map((vendor) => vendor.companyName) ?? [])
    },
    {
      field: 'parentAsset',
      headerName: t('parent_asset'),
      description: t('parent_asset'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<AssetMiniDTO>) =>
        params.value?.name
    },
    {
      field: 'createdAt',
      headerName: t('created_at'),
      description: t('created_at'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<string>) =>
        getFormattedDate(params.value)
    }
  ];
  const onResetFilters = () => {
    setCriteria(initialCriteria);
    setView('hierarchy');
  };
  const defaultFields: Array<IField> = [
    {
      name: 'assetInfo',
      type: 'titleGroupField',
      label: t('asset_information')
    },
    {
      name: 'name',
      type: 'text',
      label: t('name'),
      placeholder: t('asset_name_description'),
      required: true
    },
    {
      name: 'location',
      type: 'select',
      type2: 'location',
      label: t('location'),
      placeholder: t('select_asset_location'),
      required: true,
      midWidth: true
    },
    {
      name: 'acquisitionCost',
      type: 'number',
      label: t('acquisition_cost'),
      placeholder: t('acquisition_cost'),
      midWidth: true
    },
    {
      name: 'description',
      type: 'text',
      label: t('description'),
      placeholder: t('description'),
      multiple: true
    },
    {
      name: 'model',
      type: 'text',
      label: t('model'),
      placeholder: t('model'),
      midWidth: true
    },
    {
      name: 'serialNumber',
      type: 'text',
      label: t('serial_number'),
      placeholder: t('serial_number'),
      midWidth: true
    },
    {
      name: 'category',
      midWidth: true,
      label: t('category'),
      placeholder: t('category'),
      type: 'select',
      type2: 'category',
      category: 'asset-categories'
    },
    {
      name: 'area',
      type: 'text',
      midWidth: true,
      label: t('area'),
      placeholder: t('area')
    },
    {
      name: 'image',
      type: 'file',
      fileType: 'image',
      label: t('image')
    },
    {
      name: 'assignedTo',
      type: 'titleGroupField',
      label: t('assigned_to')
    },
    {
      name: 'primaryUser',
      type: 'select',
      type2: 'user',
      label: t('worker'),
      placeholder: t('primary_user_description')
    },
    {
      name: 'assignedTo',
      type: 'select',
      type2: 'user',
      multiple: true,
      label: t('additional_workers'),
      placeholder: 'additional_workers_description'
    },
    {
      name: 'teams',
      type: 'select',
      type2: 'team',
      multiple: true,
      label: t('teams'),
      placeholder: 'Select teams'
    },
    {
      name: 'moreInfos',
      type: 'titleGroupField',
      label: t('more_informations')
    },
    {
      name: 'customers',
      type: 'select',
      type2: 'customer',
      multiple: true,
      label: t('customers'),
      placeholder: 'customers_description'
    },
    {
      name: 'vendors',
      type: 'select',
      type2: 'vendor',
      multiple: true,
      label: t('vendors'),
      placeholder: t('vendors_description')
    },
    {
      name: 'inServiceDate',
      type: 'date',
      midWidth: true,
      label: t('inServiceDate_description')
    },
    {
      name: 'warrantyExpirationDate',
      type: 'date',
      midWidth: true,
      label: t('warranty_expiration_date')
    },
    {
      name: 'files',
      type: 'file',
      multiple: true,
      label: t('files'),
      fileType: 'file'
    },
    {
      name: 'additionalInfos',
      type: 'text',
      label: t('additional_information'),
      placeholder: t('additional_information'),
      multiple: true
    },
    {
      name: 'structure',
      type: 'titleGroupField',
      label: t('structure')
    },
    { name: 'parts', type: 'select', type2: 'part', label: t('parts') },
    {
      name: 'parentAsset',
      type: 'select',
      type2: 'asset',
      label: t('parent_asset')
    }
  ];
  const shape = {
    name: Yup.string().required(t('required_asset_name'))
  };

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
            id: t('loading_assets', { name: row.name, id: node.id }),
            hierarchy: [...row.hierarchy, '']
          }
        ]);
        dispatch(getAssetChildren(row.id, row.hierarchy));
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

  const renderAssetAddModal = () => (
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
          {t('add_asset')}
        </Typography>
        <Typography variant="subtitle2">
          {t('add_asset_description')}
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
            fields={getFilteredFields(defaultFields)}
            validation={Yup.object().shape(shape)}
            submitText={t('create_asset')}
            values={{
              inServiceDate: null,
              warrantyExpirationDate: null,
              location: locationParamObject
                ? {
                    label: locationParamObject.name,
                    value: locationParamObject.id
                  }
                : null
            }}
            onChange={({ field, e }) => {}}
            onSubmit={async (values) => {
              let formattedValues = formatAssetValues(values);
              return new Promise<void>((resolve, rej) => {
                uploadFiles(formattedValues.files, formattedValues.image)
                  .then((files) => {
                    formattedValues = {
                      ...formattedValues,
                      image: files.length ? { id: files[0].id } : null,
                      files: files.map((file) => {
                        return { id: file.id };
                      })
                    };
                    dispatch(addAsset(formattedValues))
                      .then(onCreationSuccess)
                      .then(() => {
                        dispatch(getAssetChildren(0, []));
                      })
                      .catch(onCreationFailure)
                      .finally(resolve);
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

  if (hasViewPermission(PermissionEntity.ASSETS))
    return (
      <>
        {renderAssetAddModal()}
        <Helmet>
          <title>{t('assets')}</title>
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
            <SearchInput onChange={debouncedQueryChange} />
            <Stack direction="row" spacing={1}>
              <IconButton onClick={handleOpenMenu} color="primary">
                <MoreVertTwoToneIcon />
              </IconButton>
              {view === 'list' && (
                <Button variant={'outlined'} onClick={onResetFilters}>
                  {t('reset_filters')}
                </Button>
              )}
              {hasCreatePermission(PermissionEntity.ASSETS) && (
                <Button
                  onClick={() => setOpenAddModal(true)}
                  startIcon={<AddTwoToneIcon />}
                  sx={{ mx: 6, my: 1 }}
                  variant="contained"
                >
                  {t('asset')}
                </Button>
              )}
            </Stack>
          </Grid>
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
                  treeData={view === 'hierarchy'}
                  columns={columns}
                  rows={view === 'hierarchy' ? assetsHierarchy : assets.content}
                  apiRef={apiRef}
                  getRowHeight={() => 'auto'}
                  getTreeDataPath={(row) =>
                    view === 'hierarchy'
                      ? row.hierarchy.map((id) => id.toString())
                      : [row.id.toString()]
                  }
                  disableColumnFilter
                  loading={loadingGet}
                  groupingColDef={
                    view === 'hierarchy' ? groupingColDef : undefined
                  }
                  paginationMode={view === 'hierarchy' ? undefined : 'server'}
                  onPageSizeChange={onPageSizeChange}
                  onPageChange={onPageChange}
                  rowsPerPageOptions={
                    view === 'list' ? [10, 20, 50] : undefined
                  }
                  components={{
                    Toolbar: GridToolbar,
                    NoRowsOverlay: () => (
                      <NoRowsMessageWrapper
                        message={t('noRows.asset.message')}
                        action={t('noRows.asset.action')}
                      />
                    )
                  }}
                  onRowClick={(params) => {
                    navigate(getAssetUrl(params.id));
                  }}
                  initialState={{
                    columns: {
                      columnVisibilityModel: {}
                    }
                  }}
                />
              </Box>
            </Card>
          </Grid>
        </Grid>
        {renderMenu()}
        <Drawer
          anchor="left"
          open={openFilterDrawer}
          onClose={handleCloseFilterDrawer}
          PaperProps={{
            sx: { width: '30%' }
          }}
        >
          <Filters
            filterFields={criteria.filterFields}
            onFilterChange={onFilterChange}
            onSave={() => {
              handleCloseFilterDrawer();
              setView('list');
            }}
          />
        </Drawer>
      </>
    );
  else return <PermissionErrorMessage message={'no_access_assets'} />;
}

export default Assets;
