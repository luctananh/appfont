// /**
//  * @param {object} params
//  * @param {string} params.shopId - ID của shop để áp dụng font mặc định
//  * @param {boolean} params.force - Buộc áp dụng phông chữ mặc định ngay cả khi phông chữ tồn tại
//  */
// export const params = {
//   shopId: { type: "string" },
//   force: { type: "boolean" }
// };

// /** @type { ActionOptions } */
// export const options = {
//   triggers: { 
//     api: true,
//     // Nếu không cần chạy định kỳ, bạn có thể xóa phần scheduler bên dưới
//     // scheduler: [
//     //   {
//     //     cron: "0 0 * * 0" // Chạy hàng tuần vào Chủ Nhật lúc nửa đêm (tùy chọn)
//     //   }
//     // ] 
//   }
// };

// /** @type { ActionRun } */
// export const run = async ({ params, logger, api, connections }) => {
//   const shopId = connections.shopify.currentShopId;
  
//   if (!shopId) {
//     logger.error("No shop ID available in context");
//     throw new Error("No shop ID available in context");
//   }
  
//   logger.info(`Checking for existing font configuration for shop ${shopId}`);
  
//   // Kiểm tra xem có bản ghi selectfont nào hiện có cho cửa hàng này không
//   const existingConfig = await api.selectfont.findMany({
//     filter: {
//       shopid: { equals: shopId },
//       namespace: { equals: "font-settings" }
//     }
//   });
  
//   // Cấu hình phông chữ mặc định
//   const defaultFontConfig = {
//     primaryFont: "Open Sans",
//     secondaryFont: "Lato",
//     headingsFont: "Open Sans",
//     bodyFont: "Open Sans",
//     buttonFont: "Open Sans",
//     fontSources: [
//       {
//         name: "Open Sans",
//         url: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap",
//         type: "google"
//       },
//       {
//         name: "Lato",
//         url: "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap",
//         type: "google"
//       }
//     ],
//     fontWeights: {
//       headings: "600",
//       body: "400",
//       buttons: "500"
//     }
//   };
  
//   let configRecord;
  
//   // Nếu chưa có cấu hình hoặc được yêu cầu cập nhật lại
//   if (existingConfig.length === 0 || params.force) {
//     if (existingConfig.length === 0) {
//       logger.info("No existing font configuration found, creating default configuration");
      
//       configRecord = await api.selectfont.create({
//         key: "font-config",
//         namespace: "font-settings",
//         shopid: shopId,
//         value: defaultFontConfig
//       });
      
//       logger.info(`Created default font configuration with ID: ${configRecord.id}`);
//     } else {
//       logger.info(`Updating existing font configuration with ID: ${existingConfig[0].id}`);
      
//       configRecord = await api.selectfont.update(existingConfig[0].id, {
//         value: defaultFontConfig
//       });
      
//       logger.info(`Updated font configuration with ID: ${configRecord.id}`);
//     }
    
//     // Áp dụng cấu hình mới cho chủ đề ngay lập tức
//     logger.info("Calling update1 action to apply font changes to theme immediately");
//     try {
//       const updateResult = await api.update1({
//         shopId: shopId,
//         configId: configRecord.id
//       });
      
//       logger.info("Successfully applied font changes to theme");
      
//       return {
//         success: true,
//         message: "Default font configuration has been applied to your theme immediately",
//         configId: configRecord.id,
//         updateResult: updateResult
//       };
//     } catch (error) {
//       logger.error({ error }, "Failed to apply theme changes");
//       return {
//         success: false,
//         message: "Font configuration was saved but could not be applied to the theme",
//         configId: configRecord.id,
//         error: error.message
//       };
//     }
//   } else {
//     // Nếu đã có cấu hình, ta vẫn gọi luôn update1 để áp dụng ngay
//     logger.info(`Existing font configuration found with ID: ${existingConfig[0].id}, applying theme update immediately`);
//     try {
//       const updateResult = await api.update1({
//         shopId: shopId,
//         configId: existingConfig[0].id
//       });
      
//       logger.info("Successfully applied font changes to theme");
      
//       return {
//         success: true,
//         message: "Existing font configuration has been applied to your theme immediately",
//         configId: existingConfig[0].id,
//         updateResult: updateResult
//       };
//     } catch (error) {
//       logger.error({ error }, "Failed to apply theme changes");
//       return {
//         success: false,
//         message: "Existing font configuration was found but could not be applied to the theme",
//         configId: existingConfig[0].id,
//         error: error.message
//       };
//     }
//   }
// };
