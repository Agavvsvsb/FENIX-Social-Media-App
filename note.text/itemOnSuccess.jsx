import {
    Card,
    CardContent,
    Box,
    IconButton,
    Typography,
    Avatar,
    ButtonGroup,
    Button,
} from "@mui/material";

import { useApp } from "../AppProvider";

import { Delete as DeleteIcon } from "@mui/icons-material";
import { blue } from "@mui/material/colors";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ThumbUpAltOutlined from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const api = "http://localhost:8080";

const likePost = async (postId) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication required");
    }
    const res = await fetch(`${api}/posts/${postId}/like`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
    if (!res.ok) {
        throw new Error("Failed to like post");
    }
    return res.json();
}

const unlikePost = async (postId) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication required");
    }
    const res = await fetch(`${api}/posts/${postId}/like`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
    if (!res.ok) {
        throw new Error("Failed to unlike post");
    }
    return res.json();
}

export default function Item({ post, remove }) {
    const {Auth} = useApp();
    const queryClient = useQueryClient();

    const isLiked = post.likes?.some(like => like.userId === Auth?.id);

    const {mutate: like} = useMutation({
        mutationFn: likePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            console.error(error);
        }
    });

    const { mutate: unlike } = useMutation({
        mutationFn: unlikePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            console.error(error);
        }
    });

    const handleLikeClick = () => {
        if (isLiked) {
            unlike(post.id);
        } else {
            like(post.id);
        }
    };
    
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
                        >
                            {post.user.name?.[0] || post.user.username?.[0]}
                        </Avatar>
                        <Typography sx={{paddingTop: 0.5, fontWeight: "bold" }}>
                            {post.user.name || post.user.username}
                        </Typography>
                    </Box>
                    {Auth && Auth.id === post.user.id && <IconButton size="medium" onClick={() => remove(post.id)}>
                        <DeleteIcon sx={{ fontSize: 22, color: "red" }} />
                    </IconButton>}
                </Box>

                <Typography sx={{ mt: 2 }}>{post.content}</Typography>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "end",
                        alignItems: "center",
                        mt: 2,
                        gap: 2,
                    }}
                >
                   
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size="small" sx={{ mr: -0.5, mt: 0.4 }}>
                            <ChatBubbleOutlineIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                            5
                        </Typography>
                    </Box>

                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                            size="small" 
                            sx={{ mr: -0.5 }}
                            onClick={handleLikeClick}
                        >
                            {isLiked ? (
                                <ThumbUpIcon fontSize="small" sx={{ color: blue[500] }} />
                            ) : (
                                <ThumbUpAltOutlined fontSize="small" />
                            )}
                        </IconButton>
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {post.likes?.length || 0}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
