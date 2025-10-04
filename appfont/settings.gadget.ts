import type { GadgetSettings } from "gadget-server";

export const settings: GadgetSettings = {
  type: "gadget/settings/v1",
  frameworkVersion: "v1.3.0",
  plugins: {
    connections: {
      shopify: {
        apiVersion: "2025-07",
        enabledModels: [
          "shopifyAsset",
          "shopifyFile",
          "shopifyTheme",
        ],
        type: "partner",
        scopes: [
          "read_products",
          "write_products",
          "write_themes",
          "read_themes",
        ],
      },
    },
  },
};
