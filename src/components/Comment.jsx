import { Box, Typography, Avatar, IconButton, CircularProgress } from "@mui/material";
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
      "Authorization": `Bearer ${token}`
    }
  });

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
    onSuccess: async (data) => {
      console.log('Comment deleted successfully:', data);
      setDeleteError(null);
      
      // Invalidate both the specific post and the posts list
      try {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["posts"] }),
          queryClient.invalidateQueries({ queryKey: ["posts", postId] })
        ]);
      } catch (error) {
        console.error("Error invalidating queries:", error);
      }
    },
    onError: (error) => {
      console.error("Error deleting comment:", error);
      setDeleteError(error.message || "Failed to delete comment. Please try again.");
    }
  });

  // Check if the current user is the comment owner
  const isCommentOwner = Auth && Auth.id === comment.user.id;
  
  // Check if the current user is the post owner
  let isPostOwner = false;
  
  // Use the explicit postOwner field if available
  if (comment.postOwner && Auth) {
    isPostOwner = Auth.id === comment.postOwner;
    console.log('Post owner check using postOwner field:', { 
      authId: Auth.id, 
      postOwnerId: comment.postOwner, 
      isMatch: Auth.id === comment.postOwner 
    });
  }
  // Fallback: try to get the post from the comment data if it's available
  else if (comment.post) {
    isPostOwner = Auth && Auth.id === comment.post.userId;
    console.log('Post owner check using post.userId:', { 
      authId: Auth?.id, 
      postUserId: comment.post.userId, 
      isMatch: Auth?.id === comment.post.userId 
    });
  } 
  // Last resort: try to get it from the query cache
  else if (Auth) {
    const postData = queryClient.getQueryData(["posts", postId]);
    
    if (postData) {
      // Handle both post list and single post detail structures
      const post = postData.post || postData;
      if (post && post.user) {
        isPostOwner = Auth.id === post.user.id;
        console.log('Post owner check using cache data:', { 
          authId: Auth.id, 
          postUserId: post.user.id, 
          isMatch: Auth.id === post.user.id 
        });
      }
    }
  }
  
  // Debug logging
  console.log('Comment permission check:', {
    commentId: comment.id,
    isCommentOwner,
    isPostOwner,
    canDelete: isCommentOwner || isPostOwner
  });
  
  const canDelete = isCommentOwner || isPostOwner;
  
  return (
    <Box sx={{ display: "flex", mb: 2, pl: 2 }}>
      <Avatar
        sx={{
          width: 24,
          height: 24,
          background: blue[500],
          mr: 1
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
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: "center" }}>
              <IconButton 
                size="small" 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this comment?')) {
                    remove.mutate(comment.id);
                  }
                }}
                sx={{ p: 0 }}
                disabled={remove.isLoading}
              >
                <DeleteIcon sx={{ 
                  fontSize: 16, 
                  color: remove.isLoading ? 'grey.500' : 'red' 
                }} />
              </IconButton>
              {remove.isLoading && (
                <CircularProgress size={16} sx={{ ml: 1 }} />
              )}
            </Box>
          )}
          {deleteError && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
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