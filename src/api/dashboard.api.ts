import http from './http'
import type { StudentDashboardSummaryDto } from '../types/dto'

export const dashboardApi = {
  getStudentSummary: async () => {
    const response = await http.get<StudentDashboardSummaryDto>('/dashboard/summary')
    return response.data
  },
}
