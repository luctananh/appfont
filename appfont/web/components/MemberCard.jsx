import React, { useState, useEffect } from "react";
import { Card, BlockStack, Text, SkeletonDisplayText } from "@shopify/polaris";

const MemberCard = ({ title }) => {
  const [customerCount, setCustomerCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerCount = async () => {
      try {
        const response = await fetch("/app/api/customer/count");
        const data = await response.json();
        setCustomerCount(data.count);
      } catch (error) {
        console.error("Error fetching customer count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerCount();
  }, []);

  return (
    <Card>
      <BlockStack gap={200}>
        <Text variant="headingSm" as="h2">
          {title}
        </Text>
        {loading ? (
          <SkeletonDisplayText maxWidth="40px" size="small" />
        ) : (
          <Text variant="headingXl">{customerCount}</Text>
        )}
      </BlockStack>
    </Card>
  );
};

export default MemberCard;