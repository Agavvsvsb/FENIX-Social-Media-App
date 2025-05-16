import { useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  Avatar, 
  IconButton,
  Divider,
  Alert
} from "@mui/material";
import { blue } from "@mui/material/colors";
import { useApp } from "../AppProvider";
import Comment from "../components/Comment";
import CommentForm from "../components/CommentForm";
import ThumbUpAltOutlined from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const api = "http://localhost:8080";

async function fetchPost(postId) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Authentication required");
  }
  
  const res = await fetch(`${api}/posts/${postId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Authentication required");
    }
    throw new Error("Failed to fetch post");
  }
  
  return res.json();
}

export default function Post() {
  const { id } = useParams();
  const { Auth } = useApp();
  const [showComments, setShowComments] = useState(true);
  
  const { data, error } = useQuery({
    queryKey: ["posts", id],
    queryFn: () => fetchPost(id),
    enabled: !!id && !!Auth,
  });


  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error.message || "An error occurred while fetching the post"}
      </Alert>
    );
  }

  if (!data || !data.post) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Post not found
      </Alert>
    );
  }

  const post = data.post;
  const isLiked = post.likes?.some(like => like.userId === Auth?.id);
  
  return (
    <Card sx={{ mb: 3, mt: 2 }}>
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
            <Typography sx={{ paddingTop: 0.5, fontWeight: "bold" }}>
              {post.user.name || post.user.username}
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ mt: 2 }}>{post.content}</Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Created at: {new Date(post.created).toLocaleString()}
          </Typography>
          
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                size="small" 
                sx={{ mr: -0.5 }}
                onClick={() => setShowComments(!showComments)}
              >
                <ChatBubbleOutlineIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {post.comments?.length || 0}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton size="small" sx={{ mr: -0.5 }}>
                {isLiked ? (
                  <ThumbUpIcon fontSize="small" color="primary" />
                ) : (
                  <ThumbUpAltOutlined fontSize="small" />
                )}
              </IconButton>
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {post.likes?.length || 0}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {showComments && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <CommentForm postId={post.id} />
            
            <Box sx={{ mt: 2 }}>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map(comment => (
                  <Comment 
                    key={comment.id} 
                    comment={comment} 
                    postId={post.id} 
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No comments yet. Be first to share your thoughts.
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}