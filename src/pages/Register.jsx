import { Box, Typography, OutlinedInput, Button } from "@mui/material";
import { useNavigate } from "react-router";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

async function postUser(userdata) {
    const res = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userdata),
    });
    if (!res.ok) {
        throw new Error("Failed to register");
    }
    return res.json();
}

export default function Register() {

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const create = useMutation({
        mutationFn: postUser,
        onSuccess: () => {
            navigate("/login");
        },
    });

    const submitRegister = userdata => {
        create.mutate(userdata);
    };

    return (
        <Box sx={{maxWidth: "800px", mx: "auto"}}>
            <Typography variant="h4">Register</Typography>

            <form onSubmit={handleSubmit(submitRegister)}>
                <OutlinedInput
                    {...register("name", { required: true })}
                    fullWidth
                    placeholder="name"
                    sx={{ mt: 4 }}
                />
                {errors.name && (
                    <Typography color="error">Name is required</Typography>
                )}

                <OutlinedInput
                    {...register("username", { required: true })}
                    fullWidth
                    placeholder="username"
                    sx={{ mt: 4 }}
                />
                {errors.username && (
                    <Typography color="error">Username is required</Typography>
                )}
                <OutlinedInput
                    {...register("bio")}
                    fullWidth
                    placeholder="tell us about your sis and her ph (Optional)"
                    sx={{ mt: 4 }}
                />

                <OutlinedInput
                    {...register("password", { required: true })}
                    fullWidth
                    placeholder="password"
                    sx={{ mt: 4 }}
                />
                {errors.password && (
                    <Typography color="error">Password is required</Typography>
                )}

                <Button
                    sx={{ mt: 4 }}
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={create.isPending}
                >
                    {create.isPending ? "Registering..." : "Register"}
                </Button>
            </form>
        </Box>
    );
}
