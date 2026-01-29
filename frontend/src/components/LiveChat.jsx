import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Lock, Users, Smile, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import '../styles/LiveChat.css';

const LiveChat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [recipientId, setRecipientId] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [showUserList, setShowUserList] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    const emojis = [
        '😊', '😂', '😃', '😄', '😁', '😅', '🤣', '😉', '😍', '😘', '😎', '🤔', '😴', '🥲', '😭', '😤', '😡', '🤯', '😇', '🤗', '🥳', '🤩', '😻',
        '👋', '👍', '👎', '🙏', '🙌', '🤝', '💪', '🫶', '✌️', '👌', '🤞', '🫡', '👏', '👐', '🤲',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💕', '💞', '💖', '💘', '💯',
        '💻', '🖥️', '⌨️', '🖱️', '📱', '📚', '📖', '🛠️', '⚙️', '🧠', '📊', '📈', '📉', '🧪', '🔬', '📌', '📍',
        '✅', '❌', '⚠️', '🚀', '🔥', '✨', '🌟', '🎯', '🏆', '🥇', '📣', '🔔', '🔒', '🔓', '💡',
        '🎉', '🎊', '🎈', '🎁', '🥂', '🍾', '🌈', '☕', '🍕', '🍔', '🍟', '🍩', '🍿',
        '💬', '🗨️', '📩', '📨', '📢', '📤', '📥',
        '😺', '🐱', '🐶', '🦄', '🌍', '🌙', '⭐', '⚡', '🧩', '🎵', '🎧', '📸'
    ];


    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const [historyRes, usersRes] = await Promise.all([
                    api.get('/chat/history'),
                    api.get('/chat/users')
                ]);
                setMessages(historyRes.data || []);
                setUsers(usersRes.data.filter(u => u.id !== user.id) || []);
            } catch (err) {
                console.error('Error fetching chat data:', err);
            }
        };
        fetchData();

        // WebSocket setup with robust host detection
        const apiUrl = import.meta.env.VITE_API_URL || '';
        let wsHost = window.location.host;
        
        if (apiUrl.startsWith('http')) {
            // Extract host from absolute URL
            wsHost = apiUrl.split('://')[1].split('/')[0];
        } else if (window.location.hostname === 'localhost') {
            wsHost = 'localhost:8000';
        }

        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        ws.current = new WebSocket(`${protocol}://${wsHost}/ws/chat/${user.id}`);

        ws.current.onmessage = (event) => {
            try {
                const newMsg = JSON.parse(event.data);
                setMessages(prev => [...prev, newMsg]);
            } catch (err) {
                console.error("Error parsing socket message:", err);
            }
        };

        ws.current.onclose = () => console.log('WebSocket connection closed');

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !ws.current) return;

        const payload = {
            text: inputText,
            is_private: isPrivate && recipientId !== null,
            receiver_id: isPrivate ? recipientId : null
        };

        ws.current.send(JSON.stringify(payload));
        setInputText('');
        setShowEmojiPicker(false);
    };

    const addEmoji = (emoji) => {
        setInputText(prev => prev + emoji);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchUser.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="live-chat-panel">
            <div className="chat-header">
                <div className="chat-title">
                    <MessageSquare size={18} />
                    <span>Community Live Chat</span>
                </div>
                <div className="chat-controls">
                    <button
                        className={`mode-toggle ${!isPrivate ? 'active' : ''}`}
                        onClick={() => { setIsPrivate(false); setRecipientId(null); }}
                        title="Public Channel"
                    >
                        <Hash size={16} />
                    </button>
                    <button
                        className={`mode-toggle ${isPrivate ? 'active' : ''}`}
                        onClick={() => setShowUserList(!showUserList)}
                        title="Private Message"
                    >
                        <Lock size={16} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isPrivate && showUserList && (
                    <motion.div
                        className="receiver-selector"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <div className="selector-header">
                            <p>Private Chat with...</p>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                                className="user-search-input"
                            />
                        </div>
                        <div className="user-scroll-list">
                            {filteredUsers.map(u => (
                                <div
                                    key={u.id}
                                    className={`user-select-item ${recipientId === u.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setRecipientId(u.id);
                                        setIsPrivate(true);
                                        setShowUserList(false);
                                    }}
                                >
                                    <span>{u.name}</span>
                                    <Send size={14} className="send-icon" />
                                </div>
                            ))}
                            {filteredUsers.length === 0 && <p className="no-users">No users found</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isPrivate && recipientId && !showUserList && (
                <div className="active-private-label">
                    <span>Chatting with: <strong>{users.find(u => u.id === recipientId)?.name}</strong></span>
                    <button onClick={() => { setRecipientId(null); setIsPrivate(false); }}>✕</button>
                </div>
            )}

            <div className="chat-messages-container">
                {messages.map((msg, index) => {
                    const isSelf = msg.sender_id === user.id;
                    return (
                        <div
                            key={msg.id || index}
                            className={`chat-msg ${isSelf ? 'self' : 'other'} ${msg.is_private ? 'private' : ''}`}
                        >
                            <div className="msg-content-wrapper">
                                {!isSelf && (
                                    <div className="msg-sender-tag">
                                        {msg.sender_name}
                                    </div>
                                )}
                                <div className="msg-bubble">
                                    <div className="msg-body">{msg.text}</div>
                                    <div className="msg-footer">
                                        {msg.is_private && <Lock size={10} className="lock-icon" />}
                                        <span className="msg-time">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                {isSelf && (
                                    <div className="msg-sender-tag self-tag">
                                        You
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
                <div className="input-actions-left">
                    <button
                        type="button"
                        className="emoji-btn"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        <Smile size={20} />
                    </button>
                    {showEmojiPicker && (
                        <div className="emoji-mini-picker">
                            {emojis.map(e => (
                                <span key={e} onClick={() => addEmoji(e)}>{e}</span>
                            ))}
                        </div>
                    )}
                </div>
                <input
                    type="text"
                    placeholder={isPrivate ? "Private message..." : "Type in public chat..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="chat-main-input"
                />
                <button type="submit" className="send-btn-main" disabled={!inputText.trim()}>
                    <Send size={20} />
                    <span className="sr-only">Send</span>
                </button>
            </form>
        </div>
    );
};

export default LiveChat;
