import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

export default function ContactUsForm() {
    const [formData, setFormData] = useState({
        name: "helloWorld",
        age: 10
    });

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const submitForm = (event) => {
        event.preventDefault();
        console.log("Submit Form", formData);
    };

    return (
        <Box sx={{ width: 300, margin: "auto", padding: 2 }}>
            <h2>Contact Us Form</h2>
            <form onSubmit={submitForm}>
                <TextField
                    label="Enter Name"
                    name="name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={formData.name}
                    onChange={handleChange}
                />
                <TextField
                    label="Enter Age"
                    name="age"
                    type="number"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={formData.age}
                    onChange={handleChange}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Submit
                </Button>
            </form>
        </Box>
    );
}
