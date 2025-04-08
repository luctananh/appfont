/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
  // Define sample fonts data
  const sampleFonts = [
    {
      name: "Roboto",
      link: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
      keyfont: "roboto"
    },
    {
      name: "Open Sans",
      link: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap",
      keyfont: "open-sans"
    },
    {
      name: "Lato",
      link: "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap",
      keyfont: "lato"
    },
    {
      name: "Montserrat",
      link: "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap",
      keyfont: "montserrat"
    },
    {
      name: "Raleway",
      link: "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap",
      keyfont: "raleway"
    },
    {
      name: "Source Sans Pro",
      link: "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap",
      keyfont: "source-sans"
    }
  ];

  // Create the sample fonts
  const createdFonts = [];
  for (const font of sampleFonts) {
    try {
      const createdFont = await api.datafontgg.create(font);
      createdFonts.push(createdFont);
      logger.info(`Created font: ${font.name}`);
    } catch (error) {
      // If the font already exists, log the error but continue
      logger.error(`Error creating font ${font.name}: ${error.message}`);
    }
  }

  // Return success message with count
  return {
    success: true,
    message: `Successfully added ${createdFonts.length} sample fonts`,
    count: createdFonts.length,
    fonts: createdFonts
  };
};

/** @type { ActionOptions } */
export const options = {
  // Ensure this action is available via API
  triggers: { api: true }
};