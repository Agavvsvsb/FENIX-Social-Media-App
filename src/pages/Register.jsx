import { Box, Typography, OutlinedInput, Button } from "@mui/material";

import { useApp } from "../AppProvider";
import { useNavigate } from "react-router";

import { useForm } from "react-hook-form";

export default function Login() {
    const { setAuth } = useApp();

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const Register = () => {
        navigate("/login");
    };

    return (
        <Box>
            <Typography variant="h4">Register</Typography>

            <form onSubmit={handleSubmit(Register)}>
                <OutlinedInput
                    {...register("name", { required: true })}
                    fullWidth
                    placeholder="name"
                    sx={{ mt: 2 }}
                />
                {errors.name && (
                    <Typography color="error">Name is required</Typography>
                )}

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
                    {...register("bio")}
                    fullWidth
                    placeholder="tell us about your sis and her ph (Optional)"
                    sx={{ mt: 2 }}
                />

                <OutlinedInput
                    {...register("password", { required: true })}
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
                >
                    Login
                </Button>
            </form>
        </Box>
    );
}
