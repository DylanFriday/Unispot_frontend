import http from './http'

export interface CourseDto {
  id: number
  code: string
  name: string
}

export const coursesApi = {
  listCourses: async (query?: string) => {
    const search = query ? `?query=${encodeURIComponent(query)}` : ''
    const response = await http.get<CourseDto[]>(`/courses${search}`)
    return response.data
  },
  createCourse: async (payload: { code: string; name: string }) => {
    const response = await http.post<CourseDto>('/courses', payload)
    return response.data
  },
}
