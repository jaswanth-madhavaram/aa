"""
Medico.AI frontend.

This keeps the project frontend as Streamlit/Python while rendering the provided
HTML design directly for a closer visual match.
"""
from __future__ import annotations

import os
from textwrap import dedent

import streamlit as st
import streamlit.components.v1 as components


st.set_page_config(
    page_title="Medico.AI - Save on Medicines",
    page_icon="💊",
    layout="wide",
    initial_sidebar_state="collapsed",
)

API_BASE = os.getenv("MEDICO_API_URL", "http://localhost:8000/api/v1")
HEALTH_URL = os.getenv("MEDICO_HEALTH_URL", "http://localhost:8000/health")

st.markdown(
    """
<style>
html, body, .stApp {
  margin: 0 !important;
  padding: 0 !important;
  background: #F7F9FC !important;
}
.block-container {
  max-width: none !important;
  padding: 0 !important;
}
[data-testid="stHeader"],
[data-testid="stToolbar"],
[data-testid="stDecoration"],
[data-testid="stStatusWidget"],
[data-testid="collapsedControl"],
#MainMenu,
footer {
  display: none !important;
}
iframe {
  display: block;
}
</style>
""",
    unsafe_allow_html=True,
)

html_app = dedent(
    f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medico.AI — Save on Medicines</title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Lato:wght@400;700&display=swap" rel="stylesheet">
    <style>
      :root {{
        --green: #1DB954;
        --green-light: #e8faf0;
        --green-dark: #148a3d;
        --orange: #FF6B35;
        --blue: #2563EB;
        --bg: #F7F9FC;
        --card: #ffffff;
        --text: #1a1a2e;
        --muted: #6B7280;
        --border: #E5E7EB;
        --shadow: 0 4px 24px rgba(0,0,0,0.08);
        --radius: 18px;
      }}

      * {{ margin: 0; padding: 0; box-sizing: border-box; }}

      body {{
        font-family: 'Lato', sans-serif;
        background: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }}

      nav {{
        background: white;
        border-bottom: 2px solid var(--border);
        padding: 0 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 68px;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      }}
      .logo {{
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: 'Nunito', sans-serif;
        font-weight: 900;
        font-size: 1.5rem;
        color: var(--text);
        text-decoration: none;
      }}
      .logo-icon {{
        width: 40px; height: 40px;
        background: linear-gradient(135deg, var(--green), var(--green-dark));
        border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.3rem;
        box-shadow: 0 3px 10px rgba(29,185,84,0.35);
      }}
      .nav-links {{ display: flex; gap: 8px; align-items: center; }}
      .nav-links a {{
        font-family: 'Nunito', sans-serif;
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--muted);
        text-decoration: none;
        padding: 8px 16px;
        border-radius: 10px;
        transition: all 0.2s;
      }}
      .nav-links a:hover, .nav-links a.active {{
        background: var(--green-light);
        color: var(--green-dark);
      }}
      .status-pill {{
        display: flex; align-items: center; gap: 6px;
        background: var(--green-light);
        color: var(--green-dark);
        font-weight: 700;
        font-size: 0.82rem;
        padding: 6px 14px;
        border-radius: 99px;
        border: 1.5px solid var(--green);
      }}
      .dot {{ width: 8px; height: 8px; border-radius: 50%; background: var(--green); animation: pulse 1.8s infinite; }}
      @keyframes pulse {{ 0%,100%{{opacity:1}} 50%{{opacity:0.4}} }}
      .auth-actions {{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }}
      .auth-btn {{
        border:2px solid var(--green);
        background:white;
        color:var(--green-dark);
        padding:7px 12px;
        border-radius:10px;
        font-family:'Nunito',sans-serif;
        font-weight:800;
        cursor:pointer;
      }}
      .auth-btn.primary {{ background:var(--green); color:white; }}
      .auth-user {{ color:var(--green-dark); font-weight:800; font-family:'Nunito',sans-serif; }}
      .modal {{
        position:fixed; inset:0; z-index:999;
        display:none; place-items:center;
        background:rgba(15,23,42,0.55);
        padding:20px;
      }}
      .modal.active {{ display:grid; }}
      .auth-card {{
        width:min(420px,100%);
        background:white;
        border-radius:18px;
        padding:24px;
        box-shadow:0 24px 80px rgba(0,0,0,0.25);
      }}
      .auth-card h2 {{ font-family:'Nunito',sans-serif; font-weight:900; margin-bottom:8px; }}
      .auth-card input {{
        width:100%;
        border:2px solid var(--border);
        border-radius:12px;
        padding:12px 14px;
        margin:8px 0;
        font:inherit;
      }}
      .auth-row {{ display:flex; gap:10px; margin-top:12px; }}
      .auth-row button {{ flex:1; }}
      .source-note {{
        margin:10px 24px 0;
        color:var(--muted);
        font-size:0.86rem;
        font-weight:700;
      }}

      .hero {{
        background: linear-gradient(135deg, #0f4c35 0%, #1a7a4f 50%, #1DB954 100%);
        padding: 56px 32px 48px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }}
      .hero::before {{
        content: '';
        position: absolute; inset: 0;
        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      }}
      .hero h1 {{
        font-family: 'Nunito', sans-serif;
        font-weight: 900;
        font-size: clamp(2rem, 4vw, 3rem);
        color: white;
        line-height: 1.15;
        position: relative;
      }}
      .hero p {{
        color: rgba(255,255,255,0.85);
        font-size: 1.15rem;
        margin: 12px auto 0;
        max-width: 520px;
        position: relative;
      }}

      .search-section {{
        max-width: 680px;
        margin: -28px auto 0;
        padding: 0 24px;
        position: relative;
        z-index: 10;
      }}
      .search-box {{
        background: white;
        border-radius: 20px;
        padding: 8px 8px 8px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.15);
        border: 2px solid transparent;
        transition: border 0.2s;
      }}
      .search-box:focus-within {{ border-color: var(--green); }}
      .search-box input {{
        flex: 1;
        border: none; outline: none;
        font-family: 'Nunito', sans-serif;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text);
        background: transparent;
      }}
      .search-box input::placeholder {{ color: #b0b8c4; font-weight: 600; }}
      .search-btn {{
        background: linear-gradient(135deg, var(--green), var(--green-dark));
        color: white;
        border: none;
        border-radius: 14px;
        padding: 12px 28px;
        font-family: 'Nunito', sans-serif;
        font-weight: 800;
        font-size: 1rem;
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
        white-space: nowrap;
      }}
      .search-btn:hover {{ transform: translateY(-1px); box-shadow: 0 6px 20px rgba(29,185,84,0.45); }}
      .search-hint {{
        text-align: center;
        color: var(--muted);
        font-size: 0.85rem;
        margin-top: 10px;
      }}

      .main {{ max-width: 960px; margin: 40px auto 60px; padding: 0 24px; }}
      .summary-cards {{
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 32px;
      }}
      @media(max-width:700px){{ .summary-cards {{ grid-template-columns: repeat(2,1fr); }} }}
      .sum-card {{
        background: white;
        border-radius: var(--radius);
        padding: 22px 16px;
        text-align: center;
        box-shadow: var(--shadow);
        border: 2px solid var(--border);
        transition: transform 0.2s;
      }}
      .sum-card:hover {{ transform: translateY(-3px); }}
      .sum-card .big {{
        font-family: 'Nunito', sans-serif;
        font-size: 2rem;
        font-weight: 900;
        line-height: 1;
        margin-bottom: 6px;
      }}
      .sum-card .label {{
        font-size: 0.82rem;
        color: var(--muted);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }}
      .sum-card.green .big {{ color: var(--green-dark); }}
      .sum-card.orange .big {{ color: var(--orange); }}
      .sum-card.blue .big {{ color: var(--blue); }}
      .sum-card.save {{ background: linear-gradient(135deg, #e8faf0, #d0f5e3); border-color: var(--green); }}
      .sum-card.save .big {{ color: var(--green-dark); }}

      .section-title {{
        font-family: 'Nunito', sans-serif;
        font-weight: 800;
        font-size: 1.25rem;
        color: var(--text);
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }}

      .result-card {{
        background: white;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        border: 2px solid var(--border);
        overflow: hidden;
        margin-bottom: 24px;
      }}
      .result-header {{
        padding: 18px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid var(--border);
        background: #fafafa;
      }}
      .medicine-name {{
        font-family: 'Nunito', sans-serif;
        font-weight: 900;
        font-size: 1.3rem;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }}
      .badge {{
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 12px;
        border-radius: 99px;
        font-size: 0.78rem;
        font-weight: 700;
        font-family: 'Nunito', sans-serif;
      }}
      .badge-green {{ background: var(--green-light); color: var(--green-dark); border: 1.5px solid var(--green); }}
      .badge-orange {{ background: #fff4ee; color: #c94a1a; border: 1.5px solid var(--orange); }}
      .badge-muted {{ background:#f3f4f6;color:#6b7280;border:1.5px solid #d1d5db; }}

      .composition {{
        padding: 12px 24px;
        background: #f0f9ff;
        border-bottom: 1.5px solid var(--border);
        font-size: 0.9rem;
        color: #1e40af;
        font-weight: 600;
      }}
      .composition span {{ font-weight: 800; }}
      .options-wrap {{ padding: 0 24px 8px; overflow-x: auto; }}
      table {{ width: 100%; border-collapse: collapse; margin: 16px 0; }}
      thead tr {{ background: #f3f4f6; }}
      th {{
        font-family: 'Nunito', sans-serif;
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--muted);
        padding: 10px 14px;
        text-align: left;
        white-space: nowrap;
      }}
      td {{
        padding: 14px 14px;
        font-size: 0.95rem;
        color: var(--text);
        border-bottom: 1.5px solid var(--border);
        vertical-align: middle;
      }}
      tr:last-child td {{ border-bottom: none; }}
      tr:hover td {{ background: #f9fafb; }}
      .best-row td {{ background: #f0fff6 !important; }}
      .option-name {{ font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1rem; }}
      .star-badge {{
        display: inline-flex; align-items: center; gap: 4px;
        background: #fff8e1; color: #b45309;
        border: 1.5px solid #fcd34d;
        padding: 2px 8px; border-radius: 99px;
        font-size: 0.75rem; font-weight: 700;
      }}
      .price {{ font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.05rem; }}
      .price-generic {{ color: var(--green-dark); }}
      .price-branded {{ color: var(--orange); }}
      .savings-chip {{
        display: inline-block;
        background: var(--green-light);
        color: var(--green-dark);
        border-radius: 8px;
        padding: 3px 10px;
        font-weight: 800;
        font-size: 0.88rem;
        font-family: 'Nunito', sans-serif;
      }}

      .cheapest-banner {{
        margin: 0 24px 20px;
        background: linear-gradient(90deg, #1DB954, #148a3d);
        border-radius: 14px;
        padding: 16px 22px;
        display: flex;
        align-items: center;
        gap: 14px;
        color: white;
      }}
      .cheapest-icon {{
        width: 42px; height: 42px;
        background: rgba(255,255,255,0.2);
        border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.4rem; flex-shrink: 0;
      }}
      .cheapest-text .title {{
        font-family: 'Nunito', sans-serif;
        font-weight: 900;
        font-size: 1.05rem;
      }}
      .cheapest-text .sub {{
        font-size: 0.88rem;
        opacity: 0.88;
        margin-top: 2px;
      }}

      .how-section {{ margin: 40px 0; }}
      .steps {{ display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }}
      @media(max-width:600px){{ .steps {{ grid-template-columns: 1fr; }} }}
      .step-card {{
        background: white;
        border-radius: var(--radius);
        padding: 28px 22px;
        text-align: center;
        box-shadow: var(--shadow);
        border: 2px solid var(--border);
        position: relative;
      }}
      .step-num {{
        width: 44px; height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--green), var(--green-dark));
        color: white;
        font-family: 'Nunito', sans-serif;
        font-weight: 900;
        font-size: 1.25rem;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 14px;
        box-shadow: 0 4px 14px rgba(29,185,84,0.35);
      }}
      .step-icon {{ font-size: 2rem; margin-bottom: 8px; }}
      .step-card h3 {{
        font-family: 'Nunito', sans-serif;
        font-weight: 800;
        font-size: 1.1rem;
        margin-bottom: 8px;
      }}
      .step-card p {{ color: var(--muted); font-size: 0.92rem; line-height: 1.5; }}

      .upload-card {{
        background: white;
        border-radius: var(--radius);
        padding: 36px;
        text-align: center;
        box-shadow: var(--shadow);
        border: 3px dashed var(--border);
        margin-bottom: 32px;
        transition: border-color 0.2s;
      }}
      .upload-card:hover {{ border-color: var(--green); background: var(--green-light); }}
      .upload-icon {{ font-size: 3rem; margin-bottom: 12px; }}
      .upload-card h2 {{
        font-family: 'Nunito', sans-serif;
        font-weight: 900;
        font-size: 1.4rem;
        margin-bottom: 8px;
      }}
      .upload-card p {{ color: var(--muted); margin-bottom: 20px; }}
      .btn-upload {{
        background: linear-gradient(135deg, var(--green), var(--green-dark));
        color: white;
        border: none;
        padding: 14px 32px;
        border-radius: 14px;
        font-family: 'Nunito', sans-serif;
        font-weight: 800;
        font-size: 1rem;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(29,185,84,0.35);
        transition: transform 0.15s;
      }}
      .btn-upload:hover {{ transform: translateY(-2px); }}
      input[type=file] {{ margin: 14px 0; }}
      .scan-panel {{
        display: grid;
        grid-template-columns: minmax(220px, 0.9fr) minmax(260px, 1.1fr);
        gap: 18px;
        align-items: start;
        margin: 18px 0 24px;
      }}
      .preview-box, .scan-detail-box {{
        background: white;
        border: 2px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        overflow: hidden;
      }}
      .preview-box img {{
        width: 100%;
        max-height: 460px;
        object-fit: contain;
        background: #f3f4f6;
        display: block;
      }}
      .preview-empty {{
        padding: 34px 18px;
        color: var(--muted);
        font-weight: 700;
        text-align: center;
      }}
      .scan-detail-box {{ padding: 18px; }}
      .pill-list {{ display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }}
      .med-pill {{
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 10px;
        border-radius: 99px;
        background: var(--green-light);
        border: 1.5px solid var(--green);
        color: var(--green-dark);
        font-family: 'Nunito', sans-serif;
        font-weight: 800;
        font-size: 0.88rem;
      }}
      .scan-lines {{
        margin-top: 12px;
        max-height: 220px;
        overflow: auto;
        border-top: 1px solid var(--border);
      }}
      .scan-line {{
        padding: 9px 0;
        border-bottom: 1px solid var(--border);
        color: var(--muted);
        font-size: 0.9rem;
      }}
      .scan-line strong {{ color: var(--text); }}
      textarea {{
        width: 100%;
        min-height: 160px;
        resize: vertical;
        border: 2px solid var(--border);
        border-radius: 14px;
        padding: 14px;
        font-family: 'Lato', sans-serif;
        font-size: 1rem;
      }}

      .disclaimer {{
        background: #fffbeb;
        border: 2px solid #fcd34d;
        border-radius: 14px;
        padding: 16px 20px;
        display: flex;
        gap: 12px;
        align-items: flex-start;
        margin-top: 24px;
      }}
      .disclaimer-icon {{ font-size: 1.4rem; flex-shrink: 0; margin-top: 2px; }}
      .disclaimer p {{
        color: #92400e;
        font-size: 0.9rem;
        line-height: 1.5;
        font-weight: 600;
      }}

      .tabs {{ display: flex; gap: 6px; margin-bottom: 24px; flex-wrap: wrap; }}
      .tab {{
        padding: 10px 22px;
        border-radius: 12px;
        font-family: 'Nunito', sans-serif;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        border: 2px solid var(--border);
        background: white;
        color: var(--muted);
        transition: all 0.15s;
      }}
      .tab.active {{
        background: var(--green);
        color: white;
        border-color: var(--green);
        box-shadow: 0 3px 12px rgba(29,185,84,0.3);
      }}

      .page-section {{ display: none; }}
      .page-section.active {{ display: block; }}
      .loading, .error-msg {{
        text-align: center;
        padding: 18px;
        color: var(--muted);
        font-weight: 700;
      }}
      .error-msg {{ color: #c94a1a; }}
      footer {{
        background: #1a1a2e;
        color: rgba(255,255,255,0.6);
        text-align: center;
        padding: 20px;
        font-size: 0.88rem;
      }}
      footer span {{ color: var(--green); font-weight: 700; }}
      @media(max-width:760px) {{
        nav {{ height: auto; padding: 16px; flex-direction: column; align-items: flex-start; }}
        .nav-links {{ flex-wrap: wrap; }}
        .search-box {{ flex-direction: column; align-items: stretch; }}
        .summary-cards {{ grid-template-columns: 1fr; }}
        .scan-panel {{ grid-template-columns: 1fr; }}
      }}
    </style>
    </head>
    <body>

    <nav>
      <a href="#" class="logo">
        <div class="logo-icon">💊</div>
        Medico.AI
      </a>
      <div class="nav-links">
        <a href="#" class="active" onclick="showPage('home',this)">🏠 Home</a>
        <a href="#" onclick="showPage('upload',this)">📷 Upload Prescription</a>
        <a href="#" onclick="showPage('search',this)">🔍 Search Medicine</a>
        <a href="#" onclick="showPage('browse',this)">📋 Browse</a>
      </div>
      <div class="status-pill">
        <div class="dot"></div>
        <span id="statusText">Checking backend...</span>
      </div>
    </nav>

    <div id="page-home" class="page-section active">
      <div class="hero">
        <h1>💊 Find Cheaper Medicines<br>Save Up to 80%</h1>
        <p>Type any medicine name and instantly see affordable generic alternatives</p>
      </div>

      <div class="search-section">
        <div class="search-box">
          <span style="font-size:1.3rem">🔍</span>
          <input type="text" id="searchInput" placeholder="e.g. Augmentin, Crocin, Lipitor..." value="Augmentin">
          <button class="search-btn" onclick="searchHome()">Search →</button>
        </div>
        <p class="search-hint">💡 Try: Crocin · Augmentin · Metformin · Lipitor · Paracetamol</p>
      </div>

      <div class="main">
        <div class="how-section">
          <div class="section-title">✨ How It Works</div>
          <div class="steps">
            <div class="step-card">
              <div class="step-icon">📸</div>
              <div class="step-num">1</div>
              <h3>Upload or Search</h3>
              <p>Take a photo of your prescription or simply type the medicine name</p>
            </div>
            <div class="step-card">
              <div class="step-icon">🤖</div>
              <div class="step-num">2</div>
              <h3>AI Finds Alternatives</h3>
              <p>Our AI matches brands to their generic salt compositions instantly</p>
            </div>
            <div class="step-card">
              <div class="step-icon">💰</div>
              <div class="step-num">3</div>
              <h3>Save Money</h3>
              <p>See ranked cheaper options including Jan Aushadhi store prices</p>
            </div>
          </div>
        </div>

        <div id="resultsSection" style="display:none">
          <div class="section-title">📋 Results for "<span id="searchedName">Augmentin</span>"</div>
          <div id="resultsContent"></div>
        </div>
      </div>
    </div>

    <div id="page-upload" class="page-section">
      <div class="main" style="max-width:680px">
        <div class="section-title" style="margin-top:16px">📷 Upload Your Prescription</div>
        <div class="upload-card">
          <div class="upload-icon">🗒️</div>
          <h2>Take a Photo or Upload</h2>
          <p>Our AI will read your prescription and find cheaper alternatives for all medicines</p>
          <input id="prescriptionFile" type="file" accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff">
          <br>
          <button class="btn-upload" onclick="uploadPrescription()">📷 Analyse Prescription</button>
          <p style="margin-top:14px;font-size:0.82rem;color:#aaa">Supports JPG, PNG, WebP, BMP, TIFF · Max 10MB</p>
        </div>
        <div class="scan-panel">
          <div class="preview-box" id="previewBox">
            <div class="preview-empty">Selected prescription image will appear here</div>
          </div>
          <div class="scan-detail-box" id="scanDetails">
            <div class="section-title" style="margin-bottom:8px">Scan Details</div>
            <p style="color:var(--muted);font-weight:600">Choose an image, then run analysis to see detected medicine names and OCR confidence.</p>
          </div>
        </div>
        <div id="uploadResults"></div>
        <div class="disclaimer">
          <div class="disclaimer-icon">🔒</div>
          <p>Your prescription is processed securely. We only extract medicine names for comparison.</p>
        </div>
      </div>
    </div>

    <div id="page-search" class="page-section">
      <div class="main" style="max-width:680px">
        <div class="section-title" style="margin-top:16px">🔍 Search Medicine</div>
        <div class="search-box" style="margin-bottom:16px">
          <span style="font-size:1.3rem">🔍</span>
          <input id="searchPageInput" type="text" placeholder="Type medicine name...">
          <button class="search-btn" onclick="searchStandalone()">Search →</button>
        </div>
        <p class="search-hint" style="text-align:left;margin-bottom:24px">Popular: Crocin · Metformin · Atorvastatin · Pantoprazole · Azithromycin</p>
        <div id="searchPageResults"></div>
        <div class="disclaimer">
          <div class="disclaimer-icon">💡</div>
          <p>You can search by brand name like "Crocin" or generic name like "Paracetamol". Both work.</p>
        </div>
      </div>
    </div>

    <div id="page-browse" class="page-section">
      <div class="main">
        <div class="section-title" style="margin-top:16px">📋 Medicine Database</div>
        <div class="tabs" id="categoryTabs">
          <div class="tab active" onclick="browseMedicines('', this)">All</div>
        </div>
        <div id="browseResults" class="result-card" style="padding:24px;text-align:center;color:var(--muted)">
          <div style="font-size:2.5rem;margin-bottom:12px">📚</div>
          <strong style="font-size:1.1rem;font-family:'Nunito',sans-serif">Medicine database loading...</strong>
        </div>
      </div>
    </div>

    <footer>
      Made with ❤️ for India &nbsp;|&nbsp; <span>Medico.AI</span> &nbsp;|&nbsp; Always consult your doctor before switching medicines
    </footer>

    <script>
      const API_BASE = "{API_BASE}";
      const HEALTH_URL = "{HEALTH_URL}";

      function esc(value) {{
        return String(value ?? '').replace(/[&<>"']/g, ch => ({{
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }}[ch]));
      }}

      function rupee(value) {{
        const n = Number(value);
        return Number.isFinite(n) ? `₹${{n.toFixed(2)}}` : 'N/A';
      }}

      function showPage(name, el) {{
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        document.getElementById('page-' + name).classList.add('active');
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        if (el) el.classList.add('active');
        if (name === 'browse') loadBrowse();
      }}

      async function updateStatus() {{
        try {{
          const res = await fetch(HEALTH_URL);
          const data = await res.json();
          document.getElementById('statusText').textContent = data.database === 'connected'
            ? `${{data.medicines_in_db}} Medicines Ready`
            : 'Backend Online';
        }} catch (err) {{
          document.getElementById('statusText').textContent = 'Backend Offline';
          document.querySelector('.status-pill').style.borderColor = '#FF6B35';
          document.querySelector('.status-pill').style.color = '#c94a1a';
          document.querySelector('.status-pill').style.background = '#fff4ee';
        }}
      }}

      function summaryHtml(results) {{
        const found = results.filter(r => r.match_type !== 'none' && !r.error);
        const priced = found.filter(r => (r.alternatives || []).some(a => a.price_available !== false));
        let original = 0;
        let cheapest = 0;
        priced.forEach(r => {{
          const alts = (r.alternatives || []).filter(a => a.price_available !== false);
          if (!alts.length) return;
          cheapest += Number(alts[0].brand_price || 0);
          const matched = alts.find(a => String(a.brand_name).toLowerCase() === String(r.matched_brand || '').toLowerCase());
          original += matched ? Number(matched.brand_price || 0) : Math.max(...alts.map(a => Number(a.brand_price || 0)));
        }});
        const saved = Math.max(0, original - cheapest);
        const pct = original > 0 ? saved / original * 100 : 0;
        return `
          <div class="summary-cards">
            <div class="sum-card blue"><div class="big">${{found.length}}</div><div class="label">Medicine Found</div></div>
            <div class="sum-card orange"><div class="big">₹${{original.toFixed(0)}}</div><div class="label">Branded Price / Strip</div></div>
            <div class="sum-card green"><div class="big">₹${{cheapest.toFixed(0)}}</div><div class="label">Generic Price / Strip</div></div>
            <div class="sum-card save"><div class="big">₹${{saved.toFixed(0)}} 💚</div><div class="label">You Save (${{pct.toFixed(0)}}%!)</div></div>
          </div>`;
      }}

      function badgeFor(match) {{
        if (match.match_type === 'exact') return '<span class="badge badge-green">✅ Exact Match</span>';
        if (match.match_type === 'fuzzy') return `<span class="badge badge-orange">~ Fuzzy (${{match.fuzzy_score || 0}}%)</span>`;
        if (match.match_type === 'salt') return '<span class="badge badge-orange">~ Generic Match</span>';
        if (match.match_type === 'web') return '<span class="badge badge-orange">Web Source</span>';
        return '<span class="badge badge-muted">Matched</span>';
      }}

      function webSourceHtml(alt) {{
        const urls = (alt.source_urls || []).slice(0, 3);
        const links = urls.map((url, i) => `<a href="${{esc(url)}}" target="_blank" rel="noopener" style="color:white;text-decoration:underline">Source ${{i + 1}}</a>`).join(' · ');
        return `
          <div class="cheapest-banner" style="background:linear-gradient(90deg,#2563EB,#1e40af)">
            <div class="cheapest-icon">🌐</div>
            <div class="cheapest-text">
              <div class="title">Web info from ${{esc(alt.source || 'public drug databases')}}</div>
              <div class="sub">Generic: ${{esc(alt.generic_name || 'N/A')}} · Form: ${{esc(alt.form || alt.unit_type || 'N/A')}} · Strength: ${{esc(alt.strength || 'N/A')}}</div>
              <div class="sub">Prices are unavailable from this source. ${{links}}</div>
            </div>
          </div>`;
      }}

      function resultsHtml(results) {{
        const found = results.filter(r => r.match_type !== 'none' && !r.error);
        const notFound = results.filter(r => r.match_type === 'none' || r.error);
        if (!found.length && !notFound.length) return '<div class="error-msg">No medicines found. Try a different search.</div>';

        let html = summaryHtml(results);
        found.forEach(r => {{
          const alts = r.alternatives || [];
          if (r.match_type === 'web') {{
            const alt = alts[0] || {{}};
            html += `
            <div class="result-card">
              <div class="result-header">
                <div class="medicine-name">💊 ${{esc(r.matched_brand || r.query)}} ${{badgeFor(r)}}</div>
              </div>
              <div class="composition">🧪 Composition: <span>${{esc(r.salt_composition || alt.generic_name || '')}}</span></div>
              <div class="options-wrap">
                <table>
                  <thead>
                    <tr><th>Name</th><th>Generic</th><th>Manufacturer / Source</th><th>Form</th><th>Price</th></tr>
                  </thead>
                  <tbody>
                    <tr class="best-row">
                      <td><div class="option-name">${{esc(alt.brand_name || r.matched_brand || r.query)}}</div></td>
                      <td>${{esc(alt.generic_name || '')}}</td>
                      <td>${{esc(alt.manufacturer || alt.source || '')}}</td>
                      <td>${{esc((alt.strength || '') + ' ' + (alt.form || alt.unit_type || ''))}}</td>
                      <td><span class="badge badge-muted">Unavailable</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              ${{webSourceHtml(alt)}}
            </div>`;
            return;
          }}
          const rows = alts.map((a, index) => {{
            if (a.price_available === false) {{
              return `
              <tr>
                <td><div class="option-name">${{esc(a.brand_name)}}</div><span class="badge badge-orange">Web Source</span></td>
                <td>${{esc(a.generic_name)}}</td>
                <td>${{esc(a.manufacturer || a.source || '')}}</td>
                <td>${{esc((a.strength || '') + ' ' + (a.form || ''))}}</td>
                <td><span class="badge badge-muted">Unavailable</span></td>
                <td><span class="badge badge-muted">N/A</span></td>
              </tr>`;
            }}
            const best = index === 0 ? '<span class="star-badge">⭐ Best Value</span>' : '';
            const priceClass = index === 0 ? 'price-generic' : 'price-branded';
            const save = Number(a.savings_pct || 0) > 0
              ? `<span class="savings-chip">Save ${{Number(a.savings_pct || 0).toFixed(0)}}% 🎉</span>`
              : '<span class="badge badge-muted">Branded</span>';
            const jan = index === 0 && a.jan_aushadhi_price
              ? '<br><span class="badge badge-orange" style="font-size:0.72rem">Jan Aushadhi</span>'
              : '';
            return `
              <tr class="${{index === 0 ? 'best-row' : ''}}">
                <td><div class="option-name">${{esc(a.brand_name)}}</div>${{best}}${{jan}}</td>
                <td>${{esc(a.generic_name)}}</td>
                <td>${{esc(a.manufacturer)}}</td>
                <td>${{esc((a.strength || '') + ' ' + (a.form || ''))}}</td>
                <td><span class="price ${{priceClass}}">${{rupee(a.brand_price)}}</span></td>
                <td>${{save}}</td>
              </tr>`;
          }}).join('');
          const best = alts[0] || {{}};
          html += `
            <div class="result-card">
              <div class="result-header">
                <div class="medicine-name">💊 ${{esc(r.matched_brand || r.query)}} ${{badgeFor(r)}}</div>
                <button style="background:none;border:none;font-size:1.3rem;cursor:pointer;">▲</button>
              </div>
              <div class="composition">🧪 Active Ingredient: <span>${{esc(r.salt_composition || '')}}</span></div>
              <div class="options-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Option</th>
                      <th>Generic Salt Name</th>
                      <th>Manufacturer</th>
                      <th>Tablet Form</th>
                      <th>Price / Unit</th>
                      <th>You Save</th>
                    </tr>
                  </thead>
                  <tbody>${{rows}}</tbody>
                </table>
              </div>
              <div class="cheapest-banner">
                <div class="cheapest-icon">🏆</div>
                <div class="cheapest-text">
                  <div class="title">Best Deal: ${{esc(best.brand_name || 'Best option')}} @ ${{rupee(best.brand_price)}} per unit</div>
                  <div class="sub">You save ${{rupee(best.savings_vs_brand)}} (${{Number(best.savings_pct || 0).toFixed(0)}}%) compared to branded medicine.</div>
                </div>
              </div>
            </div>`;
        }});

        if (notFound.length) {{
          html += '<div class="result-card" style="padding:20px"><div class="section-title">❓ Not Identified</div>';
          notFound.forEach(r => html += `<div class="error-msg">${{esc(r.query)}} — ${{esc(r.error || 'No match found')}}</div>`);
          html += '</div>';
        }}

        html += `
          <div class="disclaimer">
            <div class="disclaimer-icon">⚠️</div>
            <p><strong>Important:</strong> Medico.AI is an information tool only. Always consult a registered pharmacist or doctor before switching any medicine. Generic medicines contain the same active ingredient but please verify with your healthcare provider.</p>
          </div>`;
        return html;
      }}

      async function searchMedicine(name, targetId) {{
        const target = document.getElementById(targetId);
        target.innerHTML = '<div class="loading">Searching cheaper alternatives...</div>';
        try {{
          const res = await fetch(`${{API_BASE}}/medicines/search?name=${{encodeURIComponent(name)}}`);
          if (!res.ok) throw new Error(await res.text());
          const data = await res.json();
          target.innerHTML = resultsHtml([data]);
        }} catch (err) {{
          target.innerHTML = `<div class="error-msg">Cannot reach backend. Is FastAPI running on port 8000?</div>`;
        }}
      }}

      function searchHome() {{
        const val = document.getElementById('searchInput').value.trim() || 'Augmentin';
        document.getElementById('searchedName').textContent = val;
        document.getElementById('resultsSection').style.display = 'block';
        searchMedicine(val, 'resultsContent');
        document.getElementById('resultsSection').scrollIntoView({{ behavior: 'smooth', block: 'start' }});
      }}

      function searchStandalone() {{
        const val = document.getElementById('searchPageInput').value.trim();
        if (!val) return;
        searchMedicine(val, 'searchPageResults');
      }}

      function medicineDetailsHtml(details) {{
        const meds = details && details.length ? details : [];
        if (!meds.length) {{
          return '<p style="color:var(--muted);font-weight:600">No medicine names detected yet.</p>';
        }}
        return `<div class="pill-list">${{meds.map(m => {{
          const extra = [m.form, m.dosage].filter(Boolean).join(' ');
          return `<span class="med-pill">💊 ${{esc(m.name || m)}}${{extra ? ` <small>${{esc(extra)}}</small>` : ''}}</span>`;
        }}).join('')}}</div>`;
      }}

      function scanDetailsHtml(data) {{
        const lines = (data.ocr_lines || []).slice(0, 12).map(line => `
          <div class="scan-line">
            <strong>${{Number(line.confidence || 0)}}%</strong>
            ${{esc(line.text || '')}}
          </div>
        `).join('');
        const steps = (data.ocr_processing_steps || []).slice(0, 5).map(esc).join(' · ');
        return `
          <div class="section-title" style="margin-bottom:8px">Detected Medicines (${{data.total_medicines_found || 0}})</div>
          ${{medicineDetailsHtml(data.extracted_medicine_details || [])}}
          <div style="margin-top:16px;color:var(--muted);font-weight:700;font-size:0.92rem">
            OCR: ${{esc(data.ocr_engine || 'none')}} · Confidence: ${{Number(data.ocr_confidence || 0)}}%
          </div>
          ${{steps ? `<div style="margin-top:6px;color:var(--muted);font-size:0.82rem">Passes: ${{steps}}</div>` : ''}}
          ${{lines ? `<div class="scan-lines">${{lines}}</div>` : ''}}
        `;
      }}

      async function uploadPrescription() {{
        const fileInput = document.getElementById('prescriptionFile');
        const target = document.getElementById('uploadResults');
        if (!fileInput.files.length) {{
          target.innerHTML = '<div class="error-msg">Please choose a prescription image first.</div>';
          return;
        }}
        const form = new FormData();
        form.append('file', fileInput.files[0]);
        form.append('ocr_engine', 'auto');
        target.innerHTML = '<div class="loading">Running OCR and AI analysis...</div>';
        try {{
          try {{
            await fetch(HEALTH_URL, {{ cache: 'no-store' }});
          }} catch (healthErr) {{
            throw new Error('Backend is not reachable. Start FastAPI on port 8000 and try again.');
          }}
          const res = await fetch(`${{API_BASE}}/upload`, {{ method: 'POST', body: form }});
          if (!res.ok) {{
            let message = await res.text();
            try {{
              const parsed = JSON.parse(message);
              message = parsed.detail || message;
            }} catch (parseErr) {{}}
            throw new Error(message);
          }}
          const data = await res.json();
          document.getElementById('scanDetails').innerHTML = scanDetailsHtml(data);
          target.innerHTML = `
            <div class="result-card" style="padding:20px">
              <div class="section-title">📄 Raw OCR Text</div>
              <pre style="white-space:pre-wrap;color:var(--muted)">${{esc(data.raw_text || '(empty)')}}</pre>
            </div>
          ` + resultsHtml(data.results || []);
        }} catch (err) {{
          target.innerHTML = `<div class="error-msg">Upload failed: ${{esc(err.message || 'Cannot reach backend. Please refresh and try again.')}}</div>`;
        }}
      }}

      async function loadCategories() {{
        try {{
          const res = await fetch(`${{API_BASE}}/categories`);
          const cats = await res.json();
          const wrap = document.getElementById('categoryTabs');
          cats.slice(0, 6).forEach(cat => {{
            const div = document.createElement('div');
            div.className = 'tab';
            div.textContent = cat;
            div.onclick = () => browseMedicines(cat, div);
            wrap.appendChild(div);
          }});
        }} catch (err) {{}}
      }}

      async function loadBrowse() {{
        const target = document.getElementById('browseResults');
        if (target.dataset.loaded) return;
        browseMedicines('', document.querySelector('#categoryTabs .tab'));
      }}

      async function browseMedicines(category, el) {{
        document.querySelectorAll('#categoryTabs .tab').forEach(t => t.classList.remove('active'));
        if (el) el.classList.add('active');
        const target = document.getElementById('browseResults');
        target.dataset.loaded = '1';
        target.innerHTML = '<div class="loading">Loading medicines...</div>';
        try {{
          const params = new URLSearchParams({{ limit: 80 }});
          if (category) params.set('category', category);
          const res = await fetch(`${{API_BASE}}/medicines?${{params}}`);
          const meds = await res.json();
          const rows = meds.map(m => {{
            const savings = Number(m.brand_price_per_unit || 0) - Number(m.generic_price_per_unit || 0);
            const pct = Number(m.brand_price_per_unit || 0) > 0 ? savings / Number(m.brand_price_per_unit) * 100 : 0;
            return `
              <tr>
                <td><div class="option-name">${{esc(m.brand_name)}}</div></td>
                <td>${{esc(m.generic_name)}}</td>
                <td>${{esc(m.salt_composition)}}</td>
                <td>${{esc(m.category)}}</td>
                <td><span class="price price-branded">${{rupee(m.brand_price_per_unit)}}</span></td>
                <td><span class="price price-generic">${{rupee(m.generic_price_per_unit)}}</span></td>
                <td><span class="savings-chip">${{pct.toFixed(0)}}%</span></td>
              </tr>`;
          }}).join('');
          target.className = 'result-card';
          target.style.padding = '0';
          target.innerHTML = `
            <div class="options-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Brand</th><th>Generic</th><th>Salt</th><th>Category</th>
                    <th>Brand Price</th><th>Generic Price</th><th>Savings</th>
                  </tr>
                </thead>
                <tbody>${{rows}}</tbody>
              </table>
            </div>`;
        }} catch (err) {{
          target.innerHTML = '<div class="error-msg">Cannot load medicine database.</div>';
        }}
      }}

      document.getElementById('searchInput').addEventListener('keydown', e => {{
        if (e.key === 'Enter') searchHome();
      }});
      document.getElementById('searchPageInput').addEventListener('keydown', e => {{
        if (e.key === 'Enter') searchStandalone();
      }});
      document.getElementById('prescriptionFile').addEventListener('change', e => {{
        const file = e.target.files && e.target.files[0];
        const preview = document.getElementById('previewBox');
        const details = document.getElementById('scanDetails');
        if (!file) {{
          preview.innerHTML = '<div class="preview-empty">Selected prescription image will appear here</div>';
          return;
        }}
        const url = URL.createObjectURL(file);
        preview.innerHTML = `<img src="${{url}}" alt="Selected prescription image">`;
        details.innerHTML = `
          <div class="section-title" style="margin-bottom:8px">Ready to Scan</div>
          <p style="color:var(--muted);font-weight:700">${{esc(file.name)}} · ${{(file.size / 1024).toFixed(1)}} KB</p>
          <p style="color:var(--muted);font-weight:600;margin-top:8px">Click Analyse Prescription to extract medicine names from this image.</p>
        `;
      }});

      updateStatus();
      loadCategories();
    </script>
    </body>
    </html>
    """
)

components.html(html_app, height=1500, scrolling=True)
