import { useState, useEffect } from "react"
import axios from 'axios'
import { useNavigate } from "react-router-dom"



export default function Logs() {


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

    const [logs, setLogs] = useState(null)

    async function handleGetLogs() {
        try {
            const result = await axios.get("http://127.0.0.1:8000/logs")
            setLogs(result.data)
        }
        catch(e) {
            alert("Error Please Try Again")
        }
    }

    return (
        <div className="page page--top">
            <div className="page-header">
                <h1>Logs</h1>
                <p>Review system activity</p>
            </div>
            <div className="content-area">
                <div className="toolbar">
                    <button className="btn btn-secondary" onClick={handleGetLogs}>Get Logs</button>
                </div>
                <div className="logs-output" dangerouslySetInnerHTML={{__html: logs}}/>
            </div>
        </div>
    )
}