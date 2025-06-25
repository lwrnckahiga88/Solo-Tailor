const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { footScanData, style, color, material } = JSON.parse(event.body);

    if (process.env.NETLIFY_DEV === 'true') {
      const mockModels = {
        sneaker: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/Shoe/glTF/Shoe.gltf',
        runner: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/RunningShoe/glTF/RunningShoe.gltf',
        boot: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/Boot/glTF/Boot.gltf'
      };
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          modelUrl: mockModels[style] || mockModels.sneaker,
          isMock: true
        })
      };
    }

    const response = await fetch('https://api.scansoles.com/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SCANSOLES_API_KEY}`
      },
      body: JSON.stringify({
        scan_data: footScanData,
        design: { style, color, material }
      })
    });

    const { model_url: modelUrl } = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ modelUrl })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Model generation failed',
        details: process.env.NETLIFY_DEV === 'true' ? error.message : undefined
      })
    };
  }
};
