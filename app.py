from flask import Flask, Response, request, redirect
import json
from astropy.io import fits
import numpy as np

app = Flask(__name__, static_url_path="/static")

fits_file = fits.open('./static/images/image.fits')
fits_data = fits_file[0].data

@app.route('/api/average-pixel-value')
def average_pixel_value():
    """
    Returns the average pixel value of specific region.
    Currently consider the region to be a rectangle.
    """
    data = json.loads(request.args['json'])
    coords = data['region']['geometry']['coordinates']
    x1, y1 = coords[0]
    x2, y2 = coords[2]
    if (x1>x2):
        x1, x2 = x2, x1
    if (y1>y2):
        y1, y2 = y2, y1
    area = fits_data[x1:x2, y1:y2]
    average_value = np.sum(area)/(area.shape[0]*area.shape[1] or 1)
    content = json.dumps({'value': average_value})
    return Response(mimetype='application/json', status=200, response=content)

@app.route('/')
def hello():
    return redirect('/static/index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=80)
