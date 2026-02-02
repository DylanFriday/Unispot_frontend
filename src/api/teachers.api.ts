import http from './http'
import type { TeacherDto } from '../types/dto'

export const teachersApi = {
  listTeachersByCourse: async (courseId: number) => {
    const response = await http.get<TeacherDto[]>(
      `/courses/${courseId}/teachers`
    )
    return response.data
  },
}
