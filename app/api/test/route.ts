export async function GET() {
  console.log('🧪 Test API endpoint called!');
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Test API is working'
  });
}
