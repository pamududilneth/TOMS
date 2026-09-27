import { buildSingleIncidentTableHTML, buildSingleBreakdownTableHTML } from "./reportTable";

async function fetchImageAsDataUrl(url) {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function writeHtmlToClipboard(html, plainText) {
    if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([plainText], { type: "text/plain" }),
        });
        await navigator.clipboard.write([item]);
    } else {
        await navigator.clipboard.writeText(plainText);
    }
}

export async function copyIncidentTableToClipboard(incident) {
    const html = buildSingleIncidentTableHTML(incident, { standalone: false });
    const plain = `Incident Report — ${incident.request_id}`;

    await writeHtmlToClipboard(html, plain);
    return { success: true, hasImage: false };
}

export async function copyBreakdownTableToClipboard(breakdown) {
    const html = buildSingleBreakdownTableHTML(breakdown, { standalone: false });
    const plain = `Breakdown Report — ${breakdown.job_number}`;

    await writeHtmlToClipboard(html, plain);
    return { success: true };
}