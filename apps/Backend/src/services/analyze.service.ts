import * as cheerio from "cheerio"
import { analysisType } from "../types/types";

export const analyzeSite = async (html: string): Promise<analysisType> => {
    const $ = cheerio.load(html);

    const page_title = $('title').first().text().trim() || "";

    const meta_description =
        $('meta[name="description"]').attr('content')?.trim() ||
        $('meta[property="og:description"]').attr('content')?.trim() ||
        "";

    const h1_count = $('h1').length;

    const images = $('img');
    let images_missing_alt_text = 0;
    images.each((_, el) => {
        const alt = $(el).attr('alt');
        if (alt === undefined || alt.trim() === '') {
            images_missing_alt_text += 1;
        }
    });

    $('script, style, noscript').remove();

    const rawText = $('body').length ? $('body').text() : $.root().text();
    const text = rawText.replace(/\s+/g, ' ').trim();
    const word_count = text.length === 0 ? 0 : text.split(' ').length;

    return {
        page_title,
        meta_description,
        h1_count,
        images_missing_alt_text,
        word_count
    };
}