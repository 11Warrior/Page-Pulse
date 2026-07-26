import axios from "axios";

export const checkUrl = (url: unknown): URL => {
    if (typeof (url) !== 'string' || url.trim().length === 0) {
        throw new Error("Invalid URL Passed");
    }

    // console.log(url);
    let parsed: URL;
    try {
        parsed = new URL(url.trim());
    } catch {
        throw new Error("Invalid URL Passed");
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error("Invalid URL Passed");
    }
    // console.log(parsed);
    return parsed;
}

export const fetchUrl = async (url: unknown): Promise<{ response_time: number, http_status: number, html: string }> => {
    const parsed = checkUrl(url);

    const start = Date.now();

    const response = await axios.get(parsed.href, {
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: () => true,
        responseType: 'text'
    });

    const responseTime = Date.now() - start;

    return {
        response_time: responseTime,
        http_status: response.status,
        html: response.data
    }

}
