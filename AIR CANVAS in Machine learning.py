import numpy as np
import cv2
from collections import deque

# Define trackbar callback function
def setValues(x):
    pass  # No need to use this for now

# Create the window and trackbars for HSV range adjustments
cv2.namedWindow("Color detectors")
cv2.createTrackbar("Upper Hue", "Color detectors", 135, 180, setValues)
cv2.createTrackbar("Upper Saturation", "Color detectors", 205, 255, setValues)
cv2.createTrackbar("Upper Value", "Color detectors", 255, 255, setValues)
cv2.createTrackbar("Lower Hue", "Color detectors", 64, 180, setValues)
cv2.createTrackbar("Lower Saturation", "Color detectors", 85, 255, setValues)
cv2.createTrackbar("Lower Value", "Color detectors", 111, 255, setValues)

# Initialize deque points for drawing
bpoints = [deque(maxlen=1024)]
gpoints = [deque(maxlen=1024)]
rpoints = [deque(maxlen=1024)]
ypoints = [deque(maxlen=1024)]

# Indices to track the current position in the deque
blue_index = 0
green_index = 0
red_index = 0
yellow_index = 0

# Kernel for morphological operations
kernel = np.ones((5, 5), np.uint8)

# Color list for drawing
colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (0, 255, 255)]  # BGR order
colorIndex = 0  # Default color is blue

# Initialize the paint window
paintWindow = np.ones((471, 636, 3)) * 255  # White background
paintWindow = cv2.rectangle(paintWindow, (40, 1), (140, 65), (0, 0, 0), 2)  # Clear area
paintWindow = cv2.rectangle(paintWindow, (160, 1), (255, 65), colors[0], -1)  # Blue color
paintWindow = cv2.rectangle(paintWindow, (275, 1), (370, 65), colors[1], -1)  # Green color
paintWindow = cv2.rectangle(paintWindow, (390, 1), (485, 65), colors[2], -1)  # Red color
paintWindow = cv2.rectangle(paintWindow, (505, 1), (600, 65), colors[3], -1)  # Yellow color

# Add text to indicate buttons
cv2.putText(paintWindow, "CLEAR", (49, 33), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2, cv2.LINE_AA)
cv2.putText(paintWindow, "BLUE", (185, 33), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
cv2.putText(paintWindow, "GREEN", (298, 33), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
cv2.putText(paintWindow, "RED", (420, 33), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
cv2.putText(paintWindow, "YELLOW", (520, 33), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150, 150, 150), 2, cv2.LINE_AA)

# Open the webcam
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    frame = cv2.flip(frame, 1)  # Flip the frame horizontally
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)  # Convert frame to HSV color space

    # Get HSV values from trackbars
    u_hue = cv2.getTrackbarPos("Upper Hue", "Color detectors")
    u_saturation = cv2.getTrackbarPos("Upper Saturation", "Color detectors")
    u_value = cv2.getTrackbarPos("Upper Value", "Color detectors")
    l_hue = cv2.getTrackbarPos("Lower Hue", "Color detectors")
    l_saturation = cv2.getTrackbarPos("Lower Saturation", "Color detectors")
    l_value = cv2.getTrackbarPos("Lower Value", "Color detectors")
    
    Upper_hsv = np.array([u_hue, u_saturation, u_value])
    Lower_hsv = np.array([l_hue, l_saturation, l_value])

    # Create mask based on trackbar values
    Mask = cv2.inRange(hsv, Lower_hsv, Upper_hsv)
    Mask = cv2.erode(Mask, kernel, iterations=1)
    Mask = cv2.morphologyEx(Mask, cv2.MORPH_OPEN, kernel)
    Mask = cv2.dilate(Mask, kernel, iterations=1)

    # Find contours
    cnts, _ = cv2.findContours(Mask.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    center = None

    if len(cnts) > 0:
        cnt = sorted(cnts, key=cv2.contourArea, reverse=True)[0]
        ((x, y), radius) = cv2.minEnclosingCircle(cnt)
        cv2.circle(frame, (int(x), int(y)), int(radius), (0, 255, 255), 2)  # Draw circle around the object
        M = cv2.moments(cnt)
        center = (int(M['m10'] / M['m00']), int(M['m01'] / M['m00']))  # Find center

        if center[1] <= 65:  # Check if we are in the "button" area
            if 40 <= center[0] <= 140:
                # Reset points if the "CLEAR" button is clicked
                bpoints = [deque(maxlen=512)]
                gpoints = [deque(maxlen=512)]
                rpoints = [deque(maxlen=512)]
                ypoints = [deque(maxlen=512)]
                blue_index = green_index = red_index = yellow_index = 0
                paintWindow[67:, :, :] = 255  # Clear the drawing canvas
            elif 160 <= center[0] <= 255:
                colorIndex = 0  # Blue color
            elif 275 <= center[0] <= 370:
                colorIndex = 1  # Green color
            elif 390 <= center[0] <= 485:
                colorIndex = 2  # Red color
            elif 505 <= center[0] <= 600:
                colorIndex = 3  # Yellow color
        else:
            # Add the point to the selected color
            if colorIndex == 0:
                bpoints[blue_index].appendleft(center)
            elif colorIndex == 1:
                gpoints[green_index].appendleft(center)
            elif colorIndex == 2:
                rpoints[red_index].appendleft(center)
            elif colorIndex == 3:
                ypoints[yellow_index].appendleft(center)
    else:
        # Add new deque if none exists for a color
        bpoints.append(deque(maxlen=512))
        blue_index += 1
        gpoints.append(deque(maxlen=512))
        green_index += 1
        rpoints.append(deque(maxlen=512))
        red_index += 1
        ypoints.append(deque(maxlen=512))
        yellow_index += 1

    # Draw the points on the frame and paint window
    points = [bpoints, gpoints, rpoints, ypoints]
    for i in range(len(points)):
        for j in range(len(points[i])):
            for k in range(1, len(points[i][j])):
                if points[i][j][k - 1] is None or points[i][j][k] is None:
                    continue
                cv2.line(frame, points[i][j][k - 1], points[i][j][k], colors[i], 2)
                cv2.line(paintWindow, points[i][j][k - 1], points[i][j][k], colors[i], 2)

    # Show images
    cv2.imshow("Tracking", frame)
    cv2.imshow("Paint", paintWindow)
    cv2.imshow("Mask", Mask)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
