import { getCvPdf } from "../data/cv-pdf.server";

export async function loader() {
  const pdf = await getCvPdf();
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Haseeb-Arshad-Resume.pdf"',
      // Browsers/CDNs can hold it briefly; the server re-pulls from Google
      // Docs on its own hourly cadence regardless of request traffic.
      "Cache-Control": "public, max-age=300",
    },
  });
}
