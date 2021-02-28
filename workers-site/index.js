import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

const DEBUG = ENVIRONMENT === "dev"

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  let options = {}

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true,
      }
    }
    const page = await getAssetFromKV(event, options)
    // allow headers to be altered
    const response = new Response(page.body, page)
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Content-Security-Policy', "default-src 'none'; style-src 'sha256-hX9S1JB5P1Ag8+1gSqzoVQTFEulZ7dXUvLzkKOc1p9c='; font-src data:; img-src data:; frame-ancestors 'none';")
    response.headers.set('Referrer-Policy', 'same-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Cache-Control', 'public, max-age=180')

    return response

  } catch (e) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/404.html`, req),
        })

        return new Response(notFoundResponse.body, { ...notFoundResponse, status: 404 })
      } catch (exception) {}
    }

    return new Response(e.message || e.toString(), { status: 500 })
  }
}
