import React, { useState, useEffect } from "react";
import {
  LegacyCard,
  EmptyState,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Layout,
  Page,
  Select,
  Text,
} from "@shopify/polaris";
import { api } from "../api";

export default function AppPage() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [themes, setThemes] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState(null);

  // Fetch themes from the shopifyTheme data
  useEffect(() => {
    async function fetchThemes() {
      const result = await api.shopifyTheme.findMany();
      const themeOptions = result.map((theme) => ({
        label: theme.name,
        value: theme.id,
      }));
      setThemes(themeOptions);
    }
    fetchThemes();
  }, []);

  const toggleEnable = () => {
    setIsEnabled((prevState) => !prevState);
  };

  const handleThemeChange = (value) => {
    setSelectedThemeId(value);
  };

  const handleApplyNow = () => {
    if (selectedThemeId) {
      const editorUrl = `https://admin.shopify.com/store/storelta/themes/${selectedThemeId}/editor?context=apps`;
      window.open(editorUrl, "_blank");
    } else {
      alert("Please select a theme first.");
    }
  };

  return (
    <Page title="Home">
      <Layout>
        {/* Section 1: Enable App */}
        {/* <Layout.Section>
          <Card title="Enable app to apply your fonts">
            <BlockStack gap="2">
              <Text as="p" variant="bodyMd">
                {isEnabled ? "App is enabled now" : "App is disabled now"}
              </Text>
              <Button onClick={toggleEnable}>
                {isEnabled ? "Disable" : "Enable"}
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section> */}

        {/* Section 2: Select Theme */}
        <Layout.Section>
          <Card title="Select your theme to work on">
            <BlockStack gap="4">
              <Select
                label="Select your theme to work on"
                options={themes}
                onChange={handleThemeChange}
                value={selectedThemeId}
                placeholder="Select a theme"
              />
              <Text as="p" variant="bodyMd">
                Click on Apply now button to go to the theme editor, after that
                you can click on Save button to apply your fonts to the theme.
                Back to the app to continue your work.
              </Text>
              <Button onClick={handleApplyNow} primary>
                Apply now
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Section 4: Empty State Example */}
        <Layout.Section>
          <LegacyCard sectioned>
            <p>Add fonts</p>
            <EmptyState
              heading="Create your first font"
                 action={{ content: "Add new font", url: "/about" }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>You can upload a custom font or select the font from Google fonts.</p>
            </EmptyState>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}