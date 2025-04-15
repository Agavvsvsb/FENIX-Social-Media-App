import {
    Card,
    CardContent,
    Box,
    IconButton,
    Typography,
    Avatar,
} from "@mui/material";

import { Delete as DeleteIcon } from "@mui/icons-material";
import { blue } from "@mui/material/colors";

export default function Item({ post, remove }) {
    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                    }}
                >
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                background: blue[500],
                            }}
                        />
                        <Typography sx={{ fontWeight: "bold" }}>
                            {post.user.name}
                        </Typography>
                    </Box>
                    <IconButton size="medium" onClick={() => remove(post.id)}>
                        <DeleteIcon sx={{ fontSize: 22, color: "red" }} />
                    </IconButton>
                </Box>

                <Typography sx={{ mt: 2 }}>{post.content}</Typography>
            </CardContent>
        </Card>
    );
}
