import ProgressLayout from '../components/progress-layout.vue'

export const progressTrackingRoutes = [
  {
    path: '/progress-tracking',
    component: ProgressLayout,
    meta: { requiresAuth: true, roles: ['PACIENTE'] },
    children: [
      {
        path: '',
        name: 'progress-tracking-index',
        redirect: { name: 'progress-tracking-consumption-record' },
      },
      {
        path: 'consumption-record',
        name: 'progress-tracking-consumption-record',
        component: () => import('../pages/consumption-record-page.vue'),
        meta: { requiresAuth: true, roles: ['PACIENTE'] },
      },
      {
        path: 'progress-chart',
        name: 'progress-tracking-progress-chart',
        component: () => import('../pages/progress-chart-page.vue'),
        meta: { requiresAuth: true, roles: ['PACIENTE'] },
      },
      {
        path: 'adherence-plan',
        name: 'progress-tracking-adherence-plan',
        component: () => import('../pages/adherence-plan-page.vue'),
        meta: { requiresAuth: true, roles: ['PACIENTE'] },
      },
      {
        path: 'update-weekly-weight',
        name: 'progress-tracking-update-weekly-weight',
        component: () => import('../pages/update-weekly-weight-page.vue'),
        meta: { requiresAuth: true, roles: ['PACIENTE'] },
      },
      {
        path: 'activity-record',
        name: 'progress-tracking-activity-record',
        component: () => import('../pages/activity-record-page.vue'),
        meta: { requiresAuth: true, roles: ['PACIENTE'] },
      },
    ],
  },
]
