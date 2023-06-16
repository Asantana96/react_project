import { AuthContext } from "../contexts/UserProvider"
import { useContext } from "react"
import { Link } from "react-router-dom";

export default function DefaultHome(){
  const { user } = useContext(AuthContext);

  return (
    <>
      {user.loggedIn ? (
        <>
          <h2>Welcome, {user.username}!</h2>
          <Link to="/logout">Logout</Link>
        </>
      ) : (
        <>
          <h2>Welcome to the Default Home Page!</h2>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
      {/* Rest of your home page content */}
    </>
  );
}