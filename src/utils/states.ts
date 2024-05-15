import { EntityType, OwnHeader } from 'src/content/own/Imports';

export const getOwnHeadersConfig = (
  t: any
): Record<EntityType, OwnHeader[]> => {
  const idFormatter = (value) => (isNaN(value) ? null : value);
  const arrayFormatter = (value) => value?.split(',') ?? [];
  return {
    'work-orders': [
      {
        label: t('id'),
        keyName: 'id',
        formatter: idFormatter
      },
      { label: t('title'), keyName: 'title', required: true },
      { label: t('description'), keyName: 'description' },
      { label: t('due_date'), keyName: 'dueDate' },
      { label: t('completed_on'), keyName: 'completedOn' },
      { label: t('status'), keyName: 'status' },
      { label: t('estimated_hours'), keyName: 'estimatedDuration' },
      { label: t('priority'), keyName: 'priority' },
      { label: t('category'), keyName: 'category' },
      { label: t('completed_by'), keyName: 'completedByEmail' },
      {
        label: t('assigned_to'),
        keyName: 'assignedToEmails',
        formatter: arrayFormatter
      },
      { label: t('primary_worker'), keyName: 'primaryUserEmail' },
      { label: t('asset_name'), keyName: 'assetName' },
      { label: t('location_name'), keyName: 'locationName' },
      { label: t('team_name'), keyName: 'teamName' },
      { label: t('customers'), keyName: 'customersNames' },
      { label: t('feedback'), keyName: 'feedback' },
      { label: t('requires_signature'), keyName: 'requiredSignature' },
      { label: t('archived'), keyName: 'archived' }
    ],
    locations: [
      {
        label: t('id'),
        keyName: 'id',
        formatter: idFormatter
      },
      { label: t('name'), keyName: 'name', required: true },
      { label: t('address'), keyName: 'address' },
      { label: t('longitude'), keyName: 'longitude' },
      { label: t('latitude'), keyName: 'latitude' },
      { label: t('parent_location'), keyName: 'parentLocationName' },
      { label: t('customers'), keyName: 'customersNames' },
      { label: t('vendors'), keyName: 'vendorsNames' },
      {
        label: t('assigned_to'),
        keyName: 'workersEmails',
        formatter: arrayFormatter
      },
      {
        label: t('teams'),
        keyName: 'teamsNames',
        formatter: arrayFormatter
      }
    ],
    assets: [
      {
        label: t('id'),
        keyName: 'id',
        formatter: idFormatter
      },
      { label: t('name'), keyName: 'name', required: true },
      { label: t('archived'), keyName: 'archived' },
      { label: t('location_name'), keyName: 'locationName' },
      { label: t('parent_asset'), keyName: 'parentAssetName' },
      { label: t('area'), keyName: 'area' },
      { label: t('barcode'), keyName: 'barCode' },
      { label: t('category'), keyName: 'category' },
      { label: t('primary_worker'), keyName: 'primaryUserEmail' },
      { label: t('customers'), keyName: 'customersNames' },
      { label: t('vendors'), keyName: 'vendorsNames' },
      {
        label: t('warranty_expiration_date'),
        keyName: 'warrantyExpirationDate'
      },
      { label: t('additional_information'), keyName: 'additionalInfos' },
      { label: t('serial_number'), keyName: 'serialNumber' },
      {
        label: t('assigned_to'),
        keyName: 'assignedToEmails',
        formatter: arrayFormatter
      },
      {
        label: t('teams'),
        keyName: 'teamsNames',
        formatter: arrayFormatter
      },
      { label: t('status'), keyName: 'status' },
      { label: t('acquisition_cost'), keyName: 'acquisitionCost' }
    ],
    parts: [
      {
        label: t('id'),
        keyName: 'id',
        formatter: idFormatter
      },
      { label: t('name'), keyName: 'name', required: true },
      { label: t('cost'), keyName: 'cost' },
      { label: t('category'), keyName: 'category' },
      { label: t('non_stock'), keyName: 'nonStock' },
      { label: t('barcode'), keyName: 'barcode' },
      { label: t('description'), keyName: 'description' },
      { label: t('quantity'), keyName: 'quantity', required: true },
      { label: t('additional_information'), keyName: 'additionalInfos' },
      { label: t('area'), keyName: 'area' },
      { label: t('minimum_quantity'), keyName: 'minQuantity' },
      { label: t('location_name'), keyName: 'locationName' },
      { label: t('customers'), keyName: 'customersNames' },
      { label: t('vendors'), keyName: 'vendorsNames' },
      {
        label: t('assigned_to'),
        keyName: 'assignedToEmails',
        formatter: arrayFormatter
      },
      {
        label: t('teams'),
        keyName: 'teamsNames',
        formatter: arrayFormatter
      }
    ],
    meters: [
      {
        label: t('id'),
        keyName: 'id',
        formatter: idFormatter
      },
      { label: t('name'), keyName: 'name', required: true },
      { label: t('unit'), keyName: 'unit', required: true },
      {
        label: t('update_frequency'),
        keyName: 'updateFrequency',
        required: true
      },
      //TODO Asset
      { label: t('category'), keyName: 'meterCategory' },
      { label: t('location_name'), keyName: 'locationName' },
      {
        label: t('users'),
        keyName: 'usersEmails',
        formatter: arrayFormatter
      }
    ]
  };
};
