import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Item from "../components/Item";
import Form from "../components/Form";
import { useApp } from "../AppProvider";

const api = "http://localhost:8080/posts";

async function fetchPosts() {
    const res = await fetch(api);
    const data = await res.json();
    console.log("API Response:", data);
    return data;
}

async function deletePost(id) {
    const res = await fetch(`${api}/${id}`, {
        method: "DELETE",
    });

    return res.json();
}

export default function Home() {
    const { data, error, isLoading, isError } = useQuery({
        queryKey: ["posts"],
        queryFn: fetchPosts,
    });
    const queryClient = useQueryClient();

    const { showForm } = useApp();

    const remove = useMutation({
        mutationFn: deletePost,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });

    if (isError) {
        return <div>Error: {error.message}</div>;
    }

    if (isLoading) {
        return <div>Loading, please wait.....</div>;
    }

    if (!data) {
        return <div>No data available</div>;
    }

    return (
        <>
            {showForm && <Form />}

            {data.map((post) => {
                return (
                    <Item key={post.id} post={post} remove={remove.mutate} />
                );
            })}
        </>
    );
}
