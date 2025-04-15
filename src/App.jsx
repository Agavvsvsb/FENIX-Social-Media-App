import Header from "./components/Header.jsx";
// you can add .jsx or not

import { Container } from "@mui/material";
import AppDrawer from "./components/AppDrawer.jsx";

import { Outlet } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <div>
                <Header />
                <AppDrawer />
                <Container sx={{ mt: 4, pt: 8 }} maxWidth="md">
                    <Outlet />
                </Container>
            </div>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
