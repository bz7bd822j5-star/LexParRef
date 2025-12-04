#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extraction de tous les codes juridiques depuis PDF vers JSON
Génère des fichiers JSON pour recherche locale
"""

import PyPDF2
import re
import json
from typing import Dict, List
import sys

def extract_code(pdf_path: str, code_name: str, code_version: str) -> Dict:
    """Extrait tous les articles d'un code juridique"""
    
    print(f"\n📖 Extraction: {code_name}")
    print(f"   Fichier: {pdf_path}")
    
    try:
        with open(pdf_path, 'rb') as f:
            pdf = PyPDF2.PdfReader(f)
            total_pages = len(pdf.pages)
            print(f"   📄 Pages: {total_pages}")
            
            # Extraire tout le texte
            full_text = ""
            for i, page in enumerate(pdf.pages):
                if i % 100 == 0 and i > 0:
                    print(f"      ... page {i}/{total_pages}")
                full_text += page.extract_text() + "\n"
        
        print(f"   ✅ Texte extrait: {len(full_text)} caractères")
        
        # Parser les articles
        articles = {}
        
        # Pattern pour détecter un article
        # Format: "Article 123-45" ou "Article L234-1" ou "Article R625-1"
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
        
        print(f"   📚 Articles extraits: {len(articles)}")
        
        if len(articles) > 0:
            # Afficher quelques exemples
            print(f"   🔍 Exemples:")
            for i, (num, data) in enumerate(list(articles.items())[:3]):
                print(f"      - Article {num}: {data['texte'][:60]}...")
        
        return {
            "code": code_name,
            "date_extraction": "2025-12-04",
            "version": code_version,
            "total_articles": len(articles),
            "articles": articles
        }
    
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return {
            "code": code_name,
            "date_extraction": "2025-12-04",
            "version": code_version,
            "total_articles": 0,
            "articles": {},
            "error": str(e)
        }

def save_json(data: Dict, output_path: str):
    """Sauvegarde les données en JSON"""
    print(f"   💾 Sauvegarde: {output_path}")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Vérifier la taille
    import os
    size_kb = os.path.getsize(output_path) / 1024
    print(f"   ✅ Fichier: {size_kb:.1f} Ko")

if __name__ == "__main__":
    print("🚀 Extraction des codes juridiques\n")
    print("=" * 60)
    
    # Liste des codes à extraire
    codes = [
        {
            "pdf": "code-cgct.pdf",
            "name": "Code général des collectivités territoriales",
            "version": "2025",
            "output": "code-cgct.json"
        },
        {
            "pdf": "code-securite-interieure.pdf",
            "name": "Code de la sécurité intérieure",
            "version": "2025",
            "output": "code-securite-interieure.json"
        }
    ]
    
    results = []
    
    for code in codes:
        data = extract_code(code["pdf"], code["name"], code["version"])
        save_json(data, code["output"])
        results.append({
            "name": code["name"],
            "articles": data["total_articles"]
        })
        print()
    
    print("=" * 60)
    print("\n✨ Extraction terminée !\n")
    print("📊 Résumé:")
    for r in results:
        print(f"   • {r['name']}: {r['articles']} articles")
    print()
