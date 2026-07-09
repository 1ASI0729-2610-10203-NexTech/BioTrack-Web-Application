import { apiService } from '../../shared/infrastructure/api.service'

export const corporateCollaboratorApiService = {
  async fetchCollaborators(companyId) {
    const metrics = await apiService.get(`/companies/${companyId}/metrics`)
    return metrics?.collaborators ?? []
  },

  async uploadCollaborators(companyId, fileOrCollaborators) {
    let collaborators = fileOrCollaborators
    if (fileOrCollaborators instanceof File) {
      if (!fileOrCollaborators.name.toLowerCase().endsWith('.csv')) {
        throw new Error('El backend acepta una lista estructurada; carga un archivo CSV.')
      }
      const [headerLine, ...rows] = (await fileOrCollaborators.text())
        .split(/\r?\n/)
        .filter(Boolean)
      const headers = headerLine.split(',').map((header) => header.trim().toLowerCase())
      const read = (values, aliases) => {
        const index = headers.findIndex((header) => aliases.includes(header))
        return index >= 0 ? values[index]?.trim() ?? '' : ''
      }
      collaborators = rows.map((row) => {
        const values = row.split(',')
        return {
          firstName: read(values, ['firstname', 'first_name', 'nombre']),
          lastName: read(values, ['lastname', 'last_name', 'apellido']),
          email: read(values, ['email', 'correo']),
          documentNumber: read(values, ['documentnumber', 'document_number', 'documento', 'dni']),
        }
      })
    }
    return apiService.put(`/companies/${companyId}/collaborators`, { collaborators })
  },
}
