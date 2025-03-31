import { useState } from "react";
import Header from "./components/Header.jsx";
import Item from "./components/Item.jsx";
import Form from "./components/Form.jsx";
// you can add .jsx or not

import { Container } from "@mui/material";
import { useApp } from "./AppProvider.jsx";
import AppDrawer from "./components/AppDrawer.jsx";

export default function App() {
    const { showForm } = useApp();
    const [posts, setPosts] = useState([
        { id: 1, content: "Some content", user: "Alice" },
        { id: 2, content: "More content", user: "John Doe" },
        { id: 3, content: "Another content", user: "Eimg" },
    ]);

    const remove = (id) => {
        setPosts(posts.filter((post) => post.id != id));
    };

    const add = (content) => {
        const id = posts[posts.length - 1].id + 1;
        setPosts([{ id, content, user: "John Doe" }, ...posts]);
    };

    return (
        <div>
            <Header />
            <AppDrawer />
            <Container sx={{ mt: 4, pt: 8 }} maxWidth="md">
                {showForm && <Form add={add} />}
                {posts.map(
                    (
                        post //we use (<Item...) especially () because we want to write this without return. When we down to next line we must use return so instead we use () to put it in one line even you go down to another line.
                    ) => (
                        <Item key={post.id} post={post} remove={remove} />
                    )
                )}
            </Container>
        </div>
    );
}
