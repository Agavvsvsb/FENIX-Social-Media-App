import {
    Card,
    CardContent,
    Box,
    IconButton,
    Typography,
    Avatar,
    Divider,
} from "@mui/material";

import { useApp } from "../AppProvider";

import { Delete as DeleteIcon } from "@mui/icons-material";
import InsertCommentIcon from "@mui/icons-material/InsertComment";
import { blue } from "@mui/material/colors";
import ThumbUpAltOutlined from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

const api = "http://localhost:8080";

const likePost = async (postId) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication required");
    }
    const res = await fetch(`${api}/posts/${postId}/like`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        throw new Error("Failed to like post");
    }
    return res.json();
};

const unlikePost = async (postId) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication required");
    }
    const res = await fetch(`${api}/posts/${postId}/like`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        throw new Error("Failed to unlike post");
    }
    return res.json();
};

async function deletePost(id) {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication required");
    }

    const res = await fetch(`${api}/posts/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        // Check content type before trying to parse as JSON
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            throw new Error(errorData.msg || "Failed to delete post");
        } else {
            throw new Error(
                `Failed to delete post: ${res.status} ${res.statusText}`
            );
        }
    }

    // Check content type before trying to parse as JSON
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    } else {
        return { success: true }; // Return a simple success object if not JSON
    }
}

export default function Item({ post }) {
    const { Auth } = useApp();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [optimisticLiked, setOptimisticLiked] = useState(null);
    const [optimisticLikeCount, setOptimisticLikeCount] = useState(
        post.likes?.length || 0
    );

    const serverIsLiked = post.likes?.some((like) => like.userId === Auth?.id);

    const isLiked = optimisticLiked !== null ? optimisticLiked : serverIsLiked;

    useEffect(() => {
        // Update local state when server data changes
        setOptimisticLiked(serverIsLiked);
        setOptimisticLikeCount(post.likes?.length || 0);
    }, [serverIsLiked, post.likes?.length]);

    const { mutate: like } = useMutation({
        mutationFn: likePost,

        onMutate: async () => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["posts"] });

            // Save previous state
            const previousPosts = queryClient.getQueryData(["posts"]);

            // Optimistically update local state
            setOptimisticLiked(true);
            setOptimisticLikeCount((prev) => prev + 1);

            // Also update the cache directly for immediate UI updates
            if (previousPosts?.posts) {
                const updatedPosts = {
                    ...previousPosts,
                    posts: previousPosts.posts.map((p) => {
                        if (p.id === post.id) {
                            // Add current user's like if not already present
                            const updatedLikes = [...(p.likes || [])];
                            if (
                                !updatedLikes.some(
                                    (like) => like.userId === Auth?.id
                                )
                            ) {
                                updatedLikes.push({ userId: Auth?.id });
                            }
                            return { ...p, likes: updatedLikes };
                        }
                        return p;
                    }),
                };
                queryClient.setQueryData(["posts"], updatedPosts);
            }

            // Return previous state for rollback if needed
            return { previousPosts };
        },
        onError: (err, context) => {
            // Revert optimistic update on error
            setOptimisticLiked(serverIsLiked);
            setOptimisticLikeCount(post.likes?.length || 0);

            // Restore previous cache state
            if (context?.previousPosts) {
                queryClient.setQueryData(["posts"], context.previousPosts);
            }

            console.error(err);
        },
        onSettled: () => {
            // Force immediate refetch to sync with server
            queryClient.refetchQueries({ queryKey: ["posts"] });

            // Also check if there's a specific post query to update
            queryClient.invalidateQueries({
                queryKey: ["posts", post.id.toString()],
            });
        },
    });

    const { mutate: unlike } = useMutation({
        mutationFn: unlikePost,
        // Optimistically update UI before server responds
        onMutate: async () => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["posts"] });

            // Save previous state
            const previousPosts = queryClient.getQueryData(["posts"]);

            // Optimistically update local state
            setOptimisticLiked(false);
            setOptimisticLikeCount((prev) => Math.max(0, prev - 1));

            // Also update the cache directly for immediate UI updates
            if (previousPosts?.posts) {
                const updatedPosts = {
                    ...previousPosts,
                    posts: previousPosts.posts.map((p) => {
                        if (p.id === post.id) {
                            // Remove current user's like
                            const updatedLikes = (p.likes || []).filter(
                                (like) => like.userId !== Auth?.id
                            );
                            return { ...p, likes: updatedLikes };
                        }
                        return p;
                    }),
                };
                queryClient.setQueryData(["posts"], updatedPosts);
            }

            return { previousPosts };
        },
        onError: (err, variables, context) => {
            // Revert optimistic update on error
            setOptimisticLiked(serverIsLiked);
            setOptimisticLikeCount(post.likes?.length || 0);

            // Restore previous cache state
            if (context?.previousPosts) {
                queryClient.setQueryData(["posts"], context.previousPosts);
            }

            console.error(err);
        },
        onSettled: () => {
            // Force immediate refetch to sync with server
            queryClient.refetchQueries({ queryKey: ["posts"] });

            // Also check if there's a specific post query to update
            queryClient.invalidateQueries({
                queryKey: ["posts", post.id.toString()],
            });
        },
    });

    const { mutate: remove } = useMutation({
        mutationFn: deletePost,
        onMutate: async () => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["posts"] });
            await queryClient.cancelQueries({
                queryKey: ["post", post.user.id.toString()],
            });

            // Save previous state
            const previousPosts = queryClient.getQueryData(["posts"]);
            const previousUserData = queryClient.getQueryData([
                "post",
                post.user.id.toString(),
            ]);

            // Optimistically update the posts list
            if (previousPosts?.posts) {
                const updatedPosts = {
                    ...previousPosts,
                    posts: previousPosts.posts.filter((p) => p.id !== post.id),
                };
                queryClient.setQueryData(["posts"], updatedPosts);
            }

            // Optimistically update the user profile data
            if (previousUserData) {
                const userData = previousUserData.user || previousUserData;
                if (userData.posts) {
                    const updatedUserData = {
                        ...previousUserData,
                        user: {
                            ...userData,
                            posts: userData.posts.filter(
                                (p) => p.id !== post.id
                            ),
                        },
                    };
                    queryClient.setQueryData(
                        ["post", post.user.id.toString()],
                        updatedUserData
                    );
                }
            }

            return { previousPosts, previousUserData };
        },
        onError: (err, context) => {
            if (context?.previousPosts) {
                queryClient.setQueryData(["posts"], context.previousPosts);
            }
            if (context?.previousUserData) {
                queryClient.setQueryData(
                    ["post", post.user.id.toString()],
                    context.previousUserData
                );
            }
            console.error("Error deleting post:", err);
        },
        onSuccess: async () => {
            // Still invalidate queries to ensure consistency with server
            await queryClient.invalidateQueries({ queryKey: ["posts"] });
            await queryClient.invalidateQueries({
                queryKey: ["post", post.user.id.toString()],
            });
        },
    });

    const handleLikeClick = () => {
        if (isLiked) {
            unlike(post.id);
        } else {
            like(post.id);
        }
    };

    return (
        <Card sx={{ mb: 3, maxWidth: 700, mx: "auto", height: "100%" }}>
            <CardContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                    }}
                >
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                background: blue[500],
                            }}
                        >
                            {post.user.name?.[0] || post.user.username?.[0]}
                        </Avatar>
                        <Typography
                            onClick={() => navigate(`/profile/${post.user.id}`)}
                            sx={{
                                paddingTop: 0.5,
                                fontWeight: "bold",
                                "&:hover": {
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    color: blue[600],
                                },
                            }}
                        >
                            {post.user.name || post.user.username}
                        </Typography>
                    </Box>
                    {Auth && Auth.id === post.user.id && (
                        <IconButton
                            size="medium"
                            onClick={() => remove(post.id)}
                        >
                            <DeleteIcon sx={{ fontSize: 22, color: "red" }} />
                        </IconButton>
                    )}
                </Box>

                <Typography sx={{ mt: 2 }}>{post.content}</Typography>

                <Divider sx={{ borderBottomWidth: "1px" }} />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "end",
                        alignItems: "center",
                        mt: 4,
                        gap: 2,
                        mb: 0,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                            size="small"
                            sx={{ mr: -0.5, mt: 0.4 }}
                            onClick={() => {
                                navigate(`/posts/${post.id}`);
                            }}
                        >
                            <InsertCommentIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {post.comments?.length || 0}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                            size="small"
                            sx={{ mr: -0.5 }}
                            onClick={handleLikeClick}
                        >
                            {isLiked ? (
                                <ThumbUpIcon
                                    fontSize="small"
                                    sx={{ color: blue[500] }}
                                />
                            ) : (
                                <ThumbUpAltOutlined fontSize="small" />
                            )}
                        </IconButton>
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {optimisticLikeCount}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
