# Pacman แบบกาว ๆ 
โปรเจกต์ Flask Socket.io Pacman ซึ่งเป็นเกม Pacman แบบสดใสที่สามารถเล่นกับเพื่อนๆ ได้ผ่านการเชื่อมต่อแบบ realtime โดยใช้ Flask และ Socket.io

# ตัวอย่างเกม

![example](https://cdn.discordapp.com/attachments/969189988904357969/1154097695145857114/image.png)  

## วิธีการเริ่มต้น

1. ติดตั้ง Python: [เว็บไซต์หลักของ Python](https://www.python.org/downloads/).


2. ทำการ Clone โปรเจกต์นี้โลด



3. ติดตั้ง Library ให้พร้อม

   ```
   pip install -r requirements.txt
   ```

4. รันเซิร์ฟเวอร์:

   ```
   python app.py
   ```

5. เว็บจะทำงานที่ [http://localhost:5000](http://localhost:5000)

## วิธีการเล่น

1. เริ่มต้นเกม:
   - คลิกปุ่ม "Create Game" เพื่อสร้างเกมของคุณเอง.
   - หรือแบ่งปัน ID เกมกับเพื่อนๆ เพื่อให้พวกเขาเข้าร่วมเกมของคุณ.

2. เข้าร่วมเกม:
   - ให้เพื่อนเข้าร่วมเกมโดยคีย์ ID เกมของคุณในช่อง "Game ID" และคลิก "Join Game."

3. ควบคุม Pacman:
   - ใช้ปุ่มลูกศรบนคีย์บอร์ดเพื่อควบคุมการเคลื่อนที่ของ Pacman.
   - ดาวน์โหลดรูป Pacman ที่คุณต้องการแสดงในกล่อง "Pacman Image URL."
   - Pacman จะกินจุดที่อยู่ใกล้เขา และจุดที่ถูกกินจะหายไป.

## สำหรับชาวนักเดฟ

- โปรเจกต์นี้มี Flask ใช้เป็น web framework และ Flask-SocketIO เป็นไลบรารีสำหรับการสื่อสารแบบ realtime.
- ไฟล์ JavaScript (`static/main.js`) ใช้สำหรับการเรนเดอร์และควบคุมการเคลื่อนที่ของ Pacman.
