# from tensorflow.keras.models import load_model
# import cv2 as cv
# import numpy as np
# import base64
# import sys
# import json
model_path = 'transfer_learning_model1.h5'
print("hi")

# model1 = load_model(model_path)
# image_path=r"D:\srppdd\samples_from_person\p2.jpg"
#image_path = "D:/srp_pdd/datasets/Spiral/test/Parkinson/Parkinson3.png"
#image_path = "D:/srp_pdd/datasets/Spiral/test/Healthy/Healthy3.png"
# img = cv.imread(image_path)
# img = sys.argv[1]
# img = base64.b64decode(base64_img)
# nparr = np.frombuffer(img,np.uint8)
# img = cv.imdecode(nparr,cv.IMREAD_COLOR)
# cv.imshow("image",img)
# img = cv.resize(img,(100,100))
# img = img/255.0
# img = np.expand_dims(img,axis=0)
# predictions = model1.predict(img)

# if predictions[0][0]>predictions[0][1]:
#     # print("class 0")
#     #print(list(train_generator.class_indices.keys())[0])
#     print("Healthy")
#     sys.stdout.flush()
# else:
#     # print("class 1")
#     #print(list(train_generator.class_indices.keys())[1])
#     print("Parkinson")
#     sys.stdout.flush()
# cv.imshow("image",img)