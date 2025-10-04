import { ActionOptions } from "gadget-server";

/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections, sessionID }) => {
  try {
    const sessionIF = await api.session.findById(sessionID);
    const shopId = sessionIF.shopId;
    
    // Lấy font setting của shop hiện tại
    const selecteddesign = await api.selectfont.findFirst({
      filter: {
        shopid: { equals: String(shopId) },
        namespace: { equals: "setting" },
        key: { equals: "style" }
      }
    });
    
    if (!selecteddesign?.value) {
      logger.info("No font selected for this shop");
      return;
    }
    
    // Dùng Shopify client trực tiếp
    const shopifyClient = await connections.shopify.forShopId(shopId);
    
    const result = await shopifyClient.graphql(`
      mutation ($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
          }
          userErrors {
            message
          }
        }
      }
    `, {
      metafields: [{
        key: "style",
        namespace: "setting", 
        ownerId: `gid://shopify/Shop/${shopId}`,
        type: "json",
        value: JSON.stringify(selecteddesign.value)
      }]
    });
    
    if (result.metafieldsSet.userErrors.length > 0) {
      throw new Error("Shopify errors: " + JSON.stringify(result.metafieldsSet.userErrors));
    }
    
    logger.info("Metafield updated successfully", result.metafieldsSet.metafields);
    
  } catch (error) {
    logger.error("Error updating metafield:", error);
    throw error;
  }
};

/** @type { ActionOptions } */
export const options = {
  actionType: "custom",
  triggers: { api: true },
};