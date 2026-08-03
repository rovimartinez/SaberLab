export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT course_id, lecciones FROM visibilidad_curso'
  ).all();

  const visibilityMap = {};
  results.forEach((row) => {
    visibilityMap[row.course_id] = row.lecciones || {};
  });

  return Response.json({ visibility: visibilityMap });
}
