import requests
import json
import time

API_URL = "http://localhost:8000"

def upload_manual():
    print("\n[1] Uploading 'Acid-Base Titration' Manual...")
    # This simulates a manual. In reality, you'd upload a PDF.
    manual_content = """
    STANDARD OPERATING PROCEDURE: ACID-BASE TITRATION
    
    1. Preparation:
       - Rinse the burette with distilled water, then with the standard base solution (NaOH).
       - Fill the burette with NaOH. Eliminate air bubbles.
       - Record INITIAL READING (V1).
       
    2. Flask Setup:
       - Pipette 25mL of unknown acid (HCl) into a clean conical flask.
       - Add 2-3 drops of Phenolphthalein indicator. Solution should be COLORLESS.
       
    3. Titration:
       - Place flask under burette over a white tile.
       - Add NaOH slowly while SWIRLING the flask constantly.
       - Slow down to drop-wise addition as the endpoint approaches (flash of pink).
       
    4. Endpoint:
       - Stop when a FAINT PINK color persists for at least 30 seconds.
       - Record FINAL READING (V2).
       - Verify: V2 - V1 = Titer value.
       
    SAFETY:
    - Wear safety goggles at all times.
    - If acid spills on skin, wash immediately with water.
    - Never pipette by mouth.
    """
    
    # Save as temp file to upload
    with open("temp_manual.txt", "w") as f:
        f.write(manual_content)
        
    files = {"file": ("titration_manual.txt", open("temp_manual.txt", "rb"))}
    res = requests.post(f"{API_URL}/upload", files=files)
    print(res.json())

def test_states():
    # Sequence of Student Actions (States)
    student_states = [
        {
            "step": 1, 
            "description": "Student rinsed burette with water only, then immediately filled with NaOH." 
            # ERROR: Didn't rinse with NaOH
        },
        {
            "step": 2, 
            "description": "Student pipetted 25mL HCl into flask. Added 10 drops of Phenolphthalein. Solution is colorless."
            # MINOR ERROR: Too much indicator (standard is 2-3 drops)
        },
        {
            "step": 3, 
            "description": "Student is adding NaOH rapidly without swirling the flask."
            # CRITICAL ERROR: Not swirling
        },
        {
            "step": 4, 
            "description": "Student stopped titration when solution turned deep dark pink."
            # ERROR: Overshot endpoint (should be faint pink)
        }
    ]

    print("\n[2] Evaluating Student States against Manual...")
    
    for i, state in enumerate(student_states):
        print(f"\n--- Analyzing Step {state['step']} ---")
        print(f"Student Action: {state['description']}")
        
        start = time.time()
        res = requests.post(f"{API_URL}/evaluate", json={"state": state['description']})
        
        if res.status_code == 200:
            print(f"Gemini Feedback ({time.time()-start:.2f}s):\n")
            print(res.json()['feedback'])
        else:
            print("Error:", res.text)
            
        time.sleep(10) # courteous delay for free tier

if __name__ == "__main__":
    try:
        # Check health
        requests.get(f"{API_URL}/health")
        upload_manual()
        test_states()
    except Exception as e:
        print(f"Failed to connect to {API_URL}. Is the server running? {e}")
