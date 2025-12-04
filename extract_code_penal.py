#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extraction du Code Pénal depuis PDF vers JSON
Génère un fichier JSON avec tous les articles pour recherche locale
"""

import PyPDF2
import re
import json
from typing import Dict, List

def extract_code_penal(pdf_path: str) -> Dict:
    """Extrait tous les articles du Code Pénal"""
    
    print(f"📖 Lecture du PDF: {pdf_path}")
    
    with open(pdf_path, 'rb') as f:
        pdf = PyPDF2.PdfReader(f)
        total_pages = len(pdf.pages)
        print(f"📄 Nombre de pages: {total_pages}")
        
        # Extraire tout le texte
        full_text = ""
        for i, page in enumerate(pdf.pages):
            if i % 50 == 0:
                print(f"  ... page {i}/{total_pages}")
            full_text += page.extract_text() + "\n"
    
    print(f"✅ Texte extrait: {len(full_text)} caractères")
    
    # Parser les articles
    articles = {}
    
    # Pattern pour détecter un article
    # Format: "Article 123-45" suivi du texte jusqu'au prochain article
    article_pattern = r'Article\s+([0-9A-Z][0-9A-Z-]+)\s*\n+(.*?)(?=\n+Article\s+[0-9A-Z]|\Z)'
    
    matches = re.finditer(article_pattern, full_text, re.DOTALL | re.MULTILINE)
    
    for match in matches:
        article_num = match.group(1).strip()
        article_text = match.group(2).strip()
        
        # Nettoyer le texte
        article_text = re.sub(r'\s+', ' ', article_text)  # Normaliser les espaces
        article_text = article_text[:2000]  # Limiter à 2000 caractères
        
        if article_text and len(article_text) > 10:  # Ignorer les articles vides
            articles[article_num] = {
                "numero": article_num,
                "texte": article_text
            }
    
    print(f"📚 Articles extraits: {len(articles)}")
    
    # Afficher quelques exemples
    print("\n🔍 Exemples d'articles extraits:")
    for i, (num, data) in enumerate(list(articles.items())[:5]):
        print(f"  - Article {num}: {data['texte'][:80]}...")
    
    return {
        "code": "Code pénal",
        "date_extraction": "2025-12-04",
        "version": "08/11/2025",
        "total_articles": len(articles),
        "articles": articles
    }

def save_json(data: Dict, output_path: str):
    """Sauvegarde les données en JSON"""
    print(f"\n💾 Sauvegarde du JSON: {output_path}")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Vérifier la taille
    import os
    size_kb = os.path.getsize(output_path) / 1024
    print(f"✅ Fichier généré: {size_kb:.1f} Ko")

if __name__ == "__main__":
    print("🚀 Extraction du Code Pénal\n")
    
    # Extraction
    data = extract_code_penal("code-penal.pdf")
    
    # Sauvegarde
    save_json(data, "code-penal.json")
    
    print("\n✨ Extraction terminée !")
