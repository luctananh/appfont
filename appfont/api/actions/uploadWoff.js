import { applyParams, save, ActionOptions } from "gadget-server";
import { useShopify } from "@gadgetinc/react";
export const run = async ({ params, input }) => {
    try {
        console.log("Received input:", input);  // Log để kiểm tra dữ liệu nhận được

        const file = input?.file;
        if (!file || !file.name || !file.data) {
            throw new Error("Invalid or missing file in input.");
        }

        const fileName = file.name;
        const fileContent = Buffer.from(file.data, 'base64'); // Chuyển đổi base64 thành buffer

        // Kiểm tra và lấy thông tin shopifyShop
        const shopifyShop = params?.shopifyShop;
        if (!shopifyShop || !shopifyShop.domain || !shopifyShop.accessToken) {
            throw new Error("Invalid or missing shopifyShop information.");
        }

        const shopDomain = shopifyShop.domain;
        const apiKey = shopifyShop.accessToken;

        // Upload file lên Shopify Files API
        const url = `https://${shopDomain}/admin/api/2023-10/files.json`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "X-Shopify-Access-Token": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                file: {
                    attachment: fileContent.toString("base64"), // Shopify yêu cầu tệp ở dạng Base64
                    filename: fileName,
                },
            }),
        });

        if (!response.ok) {
            const responseBody = await response.text();
            throw new Error(`Shopify API error: ${response.status} - ${responseBody}`);
        }

        const responseJson = await response.json();
        const fileUrl = responseJson.file?.url;

        // Trả về URL tệp đã upload
        return { success: true, fileUrl };
    } catch (error) {
        console.error("Error in uploadWoff action:", error);
        return { success: false, error: error.message };
    }
};
