import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = ENVIRONMENT !== "production"

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

  /**
   * You can add custom logic to how we fetch your assets
   * by configuring the function `mapRequestToAsset`
   */
  // options.mapRequestToAsset = handlePrefix(/^\/docs/)

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true,
      }
    }
    const nonce = Math.random().toString(36).substring(7)
    const page = await getAssetFromKV(event, options)
    // allow headers to be altered
    var body = await page.text()
    const siteData = {
      'random-nonce': nonce
    }
    for (var key in siteData) {
      if (!siteData.hasOwnProperty(key)) {
        continue;
      }
  
      body = body.replace(key, siteData[key]);
    }
    const response = new Response(body, page)
    var contentMimeType = 'text/plain; charset=UTF-8'
    if (body.startsWith('<!DOCTYPE html>')) {
      contentMimeType = 'text/html; charset=UTF-8'
    } else if(body.startsWith('<?xml')) {
      contentMimeType = 'text/xml; charset=UTF-8'
    }
    response.headers.set('Content-Type', contentMimeType)
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Content-Security-Policy', "default-src 'none'; style-src 'nonce-random-nonce'; font-src data:; img-src data:; frame-ancestors 'none';".replace('random-nonce', nonce))
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
      } catch (e) {}
    }

    return new Response(e.message || e.toString(), { status: 500 })
  }
}

/**
 * Here's one example of how to modify a request to
 * remove a specific prefix, in this case `/docs` from
 * the url. This can be useful if you are deploying to a
 * route on a zone, or if you only want your static content
 * to exist at a specific path.
 */
function handlePrefix(prefix) {
  return request => {
    // compute the default (e.g. / -> index.html)
    let defaultAssetKey = mapRequestToAsset(request)
    let url = new URL(defaultAssetKey.url)

    // strip the prefix from the path for lookup
    url.pathname = url.pathname.replace(prefix, '/')

    // inherit all other props from the default request
    return new Request(url.toString(), defaultAssetKey)
  }
}
