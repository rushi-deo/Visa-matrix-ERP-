#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mammoth from "mammoth";
import * as cheerio from "cheerio";

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const inputDirectory = path.resolve(toolDirectory, "../../visa-forms");
const outputDirectory = path.join(inputDirectory, "generated");

const slug = (value) => String(value || "")
  .replace(/[?？:：]+/g, "")
  .replace(/[^\p{L}\p{N}]+/gu, "_")
  .replace(/^_+|_+$/g, "")
  .toLowerCase() || "field";

const cleanLabel = (value) => String(value || "")
  .replace(/^[\s\d.)-]+/, "")
  .replace(/[?？:：]+$/, "")
  .replace(/[\u2610\u2611\u2612\u25a1\u25a0\u25cb\u25cf\u25ef\u25c9]/gu, "")
  .replace(/\s+/g, " ")
  .trim();

const inferMetadata = (fileName, text) => {
  const stem = path.basename(fileName, path.extname(fileName)).replace(/[._-]+/g, " ").trim();
  const country = text.match(/(?:country|destination)\s*[:=-]\s*([^,;|\n]+)/i)?.[1]?.trim()
    || stem.split(/\s+(?:visa|application|form)\b/i)[0].trim();
  const visaType = text.match(/(?:visa\s*type|visa)\s*[:=-]\s*([^,;|\n]+)/i)?.[1]?.trim()
    || stem.match(/\b(?:visa|application|form)\s+(?:application\s+for\s+)?(.+)$/i)?.[1]?.trim() || null;
  return { country, visa_type: visaType };
};

const findJsonObject = (text) => {
  const objectStart = text.indexOf("{");
  const arrayStart = text.indexOf("[");
  const start = objectStart < 0 ? arrayStart : arrayStart < 0 ? objectStart : Math.min(objectStart, arrayStart);
  if (start < 0) return null;
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') quoted = false;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === "{" || character === "[") depth += 1;
    else if ((character === "}" || character === "]") && --depth === 0) {
      try { return JSON.parse(text.slice(start, index + 1)); } catch { return null; }
    }
  }
  return null;
};

const normalizeEmbeddedSchema = (source, fileName, rawText) => {
  const embedded = source.form_schema ?? source.visa_application_form ?? source.application_form ?? source;
  const sections = Array.isArray(embedded) ? embedded : embedded.sections;
  if (!Array.isArray(sections)) return null;
  const used = new Set();
  const uniqueId = (value) => {
    const base = slug(value);
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}_${suffix++}`;
    used.add(id);
    return id;
  };
  const normalizedSections = sections.map((section) => ({
    id: uniqueId(section.id ?? section.section_id ?? section.title),
    title: section.title ?? section.section_title ?? section.label ?? "Application Details",
    fields: (Array.isArray(section.fields) ? section.fields : []).map((field) => {
      const next = { ...field };
      next.id = uniqueId(field.id ?? field.field_id ?? field.label);
      next.label = field.label ?? field.question ?? field.name ?? next.id;
      if (field.ui === "radio" && field.type === "boolean") next.type = "radio";
      delete next.field_id;
      return next;
    }),
  })).filter((section) => section.fields.length > 0);
  const metadata = inferMetadata(fileName, rawText);
  return {
    ...(source.country ?? embedded.country ? { country: source.country ?? embedded.country } : { country: metadata.country }),
    ...(source.visa_type ?? embedded.visa_type ? { visa_type: source.visa_type ?? embedded.visa_type } : metadata.visa_type ? { visa_type: metadata.visa_type } : {}),
    name: path.basename(fileName, path.extname(fileName)),
    version: 1,
    status: "draft",
    form_schema: { sections: normalizedSections },
  };
};

const extractOptions = (text) => {
  const matches = [...text.matchAll(/[\u2610\u2611\u2612\u25a1\u25a0\u25cb\u25cf\u25ef\u25c9]\s*([^\u2610\u2611\u2612\u25a1\u25a0\u25cb\u25cf\u25ef\u25c9]+)/gu)];
  return matches.map((match) => cleanLabel(match[1])).filter(Boolean);
};

const convertHtml = (html, fileName, rawText) => {
  const $ = cheerio.load(html, null, false);
  const sections = [];
  const used = new Set();
  let current = null;
  let pendingHelp = null;
  const uniqueId = (value) => {
    const base = slug(value);
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}_${suffix++}`;
    used.add(id);
    return id;
  };
  const ensureSection = (title = "Application Details") => {
    if (!current) {
      current = { id: uniqueId(title), title, fields: [] };
      sections.push(current);
    }
    return current;
  };
  const addField = (label, type, extras = {}) => {
    const clean = cleanLabel(label);
    if (!clean) return;
    const field = { id: uniqueId(clean), label: clean, type, required: false, ...extras };
    if (pendingHelp) { field.help_text = pendingHelp; pendingHelp = null; }
    ensureSection().fields.push(field);
  };
  const addTextControl = (text) => {
    const clean = cleanLabel(text);
    if (!clean) return;
    const options = extractOptions(text);
    if (options.length) return addField(clean, /yes|no/i.test(options.join(" ")) ? "radio" : "select", { options });
    if (/\b(?:date|dob|birth)\b/i.test(clean)) return addField(clean, "date");
    if (/address|explain|describe|comment|details|reason|notes?/i.test(clean)) return addField(clean, "textarea");
    addField(clean, "text");
  };
  const processTable = (table) => {
    table.find("tr").each((_, row) => {
      const cells = $(row).find("th,td").toArray().map((cell) => ({
        text: $(cell).text().replace(/\s+/g, " ").trim(),
        html: $(cell).html() || "",
      })).filter((cell) => cell.text || /checkbox|radio|select|input/i.test(cell.html));
      if (!cells.length) return;
      const label = cells[0].text;
      const combined = cells.map((cell) => cell.text).join(" ");
      const options = extractOptions(combined);
      if (/checkbox/i.test(combined) || /[\u2610\u2611\u2612\u25a1\u25a0]/u.test(combined)) addField(label, "checkbox");
      else if (/radio/i.test(combined) || /[\u25cb\u25cf\u25ef\u25c9]/u.test(combined)) addField(label, "radio", { options });
      else if (/select|dropdown|combobox/i.test(combined) || options.length > 1) addField(label, "select", { options });
      else if (/\b(?:date|dob|birth)\b/i.test(label)) addField(label, "date");
      else if (cells.length > 1 || /input|textarea|blank|_{2,}|\.{3,}/i.test(combined)) addTextControl(label);
    });
  };

  $("body").contents().each((_, element) => {
    const tag = String(element.name || "").toLowerCase();
    const node = $(element);
    if (/^h[1-6]$/.test(tag)) {
      current = { id: uniqueId(node.text()), title: node.text().replace(/\s+/g, " ").trim(), fields: [] };
      sections.push(current);
    } else if (tag === "table") {
      processTable(node);
    } else if (["p", "div", "li"].includes(tag)) {
      const text = node.text().replace(/\s+/g, " ").trim();
      if (!text) return;
      if (/^(?:note|notes|hint|help|instruction|instructions|please)\s*[:：]/i.test(text)) pendingHelp = text;
      else if (/^(?:title|heading)\b/i.test(node.attr("class") || "") || /^(?:\d+[.)]|section\s*:)/i.test(text)) {
        current = { id: uniqueId(text), title: text, fields: [] };
        sections.push(current);
      } else if (/[\u2610\u2611\u2612\u25a1\u25a0]/u.test(text)) {
        addField(cleanLabel(text), "checkbox", { options: extractOptions(text) });
      } else if (/[\u25cb\u25cf\u25ef\u25c9]/u.test(text)) {
        addField(cleanLabel(text), "radio", { options: extractOptions(text) });
      } else if (node.find("input,select,textarea").length || /_{2,}|\.{3,}|[?？:]$/u.test(text)) {
        addTextControl(text);
      } else if (!/[.!]$/u.test(text) && text.split(/\s+/).length <= 12) {
        addTextControl(text);
      }
    }
  });

  const metadata = inferMetadata(fileName, rawText);
  return {
    country: metadata.country,
    ...(metadata.visa_type ? { visa_type: metadata.visa_type } : {}),
    name: path.basename(fileName, path.extname(fileName)),
    version: 1,
    status: "draft",
    form_schema: { sections: sections.filter((section) => section.fields.length > 0) },
  };
};

const convertFile = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  const raw = await mammoth.extractRawText({ buffer });
  const embedded = findJsonObject(raw.value);
  if (embedded) return normalizeEmbeddedSchema(embedded, path.basename(filePath), raw.value);
  const html = await mammoth.convertToHtml({ buffer });
  return convertHtml(html.value, path.basename(filePath), raw.value);
};

const findDocx = async (directory) => {
  const files = [];
  const walk = async (current) => {
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      if (entry.name === "generated") continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".docx")) files.push(fullPath);
    }
  };
  await walk(directory);
  return files.sort((left, right) => left.localeCompare(right));
};

const main = async () => {
  await fs.mkdir(outputDirectory, { recursive: true });
  const files = await findDocx(inputDirectory);
  if (!files.length) throw new Error(`No .docx files found in ${inputDirectory}.`);
  for (const filePath of files) {
    const output = await convertFile(filePath);
    if (!output?.form_schema?.sections?.length) throw new Error(`No form fields extracted from '${path.basename(filePath)}'.`);
    const outputPath = path.join(outputDirectory, `${path.basename(filePath, path.extname(filePath))}.json`);
    await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
    console.log(`Converted ${path.relative(inputDirectory, filePath)} -> ${path.relative(inputDirectory, outputPath)}`);
  }
};

main().catch((error) => {
  console.error(`Form conversion failed: ${error.message}`);
  process.exitCode = 1;
});
