import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "datafontgg" model, go to https://appfont.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "HHB9fzQlAYBF",
  fields: {
    blogPage: { type: "boolean", storageKey: "u8npOagsgBmH" },
    cartPage: { type: "boolean", storageKey: "GNFZ-_gPRcaP" },
    checkbox: { type: "string", storageKey: "WexP-RoFC1So" },
    collectionsPage: { type: "boolean", storageKey: "JMWJ957Km6x6" },
    customUrl: { type: "boolean", storageKey: "Hqz3o5PoZrsE" },
    customUrls: { type: "string", storageKey: "PmnEQTiXDCJq" },
    homePage: { type: "boolean", storageKey: "_Hv4DFAV4ltA" },
    keyfont: { type: "string", storageKey: "XPI_qOXoOSMT" },
    link: {
      type: "string",
      validations: { required: true },
      storageKey: "zuTswQPN-j9B",
    },
    name: {
      type: "string",
      validations: { required: true },
      storageKey: "jNw9t2JHxei7",
    },
    productsPage: { type: "boolean", storageKey: "k-s1a2mjJ6R-" },
    size: { type: "string", storageKey: "oumm0-_AJOXm" },
    visibilityMode: { type: "string", storageKey: "pyyyX9MXyjIo" },
  },
};
