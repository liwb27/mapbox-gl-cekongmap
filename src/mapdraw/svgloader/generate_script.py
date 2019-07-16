import base64
import os
import re
# 读取svg目录下的所有文件，并生成index.js
output_file = open('./src/mapdraw/svgloader/index.js', 'w')
output_file.write("module.exports = function(map) {\n\
    const svgs = [];\n\
    const prefix = 'data:image/svg+xml;base64,';\n\
    var option = {'sdf':'true'}\n")

template_s = "svgs[{0}] = new Image({1},{2});\n\
    svgs[{0}].src = prefix + '{3}';\n\
    svgs[{0}].onload = () => map.addImage('{4}', svgs[{0}],option);\n\
    svgs[{0}].name = '{4}';\n"

pattern = r'viewBox="(.*?)"'
i=0
for root,dirs,files in os.walk('./src/mapdraw/svgloader/svg'):
    for fileName in files:
        with open(os.path.join(root,fileName), 'r') as f:
            svg_content = f.read()
            slist = re.findall(pattern, svg_content)[0].split(' ')
            b64 = base64.b64encode(svg_content.encode('utf-8'))
            
            s = template_s.format(str(i),(int(slist[2])/int(slist[3]))*32, 32, str(b64)[2:-1], fileName.split('.')[0])
            output_file.write(s)
            i += 1

output_file.write("return svgs;\n}")
output_file.close()