import { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
      "Authorization": `Bearer ${token}`
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.msg || "Failed to post comment");
  }

  return res.json();
}

export default function CommentForm({ postId }) {
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: postComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", postId] });
      setContent("");
    },
    onError: (error) => {
      console.error("Error posting comment:", error);
    }
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