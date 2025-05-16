
import { Alert, Box, Typography, OutlinedInput, Button } from "@mui/material";

import { useApp } from "../AppProvider";
import { useNavigate } from "react-router";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

async function loginUser(userData) {
    const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });
    
    if (!res.ok) {
        throw new Error("User not found or incorrect password");
    }
    
    return res.json();
}

export default function Login() {
    const { setAuth } = useApp();

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const login = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            // Store the token in localStorage
            localStorage.setItem("token", data.token);
            // Set the user object in Auth state
            setAuth(data.user);
            navigate("/");
        },
    });

    const submit = (userData) => {
        login.mutate(userData);
    };

    return (
        <Box style={{ marginTop: 80}}>
            <Typography variant="h4">Login</Typography>

            {login.isError && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    {login.error.message}
                </Alert>
            )}

            <form onSubmit={handleSubmit(submit)}>
                <OutlinedInput
                    {...register("username", { required: true })}
                    fullWidth
                    placeholder="username"
                    sx={{ mt: 2 }}
                />
                {errors.username && (
                    <Typography color="error">Username is required</Typography>
                )}

                <OutlinedInput
                    {...register("password", { required: true })}
                    type="password"
                    fullWidth
                    placeholder="password"
                    sx={{ mt: 2 }}
                />
                {errors.password && (
                    <Typography color="error">Password is required</Typography>
                )}

                <Button
                    sx={{ mt: 2 }}
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={login.isPending}
                >
                    {login.isPending ? "Logging in..." : "Login"}
                </Button>
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Don't have an account?{" "}
                    <span
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={() => navigate("/register")}
                    >
                        Register here
                    </span>
                </Typography>
            </form>
        </Box>
    );
}
