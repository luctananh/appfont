import type { GadgetPermissions } from "gadget-server";

/**
 * This metadata describes the access control configuration available in your application.
 * Grants that are not defined here are set to false by default.
 *
 * View and edit your roles and permissions in the Gadget editor at https://appfont.gadget.app/edit/settings/permissions
 */
export const permissions: GadgetPermissions = {
  type: "gadget/permissions/v1",
  roles: {
    "shopify-app-users": {
      storageKey: "Role-Shopify-App",
      models: {
        datafontgg: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        selectfont: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAsset: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyAsset.gelly",
          },
        },
        shopifyFile: {
          read: {
            filter: "accessControl/filters/shopify/shopifyFile.gelly",
          },
        },
        shopifyGdprRequest: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyGdprRequest.gelly",
          },
          actions: {
            create: true,
            update: true,
          },
        },
        shopifyProduct: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProduct.gelly",
          },
        },
        shopifyShop: {
          read: {
            filter: "accessControl/filters/shopify/shopifyShop.gelly",
          },
          actions: {
            install: true,
            reinstall: true,
            uninstall: true,
            update: true,
          },
        },
        shopifySync: {
          read: {
            filter: "accessControl/filters/shopify/shopifySync.gelly",
          },
          actions: {
            abort: true,
            complete: true,
            error: true,
            run: true,
          },
        },
        shopifyTheme: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyTheme.gelly",
          },
          actions: {
            create: true,
            update: true,
          },
        },
      },
      actions: {
        scheduledShopifySync: true,
        update1: true,
        uploadWoff: true,
      },
    },
    unauthenticated: {
      storageKey: "unauthenticated",
      models: {
        datafontgg: {
          read: true,
        },
      },
    },
  },
};
