import React from 'react'
import '../../css/Header.css'

const Header = () => {
    return (
        <>
            <main>
                <nav className='header'>
                    <h2>Buildings</h2>
                    <nav>
                        <ul className='graph'>
                            <li> <a href='./pages/Graph.jsx'>Graph View</a ></li>
                        </ul>
                    </nav>
                </nav>
            </main>
        </>
    )
}

export default Header
