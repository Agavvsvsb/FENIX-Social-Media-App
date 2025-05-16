import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Item from "../components/Item";
import Form from "../components/Form";
import { useApp } from "../AppProvider";
import { useNavigate } from "react-router";
import { Alert, Snackbar, CircularProgress, Box } from "@mui/material"; // Added CircularProgress and Box

const api = "http://localhost:8080/posts";

async function fetchPosts() {
    const token = localStorage.getItem("token");
    
    if (!token) {
        throw new Error("Authentication required");
    }
    
    const res = await fetch(api, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    if (!res.ok) {
        if (res.status === 401) {
            throw new Error("Authentication required");
        }
        throw new Error("Failed to fetch posts");
    }
    
    const data = await res.json();
    console.log("API Response:", data);
    return data;
}

async function deletePost(id) {
    const token = localStorage.getItem("token");
    
    if (!token) {
        throw new Error("Authentication required");
    }
    
    const res = await fetch(`${api}/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    
    if (!res.ok) {
        
        const errorData = await res.json();
        throw new Error(errorData.msg || "Failed to delete post");
    }

    return res.json();
}

export default function Home() {
    const { data, error, isLoading, isError } = useQuery({
        queryKey: ["posts"],
        queryFn: fetchPosts,
    });
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { showForm, setAuth, Auth, isAuthLoading } = useApp();  // Get isAuthLoading
    
    
    const [alertOpen, setAlertOpen] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState("");
    const [alertSeverity, setAlertSeverity] = React.useState("error");

    const remove = useMutation({
        mutationFn: deletePost,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["posts"] });
            // Show success alert
            setAlertMessage("Post deleted successfully");
            setAlertSeverity("success");
            setAlertOpen(true);
        },
        onError: (error) => {
            // Show error alert
            setAlertMessage(error.message || "Failed to delete post");
            setAlertSeverity("error");
            setAlertOpen(true);
        }
    });

    // Handle alert close
    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    // Check for authentication status changes - only after auth loading is complete
    React.useEffect(() => {
        if (!isAuthLoading && !Auth) {
            setAlertMessage("Please login or register to use our service");
            setAlertSeverity("info");
            setAlertOpen(true);
            
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        }
    }, [Auth, navigate, isAuthLoading]);

    React.useEffect(() => {
        if (isError) {
            // Set alert message based on error type
            if (error.message === "Authentication required" || error.message === "Failed to fetch posts") {
                setAlertMessage("Your session has expired. Please login again.");
                localStorage.removeItem("token");
                setAuth(null);
                // Show alert before redirecting
                setAlertOpen(true);
                // Redirect after a short delay
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setAlertMessage(error.message || "An error occurred while fetching posts");
                setAlertOpen(true);
            }
        }
    }, [isError, error, navigate, setAuth]);

    // Show loading state while authenticating
    if (isAuthLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!Auth) {
        return (
            <>
                <div>Authentication required</div>
                <Snackbar 
                    open={alertOpen} 
                    autoHideDuration={6000} 
                    onClose={handleAlertClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={handleAlertClose} 
                        severity={alertSeverity}
                        sx={{ width: '100%' }}
                    >
                        {alertMessage}
                    </Alert>
                </Snackbar>
            </>
        );
    }

    if (isLoading) {
        return <div>Loading, please wait.....</div>;
    }

    if (!data && !isError) {
        return <div>No data available</div>;
    }

    return (
        <>
            {showForm && <Form />}

            {!isError && data && data.map((post) => {
                return (
                    <Item key={post.id} post={post} remove={remove.mutate} />
                );
            })}
            
            {/* Alert component */}
            <Snackbar 
                open={alertOpen} 
                autoHideDuration={6000} 
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleAlertClose} 
                    severity={alertSeverity}
                    sx={{ width: '100%' }}
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
