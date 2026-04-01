import React from "react";
import "../../css/Seat.css";

const Seating2020 = () => {
  return (
    <>
      <div className="roomContainer">
        <section className="front-row">
          <div className="block hor-board">
            <p>Board</p>
          </div>
          <div className="block hor-board">
            <p>Board</p>
          </div>
          <div className="block hor-board">
            <p>Board</p>
          </div>
        </section>

        <section className="room-body">
          <div className="seat-columns">
            <section className="col">
              <section className="room-seats row">
                <div className="seat-1 block">
                  <p>Seat #1</p>
                </div>
                <div className="seat-2 block">
                  <p>Seat #2</p>
                </div>
                <div className="seat-3 block">
                  <p>Seat #3</p>
                </div>
                <div className="seat-1 block">
                  <p>Seat #4</p>
                </div>
                <div className="seat-2 block">
                  <p>Seat #5</p>
                </div>
                <div className="seat-3 block">
                  <p>Seat #6</p>
                </div>
              </section>
              <section className="room-seats row">
                <div className="seat-1 block">
                  <p>Seat #7</p>
                </div>
                <div className="seat-2 block">
                  <p>Seat #8</p>
                </div>
                <div className="seat-3 block">
                  <p>Seat #9</p>
                </div>
                <div className="seat-1 block">
                  <p>Seat #10</p>
                </div>
                <div className="seat-2 block">
                  <p>Seat #11</p>
                </div>
                <div className="seat-3 block">
                  <p>Seat #12</p>
                </div>
              </section>
              <section className="room-seats row">
                <div className="seat-1 block">
                  <p>Seat #13</p>
                </div>
                <div className="seat-2 block">
                  <p>Seat #14</p>
                </div>
                <div className="seat-3 block">
                  <p>Seat #15</p>
                </div>
                <div className="seat-1 block">
                  <p>Seat #16</p>
                </div>
                <div className="seat-2 block">
                  <p>Seat #17</p>
                </div>
                <div className="seat-3 block">
                  <p>Seat #18</p>
                </div>
              </section>
            </section>

            <section className="col">
              <section className="room-seats row">
                <div className="seat-1 block">
                  <p>Seat #19</p>
                </div>
                <div className="seat-2 block">
                  <p>Seat #20</p>
                </div>
                <div className="seat-3 block">
                  <p>Seat #21</p>
                </div>
                <div className="seat-1 block">
                  <p>Seat #22</p>
                </div>
                <div className="seat-2 block">
                  <p>Seat #23</p>
                </div>
                <div className="seat-3 block">
                  <p>Seat #24</p>
                </div>
              </section>
              <section className="room-seats row">
                <div className="seat-1 block">
                  <p>Seat #25</p>
                </div>
                <div className="seat-2 block">
                  <p>Seat #26</p>
                </div>
                <div className="seat-3 block">
                  <p>Seat #27</p>
                </div>
                <div className="seat-1 block">
                  <p>Seat #28</p>
                </div>
                <div className="seat-2 block">
                  <p>Seat #29</p>
                </div>
                <div className="seat-3 block">
                  <p>Seat #30</p>
                </div>
              </section>
              <section className="room-seats row">
                <div className="seat-1 block">
                  <p>Seat #31</p>
                </div>
                <div className="seat-2 block">
                  <p>Seat #32</p>
                </div>
                <div className="seat-3 block">
                  <p>Seat #33</p>
                </div>
                <div className="seat-1 block">
                  <p>Seat #34</p>
                </div>
                <div className="seat-2 block">
                  <p>Seat #35</p>
                </div>
                <div className="seat-3 block">
                  <p>Seat #36</p>
                </div>
              </section>
            </section>
          </div>

          <aside className="right-wall">
            <div className="block vert-board">
              <p>Board</p>
            </div>
            <div className="block vert-board">
              <p>Board</p>
            </div>
          </aside>
        </section>

        <section className="back-row">
          <div className="block doorway">
            <p>Door</p>
          </div>
          <div className="boards back-boards">
            <div className="block hor-board">
              <p>Board</p>
            </div>
            <div className="block hor-board">
              <p>Board</p>
            </div>
          </div>
          <div className="back-wall-spacer" />
        </section>
      </div>
    </>
  );
};

export default Seating2020;
