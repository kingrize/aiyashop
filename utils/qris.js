// ===== EMV TLV PARSER/BUILDER =====
function parseTLV(payload) {
  let i = 0;
  const items = [];
  while (i < payload.length) {
    const tag = payload.slice(i, i + 2);
    const len = parseInt(payload.slice(i + 2, i + 4), 10);
    const value = payload.slice(i + 4, i + 4 + len);
    items.push({ tag, len, value });
    i += 4 + len;
  }
  return items;
}

function buildTLV(items) {
  return items
    .map(({ tag, value }) => {
      const len = String(value.length).padStart(2, "0");
      return `${tag}${len}${value}`;
    })
    .join("");
}

// ===== CRC-16/CCITT-FALSE =====
function crc16ccittFalse(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xffff;
      else crc = (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function withCRC(payloadWithoutCRC) {
  // payloadWithoutCRC MUST end with "6304"
  const crc = crc16ccittFalse(payloadWithoutCRC);
  return payloadWithoutCRC + crc;
}

// ===== SET/UPSERT TAG =====
function upsertTag(items, tag, value) {
  const idx = items.findIndex((x) => x.tag === tag);
  if (idx >= 0) items[idx].value = value;
  else items.splice(items.length, 0, { tag, len: value.length, value });
}

function removeTag(items, tag) {
  const idx = items.findIndex((x) => x.tag === tag);
  if (idx >= 0) items.splice(idx, 1);
}

// ===== MAIN: static -> "dynamic amount" =====
export function makeQrisWithAmount(qrisPayload, amountNumber, opts = {}) {
  const amount = String(Math.round(Number(amountNumber || 0)));
  if (!amount || amount === "NaN" || Number(amount) <= 0) {
    throw new Error("Amount harus angka > 0");
  }

  // 1) Parse root TLV
  let items = parseTLV(qrisPayload);

  // 2) Buang CRC lama (tag 63), nanti hitung ulang
  removeTag(items, "63");

  // 3) Set initiation method (opsional tapi umum)
  if (opts.forceDynamicInitiation) {
    upsertTag(items, "01", "12"); // dynamic
  }

  // 4) Set amount
  upsertTag(items, "54", amount);

  // 5) (Opsional) tambah reference di tag 62 subtag 05 (contoh)
  if (opts.reference) {
    const ref = String(opts.reference);
    // tag 62 is nested TLV
    const idx62 = items.findIndex((x) => x.tag === "62");
    let sub = [];
    if (idx62 >= 0) sub = parseTLV(items[idx62].value);
    upsertTag(sub, "05", ref); // subtag 05 commonly used as reference/terminal (varies by impl)
    const new62 = buildTLV(sub);
    upsertTag(items, "62", new62);
  }

  // 6) Build payload + append CRC
  const payloadNoCrc = buildTLV(items) + "6304";
  return withCRC(payloadNoCrc);
}
