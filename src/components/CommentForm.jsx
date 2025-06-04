import { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "../AppProvider";

const api = "http://localhost:8080";

async function postComment(data) {
    const { postId, content } = data;
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication required");
    }

    const res = await fetch(`${api}/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Failed to post comment");
    }

    return res.json();
}

export default function CommentForm({ postId }) {
    // Ensure postId is a number
    postId = Number(postId);
    const [content, setContent] = useState("");
    const queryClient = useQueryClient();
    const { Auth } = useApp();

    const add = useMutation({
        mutationFn: postComment,
        onMutate: async (newComment) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["posts"] });
            await queryClient.cancelQueries({ queryKey: ["post", postId] });

            // Snapshot the previous value
            const previousPosts = queryClient.getQueryData(["posts"]);
            const previousPost = queryClient.getQueryData(["post", postId]);

            // Create optimistic comment
            const optimisticComment = {
                id: Date.now(), // temporary ID
                content: newComment.content,
                created: new Date().toISOString(),
                user: Auth,
                postId: postId,
            };

            // Optimistically update the posts list
            if (previousPosts?.posts) {
                const updatedPosts = {
                    ...previousPosts,
                    posts: previousPosts.posts.map((p) => {
                        if (p.id === postId) {
                            return {
                                ...p,
                                comments: [
                                    optimisticComment,
                                    ...(p.comments || []),
                                ],
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
                        comments: [
                            optimisticComment,
                            ...(previousPost.post.comments || []),
                        ],
                    },
                };
                queryClient.setQueryData(["post", postId], updatedPost);
            }

            return { previousPosts, previousPost };
        },
        onError: (err, newComment, context) => {
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
                            return data;
                        }
                        return p;
                    }),
                };
            });

            queryClient.setQueryData(["post", postId], (old) => {
                if (!old?.post) return old;
                return {
                    ...old,
                    post: data,
                };
            });
            
            // Ensure data is refreshed from server
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
            queryClient.refetchQueries({ queryKey: ["post", postId] });
        },
        onSettled: () => {
            setContent("");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (content.trim()) {
            add.mutate({ postId, content });
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
                fullWidth
                size="small"
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{ mb: 1 }}
            />
            <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={!content.trim() || add.isPending}
            >
                {add.isPending ? "Posting..." : "Post Comment"}
            </Button>
        </Box>
    );
}
