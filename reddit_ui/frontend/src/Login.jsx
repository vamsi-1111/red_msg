import { useState } from "react"
import axios from 'axios'
import { useNavigate } from "react-router-dom"

export default function Login() {

  const navigate = useNavigate()

  const[username, setUsername] = useState("")
  const[password, setPassword] = useState("")

  function handleUsername(e) {
    setUsername(e.target.value)
  }

  function handlePassword(e) {
    setPassword(e.target.value)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("password", password)
      const result = await axios.post("http://127.0.0.1:8000/auth", formData)
      if (result.data.success) {
        sessionStorage.setItem("token", result.data.token)
        navigate("/Home", {replace: true})
      }
      else {
        alert("Invalid Credentials")
      }
    }
    catch(e) {
      alert("Server Error Please Try Again")
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Sign in</h1>
      </div>
      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" onChange={handleUsername}></input>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="text" id="password" onChange={handlePassword}></input>
          </div>
          <button className="btn btn-primary" type="submit">Sign in</button>
        </form>
      </div>
    </div>
  )
}
