import zipfile
import re
import xml.etree.ElementTree as ET

def extract(path):
    try:
        with zipfile.ZipFile(path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            # The namespace for Word text elements
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            text = []
            for t in tree.iterfind('.//w:t', ns):
                if t.text:
                    text.append(t.text)
            
            with open(r'd:\TaskCraft\Docs\extracted.txt', 'w', encoding='utf-8') as f:
                f.write('\n'.join(text))
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    extract(r"d:\TaskCraft\Docs\1ST-merged-merged.docx")
