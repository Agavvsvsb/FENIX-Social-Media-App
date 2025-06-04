import {
    Box,
    Typography,
    Avatar,
    IconButton,
    CircularProgress,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { blue } from "@mui/material/colors";
import { useApp } from "../AppProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const api = "http://localhost:8080";

async function deleteComment(commentId) {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication required");
    }

    const res = await fetch(`${api}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const { id } = useParams();
    const postId = Number(id);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Failed to delete comment");
    }

    return res.json();
}

export default function Comment({ comment, postId }) {
 
    const { Auth } = useApp();
    const queryClient = useQueryClient();
    const [deleteError, setDeleteError] = useState(null);

    const remove = useMutation({
        mutationFn: deleteComment,
        onMutate: async (commentId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["posts"] });
            await queryClient.cancelQueries({ queryKey: ["post", postId] });

            // Snapshot the previous value
            const previousPosts = queryClient.getQueryData(["posts"]);
            const previousPost = queryClient.getQueryData(["post", postId]);

            // Optimistically update the posts list
            if (previousPosts?.posts) {
                const updatedPosts = {
                    ...previousPosts,
                    posts: previousPosts.posts.map((p) => {
                        if (p.id === postId) {
                            return {
                                ...p,
                                comments: (p.comments || []).filter(
                                    (c) => c.id !== commentId
                                ),
                            };
                        }
                        return p;
                    }),
                };
                queryClient.setQueryData(["posts"], updatedPosts);
            }

            // Optimistically update the single post view
            if (previousPost?.post) {
                const updatedPost = {
                    ...previousPost,
                    post: {
                        ...previousPost.post,
                        comments: (previousPost.post.comments || []).filter(
                            (c) => c.id !== commentId
                        ),
                    },
                };
                queryClient.setQueryData(["post", postId], updatedPost);
            }

            return { previousPosts, previousPost };
        },
        onError: (error, commentId, context) => {
            setDeleteError(
                error.message || "Failed to delete comment. Please try again."
            );

            // Rollback on error
            if (context?.previousPosts) {
                queryClient.setQueryData(["posts"], context.previousPosts);
            }
            if (context?.previousPost) {
                queryClient.setQueryData(
                    ["post", postId],
                    context.previousPost
                );
            }
        },
        onSuccess: (data) => {
            // Update both queries with the server response
            queryClient.setQueryData(["posts"], (old) => {
                if (!old?.posts) return old;
                return {
                    ...old,
                    posts: old.posts.map((p) => {
                        if (p.id === postId) {
                            return {
                                ...p,
                                comments: (p.comments || []).filter(
                                    (c) => c.id !== data.comment.id
                                ),
                            };
                        }
                        return p;
                    }),
                };
            });

            queryClient.setQueryData(["post", postId], (old) => {
                if (!old?.post) return old;
                return {
                    ...old,
                    post: {
                        ...old.post,
                        comments: (old.post.comments || []).filter(
                            (c) => c.id !== data.comment.id
                        ),
                    },
                };
            });
        },
        onSettled: () => {
            // Refetch to ensure sync with server
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
            // Force immediate refetch to update UI
            queryClient.refetchQueries({ queryKey: ["post", postId] });
        },
    });

    // Check if the current user is the comment owner
    const isCommentOwner = Auth && Auth.id === comment.user.id;

    // Check if the current user is the post owner
    let isPostOwner = false;

    // Use the explicit postOwner field if available
    if (comment.postOwner && Auth) {
        isPostOwner = Auth.id === comment.postOwner;
    }
    // Fallback: try to get the post from the comment data if it's available
    else if (comment.post) {
        isPostOwner = Auth && Auth.id === comment.post.userId;
    }
    // Last resort: try to get it from the query cache
    else if (Auth) {
        const postData = queryClient.getQueryData(["post", postId]);

        if (postData) {
            // Handle both post list and single post detail structures
            const post = postData.post || postData;
            if (post && post.user) {
                isPostOwner = Auth.id === post.user.id;
            }
        }
    }

    const canDelete = isCommentOwner || isPostOwner;

    return (
        <Box sx={{ display: "flex", mb: 2, pl: 2 }}>
            <Avatar
                sx={{
                    width: 24,
                    height: 24,
                    background: blue[500],
                    mr: 1,
                }}
            >
                {comment.user.name?.[0] || comment.user.username?.[0]}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        {comment.user.name || comment.user.username}
                    </Typography>
                    {canDelete && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "center",
                            }}
                        >
                            <IconButton
                                size="small"
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            "Are you sure you want to delete this comment?"
                                        )
                                    ) {
                                        remove.mutate(comment.id);
                                    }
                                }}
                                sx={{ p: 0 }}
                                disabled={remove.isLoading}
                            >
                                <DeleteIcon
                                    sx={{
                                        fontSize: 16,
                                        color: remove.isLoading
                                            ? "grey.500"
                                            : "red",
                                    }}
                                />
                            </IconButton>
                            {remove.isLoading && (
                                <CircularProgress size={16} sx={{ ml: 1 }} />
                            )}
                        </Box>
                    )}
                    {deleteError && (
                        <Typography
                            variant="caption"
                            color="error"
                            sx={{ display: "block", mt: 1 }}
                        >
                            {deleteError}
                        </Typography>
                    )}
                </Box>
                <Typography variant="body2">{comment.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {new Date(comment.created).toLocaleString()}
                </Typography>
            </Box>
        </Box>
    );
}
