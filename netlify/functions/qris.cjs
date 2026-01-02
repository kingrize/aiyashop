/**
 * Netlify Function: /api/generate-qris  ->  proxy to api.ryzumi.vip
 * Tujuan: menghindari CORS (browser tidak boleh langsung fetch ke ryzumi).
 */

const UPSTREAM = "https://api.ryzumi.vip/api/tool/qris-converter";

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-store",
      },
      body: "",
    };
  }

  try {
    const qrisUrl = event.queryStringParameters?.url;
    const nominal = event.queryStringParameters?.nominal;

    if (!qrisUrl || !nominal) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
        body: "Missing required query params: url, nominal",
      };
    }

    const target = `${UPSTREAM}?url=${encodeURIComponent(qrisUrl)}&nominal=${encodeURIComponent(nominal)}`;

    const resp = await fetch(target, {
      headers: {
        // Kadang WAF lebih ramah kalau ada UA/Accept
        "User-Agent": "Mozilla/5.0",
        Accept: "image/png,image/*;q=0.8,*/*;q=0.5",
      },
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return {
        statusCode: 502,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
        body: `Upstream error: ${resp.status}\n${text}`,
      };
    }

    const buf = Buffer.from(await resp.arrayBuffer());

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
        "Content-Type": resp.headers.get("content-type") || "image/png",
      },
      body: buf.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
      body: `Proxy error: ${err?.message || String(err)}`,
    };
  }
};
