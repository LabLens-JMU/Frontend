import React from 'react'
import '../../css/Header.css'

const Header = () => {
    return (
        <>
            <header>
                <img className='logo' src='src/assets/images/LabLensLogo.png' width='75' alt='Logo'/>
                <h1 className='title'>LabLens</h1>
                <nav>
                    <ul className='list-icons'>
                        <li className='graph'><img src='src/assets/images/Graph.jpg' width='50' alt='graph'/></li>
                        <li className='settings'><img src='src/assets/images/Settings.png' width='50' alt='settings'/></li>
                    </ul>
                </nav>
            </header>
        </>
    )
}

export default Header
