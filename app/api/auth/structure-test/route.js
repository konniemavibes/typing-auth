export async function GET(request) {
  return new Response(
    JSON.stringify({
      message: 'Auth API structure test',
      path: request.nextUrl.pathname,
      available: true,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

export async function POST(request) {
  return new Response(
    JSON.stringify({
      message: 'Auth API structure test - POST',
      path: request.nextUrl.pathname,
      available: true,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
