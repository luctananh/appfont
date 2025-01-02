import { applyParams, ActionOptions } from "gadget-server";
/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections, sessionID }) => {
  
  const selecteddesign = await api.selectfont.findFirst();
  
  console.log("Selected design:", selecteddesign);
  const sessionIF = await api.session.findById(sessionID);
  const shopId = sessionIF.shopId;
  const shop = await api.shopifyShop.findOne(shopId);
  const domain = shop.domain;
  const shopifyClient = await connections.shopify.forShopDomain(domain);
  const accessToken = shopifyClient.storefrontAccessToken.shopify.options.accessToken;
  const API_VERSION = '2024-10';

  // Đảm bảo namespace đã được định nghĩa
  const namespace = "setting";  // Gán giá trị cho namespace
  const key = "style";  // Gán giá trị cho key
  
  if (!accessToken || !domain) {
    throw new Error("Missing required parameters: accessToken, domain");
  }

  try {
    // Lấy danh sách Metafields
    const metafieldsResponse = await fetch(`https://${domain}/admin/api/${API_VERSION}/metafields.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    });

    if (!metafieldsResponse.ok) {
      const errorText = await metafieldsResponse.text();
      throw new Error(`Failed to fetch metafields: ${metafieldsResponse.status} - ${errorText}`);
    }
    
    const metafieldsData = await metafieldsResponse.json();
    const metafields = metafieldsData.metafields;
    console.log("Existing Metafields:", metafields);

    // Tìm kiếm metafield đã tồn tại (nếu có)
    const existingMetafield = metafields.find(mf => mf.namespace === namespace && mf.key === key);

    const metafieldUrl = existingMetafield
      ? `https://${domain}/admin/api/${API_VERSION}/metafields/${existingMetafield.id}.json`
      : `https://${domain}/admin/api/${API_VERSION}/metafields.json`;

    const metafieldData = {
      namespace: namespace,  // Sử dụng namespace đã định nghĩa
      key: key,              // Sử dụng key đã định nghĩa
      value: JSON.stringify(selecteddesign),
      type: "json_string",
    };

    console.log(`Processing Metafield (${namespace}:${key}):`, metafieldData);
    const response = await fetch(metafieldUrl, {
      method: existingMetafield ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ metafield: metafieldData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to process metafield (${namespace}:${key}): ${response.status} - ${errorText}`);
    }

    const updatedMetafield = await response.json();
    console.log(`Updated Metafield (${namespace}:${key}):`, updatedMetafield);

  } catch (error) {
    logger.error("Error processing design settings metafield:", error.message);
    throw error;
  }
};
/** @type { ActionOptions } */
export const options = {
  actionType: "custom",
  triggers: { api: true },
};
