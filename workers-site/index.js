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
  const url = new URL(event.request.url)
  let options = {}

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true,
      }
    }
    const page = await getAssetFromKV(event, options)
    return createResponseFromAsset(url.pathname, page)

  } catch (e) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/404.html`, req),
        })

        return createResponseFromAsset('404.html', notFoundResponse, 404)
      } catch (exception) {}
    }

    return new Response(e.message || e.toString(), { status: 500 })
  }
}

function createResponseFromAsset(pathname, asset, status) {
  if (!status) {
    status = 200
  }
  const response = new Response(asset.body, { ...asset, status: status })
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  if (pathname.startsWith('/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000')
  } else {
    response.headers.set('Cache-Control', 'public, max-age=180')
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.startsWith('text/html')) {
    response.headers.set('Content-Security-Policy', "default-src 'none'; style-src 'self'; font-src data:; img-src data:; frame-ancestors 'none';")
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'same-origin')
  }
  return response
}
