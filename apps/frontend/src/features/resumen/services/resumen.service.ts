import { ENV } from '@/shared/config/env';
import type { Resumen, ResumenDTO } from '@/shared/types';
import { getResumenFromApi } from './resumen.api';
import { getResumenFromMock } from './resumen.mock';

const mapResumenToModel = (resumen: ResumenDTO): Resumen => ({
  totalCasos: resumen.total_casos,
  casosPendientes: resumen.casos_pendientes,
  casosEnProceso: resumen.casos_en_proceso,
  casosCompletados: resumen.casos_completados,
  totalUsuarios: resumen.total_usuarios,
  totalPacientes: resumen.total_pacientes,
  totalEspecialistas: resumen.total_especialistas,
});

export const getResumen = async (): Promise<Resumen> => {
  const data = ENV.USE_MOCK
    ? await getResumenFromMock()
    : await getResumenFromApi();

  return mapResumenToModel(data);
};
