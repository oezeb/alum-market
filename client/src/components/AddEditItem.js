import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import React from "react";
import { apiRoutes } from "../api";
import { Checkbox, FormControlLabel } from "@mui/material";

function AddEditItem(props) {
    const { showSoldCheckbox } = props;
    const [images, setImages] = React.useState(props.images || []);

    const dataURLtoBlob = (dataURL) => {
        const bytes = atob(dataURL.split(",")[1]);
        const mime = dataURL.split(",")[0].split(":")[1].split(";")[0];
        const max = bytes.length;
        const ia = new Uint8Array(max);
        for (let i = 0; i < max; i++) ia[i] = bytes.charCodeAt(i);
        return new Blob([ia], { type: mime });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const sold = formData.get("sold") === "on";
        formData.set("sold", sold);

        let tags = formData
            .get("tags")
            .split(/\W+/)
            .filter((tag) => tag !== "");
        formData.set("tags", JSON.stringify(tags));

        images.forEach((image, index) => {
            formData.append(
                "images",
                dataURLtoBlob(image),
                `image${index}.jpeg`
            );
        });

        if (props.onSubmit) props.onSubmit(formData);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <Toolbar />
            <Box display="flex" alignItems="center">
                <TextField
                    name="price"
                    label="Price (RMB)"
                    defaultValue={props.price}
                    fullWidth
                    variant="standard"
                    margin="normal"
                    size="small"
                    type="number"
                />
                {showSoldCheckbox && (
                    <FormControlLabel
                        name="sold"
                        margin="normal"
                        label="Sold"
                        control={<Checkbox defaultChecked={props.sold} />}
                        labelPlacement="start"
                    />
                )}
            </Box>
            <TextField
                name="description"
                label="Description"
                defaultValue={props.description}
                fullWidth
                required
                margin="normal"
                size="small"
                multiline
                maxRows={5}
                minRows={5}
                inputProps={{ minLength: 3 }}
                placeholder={descriptionPlaceholder}
            />
            <TagsInput
                defaultValue={props.tags?.map((tag) => `#${tag}`).join(" ")}
            />
            <ImagesInput images={images} setImages={setImages} />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Submit
            </Button>
            <Toolbar />
        </Box>
    );
}

const descriptionPlaceholder = `Record the following information:
- Item name
- Item origin
- Item condition
- Item location (campus)`;

const TagsInput = (props) => {
    const [text, setText] = React.useState(props.defaultValue || "");
    const [tags, setTags] = React.useState([]);
    const [tagsExpanded, setTagsExpanded] = React.useState(false);

    const tagsLimit = 15;
    React.useEffect(() => {
        fetch(apiRoutes.itemTags + `?limit=${tagsLimit}`)
            .then((res) => res.json())
            .then((tags) => tags.map((tag) => tag.tag))
            .then((tags) => setTags(tags))
            .catch((err) => console.error(err));
    }, []);

    const onChange = (event) => {
        const pattern = /^[\w\s#]*$/g;
        const value = event.target.value;
        if (pattern.test(value)) setText(value);
    };

    return (
        <>
            <TextField
                name="tags"
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                label="Tags"
                multiline
                margin="normal"
                maxRows={3}
                minRows={3}
                value={text}
                inputProps={{ maxLength: 100 }}
                onChange={onChange}
            />
            {tags.length > 0 && (
                <ListItem dense disablePadding>
                    <Box flexGrow={1} />
                    <Collapse
                        in={tagsExpanded}
                        timeout="auto"
                        collapsedSize="24px"
                    >
                        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                            {tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    onClick={() =>
                                        setText((prev) => prev + " #" + tag)
                                    }
                                    sx={{ mr: 1, mb: 1 }}
                                    size="small"
                                    label={"#" + tag}
                                />
                            ))}
                        </Box>
                    </Collapse>
                    <IconButton
                        sx={{ p: 0 }}
                        onClick={() => setTagsExpanded((prev) => !prev)}
                    >
                        {tagsExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </ListItem>
            )}
        </>
    );
};

const ImagesInput = (props) => {
    const { images, setImages } = props;

    const maxImages = 5;

    const onUploadImage = (event) => {
        const files = event.target.files;
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImages((prev) => [...prev, event.target.result]);
            };
            reader.readAsDataURL(file);
        }
    };

    const Container = (props) => (
        <Box
            sx={{
                m: 1,
                width: 56,
                height: 56,
                borderRadius: 1,
                border: "1px solid #bdbdbd",
                bgcolor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
            }}
            {...props}
        />
    );

    return (
        <>
            <ListItem divider dense>
                <ListItemText primary="Images" />
            </ListItem>
            <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                {images.map((image, index) => (
                    <Container key={index}>
                        <img
                            src={image}
                            alt={index}
                            width="100%"
                            height="100%"
                        />
                        <Box sx={{ position: "absolute", top: 0, right: 0 }}>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setImages((prev) =>
                                        prev.filter((_, i) => i !== index)
                                    );
                                }}
                            >
                                <CancelIcon fontSize="inherit" color="error" />
                            </IconButton>
                        </Box>
                    </Container>
                ))}
                {images.length < maxImages && (
                    <Container>
                        <InputLabel htmlFor="upload-image">
                            <Input
                                id="upload-image"
                                type="file"
                                inputProps={{
                                    multiple: true,
                                    accept: "image/*",
                                }}
                                onChange={onUploadImage}
                                sx={{ display: "none" }}
                            />
                            <AddIcon fontSize="large" />
                        </InputLabel>
                    </Container>
                )}
            </Box>
        </>
    );
};

export default AddEditItem;