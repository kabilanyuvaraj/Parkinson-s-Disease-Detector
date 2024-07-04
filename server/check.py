import warnings

warnings.filterwarnings("ignore")

import sys
from tensorflow.keras.models import load_model
import cv2 as cv
import numpy as np
import sys


img = sys.argv[1]
model_path = 'transfer_learning_model1.h5'
#print("hi")

model1 = load_model(model_path)
img = cv.imread(img)
img = cv.resize(img,(100,100))
img = img/255.0
img = np.expand_dims(img,axis=0)
predictions = model1.predict(img)

if predictions[0][0]>predictions[0][1]:
    print("Healthy"+" "+str(predictions[0][0])+" "+str(predictions[0][1]))
else:
    print("Parkinson"+" "+str(predictions[0][0])+" "+str(predictions[0][1]))

# a = sys.argv[1]
# b = sys.argv[2]
# print(a + b)