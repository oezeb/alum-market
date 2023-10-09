import React from "react";
import { useNavigate } from "react-router-dom";

import { apiRoutes } from "../api";
import AddEditItem from "./AddEditItem";
import { Box } from "@mui/system";
import { Alert, Snackbar } from "@mui/material";

function AddItem() {
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false); // snackbar

    const handleSubmit = (formData) => {
        fetch(apiRoutes.profileItems, {
            method: "POST",
            body: formData,
        })
            .then((res) => (res.ok ? res.json() : Promise.reject(res)))
            .then((data) => navigate("/items/" + data._id))
            .catch((err) => {
                console.error(err);
                setOpen(true);
            });
    };

    return (
        <Box>
            <AddEditItem onSubmit={handleSubmit} />
            <Snackbar open={open} autoHideDuration={6000} onClose={setOpen}>
                <Alert
                    onClose={setOpen}
                    severity="error"
                    sx={{ width: "100%" }}
                >
                    Error submitting item
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default AddItem;
