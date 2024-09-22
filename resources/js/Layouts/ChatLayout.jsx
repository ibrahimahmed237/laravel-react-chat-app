import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import PropTypes from "prop-types";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const { conversations, selectedConversation } = page.props;

    console.log("conversations", conversations);
    console.log("selectedConversation", selectedConversation);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversation, setSortedConversation] = useState([]);

    const isUserOnline = (userId) => {
        return onlineUsers[userId] ? true : false;
    };
    const sortConversations = (conversations) => {
        return [...conversations].sort((a, b) => {
            if (a.blocked_at && b.blocked_at)
                return new Date(b.blocked_at) - new Date(a.blocked_at);
            else if (a.blocked_at) return 1;
            else if (b.blocked_at) return -1;

            if (a.last_message_date && b.last_message_date)
                return (
                    new Date(b.last_message_date) -
                    new Date(a.last_message_date)
                );
            else if (a.last_message_date) return -1;
            else if (b.last_message_date) return 1;
            return 0;
        });
    };

    // Use in useEffect
    useEffect(() => {
        setSortedConversation(sortConversations(localConversations));
    }, [localConversations]);

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

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
            ChatLayout
            <div>{children}</div>
        </>
    );
};

export default ChatLayout;
