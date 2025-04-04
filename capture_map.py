import pyautogui
import pygetwindow

# Usage: Open in-game map in Arma Reforger and run this.
# Note: For a higher resolution capture use a virtual monitor with high resolution.

# Working area: 110-1870, 40-1010

def drag(x_from, y_from, x_to, y_to):
    pyautogui.moveTo(x_from, y_from)
    pyautogui.mouseDown(button='right')
    pyautogui.sleep(0.1)
    pyautogui.dragTo(x_to, y_to, mouseDownUp=False)
    pyautogui.sleep(0.1)
    pyautogui.mouseUp(button='right')

if __name__ == '__main__':
    width, height = pyautogui.size()
    assert width >= height

    pygetwindow.getWindowsWithTitle("Arma Reforger")[0].activate()

    # Consistent map alignment and zoom
    pyautogui.moveTo(1, 1)
    pyautogui.scroll(-500 * 120)
    pyautogui.sleep(2)
    pyautogui.moveTo(width // 2, height // 2)
    drag(width // 2 + 100, height // 2 + 100, (width - height) // 2 + 100, 100)
    
    # Capture map
    pyautogui.moveTo(width // 48, width // 48)
    pyautogui.sleep(0.5)
    pyautogui.screenshot('full_map.png', ((width - height) // 2, 0, height, height))
