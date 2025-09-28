# Plant_Disease_Detection_and_Solution
Plant Disease Detection and Solution using AI – A web-based platform that allows users to detect plant leaf diseases by uploading images. The system analyzes the image using a trained Machine Learning model and instantly provides a diagnosis along with recommended solutions. Built using HTML and CSS for the frontend, and powered by Python-based models trained on a specialized plant disease dataset. Optimized with TensorFlow Lite for fast, real-time detection directly in the browser or with minimal server interaction.


# plant_Disease_Detection_and_solution
Plant Disease Detection and Solution using AI – Detect plant leaf diseases with a Machine Learning model and get instant solutions via an Android app. Built with Python (ML) and Kotlin (Android), optimized with TensorFlow Lite for offline, real-time performance.

# 🌱 Plant Disease Detection Web App

An *AI-powered web application* that detects plant leaf diseases from images and provides *remedies/solutions* to farmers and researchers.  
Built with *Flask (Python)* for backend and *HTML, CSS, JavaScript* for frontend, powered by *TensorFlow Lite* for fast predictions.

---

## 🚀 Features

- 📷 *Upload or capture* plant leaf images.  
- 🤖 *Predicts top 3 plant diseases* with confidence % values.  
- 💊 *Recommends solutions* for each disease.  
- 📊 Displays results in a *clean, responsive table*.  
- 📝 Keeps *CSV logs* of all predictions.  

---

## 🛠 Tech Stack

### *Languages*
- 🐍 *Python 3* → Backend (Flask, ML Inference)  
- 🌐 *HTML5* → Structure of web pages  
- 🎨 *CSS3* → Styling & responsiveness  
- ⚡ *JavaScript (ES6)* → Frontend logic, camera & API handling  

### *Libraries & Frameworks*
- 🧠 *TensorFlow Lite* → Plant disease classification  
- 🍶 *Flask* → Backend web framework  
- 🔓 *Flask-CORS* → Cross-origin support  
- 🖼 *Pillow (PIL)* → Image preprocessing  
- 🔢 *NumPy* → Array operations & ML input handling  

---

## 📂 File Structure
```
bash
plant-disease-app/
│── app.py                  # 🐍 Flask backend server
│── model/
│    └── model.tflite       # 🧠 Trained ML model (TensorFlow Lite)
│── labels.json             # 🏷 Index → disease label mapping
│── data.json               # 💊 Disease → solution mapping
│── templates/
│    └── index.html         # 🌐 Frontend HTML page
│── static/
│    ├── css/
│    │   └── style.css      # 🎨 CSS styling
│    ├── js/
│    │   └── app.js         # ⚡ Frontend logic
│    └── assets/            # 🖼 Optional UI assets
│── logs/
│    └── predictions.csv    # 📊 Prediction logs
│── requirements.txt        # 📦 Python dependencies
│── README.md               # 📘 Documentation
```
## ⚙ How It Works

1️⃣ User **uploads or captures** a leaf image 🌿  
2️⃣ Backend **preprocesses** the image (resize, normalize) 🖼  
3️⃣ Image is passed into **TensorFlow Lite model** 🧠  
4️⃣ Model outputs probabilities → Top 3 diseases extracted 📊  
5️⃣ App displays a **table** with:
   - 🦠 Disease name  
   - 💊 Solution  
   - 🏅 Rank  
   - 📊 Confidence (%)  

---

## 📊 Example Prediction Result

| 🦠 **Disease**         | 💊 **Solution**                        | 🏅 **Rank** | 📊 **Confidence** |
|-------------------------|----------------------------------------|-------------|-------------------|
| 🌽 Corn Common Rust     | Apply fungicide, remove infected leaves | 1           | 88%               |
| 🍏 Apple Scab           | Use resistant varieties, apply fungicide | 2           | 8%                |
| 🍎 Apple Black Rot      | Prune branches, apply fungicide         | 3           | 4%                |

---

## 🔧 Installation & Setup

### 1️⃣ Clone the repo
bash
git clone https://github.com/your-username/plant-disease-app.git
cd plant-disease-app

### 2️⃣ Install dependencies

```bash
pip install -r requirements.txt

requirements.txt should include:

flask
flask-cors
tensorflow
numpy
pillow
```

### 3️⃣ Run the server

python app.py

👉 Server will run on http://localhost:5000/

** 🏆 Future Improvements **

🌐 Deploy on cloud (Heroku, AWS, GCP)
📱 Make it a mobile-friendly PWA
🔔 Add notifications/reminders for crop care
📊 Build an analytics dashboard for disease trends

** ✨ Credits **

👨‍💻 Built with Flask + TensorFlow Lite + HTML/CSS/JS
❤ Designed to help farmers & researchers keep crops healthy


---

Do you also want me to create the *requirements.txt code* 📦 so you can just copy-paste and run without errors?


---

## 📝 Conclusion

The *🌱 Plant Disease Detection Web App* successfully integrates *Machine Learning* and *Web Technologies* to provide farmers and researchers with a *simple yet powerful tool* for early identification of plant leaf diseases.  

By combining:  
- 🧠 *TensorFlow Lite* for efficient on-device predictions  
- 🐍 *Flask* for lightweight and scalable backend  
- 🎨 *HTML, CSS, and JavaScript* for a user-friendly frontend  

👉 this project delivers a complete *end-to-end solution* from *image upload/capture → prediction → solution recommendation*.  

💡 With future improvements such as cloud deployment, mobile app integration, and advanced analytics, this system can play a significant role in *sustainable agriculture* and *food security*.  

🌍 *Impact*: Farmers can detect diseases early, take preventive action, reduce crop losses, and improve yields.  

✨ In conclusion, this project demonstrates how *AI + Web Development* can work hand-in-hand to solve *real-world agricultural challenges*.
