import { useState, useEffect } from "react"
import axios from 'axios'
import { useNavigate } from "react-router-dom"


export default function Replies() {
    const navigate = useNavigate()

    useEffect(() => {
        const token = sessionStorage.getItem("token")
        if(token) {
            async function verifyToken() {
                try {
                    const result = await axios.post("http://127.0.0.1:8000/tokenAuth", {}, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    if(!result.data.valid) {
                        navigate("/Login", {replace: true})
                        alert("Invalid User")
                    }
                } catch(e) {
                    navigate("/Login")
                    alert("Server Error Please Try Again")
                }
            }
            verifyToken()
        }
        else {
            navigate("/Login", {replace: true})
            alert("Invalid User")
        }
    }, []);

    const [replies, setReplies] = useState({})
    const [checked, setChecked] = useState(false)

    async function handleCheckReplies() {
        try {
            const result = await axios.get("http://127.0.0.1:8000/replies")
            if(result.data) {
                setReplies(result.data)
                setChecked(true)
            }
            else {
                alert("Error Please Try Again")
            }
        }
        catch {
            alert("Server Error Please Try Again")
        }
    }

    return (
        <div className="page page--top">
            <div className="page-header">
                <h1>Replies</h1>
                <p>View incoming message replies</p>
            </div>
            <div className="content-area">
                <div className="toolbar">
                    <button className="btn btn-secondary" onClick={handleCheckReplies}>Check Replies</button>
                </div>
                {Object.keys(replies).length === 0 && checked === true ? (
                    <div className="empty-state">No Replies</div>
                ) : (
                    Object.entries(replies).map(([username,messages]) => (
                        <div className="reply-group" key={username}>
                            <div className="reply-group-header">{username}</div>
                            {messages.map((message, index) => (
                                <div className="reply-item" key={index}>
                                    <p className="reply-body">{message.body}</p>
                                    <p className="reply-time">{message.time}</p>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

