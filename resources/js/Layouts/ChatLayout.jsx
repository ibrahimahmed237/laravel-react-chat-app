import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { s } from "vite/dist/node/types.d-aGj9QkWt";
const ChatLayout = ({ children }) => {
    const page = usePage();
    const { conversations, selectedConversation } = page.props;

    console.log("conversations", conversations);
    console.log("selectedConversation", selectedConversation);
    const [onlineUsers, setOnlineUsers] = useState({});

    const isUserOnline = (userId) => {
        return onlineUsers[userId] ? true : false;
    }
    useEffect(() => {
        Echo.join("online")
            .here((users) => {
                const onlineUsersOb = Object.fromEntries(
                    users.map((user) => [user.id, user])
                );
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = {
                        ...prevOnlineUsers,
                        ...onlineUsersOb,
                    };
                    return updatedUsers;
                });
                console.log("users", users);
            })
            .joining((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = {
                        ...prevOnlineUsers,
                        [user.id]: user,
                    };
                    return updatedUsers;
                });
                console.log("joining", user);
            })
            .leaving((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    delete updatedUsers[user.id];
                    return updatedUsers;
                });
                console.log("leaving", user);
            })
            .error((error) => {
                console.error(error);
            });

        return () => {
            Echo.leave("online");
        };
    }, []);
    return (
        <>
            {" "}
            ChatLayout
            <div>{children}</div>
        </>
    );
};

export default ChatLayout;
