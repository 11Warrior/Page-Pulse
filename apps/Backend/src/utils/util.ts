import axios from "axios";

const checkUrl = (url: unknown): URL => {
    if (typeof (url) !== 'string' || url.trim().length === 0) {
        throw new Error("Invalid URL Passed");
    }

    let parsed: URL;
    try {
        parsed = new URL(url.trim());
    } catch {
        throw new Error("Invalid URL Passed");
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error("Invalid URL Passed");
    }

    return parsed;
}

export const fetchUrl = async (url: unknown): Promise<{ response_time: number, http_status: number, html: string }> => {
    const parsed = checkUrl(url);

    const start = Date.now();

    const response = await axios.get(parsed.toString(), {
        timeout: 10000,
        maxRedirects: 5,
        responseType: 'text'
    });

    const responseTime = Date.now() - start;

    return {
        response_time: responseTime,
        http_status: response.status,
        html: response.data
    }

}
