import React from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from'../context/AuthContext';

function NavBar() {
  const {isLoggedIn, logout} =  useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log('Logout function triggered');
    try {
      await axios.post('http://localhost:3001/api/logout', 
        {}, { 
          withCredentials: true,
        }
      );
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout Failed', error);
    }
  }
  
  
  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand href="#">Chat App</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: '100px' }}
            navbarScroll
          >
          </Nav>
          <Form className="d-flex">
          {isLoggedIn ? (
              <>
                <Link className="btn btn-danger mx-2" onClick={handleLogout}>Logout</Link>
              </>
            ) : (
              <>
                <Link className="btn btn-primary mx-2" to="/login" role="button">Login</Link>
                <Link className="btn btn-primary mx-2" to="/signup" role="button">Signup</Link>
              </>
            )}
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
