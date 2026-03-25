// import React from 'react'
import '../../css/Aside.css'
import React, { useState } from 'react'

const campusData = [
    {
        id: "b1",
        name: "Engeo",
        rooms: [
            { id: "r2020", name: "Room 2020" },
            { id: "r2039", name: "Room 2039" },
        ],
    },
    {
        id: "b2",
        name: "King Hall",
        rooms: [
            { id: "r201", name: "Study Room 201" },
            { id: "r203", name: "Study Room 203" },
        ],
    },
];

export function Aside({ onSelectRoom }) {
    // If null, we show all buildings. If an object, we show that building's rooms.
    const [selectedBuilding, setSelectedBuilding] = useState(null);

    return (
        <div className="aside">

            {/* --- Header / Back Button --- */}
            <div className="breadcrumb-header">
        <span
            onClick={() => setSelectedBuilding(null)}
            className={`breadcrumb-item ${!selectedBuilding ? 'active' : ''}`}
        >
          Buildings
        </span>

                {/* If a building is selected, show its name in the header */}
                {selectedBuilding && (
                    <>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-item active">
              {selectedBuilding.name}
            </span>
                    </>
                )}
            </div>

            {/* --- List View --- */}
            <div className="contents-view">

                {/* VIEW 1: Showing Rooms (because a building is selected) */}
                {selectedBuilding ? (
                    selectedBuilding.rooms.length > 0 ? (
                        selectedBuilding.rooms.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => onSelectRoom?.(room.id)}
                                className="location-item"
                            >
                                <span>🚪</span>
                                <span>{room.name}</span>
                            </div>
                        ))
                    ) : (
                        <div className="empty-location">No rooms available in this building.</div>
                    )
                ) : (

                    /* VIEW 2: Showing Buildings (because nothing is selected yet) */
                    campusData.map((building) => (
                        <div
                            key={building.id}
                            onClick={() => setSelectedBuilding(building)}
                            className="location-item"
                        >
                            <span>🏢</span>
                            <span>{building.name}</span>
                            <span className="chevron-right">❯</span>
                        </div>
                    ))

                )}
            </div>
        </div>
    );
}

export default Aside
