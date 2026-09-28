import axiosClient from '../api/axiosClient';

// Lista el catálogo. Si se envía `busqueda`, filtra por código o nombre.
const obtenerRepuestos = async (busqueda) => {
  const parametros = busqueda && busqueda.trim() ? { busqueda: busqueda.trim() } : {};

  const respuesta = await axiosClient.get('/parts', { params: parametros });
  return respuesta.data;
};

const obtenerRepuestoPorId = async (id) => {
  const respuesta = await axiosClient.get(`/parts/${id}`);
  return respuesta.data;
};

const crearRepuesto = async (datosRepuesto) => {
  const respuesta = await axiosClient.post('/parts', datosRepuesto);
  return respuesta.data;
};

const actualizarRepuesto = async (id, datosRepuesto) => {
  const respuesta = await axiosClient.put(`/parts/${id}`, datosRepuesto);
  return respuesta.data;
};

const eliminarRepuesto = async (id) => {
  await axiosClient.delete(`/parts/${id}`);
};

// datosMovimiento: { partId, type: 'ENTRY' | 'EXIT', quantity, reason }
// Devuelve { repuesto, movimiento } con el repuesto ya actualizado
const registrarMovimiento = async (datosMovimiento) => {
  const respuesta = await axiosClient.post('/parts/movement', datosMovimiento);
  return respuesta.data;
};

export {
  obtenerRepuestos,
  obtenerRepuestoPorId,
  crearRepuesto,
  actualizarRepuesto,
  eliminarRepuesto,
  registrarMovimiento
};
