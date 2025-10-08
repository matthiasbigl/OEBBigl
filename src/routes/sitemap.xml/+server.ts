export const GET = () => {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>https://oebbigl.vercel.app/</loc></url>
      <url><loc>https://oebbigl.vercel.app/departures</loc></url>
      <url><loc>https://oebbigl.vercel.app/journeys</loc></url>
    </urlset>`,
    { headers: { 'Content-Type': 'application/xml' } }
  );
};
