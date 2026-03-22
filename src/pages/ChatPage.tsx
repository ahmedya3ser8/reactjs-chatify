import { useAuthStore } from "../store/useAuthStore";

const ChatPage = () => {
  const { logout } = useAuthStore();
  return (
    <div className="relative">
      <h1>ChatPage</h1>
      <button onClick={logout}>logout</button>
    </div>
  )
}

export default ChatPage;
