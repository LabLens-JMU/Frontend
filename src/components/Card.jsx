import React from 'react';
import '../../css/Card.css';

const Card = ({ onSelectRoom }) => {
    return (
        <section className='container'>
            <div className='hero-card'>
                <h3
                    className='room'
                    role='button'
                    tabIndex={0}
                    onClick={() => onSelectRoom?.('2020')}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            onSelectRoom?.('2020');
                        }
                    }}
                >
                    Lab Room 2020
                </h3>
                <p className='description'>Occupancy: 0</p>
            </div>
            <div className='hero-card'>
                <h3 className='room'>Lab Room 2039</h3>
                <p className='description'>Occupancy: 0</p>
            </div>
        </section>
    );
};

export default Card;
