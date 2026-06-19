import { useEffect } from "react"
import axios from 'axios'
import { useNavigate } from "react-router-dom"

export default function Home() {
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

    function handleDmPage() {
        navigate("/Dm")
    }

    function handlePostPage() {
        navigate("/Post")
    }

    function handleRepliesPage() {
        navigate("/Replies")
    }

    function handleLogsPage() {
        navigate("/Logs")
    }

    return (
    <div className="page page--top">
        <div className="page-header">
            <div className="brand-mark">
                <span className="brand-dot"></span>
            </div>
            <h1>Dashboard</h1>
            <p>Choose an action to get started</p>
        </div>
        <div className="nav-grid">
            <button className="nav-btn" onClick={handleDmPage}>
                <span className="nav-btn-icon">✉</span>
                DM
            </button>
            <button className="nav-btn" onClick={handlePostPage}>
                <span className="nav-btn-icon">↑</span>
                Post
            </button>
            <button className="nav-btn" onClick={handleRepliesPage}>
                <span className="nav-btn-icon">↩</span>
                Check Replies
            </button>
            <button className="nav-btn" onClick={handleLogsPage}>
                <span className="nav-btn-icon">≡</span>
                Check Logs
            </button>
        </div>
    </div>
    )
}
