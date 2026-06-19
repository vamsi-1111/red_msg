import { useState, useEffect } from "react"
import axios from 'axios'
import { useNavigate } from "react-router-dom"

export default function Post() {
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

    const [subreddit, setSubreddit] = useState("")
    const [title, setTitle] = useState("")
    const [text, setText] = useState("")

    function handleSubreddit(e) {
        setSubreddit(e.target.value)
    }

    function handleTitle(e) {
        setTitle(e.target.value)
    }

    function handleText(e) {
        setText(e.target.value)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try{
            const result = await axios.post(`http://127.0.0.1:8000/post?subreddit=${subreddit}&title=${title}&text=${text}`)
            if(result.data.success) {
                alert("Successfully Posted")
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
                <h1>New Post</h1>
                <p>Submit a post to a subreddit</p>
            </div>
            <div className="card">
                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="subreddit">Subreddit</label>
                        <input id="subreddit" onChange={handleSubreddit}></input>
                    </div>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input id="title" onChange={handleTitle}></input>
                    </div>
                    <div className="form-group">
                        <label htmlFor="text">Text</label>
                        <input id="text" onChange={handleText}></input>
                    </div>
                    <button className="btn btn-primary" type="submit">Submit</button>
                </form>
            </div>
        </div>
    )
}
