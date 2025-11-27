"use client";

import { useState, useEffect } from "react";
import { Button } from "@whop/react/components";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: {
    name: string;
    email: string;
  };
}

interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: Message | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: selectedConversation,
          content: newMessage,
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage("");
        fetchConversations(); // Refresh conversations to update last message
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <div
                  key={conv.userId}
                  onClick={() => setSelectedConversation(conv.userId)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conv.userId ? "bg-blue-50 border-r-2 border-r-blue-600" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {conv.userName || conv.userEmail}
                    </h3>
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-xs text-gray-600 truncate">
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>
              ))}

              {conversations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start a conversation by applying to deals</p>
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Messages Header */}
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {conversations.find(c => c.userId === selectedConversation)?.userName ||
                     conversations.find(c => c.userId === selectedConversation)?.userEmail}
                  </h2>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === "current-user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === "current-user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === "current-user" ? "text-blue-200" : "text-gray-500"
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      variant="classic"
                      size="3"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">Select a conversation</p>
                  <p className="text-sm">Choose someone to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}