#!/usr/bin/env python3

import time
import requests

API_URL = "http://138.197.83.151/api/occupancy/event"

HEADERS = {
    "Content-Type": "application/json",
    "x-api-key": "lablens-secret"
}

CAMERA_TO_COMPUTERS = {
    "cam-1": list(range(1, 31)),
    "cam-2": list(range(31, 39)),
}

VALID_STATES = {0, 1}


def header(text):
    print("\n" + "=" * 60)
    print(text)
    print("=" * 60)


def choose_camera():
    header("Available Cameras")

    cams = list(CAMERA_TO_COMPUTERS.keys())

    for c in cams:
        print(c)

    while True:
        cam = input("\nCamera: ").strip()

        if cam in cams:
            return cam

        print("Invalid camera")


def choose_computers(camera):
    header(f"Computers for {camera}")

    valid = CAMERA_TO_COMPUTERS[camera]

    print(f"Valid range: {valid[0]}–{valid[-1]}")
    print("Enter computer IDs separated by commas, or a range like 1-5, or both.")
    print("Example: 1,3,5-8,12")

    while True:
        raw = input("\nComputer ID(s): ").strip()

        selected = []
        errors = []

        for part in raw.split(","):
            part = part.strip()
            if "-" in part:
                bounds = part.split("-")
                if len(bounds) == 2:
                    try:
                        lo, hi = int(bounds[0]), int(bounds[1])
                        ids = list(range(lo, hi + 1))
                        invalid = [x for x in ids if x not in valid]
                        if invalid:
                            errors.append(f"Out of range: {invalid}")
                        else:
                            selected.extend(ids)
                    except ValueError:
                        errors.append(f"Bad range: '{part}'")
                else:
                    errors.append(f"Bad range: '{part}'")
            else:
                try:
                    comp = int(part)
                    if comp not in valid:
                        errors.append(f"Invalid computer: {comp}")
                    else:
                        selected.append(comp)
                except ValueError:
                    errors.append(f"Not a number: '{part}'")

        if errors:
            for e in errors:
                print(f"  Error: {e}")
            continue

        if not selected:
            print("  No computers selected.")
            continue

        # Deduplicate while preserving order
        seen = set()
        deduped = []
        for x in selected:
            if x not in seen:
                seen.add(x)
                deduped.append(x)

        print(f"\nSelected: {deduped} ({len(deduped)} computer(s))")
        return deduped


def choose_state():
    header("Occupancy State")

    print("0 = empty")
    print("1 = occupied")

    while True:
        try:
            state = int(input("\nState: "))
        except Exception:
            print("Enter 0 or 1")
            continue

        if state in VALID_STATES:
            return state

        print("Invalid value")


def post_event(camera, computer, state):

    ts = int(time.time() * 1000)

    payload = {
        "camera_id": camera,
        "computer_id": computer,
        "ts_ms": ts,
        "occupied": state,
        "confidence": 0.89
    }

    print("\nPOST payload:")
    print(payload)

    r = requests.post(
        API_URL,
        json=payload,
        headers=HEADERS
    )

    print("HTTP status:", r.status_code)

    try:
        print(r.json())
    except Exception:
        print(r.text)


def main():

    header("LabLens POST CLI")

    while True:

        cam = choose_camera()
        computers = choose_computers(cam)
        state = choose_state()

        print(f"\nAbout to send {len(computers)} POST request(s) for computers: {computers}")
        confirm = input("Send? (y/n): ")

        if confirm.lower() == "y":
            for comp in computers:
                post_event(cam, comp, state)

        again = input("\nSend another event? (y/n): ")

        if again.lower() != "y":
            break

    print("\nDone")


if __name__ == "__main__":
    main()
