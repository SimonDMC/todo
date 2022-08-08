import React from 'react'

interface LoginProps {
    loggedIn: boolean;
    loginWithGoogle: Function;
    logOut: Function;
}

export default function Login(props: LoginProps) {

    const style: React.CSSProperties = {
        fontSize: '2em',
        fontWeight: '700',
        position: 'absolute',
        top: '.5em',
        right: '.5em',
        color: '#FFF',
        textShadow: '0 0 15px #00000050',
        backgroundColor: '#00000040',
        padding: '0.4em',
        borderRadius: '0.5em',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    }

    const handleClick = () => {
        if (props.loggedIn) {
            props.logOut();
        } else {
            props.loginWithGoogle();
        }
    }

    return (
        <div 
            className='login'
            onClick={handleClick}
            style={style}>
                {props.loggedIn ? 'Log Out' : 'Log In'}
        </div>
    )
}
