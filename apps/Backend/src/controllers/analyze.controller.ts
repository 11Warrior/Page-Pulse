import { Request, Response } from "express";
import { analyzeSite } from "../services/analyze.service";
import { fetchUrl } from "../utils/util";

export const analyze = async (req: Request, res: Response) => {
    try {
        const { url } = req.query;
      
        const { http_status, response_time, html } = await fetchUrl(url);

        if (typeof html !== 'string' || html.trim().length === 0) {
            return res.json({
                sucess: false,
                report: {
                    http_status: 415,
                    response_time: 0,
                    page_title: "",
                    meta_description: "",
                    h1_count: 0,
                    images_missing_alt_text: 0,
                    word_count: 0
                }
            });
        }

        const analysisReport = await analyzeSite(html);

        return res.json({
            sucess: true,
            report: {
                http_status,
                response_time,
                ...analysisReport,
            }
        })

    } catch (error) {
        console.log("[ERR] Error while analyzing ");
        throw error;
    }
}