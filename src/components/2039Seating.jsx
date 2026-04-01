import React from "react";
import "../../css/Seat.css";

const Seating2039 = () => {
	return (
		<>
			<div className="roomContainer room-2039">
				<section className="front-row">
					<div className="block hor-board">
						<p>Board</p>
					</div>
				</section>

				<section className="room-body room-body-2039">
					<aside className="left-wall">
						<div className="block vert-board">
							<p>Board</p>
						</div>
					</aside>

					<section className="seat-stack">
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
					</section>

					<aside className="right-wall">
						<div className="block vert-board">
							<p>Board</p>
						</div>
						<div className="block vert-board">
							<p>Board</p>
						</div>
					</aside>
				</section>

				<section className="back-row back-row-right-door">
					<div className="back-wall-spacer" />
					<div className="boards back-boards">
						<div className="block hor-board">
							<p>Board</p>
						</div>
					</div>
					<div className="block doorway">
						<p>Door</p>
					</div>
				</section>
			</div>
		</>
	);
};

export default Seating2039;
