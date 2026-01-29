from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
import json
import datetime
from app.core.database import get_db
from app.models.models import ChatMessage, User
from app.api.auth import get_current_user_socket, get_current_user

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, db: Session = Depends(get_db)):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # message_data format: {"text": "...", "receiver_id": int | None, "is_private": bool}
            text = message_data.get("text")
            receiver_id = message_data.get("receiver_id")
            is_private = message_data.get("is_private", False)
            
            if not text:
                continue

            # Save to database
            new_message = ChatMessage(
                sender_id=user_id,
                receiver_id=receiver_id if is_private else None,
                message=text,
                is_private=is_private
            )
            db.add(new_message)
            db.commit()
            db.refresh(new_message)

            user = db.query(User).filter(User.id == user_id).first()
            sender_name = user.name if user else "Anonymous"

            broadcast_data = {
                "id": new_message.id,
                "sender_id": user_id,
                "sender_name": sender_name,
                "text": text,
                "is_private": is_private,
                "receiver_id": receiver_id,
                "created_at": new_message.created_at.isoformat()
            }

            if is_private and receiver_id:
                # Send to receiver and sender (self)
                msg_json = json.dumps(broadcast_data)
                await manager.send_personal_message(msg_json, receiver_id)
                await manager.send_personal_message(msg_json, user_id)
            else:
                # Public broadcast
                await manager.broadcast(json.dumps(broadcast_data))

    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(user_id)

@router.get("/api/chat/history")
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """Fetch public messages and private messages involving the current user"""
    messages = db.query(ChatMessage).filter(
        (ChatMessage.is_private == False) | 
        (ChatMessage.sender_id == current_user.id) | 
        (ChatMessage.receiver_id == current_user.id)
    ).order_by(ChatMessage.created_at.desc()).limit(limit).all()
    
    result = []
    for msg in reversed(messages):
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        result.append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "sender_name": sender.name if sender else "Unknown",
            "text": msg.message,
            "is_private": msg.is_private,
            "receiver_id": msg.receiver_id,
            "created_at": msg.created_at.isoformat()
        })
    return result

@router.get("/api/chat/users")
async def get_chat_users(db: Session = Depends(get_db)):
    """Get list of users for private messaging"""
    users = db.query(User).filter(User.is_active == True).all()
    return [{"id": u.id, "name": u.name} for u in users]
