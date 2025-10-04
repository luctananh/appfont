import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyShop" model, go to https://appfont.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-Shop",
  fields: {
    cookieConsentLevel: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-cookie_consent_level::FieldStorageEpoch-DataModel-Shopify-Shop-cookie_consent_level-initial",
    },
    currency: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-currency::FieldStorageEpoch-DataModel-Shopify-Shop-currency-initial",
    },
    eligibleForCardReaderGiveaway: {
      type: "boolean",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-eligible_for_card_reader_giveaway::FieldStorageEpoch-DataModel-Shopify-Shop-eligible_for_card_reader_giveaway-initial",
    },
    enabledPresentmentCurrencies: {
      type: "json",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-enabled_presentment_currencies::FieldStorageEpoch-DataModel-Shopify-Shop-enabled_presentment_currencies-initial",
    },
    forceSsl: {
      type: "boolean",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-force_ssl::FieldStorageEpoch-DataModel-Shopify-Shop-force_ssl-initial",
    },
    weightUnit: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-weight_unit::FieldStorageEpoch-DataModel-Shopify-Shop-weight_unit-initial",
    },
  },
  shopify: {
    fields: [
      "address1",
      "address2",
      "assets",
      "checkoutApiSupported",
      "city",
      "country",
      "countryCode",
      "countryName",
      "countyTaxes",
      "customerAccountsV2",
      "customerEmail",
      "domain",
      "domains",
      "eligibleForPayments",
      "email",
      "files",
      "finances",
      "gdprRequests",
      "googleAppsDomain",
      "googleAppsLoginEnabled",
      "hasDiscounts",
      "hasGiftCards",
      "hasStorefront",
      "ianaTimezone",
      "latitude",
      "longitude",
      "marketingSmsContentEnabledAtCheckout",
      "moneyFormat",
      "moneyInEmailsFormat",
      "moneyWithCurrencyFormat",
      "moneyWithCurrencyInEmailsFormat",
      "multiLocationEnabled",
      "myshopifyDomain",
      "name",
      "passwordEnabled",
      "phone",
      "planDisplayName",
      "planName",
      "preLaunchEnabled",
      "primaryLocale",
      "products",
      "province",
      "provinceCode",
      "requiresExtraPaymentsAgreement",
      "setupRequired",
      "shopOwner",
      "shopifyCreatedAt",
      "shopifyUpdatedAt",
      "source",
      "syncs",
      "taxShipping",
      "taxesIncluded",
      "themes",
      "timezone",
      "transactionalSmsDisabled",
      "zipCode",
    ],
  },
};
