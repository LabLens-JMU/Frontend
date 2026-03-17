import React from 'react'
import '../../css/Header.css'
import logo from '../assets/images/LabLensLogo.png'
import graph from '../assets/images/Graph.png'
import settings from '../assets/images/Settings.png'

const Header = () => {
    return (
        <>
            <header>
                <img className='logo' src={logo} width='75' alt='Logo'/>
                <h1 className='title'>LabLens</h1>
                <nav>
                    <ul className='list-icons'>
                        <li className='graph'><img src={graph} width='50' alt='graph'/></li>
                        <li className='settings'><img src={settings} width='50' alt='settings'/></li>
                    </ul>
                </nav>
            </header>
        </>
    )
}

export default Header
