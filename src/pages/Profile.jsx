import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, CircularProgress, Box, Avatar, Typography, Container, Paper, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router";
import Item from "../components/Item";
import { useApp } from "../AppProvider";
import Form from "../components/Form";

const api = "http://localhost:8080";

const followUser = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required");
    const res = await fetch(`${api}/users/${userId}/follow`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to follow: ${res.status} ${errorText}`);
    }
    return res.json();
};

const unfollowUser = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required");
    const res = await fetch(`${api}/users/${userId}/follow`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to unfollow: ${res.status} ${errorText}`);
    }
    return res.json();
};


const fetchUser = async (userId) => {
    console.log("Fetching user with ID:", userId);
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication required");
    }

    try {
        const res = await fetch(`${api}/profile/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        console.log("Profile API response status:", res.status);

        if (!res.ok) {
            if (res.status === 401) {
                throw new Error("Authentication required");
            }
            const errorText = await res.text();
            console.error("API error response:", errorText);
            throw new Error(`Failed to fetch user: ${res.status} ${errorText}`);
        }

        const data = await res.json();
        console.log("Profile API response data:", data);
        return data;
    } catch (error) {
        console.error("Error in fetchUser:", error);
        throw error;
    }
};

export default function Profile() {

    const { Auth, showForm, theme } = useApp();
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();

    const { data, error, isLoading, isError } = useQuery({
        queryKey: ["post", id],
        queryFn: () => {
            if (!id) {
                throw new Error("User ID is required");
            }
            return fetchUser(id);
        },
        enabled: !!id, // Only run query if id exists
    });

    
    const followMutation = useMutation({
        mutationFn: () => followUser(user.id),
        onMutate: async () => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['post', id] });
            
            // Snapshot the previous value
            const previousData = queryClient.getQueryData(['post', id]);
            
            // Optimistically update the cache
            queryClient.setQueryData(['post', id], (oldData) => ({
                ...oldData,
                followers: [...(oldData?.followers || []), { followerId: Auth.id }]
            }));
            
            // Return a context object with the snapshotted value
            return { previousData };
        },
        onError: (err, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousData) {
                queryClient.setQueryData(['post', id], context.previousData);
            }
        },
        onSettled: () => {
            // Always refetch after error or success to ensure server state is in sync
            queryClient.invalidateQueries({ queryKey: ['post', id] });
        }
    });
    
    const unfollowMutation = useMutation({
        mutationFn: () => unfollowUser(user.id),
        onMutate: async () => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['post', id] });
            
            // Snapshot the previous value
            const previousData = queryClient.getQueryData(['post', id]);
            
            // Optimistically update the cache
            queryClient.setQueryData(['post', id], (oldData) => ({
                ...oldData,
                followers: (oldData?.followers || []).filter(f => f.followerId !== Auth.id)
            }));
            
            // Return a context object with the snapshotted value
            return { previousData };
        },
        onError: (err, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousData) {
                queryClient.setQueryData(['post', id], context.previousData);
            }
        },
        onSettled: () => {
            // Always refetch after error or success to ensure server state is in sync
            queryClient.invalidateQueries({ queryKey: ['post', id] });
        }
    });

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!id) {
        return (
            <Box>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography>User ID is missing. Please go back to the home page.</Typography>
                </Alert>
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={() => navigate('/')}>
                        Back to Home
                    </Button>
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography>
                        Error loading user: {error.message}
                    </Typography>
                </Alert>
            </Box>
        );
    }

    // Handle both data structures - either data.user or data itself is the user object
    const user = data.user || data;

    return (
        <Container maxWidth="xl" disableGutters sx={{
            paddingTop: '70px', // Add padding to account for the header bar
            display: 'flex',
            width: '100%',
            minHeight: '100vh',
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', md: 'row' }, // Row on md and up, column on smaller screens
            gap: { xs: 2, md: 3 },
        }}>
            {/* Profile Card - Left Side */}
            <Paper 
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: { xs: 3, sm: 3, md: 3 },
                    gap: 2,
                    width: { xs: '100%', md: '320px', lg: '400px' },
                    maxWidth: { xs: '100%', md: '320px', lg: '400px' },
                    borderRadius: "10px",
                    boxSizing: 'border-box',
                    flexShrink: 0, // Prevent the card from shrinking
                    alignSelf: 'flex-start', // Align to the top
                    position: { xs: 'static', md: 'sticky' }, // Sticky on desktop
                    top: { md: '100px' }, // Increase this value to prevent overlap with header
                    zIndex: 1,
                }}
            >
                <Avatar
                    sx={{
                        backgroundColor: "rgba(62, 144, 186, 0.73)",
                        width: { xs: 80, sm: 100, md: 120 },
                        height: { xs: 80, sm: 100, md: 120 },
                        mb: 2,
                    }}
                >
                    {user.name?.[0] || user.username?.[0]}
                </Avatar>
                
                <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center" }}>
                    {user.name || user.username}
                </Typography>
                
                {/* Stats: posts, followers, following */}
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: { xs: 2, sm: 3, md: 4 },
                    width: '100%',
                    mt: 1,
                }}>
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                            {user.posts?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            posts
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                            {user.followers?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            followers
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                            {user.following?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            following
                        </Typography>
                    </Box>
                </Box>
                
                {/* Profile action buttons */}
                {user.id === Auth?.id && (
                    <Button 
                        variant="contained" 
                        color="primary" 
                        sx={{ 
                            width: '100%', 
                            mt: 2,
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        Edit Profile
                    </Button>
                )}
                
                {user.id !== Auth?.id && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                        {user.followers?.some(f => f.followerId === Auth?.id) ? (
                            <Button
                                variant="outlined"
                                color="primary"
                                sx={{
                                    width: '100%',
                                    textTransform: 'none',
                                    fontWeight: 'bold'
                                }}
                                disabled={unfollowMutation.isLoading}
                                onClick={() => unfollowMutation.mutate(user.id)}
                            >
                                {unfollowMutation.isLoading ? 'Unfollowing...' : 'Unfollow'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{
                                    width: '100%',
                                    textTransform: 'none',
                                    fontWeight: 'bold'
                                }}
                                disabled={followMutation.isLoading}
                                onClick={() => followMutation.mutate(user.id)}
                            >
                                {followMutation.isLoading ? 'Following...' : 'Follow'}
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            color="primary"
                            sx={{
                                width: '100%',
                                mt: 1,
                                textTransform: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            Message
                        </Button>
                    </Box>
                )}
                
                {/* Bio section in profile card */}
                <Box sx={{ width: '100%', mt: 3 }}>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        Bio
                    </Typography>
                    {user.bio ? (
                        <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                            {user.bio}
                        </Typography>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                            No bio available
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* Main Content - Right Side */}
            <Box sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
            }}>
                {/* About Section */}
                <Paper sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: '10px',
                    width: '100%',
                    boxSizing: 'border-box',
                }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, borderBottom: '1px solid rgba(202, 207, 209, 0.4)', pb: 1 }}>
                        About
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '100px', color: "text.secondary" }}>
                                Lives in:
                            </Typography>
                            <Typography variant="body2">
                                {user.location || 'Not specified'}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '100px', color: "text.secondary" }}>
                                From:
                            </Typography>
                            <Typography variant="body2">
                                {user.from || 'Not specified'}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '100px', color: "text.secondary" }}>
                                Relationship:
                            </Typography>
                            <Typography variant="body2">
                                {user.relationshipStatus || 'Not specified'}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
                
                {/* Posts Section */}
                <Paper sx={{
                    p: 3,
                    borderRadius: '10px',
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: theme => theme.palette.mode === "dark" ? "#121212" : "#f5f5f5",
                }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, borderBottom: '1px solid rgba(202, 207, 209, 0.4)', pb: 1 }}>
                        Posts
                    </Typography>
                    
                    {Auth?.id === user.id && showForm && (
                        <Box sx={{ mb: 3 }}>
                            <Form />
                        </Box>
                    )}
                    
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        {user.posts && user.posts.length > 0 ? (
                            user.posts.map(post => (
                                <Box key={post.id} sx={{ width: '100%', mb: 2 }}>
                                    <Item post={post} variant="profile" />
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No posts yet
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
