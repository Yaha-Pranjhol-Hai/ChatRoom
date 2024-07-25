import React from 'react'

function Home() {
  return (
    <div style={{ width: "50%", margin: "auto", padding: "1rem" }}>
    <label htmlFor="room" className="form-label">
            Room No.
          </label>
          <input
            type="text"
            id="room"
            name="room"
          /> 
          <button>Join</button>
          </div>
  )
}

export default Home