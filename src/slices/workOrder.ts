import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from 'src/store';
import WorkOrder from '../models/owns/workOrder';
import api from '../utils/api';
import { Task } from '../models/owns/tasks';
import { getInitialPage, Page, SearchCriteria } from '../models/owns/page';

const basePath = 'work-orders';
interface WorkOrderState {
  workOrders: Page<WorkOrder>;
  workOrdersByLocation: { [key: number]: WorkOrder[] };
  workOrdersByPart: { [key: number]: WorkOrder[] };
  singleWorkOrder: WorkOrder;
  loadingGet: boolean;
  calendar: {
    events: WorkOrder[];
  };
}

const initialState: WorkOrderState = {
  workOrders: getInitialPage<WorkOrder>(),
  workOrdersByLocation: {},
  workOrdersByPart: {},
  singleWorkOrder: null,
  loadingGet: false,
  calendar: {
    events: []
  }
};

const slice = createSlice({
  name: 'workOrders',
  initialState,
  reducers: {
    getWorkOrders(
      state: WorkOrderState,
      action: PayloadAction<{ workOrders: Page<WorkOrder> }>
    ) {
      const { workOrders } = action.payload;
      state.workOrders = workOrders;
    },
    getSingleWorkOrder(
      state: WorkOrderState,
      action: PayloadAction<{ workOrder: WorkOrder }>
    ) {
      const { workOrder } = action.payload;
      state.singleWorkOrder = workOrder;
    },
    addWorkOrder(
      state: WorkOrderState,
      action: PayloadAction<{ workOrder: WorkOrder }>
    ) {
      const { workOrder } = action.payload;
      state.workOrders.content = [...state.workOrders.content, workOrder];
    },
    editWorkOrder(
      state: WorkOrderState,
      action: PayloadAction<{ workOrder: WorkOrder }>
    ) {
      const { workOrder } = action.payload;
      const inContent = state.workOrders.content.some(
        (workOrder1) => workOrder1.id === workOrder.id
      );
      if (inContent) {
        state.workOrders.content = state.workOrders.content.map(
          (workOrder1) => {
            if (workOrder1.id === workOrder.id) {
              return workOrder;
            }
            return workOrder1;
          }
        );
      } else {
        state.singleWorkOrder = workOrder;
      }
    },
    deleteWorkOrder(
      state: WorkOrderState,
      action: PayloadAction<{ id: number }>
    ) {
      const { id } = action.payload;
      const workOrderIndex = state.workOrders.content.findIndex(
        (workOrder) => workOrder.id === id
      );
      if (workOrderIndex !== -1)
        state.workOrders.content.splice(workOrderIndex, 1);
    },
    clearSingleWorkOrder(state: WorkOrderState, action: PayloadAction<{}>) {
      state.singleWorkOrder = null;
    },
    getWorkOrdersByLocation(
      state: WorkOrderState,
      action: PayloadAction<{ workOrders: WorkOrder[]; id: number }>
    ) {
      const { workOrders, id } = action.payload;
      state.workOrdersByLocation[id] = workOrders;
    },
    getWorkOrdersByPart(
      state: WorkOrderState,
      action: PayloadAction<{ workOrders: WorkOrder[]; id: number }>
    ) {
      const { workOrders, id } = action.payload;
      state.workOrdersByPart[id] = workOrders;
    },
    getEvents(
      state: WorkOrderState,
      action: PayloadAction<{ events: WorkOrder[] }>
    ) {
      const { events } = action.payload;
      state.calendar.events = events;
    },
    setLoadingGet(
      state: WorkOrderState,
      action: PayloadAction<{ loading: boolean }>
    ) {
      const { loading } = action.payload;
      state.loadingGet = loading;
    }
  }
});

export const reducer = slice.reducer;

export const getWorkOrders =
  (criteria: SearchCriteria): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(slice.actions.setLoadingGet({ loading: true }));
      const workOrders = await api.post<Page<WorkOrder>>(
        `${basePath}/search`,
        criteria
      );
      dispatch(slice.actions.getWorkOrders({ workOrders }));
    } finally {
      dispatch(slice.actions.setLoadingGet({ loading: false }));
    }
  };
export const getSingleWorkOrder =
  (id: number): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.setLoadingGet({ loading: true }));
    const workOrder = await api.get<WorkOrder>(`${basePath}/${id}`);
    dispatch(slice.actions.getSingleWorkOrder({ workOrder }));
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  };
export const addWorkOrder =
  (workOrder): AppThunk =>
  async (dispatch) => {
    const workOrderResponse = await api.post<WorkOrder>(basePath, workOrder);
    dispatch(slice.actions.addWorkOrder({ workOrder: workOrderResponse }));
    const taskBases =
      workOrder.tasks?.map((task) => {
        return {
          ...task.taskBase,
          options: task.taskBase.options.map((option) => option.label)
        };
      }) ?? [];
    if (taskBases.length) {
      const tasks = await api.patch<Task[]>(
        `tasks/work-order/${workOrderResponse.id}`,
        taskBases,
        null
      );
    }
  };
export const editWorkOrder =
  (id: number, workOrder): AppThunk =>
  async (dispatch) => {
    const workOrderResponse = await api.patch<WorkOrder>(
      `${basePath}/${id}`,
      workOrder
    );
    dispatch(slice.actions.editWorkOrder({ workOrder: workOrderResponse }));
  };
export const deleteWorkOrder =
  (id: number): AppThunk =>
  async (dispatch) => {
    const workOrderResponse = await api.deletes<{ success: boolean }>(
      `${basePath}/${id}`
    );
    const { success } = workOrderResponse;
    if (success) {
      dispatch(slice.actions.deleteWorkOrder({ id }));
    }
  };

export const getWorkOrdersByLocation =
  (id: number): AppThunk =>
  async (dispatch) => {
    const workOrders = await api.get<WorkOrder[]>(`${basePath}/location/${id}`);
    dispatch(
      slice.actions.getWorkOrdersByLocation({
        id,
        workOrders
      })
    );
  };

export const getWorkOrdersByPart =
  (id: number): AppThunk =>
  async (dispatch) => {
    const workOrders = await api.get<WorkOrder[]>(`${basePath}/part/${id}`);
    dispatch(
      slice.actions.getWorkOrdersByPart({
        id,
        workOrders
      })
    );
  };
export const getPDFReport =
  (id: number): AppThunk =>
  async (dispatch): Promise<string> => {
    const response = await api.get<{ success: boolean; message: string }>(
      `${basePath}/report/${id}`
    );
    const { message } = response;
    return message;
  };

export const getWorkOrderEvents =
  (start: Date, end: Date): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.setLoadingGet({ loading: true }));
    const response = await api.post<WorkOrder[]>(`${basePath}/events`, {
      start,
      end
    });
    dispatch(
      slice.actions.getEvents({
        events: response
      })
    );
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  };
export const clearSingleWorkOrder = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.clearSingleWorkOrder({}));
};
export default slice;
