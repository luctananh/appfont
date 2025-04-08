import React, { useState, useEffect } from "react";
import { Card, BlockStack, Text, SkeletonDisplayText } from "@shopify/polaris";

const EarnPointsCard = ({ title }) => {
  const [earnPoints, setEarnPoints] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnPoints = async () => {
      try {
        const response = await fetch("/app/api/activities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: "earn" }), // Chỉ định "earn"
        });
        const data = await response.json();
        setEarnPoints(data.points); // Nhận điểm *earn* từ response
      } catch (error) {
        console.error("Error fetching earn points:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnPoints();
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
          <Text variant="headingXl">{earnPoints}</Text>
        )}
      </BlockStack>
    </Card>
  );
};

export default EarnPointsCard;