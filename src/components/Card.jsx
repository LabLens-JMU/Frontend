import React from 'react';
import '../../css/Card.css';

const Card = ({title, description, tag}) => {
    return (
        <section className='container'>
            <div className='hero-card'>
                {/*<span className='badge'>tag</span>*/}
                <h3 className='room'>Lab Room 2020</h3>
                <p className='description'>Occupancy: 0</p>
                {/*<button className='button'>View Details</button>*/}
            </div>
            <div className='hero-card'>
                {/*<span className='badge'>tag</span>*/}
                <h3 className='room'>Lab Room 2039</h3>
                <p className='description'>Occupancy: 0</p>
                {/*<button className='button'>View Details</button>*/}
            </div>
        </section>
    );
};

export default Card;