import { useRef } from "react";

import { TextField, Tooltip, IconButton, Avatar, Paper, Box } from "@mui/material";

import PostAddIcon from '@mui/icons-material/PostAdd';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "../AppProvider";

async function postPost(content) {
    const api = "http://localhost:8080/posts";
    const token = localStorage.getItem("token");
    
    if (!token) {
        throw new Error("Authentication required");
    }

    const res = await fetch(api, {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    return res.json();
}

export default function Form() {
    const inputRef = useRef();
    const queryClient = useQueryClient();
    const { Auth } = useApp();

    const add = useMutation({
        mutationFn: postPost,
        onSuccess: (item) => {
            queryClient.invalidateQueries(["posts"], (old) => {
                return old ? [item, ...old] : [item];
            });
        },
    });

    return (
        <Paper sx={{padding: 2,border: "1.5px solid rgb(71, 128, 190)", borderRadius: 4, bgcolor: 'inherit', color: '#fff',width: '100%', mx: 'auto', mb: 2, maxWidth: 700}}>
        <form
            style={{ marginBottom: 20, display: "flex" }}
            onSubmit={(e) => {
                e.preventDefault();
                const content = inputRef.current?.value?.trim();
                if (content) {
                    add.mutate(content);
                    inputRef.current.value = '';
                }
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "flex-start", mr: 2 }}>
               {Auth && <Avatar sx={{ backgroundColor: "#3674B5", width: 40, height: 40 }}>
                    {Auth.name ? Auth.name[0] : Auth.username ? Auth.username[0] : '?'}
                </Avatar>}
            </Box>
            <TextField
                fullWidth
                multiline
                maxRows={4}
                variant="standard"
                placeholder="What's on your mind?"
                type="text"
                sx={{ 
                    flexGrow: 1,
                    '& .MuiOutlinedInput-root': {
                        pr: 1,
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.23)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                        },
                    },
                    '& .MuiInputBase-input': {
                        color: 'text.primary',
                        '&::placeholder': {
                            color: 'text.secondary',
                            opacity: 1,
                        },
                    },
                }}
                inputRef={inputRef}
                InputProps={{
                    endAdornment: (
                        <Tooltip title="Add post">
                        <IconButton 
                            type="submit"
                            color="primary"
                            sx={{ 
                                '&:hover': {
                                    backgroundColor: 'rgba(54, 116, 181, 0.1)',
                                },
                            }}
                        >
                            <PostAddIcon />
                        </IconButton>
                        </Tooltip>
                    ),
                }}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const form = e.target.closest('form');
                        if (form) form.requestSubmit();
                    }
                }}
            />
        </form>
        </Paper>
    );
}
