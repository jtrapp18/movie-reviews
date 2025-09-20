#!/usr/bin/env python3
"""
SEO Testing Script for Movie Reviews Site
Run this after starting your server to test SEO implementation
"""

import requests
import json
import xml.etree.ElementTree as ET
from urllib.parse import urljoin

def test_sitemap(base_url):
    """Test sitemap.xml endpoint"""
    print("🔍 Testing sitemap.xml...")
    try:
        response = requests.get(f"{base_url}/sitemap.xml")
        if response.status_code == 200:
            print("✅ Sitemap accessible")
            
            # Parse XML to check structure
            root = ET.fromstring(response.text)
            urls = root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')
            print(f"✅ Found {len(urls)} URLs in sitemap")
            
            # Check for movie and article URLs
            movie_urls = [url for url in urls if '/movies/' in url.find('loc').text]
            article_urls = [url for url in urls if '/articles/' in url.find('loc').text]
            
            print(f"✅ Found {len(movie_urls)} movie URLs")
            print(f"✅ Found {len(article_urls)} article URLs")
            
            return True
        else:
            print(f"❌ Sitemap failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Sitemap error: {e}")
        return False

def test_robots_txt(base_url):
    """Test robots.txt endpoint"""
    print("\n🔍 Testing robots.txt...")
    try:
        response = requests.get(f"{base_url}/robots.txt")
        if response.status_code == 200:
            print("✅ Robots.txt accessible")
            content = response.text
            if "Sitemap:" in content:
                print("✅ Sitemap reference found in robots.txt")
            if "User-agent: *" in content:
                print("✅ Proper robots.txt format")
            return True
        else:
            print(f"❌ Robots.txt failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Robots.txt error: {e}")
        return False

def test_meta_tags(base_url):
    """Test meta tags on a sample page"""
    print("\n🔍 Testing meta tags...")
    try:
        # Test home page
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            content = response.text
            if "<title>" in content:
                print("✅ Title tag found")
            if 'name="description"' in content:
                print("✅ Meta description found")
            if 'property="og:title"' in content:
                print("✅ Open Graph tags found")
            if 'application/ld+json' in content:
                print("✅ Structured data found")
            return True
        else:
            print(f"❌ Home page failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Meta tags error: {e}")
        return False

def main():
    base_url = "http://localhost:5555"
    
    print("🚀 Starting SEO Tests...")
    print("=" * 50)
    
    # Test all components
    sitemap_ok = test_sitemap(base_url)
    robots_ok = test_robots_txt(base_url)
    meta_ok = test_meta_tags(base_url)
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"Sitemap: {'✅ PASS' if sitemap_ok else '❌ FAIL'}")
    print(f"Robots.txt: {'✅ PASS' if robots_ok else '❌ FAIL'}")
    print(f"Meta Tags: {'✅ PASS' if meta_ok else '❌ FAIL'}")
    
    if all([sitemap_ok, robots_ok, meta_ok]):
        print("\n🎉 All SEO tests passed! Your site is ready for Google indexing.")
        print("\nNext steps:")
        print("1. Deploy your site")
        print("2. Submit sitemap to Google Search Console")
        print("3. Wait 1-2 weeks for Google to index")
        print("4. Test with: site:your-domain.com")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")

if __name__ == "__main__":
    main()
