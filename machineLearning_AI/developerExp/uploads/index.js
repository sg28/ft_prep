import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Collapse,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { commonStyles } from "../Styles/styles";
import { faqStyles, boxStyleHandler } from "./styles";

const FAQ = ({ topics }) => {
  const [selectedTopic, setSelectedTopic] = useState(topics?.[0]?.id || null);
  const [expanded, setExpanded] = useState(false);
  const [over, setOver] = useState(false);
  const theme = useTheme();
  const [faqHeader, setFaqHeader] = useState("Frequently Asked Questions");
  const [faqTopics, setFaqTopics] = useState([]);

  useEffect(() => {
    if (topics && topics.length > 0) {
      setFaqHeader(topics[0]?.header || "Inside Scoop");
      setFaqTopics(topics[0]?.faqs || []);
    }
  }, [topics]);

  useEffect(() => {
    if (faqTopics.length > 0) {
      setSelectedTopic(faqTopics[0]?.id || null);
    }
  }, [faqTopics]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const boxStyle = boxStyleHandler(over);
  const styles = faqStyles(theme.palette.mode);

  return (
    <Box
      id="faq"
      className="main-container"
      sx={{ ...commonStyles.container, ...styles.mainContainer }}
    >
      <Box sx={styles.contentWrapper}>
        <Typography variant="h1" sx={styles.title}>
          {faqHeader}
        </Typography>
        {faqTopics.length === 0 ? (
          <Typography variant="h3">No FAQ topics available.</Typography>
        ) : (
          <Box sx={styles.flexBox}>
            {/* Left Box: Topics */}
            <Box sx={styles.leftBox}>
              <Box sx={styles.leftOverflowBox}>
                {faqTopics.map((topic) => (
                  <Button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    sx={styles.button(selectedTopic === topic.id)}
                  >
                    {topic.name}
                  </Button>
                ))}
              </Box>
            </Box>
            {/* Right Box: Questions */}
            <Box sx={styles.rightBox}>
              {faqTopics
                .find((topic) => topic.id === selectedTopic)
                ?.questions?.map((faq) => (
                  <Accordion
                    key={faq.id}
                    expanded={expanded === faq.id}
                    onChange={handleAccordionChange(faq.id)}
                    sx={styles.accordion}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={styles.expandIcon} />}
                    >
                      <Typography variant="body1">{faq.header}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Collapse
                        in={expanded === faq.id}
                        timeout={500}
                        easing="ease-in-out"
                      >
                        <Typography variant="body1">
                          {faq.description}
                        </Typography>
                      </Collapse>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export { FAQ };
