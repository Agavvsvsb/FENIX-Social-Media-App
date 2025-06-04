import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Item from "../components/Item.jsx";
import Form from "../components/Form";
import { useApp } from "../AppProvider";
import { useNavigate } from "react-router";
import {
    Alert,
    Snackbar,
    CircularProgress,
    Box,
    Typography,
} from "@mui/material"; // Added CircularProgress and Box

const api = "http://localhost:8080/posts";

async function fetchPosts() {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication required");
    }

    const res = await fetch(api, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
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

// Remove the deletePost function

export default function Home() {
    const { data, error, isLoading, isError } = useQuery({
        queryKey: ["posts"],
        queryFn: fetchPosts,
    });
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { showForm, setAuth, Auth, isAuthLoading } = useApp();

    const [alertOpen, setAlertOpen] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState("");
    const [alertSeverity, setAlertSeverity] = React.useState("error");

    // Remove the remove useMutation

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
            if (
                error.message === "Authentication required" ||
                error.message === "Failed to fetch posts"
            ) {
                setAlertMessage(
                    "Your session has expired. Please login again."
                );
                localStorage.removeItem("token");
                setAuth(null);
                // Show alert before redirecting
                setAlertOpen(true);
                // Redirect after a short delay
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setAlertMessage(
                    error.message || "An error occurred while fetching posts"
                );
                setAlertOpen(true);
            }
        }
    }, [isError, error, navigate, setAuth]);

    // Show loading state while authenticating
    if (isAuthLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!Auth) {
        return (
            <>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '100vh', fontWeight: '500'}}>Authentication required</Box>
                <Snackbar
                    open={alertOpen}
                    autoHideDuration={6000}
                    onClose={handleAlertClose}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert
                        onClose={handleAlertClose}
                        severity={alertSeverity}
                        sx={{ width: "100%" }}
                    >
                        {alertMessage}
                    </Alert>
                </Snackbar>
            </>
        );
    }

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 5,
                }}
            >
                <Typography>Loading, please wait...</Typography>
                <CircularProgress sx={{ mt: 2 }} />
            </Box>
        );
    }

    if (!data && !isError) {
        return <div style={{ fontWeight: "bold" }}>No data available</div>;
    }

    return (
        <>
            {showForm && <Form />}

            {!isError &&
                data &&
                data.map((post) => {
                    return <Item key={post.id} post={post} />;
                })}

            {/* Alert component */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleAlertClose}
                    severity={alertSeverity}
                    sx={{ width: "100%" }}
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
