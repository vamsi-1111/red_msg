import { useState, useEffect } from "react"
import axios from 'axios'
import { useNavigate } from "react-router-dom"

export default function Dm() {
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

    const [subject, setSubject] = useState("")
    const [recipientUsername, setRecipientUsername] = useState("")
    const [messageBody, setMessageBody] = useState("")

    function handleSubject(e) {
        setSubject(e.target.value)
    }

    function handleUsername(e) {
        setRecipientUsername(e.target.value)
    }

    function handleMessageBody(e) {
        setMessageBody(e.target.value)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const result = await axios.post(`http://127.0.0.1:8000/dm?subject=${subject}&username=${recipientUsername}&body=${messageBody}`)
            if(result.data.success) {
                alert("Succesfully Sent")
            }
            else {
                alert("Error Please Try Again")
            }
        }
        catch(e) {
            alert("Server Error Please Try Again")
        }
    }

    return (
        <div className="page page--top">
            <div className="page-header">
                <h1>Send DM</h1>
                <p>Compose a direct message</p>
            </div>
            <div className="card">
                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="subject">Subject</label>
                        <input id="subject" onChange={handleSubject}></input>
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Recpient Username</label>
                        <input type="text" id="username" onChange={handleUsername}></input>
                    </div>
                    <div className="form-group">
                        <label htmlFor="messageBody">Message Body</label>
                        <input type="text" id="messageBody" onChange={handleMessageBody}></input>
                    </div>
                    <button className="btn btn-primary" type="submit">Submit</button>
                </form>
            </div>
        </div>
    )
}
