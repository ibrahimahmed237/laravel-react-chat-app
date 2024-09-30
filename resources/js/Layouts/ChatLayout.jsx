import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import TextInput from "@/Components/TextInput";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const { conversations, selectedConversation } = page.props;

    console.log("conversations", conversations);
    console.log("selectedConversation", selectedConversation);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversation, setSortedConversation] = useState([]);

    const onSearch = (ev) => {
        const value = ev.target.value.toLowerCase();
        sortedConversation(
            conversations.filter((conversation) =>
                conversation.name.toLowerCase().includes(value)
            )
        );
    };
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
            <div className="flex1- w-full flex overflow-hidden">
                <div
                    className={`transition-all w-full sm:w-[220px] md:w-[300px] bg-slate-800
                    flex flex-col overflow-hidden ${
                        selectedConversation ? "-ml-[100%] sm-ml-0" : ""
                    }
                    `}
                >
                    <div
                        className="flex items-center justify-between py-2 px-3 text-xl
                        font-medium"
                    >
                        My Chats
                        <div
                            className="tooltip tooltip-left"
                            data-tooltip="Create New Group"
                        >
                            <button className="text-gray-400 hover:text-gray-200">
                                <PencilSquareIcon className="w-4 h-4 inline-block ml-2" />
                            </button>
                        </div>
                    </div>
                    <div className="p-3">
                        <TextInput
                            placeholder="Filter users and groups"
                            className="w-full"
                            onKeyUP={onSearch}
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {sortedConversation &&
                            sortedConversation.map((conversation) => (
                                <ConversationItem
                                    key={`${
                                        conversation.is_group
                                            ? "group_"
                                            : "user_"
                                    }${conversation.id}`}
                                    conversation={conversation}
                                    online={!!isUserOnline(conversation.id)}
                                    selectedConversation={selectedConversation}
                                />
                            ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    {children}
                </div>
            </div>
        </>
    );
};

export default ChatLayout;
