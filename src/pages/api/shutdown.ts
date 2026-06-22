/** POST /api/shutdown — Atura el servidor Node.js en local */
import type { APIRoute } from "astro"

export const POST: APIRoute = async () => {
  // Enviar resposta abans d'aturar per evitar que el client pengi
  const response = new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  })

  // Aturar el procés en 100ms per donar temps a enviar la resposta
  setTimeout(() => process.exit(0), 100)

  return response
}
