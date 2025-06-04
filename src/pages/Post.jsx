import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import InsertCommentIcon from '@mui/icons-material/InsertComment';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';


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
const postId = Number(id);
  const { Auth } = useApp();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(true);
  const [optimisticLiked, setOptimisticLiked] = useState(false);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(null);
  



  const { data, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
    enabled: !!postId && !!Auth,
  });


  useEffect(() => {
    if (data?.post) {
      const userLiked = data.post.likes.some(like => like.userId === Auth?.id);
      setOptimisticLiked(userLiked);
    }
  }, [data?.post, Auth?.id]);


  const { mutate: like } = useMutation({
    mutationFn: async (mutationPostId) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to like post");
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      // Also cancel any pending refetches to the posts list
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      
      const previousPost = queryClient.getQueryData(["post", postId]);
      const currentLikes = previousPost?.post?.likes?.length || 0;
      const isLiked = previousPost?.post?.likes?.some(like => like.userId === Auth?.id);
      
      // Only update if not already liked
      if (!isLiked) {
        setOptimisticLikeCount(currentLikes + 1);
      }
      setOptimisticLiked(true);
      
      // Update the posts list optimistically as well
      const previousPosts = queryClient.getQueryData(["posts"]);
      if (previousPosts?.posts) {
        const updatedPosts = {
          ...previousPosts,
          posts: previousPosts.posts.map(p => {
            if (p.id === postId) {
              // Create a new likes array with the current user's like
              const updatedLikes = [...(p.likes || [])];
              if (!updatedLikes.some(like => like.userId === Auth?.id)) {
                updatedLikes.push({ userId: Auth?.id });
              }
              return { ...p, likes: updatedLikes };
            }
            return p;
          })
        };
        queryClient.setQueryData(["posts"], updatedPosts);
      }
      
      return { previousPost, previousPosts };
    },
    onError: ( context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      setOptimisticLiked(false);
      setOptimisticLikeCount(prev => Math.max(0, prev - 1));
    },
    onSettled: () => {
      // First invalidate the specific post query
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      // Force immediate refetch of the posts list to update UI faster
      queryClient.refetchQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: unlike } = useMutation({
    mutationFn: async (postId) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${api}/posts/${postId}/like`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to unlike post");
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      // Also cancel any pending refetches to the posts list
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      
      const previousPost = queryClient.getQueryData(["post", postId]);
      const currentLikes = previousPost?.post?.likes?.length || 0;
      const wasLiked = previousPost?.post?.likes?.some(like => like.userId === Auth?.id);

      if (wasLiked) {
        setOptimisticLikeCount(Math.max(0, currentLikes - 1));
      }
      setOptimisticLiked(false);
      
      // Update the posts list optimistically as well
      const previousPosts = queryClient.getQueryData(["posts"]);
      if (previousPosts?.posts) {
        const updatedPosts = {
          ...previousPosts,
          posts: previousPosts.posts.map(p => {
            if (p.id === postId) {
              // Remove the current user's like
              const updatedLikes = (p.likes || []).filter(like => like.userId !== Auth?.id);
              return { ...p, likes: updatedLikes };
            }
            return p;
          })
        };
        queryClient.setQueryData(["posts"], updatedPosts);
      }
      
      return { previousPost, previousPosts };
    },
    onError: ( context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      setOptimisticLiked(true);
      setOptimisticLikeCount(prev => prev + 1);
    },
    onSettled: () => {
      // First invalidate the specific post query
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      // Force immediate refetch of the posts list to update UI faster
      queryClient.refetchQueries({ queryKey: ["posts"] });
    },
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
  const isLiked = optimisticLiked || post.likes?.some(like => like.userId === Auth?.id);
  
  return (
    <Card sx={{ mb: 3, mt: 2, maxWidth: "1000px", mx: "auto"}}>
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
                <InsertCommentIcon fontSize="small"/>
              </IconButton>
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {post.comments?.length || 0}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton size="small" sx={{ mr: -0.5 }} onClick={() => isLiked ? unlike(postId) : like(postId)}>
                {isLiked ? (
                  <ThumbUpIcon fontSize="small" color="primary"/>
                ) : (
                  <ThumbUpAltOutlined fontSize="small"/>
                )}
              </IconButton>
              <Typography variant="body2" sx={{ ml: 0.5 }}>
              {optimisticLikeCount !== null ? optimisticLikeCount : post.likes?.length || 0}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {showComments && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <CommentForm postId={postId} />
            <Box sx={{ mt: 2 }}>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map(comment => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    postId={postId}
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
