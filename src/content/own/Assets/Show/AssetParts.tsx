import { Box, Card, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CustomDataGrid from '../../components/CustomDatagrid';
import {
  GridActionsCellItem,
  GridRowParams,
  GridToolbar
} from '@mui/x-data-grid';
import { GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { useNavigate } from 'react-router-dom';
import { AssetDTO } from '../../../../models/owns/asset';
import { useDispatch } from '../../../../store';
import { editAsset } from '../../../../slices/asset';
import useAuth from '../../../../hooks/useAuth';
import { PermissionEntity } from '../../../../models/owns/role';

interface PropsType {
  asset: AssetDTO;
}

const AssetParts = ({ asset }: PropsType) => {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { hasEditPermission, hasDeletePermission } = useAuth();

  const handleDelete = (id: number) => {
    if (window.confirm(t('confirm_delete_part_asset'))) {
      dispatch(
        editAsset(asset.id, {
          ...asset,
          parts: asset.parts.filter((part) => part.id !== id)
        })
      );
    }
  };
  const navigate = useNavigate();
  const columns: GridEnrichedColDef[] = [
    {
      field: 'name',
      headerName: t('name'),
      description: t('name'),
      width: 150
    },
    {
      field: 'cost',
      headerName: t('cost'),
      description: t('cost'),
      width: 150
    },
    {
      field: 'description',
      headerName: t('description'),
      description: t('description'),
      width: 150
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('actions'),
      description: t('actions'),
      getActions: (params: GridRowParams) => {
        let actions = [
          <GridActionsCellItem
            key="delete"
            icon={<DeleteTwoToneIcon fontSize="small" color="error" />}
            onClick={() => handleDelete(Number(params.id))}
            label="Remove part"
          />
        ];
        if (!hasEditPermission(PermissionEntity.ASSETS, asset)) actions.shift();
        return actions;
      }
    }
  ];
  return (
    <Box sx={{ px: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ width: '95%' }}>
              <CustomDataGrid
                columns={columns}
                rows={asset?.parts ?? []}
                components={{
                  Toolbar: GridToolbar
                }}
                onRowClick={(params) => {
                  navigate(`/app/inventory/parts/${params.id}`);
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
    </Box>
  );
};

export default AssetParts;
