import base64

input_file = './src/mapdraw/lib/text-color.png'
output_file = './src/base64/svg_b64.txt'

# with open(input_file, 'r') as f:
#     s = f.read()
#     b = base64.b64encode(s.encode('utf-8'))
with open(input_file, 'rb') as f:
    b = base64.b64encode(f.read())
with open(output_file, 'w') as f:
    f.write(str(b))