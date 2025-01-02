import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "datafontgg" model, go to https://appfont.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "HHB9fzQlAYBF",
  fields: {
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
  },
};
