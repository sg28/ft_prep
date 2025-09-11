import React from "react";
import { useEffect, useState } from "react";
import { TextField, Button, Box, Slider } from "@mui/material";

const styles = {
  container: {
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "30px",
    color: "#333",
  },
  form: {
    margin: "auto",
    width: "50%",
  },
  sliderContainer: {
    width: "100%",
    marginTop: "16px",
    marginBottom: "16px",
  },
  button: {
    marginTop: "20px",
  },
};

export default function MortagageCalculator() {
  const [formData, setFormData] = useState({
    monthlyMortgagePayment: 3000,
    totalPaymentAmount: 5000000,
    totalInterest: 10,
    loanTerm: 24,
  });

  let handleChange = (event) => {
    console.log(event.target.value);
  };

  let calculateMortgage = () => {
    console.log(" calculate mortgage ");
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>Mortgage Calculator</div>
      <div>
        <form onSubmit={calculateMortgage} style={styles.form}>
          <TextField
            label="Enter Mortgage Payment"
            name="mortgage payment"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.monthlyMortgagePayment}
            onChange={handleChange}
          />
          <TextField
            label="Enter Loan Term"
            name="loan term"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.loanTerm}
            onChange={handleChange}
          />
          <Box sx={styles.sliderContainer}>
            <Slider
              label="interest rate"
              size="small"
              defaultValue={5}
              aria-label="Small"
              valueLabelDisplay="auto"
            />
          </Box>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
            style={styles.button}
          >
            Calculate Mortgage
          </Button>
        </form>
      </div>
    </div>
  );
}
