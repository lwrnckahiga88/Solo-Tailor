const { MongoClient } = require('mongodb');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (process.env.NETLIFY_DEV === 'true') {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'Design saved (mock response in dev mode)'
      })
    };
  }

  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const { userId, design } = JSON.parse(event.body);
    
    const result = await client.db("shoe-customizer")
      .collection("designs")
      .insertOne({
        userId,
        design,
        createdAt: new Date(),
        lastModified: new Date()
      });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        insertedId: result.insertedId
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Database operation failed',
        details: error.message
      })
    };
  } finally {
    await client.close();
  }
};
