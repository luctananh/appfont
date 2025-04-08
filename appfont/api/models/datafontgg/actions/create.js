import { applyParams, save, ActionOptions } from "gadget-server";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  logger.info({ params }, "Creating new datafontgg record with parameters");
  
  try {
    applyParams(params, record);
    
    // Log the record state before saving
    logger.debug({ recordBeforeSave: record }, "Record state before save");
    
    await save(record);
    
    logger.info({ recordId: record.id }, "Successfully created datafontgg record");
  } catch (error) {
    // Log detailed error information for debugging
    logger.error({ error, params }, "Error creating datafontgg record");
    
    // Re-throw the error so it's properly handled by the framework
    throw error;
  }
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
