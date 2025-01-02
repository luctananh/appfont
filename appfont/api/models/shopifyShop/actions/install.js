import { applyParams, save, ActionOptions } from "gadget-server";
/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  // Thông tin API
  const shopifyShop = params.shopifyShop;
  const { name, domain, accessToken } = shopifyShop;
  const apiVersion = "2023-10"; // Phiên bản API Shopify
  const namespace = "setting";
  const key = "style";
  const icondefault = "applepay,visa,paypal,mastercard";
  
  const defaultMetafieldValue = await api.selectfont.findMany();

  const endpoint = `https://${name}.myshopify.com/admin/api/${apiVersion}/metafields.json`;
  await createShopMetafield(
    endpoint,
    accessToken,
    namespace,
    key,
    defaultMetafieldValue
  );
  applyParams(params, record);
  await save(record);
 
};
// Hàm tạo Metafield
async function createShopMetafield(
  endpoint,
  accessToken,
  namespace,
  key,
  defaultMetafieldValue
) {
  // Dữ liệu Metafield
  const metafieldData = {
    metafield: {
      namespace: namespace,
      key: key,
      value: JSON.stringify(defaultMetafieldValue),
      type: "json_string", // Thay đổi từ multi_line_text_field sang json_string
    },
  };
  try {
    // Gửi yêu cầu HTTP POST đến API Shopify để tạo Metafield
    const response = await fetch(endpoint, {
      method: "POST", // Phương thức POST để tạo mới
      headers: {
        "Content-Type": "application/json", // Định dạng dữ liệu là JSON
        "X-Shopify-Access-Token": accessToken, // Đưa token vào header để xác thực
      },
      body: JSON.stringify(metafieldData), // Chuyển dữ liệu Metafield thành chuỗi JSON
    });
    // Kiểm tra phản hồi từ API
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Nếu thành công, parse kết quả trả về và in thông tin Metafield
    const result = await response.json();
    const results = await api.update();
    console.log("Metafield created:", result);
  } catch (error) {
    // Bắt lỗi và in thông báo nếu có lỗi xảy ra
    console.error("Error creating Metafield:", error.message);
  }

}
/** @type { ActionOnSuccess } */
export const onSuccess = async ({
  params,
  record,
  logger,
  api,
  connections,
}) => {
  // Your logic goes here
};
/** @type { ActionOptions } */
export const options = {
  actionType: "create",
}; 