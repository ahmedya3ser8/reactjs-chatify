import { useEffect } from "react";

import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";

import NoChatHistoryPlaceHolder from "./NoChatHistoryPlaceHolder";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

const ChatContainer = () => {
  const { selectedUser, getMessagesByUserId, messages, isMessagesLoading } = useChatStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    getMessagesByUserId(selectedUser?._id as string);
  }, [getMessagesByUserId, selectedUser])

  return (
    <>
      <ChatHeader />
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message._id} className={`chat ${message.senderId === authUser?._id ? 'chat-end' : 'chat-start'}`}>
                <div className={`chat-bubble relative ${message.senderId === authUser?._id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                  {message.image && <img src={message.image} alt="Shared" className="rounded-lg h-48 object-cover" />}
                  {message.text && <p className="mt-2"> {message.text} </p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(message.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : isMessagesLoading ? <MessagesLoadingSkeleton /> : <NoChatHistoryPlaceHolder fullName={selectedUser?.fullName as string} />}
      </div>
      <MessageInput />
    </>
  )
}

export default ChatContainer;
