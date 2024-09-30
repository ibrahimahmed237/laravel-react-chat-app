const UserAvatar = ({ user, online = null, profile = false }) => {
    const onlineClass =
        online === true ? "online" : online === false ? "offline" : "";
    const sizeClass = profile ? "w-40" : "w-8";

    return (
        <>
            {user.avatar_url && (
                <div className={`chat-image avatar ${onlineClass}`}>
                    <div className={`rounded-full ${sizeClass}`}>
                        <img src={user.avatar_url} alt={user.name} />
                    </div>
                </div>
            )}

            {!user.avatar_url && (
                <div className={`chat-image placeholder ${onlineClass}`}>
                    <div
                        className={`bg-gray-400 text-gray-800 rounded-full ${sizeClass}`}
                    >
                        <span className="text-xl">
                            {user.name.substring(0, 1).toUpperCase()}
                        </span>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserAvatar;
