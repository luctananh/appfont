/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
  const shopId = connections.shopify.currentShopId;
  
  if (!shopId) {
    logger.warn("No shop ID found in the current context");
    return { success: false, error: "No shop ID found" };
  }

  // Chuyển đổi shopId sang string
  const shopIdString = String(shopId);
  
  logger.info({ shopId: shopIdString }, "Debugging font settings for shop");
  
  // Sử dụng shopIdString trong filter
  const fontSettings = await api.selectfont.findFirst({
    filter: {
      shopid: { equals: shopIdString },
      ...(params.namespace ? { namespace: { equals: params.namespace } } : {}),
      ...(params.key ? { key: { equals: params.key } } : {})
    }
  }).catch(error => {
    logger.error({ error }, "Error fetching font settings");
    return null;
  });
  
  if (!fontSettings) {
    logger.warn({ shopId }, "No font settings found for this shop");
    return { 
      success: false, 
      error: "No font settings found", 
      shopId,
      filter: {
        shopid: shopId,
        ...(params.namespace ? { namespace: params.namespace } : {}),
        ...(params.key ? { key: params.key } : {})
      }
    };
  }
  
  logger.info({
    id: fontSettings.id,
    key: fontSettings.key,
    namespace: fontSettings.namespace,
    createdAt: fontSettings.createdAt,
    updatedAt: fontSettings.updatedAt,
    valueType: typeof fontSettings.value
  }, "Found font settings");
  
  // Log the full value object for debugging
  logger.info({ value: fontSettings.value }, "Font settings value");
  
  return {
    success: true,
    shopId,
    settings: fontSettings,
    id: fontSettings.id,
    key: fontSettings.key,
    namespace: fontSettings.namespace,
    createdAt: fontSettings.createdAt,
    updatedAt: fontSettings.updatedAt,
    value: fontSettings.value
  };
};

/** @type { import("gadget-server").ActionOptions } */
export const options = {
  // Keep default API trigger
};

/**
 * Custom parameters for the debug action
 * @type { Object }
 */
export const params = {
  namespace: { type: "string" },
  key: { type: "string" }
};