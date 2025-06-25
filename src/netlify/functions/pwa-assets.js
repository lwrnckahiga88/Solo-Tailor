// netlify/functions/pwa-assets.js
const BROTLI_ASSETS = ['glb', 'gltf', 'wasm'];
const CACHE_TTL = {
  icons: 31536000, // 1 year
  models: 86400,   // 1 day
  html: 3600       // 1 hour
};

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const isDev = process.env.NETLIFY_DEV === 'true';

  // 1. Compression handling
  if (BROTLI_ASSETS.some(ext => path.endsWith(`.${ext}`))) {
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    
    if (acceptEncoding.includes('br')) {
      const brPath = path.replace(/(\.\w+)$/, '.br$1');
      const response = await context.rewrite(brPath);
      
      if (response.status === 200) {
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Content-Encoding', 'br');
        return newResponse;
      }
    }
  }

  // 2. Cache control headers
  const response = await context.next();
  const newResponse = new Response(response.body, response);
  
  if (path.startsWith('/assets/icons/')) {
    newResponse.headers.set('Cache-Control', `public, max-age=${CACHE_TTL.icons}, immutable`);
  } 
  else if (path.startsWith('/assets/models/')) {
    newResponse.headers.set('Cache-Control', `public, max-age=${CACHE_TTL.models}`);
    newResponse.headers.set('Content-Type', get3DContentType(path));
  }
  else if (path === '/manifest.json') {
    newResponse.headers.set('Content-Type', 'application/manifest+json');
  }

  // 3. Development mode overrides
  if (isDev) {
    newResponse.headers.set('X-Robots-Tag', 'noindex');
    newResponse.headers.set('Cache-Control', 'no-cache');
  }

  return newResponse;
};

function get3DContentType(path) {
  if (path.endsWith('.glb')) return 'model/gltf-binary';
  if (path.endsWith('.gltf')) return 'model/gltf+json';
  if (path.endsWith('.wasm')) return 'application/wasm';
  return 'application/octet-stream';
}

// Edge function configuration
export const config = {
  path: '/*',
  onError: 'bypass',
  preferStatic: true
};