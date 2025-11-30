import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GOOGLE_ROUTES_API_KEY = process.env.GOOGLE_ROUTES_API_KEY || '';
const HAAS_LOCATION = {
  latitude: 37.8719, // Haas School of Business
  longitude: -122.2585
};

export async function POST(request: Request) {
  try {
    const { origin } = await request.json();
    
    if (!origin?.latitude || !origin?.longitude) {
      return NextResponse.json(
        { error: 'Origin coordinates required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!GOOGLE_ROUTES_API_KEY) {
      console.error('GOOGLE_ROUTES_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Travel time service not configured' },
        { status: 503 }
      );
    }

    // Request driving route
    const drivingResponse = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_ROUTES_API_KEY,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.legs.duration,routes.legs.distanceMeters'
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: origin.latitude,
                longitude: origin.longitude
              }
            }
          },
          destination: {
            location: {
              latLng: HAAS_LOCATION
            }
          },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
          computeAlternativeRoutes: false,
          routeModifiers: {
            avoidTolls: false,
            avoidHighways: false,
            avoidFerries: false
          },
          languageCode: 'en-US',
          units: 'IMPERIAL'
        })
      }
    );

    // Request transit route
    const transitResponse = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_ROUTES_API_KEY,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.legs.duration,routes.legs.distanceMeters'
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: origin.latitude,
                longitude: origin.longitude
              }
            }
          },
          destination: {
            location: {
              latLng: HAAS_LOCATION
            }
          },
          travelMode: 'TRANSIT',
          computeAlternativeRoutes: false,
          languageCode: 'en-US',
          units: 'IMPERIAL'
        })
      }
    );

    if (!drivingResponse.ok && !transitResponse.ok) {
      const drivingError = drivingResponse.ok ? null : await drivingResponse.text();
      const transitError = transitResponse.ok ? null : await transitResponse.text();
      console.error('Google Routes API errors:', {
        driving: { status: drivingResponse.status, error: drivingError },
        transit: { status: transitResponse.status, error: transitError }
      });
      throw new Error('Failed to fetch routes from Google API');
    }

    const drivingData = drivingResponse.ok ? await drivingResponse.json() : null;
    const transitData = transitResponse.ok ? await transitResponse.json() : null;

    // Parse driving data
    let driving = null;
    if (drivingData?.routes?.[0]) {
      const route = drivingData.routes[0];
      const durationSeconds = parseInt(route.duration.replace('s', ''));
      const durationMinutes = Math.round(durationSeconds / 60);
      const distanceMiles = (route.distanceMeters * 0.000621371).toFixed(1);
      
      driving = {
        duration: durationMinutes,
        distance: distanceMiles,
        formatted: `${durationMinutes} min`
      };
    }

    // Parse transit data
    let transit = null;
    if (transitData?.routes?.[0]) {
      const route = transitData.routes[0];
      const durationSeconds = parseInt(route.duration.replace('s', ''));
      const durationMinutes = Math.round(durationSeconds / 60);
      const distanceMiles = (route.distanceMeters * 0.000621371).toFixed(1);
      
      transit = {
        duration: durationMinutes,
        distance: distanceMiles,
        formatted: `${durationMinutes} min`
      };
    }

    return NextResponse.json({
      driving,
      transit,
      destination: 'Haas School of Business'
    });

  } catch (error) {
    console.error('Travel time API error:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to calculate travel time',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
