import { useRef } from "react";

import { OutlinedInput, IconButton } from "@mui/material";

import { Add as AddIcon } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postPost(content) {
    const api = "http://localhost:8080/posts";
    const token = localStorage.getItem("token");
    
    if (!token) {
        throw new Error("Authentication required");
    }

    const res = await fetch(api, {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    return res.json();
}

export default function Form() {
    const inputRef = useRef();
    const queryClient = useQueryClient();

    const add = useMutation({
        mutationFn: postPost,
        onSuccess: (item) => {
            queryClient.invalidateQueries(["posts"], (old) => {
                return old ? [item, ...old] : [item];
            });
        },
    });

    return (
        <form
            style={{ marginBottom: 20, display: "flex" }}
            onSubmit={(e) => {
                e.preventDefault();
                const content = inputRef.current.value;
                content && add.mutate(content);
                e.currentTarget.reset();
            }}
        >
            <OutlinedInput
                type="text"
                style={{ flexGrow: 1 }}
                inputRef={inputRef}
                endAdornment={
                    //to put button in input use startAdornment or endAdornment.
                    <IconButton type="submit">
                        <AddIcon />
                    </IconButton>
                }
            />
        </form>
    );
}
