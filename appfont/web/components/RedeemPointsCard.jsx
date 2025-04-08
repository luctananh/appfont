import React, { useState, useEffect } from "react";
import { Card, BlockStack, Text, SkeletonDisplayText } from "@shopify/polaris";

const RedeemPointsCard = ({ title }) => {
  const [redeemPoints, setRedeemPoints] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRedeemPoints = async () => {
      try {
        const response = await fetch("/app/api/activities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: "redeem" }), // Chỉ định "redeem"
        });
        const data = await response.json();
        setRedeemPoints(data.points); // Nhận điểm *redeem* từ response
      } catch (error) {
        console.error("Error fetching redeem points:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRedeemPoints();
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
          <Text variant="headingXl">{redeemPoints}</Text>
        )}
      </BlockStack>
    </Card>
  );
};

export default RedeemPointsCard;