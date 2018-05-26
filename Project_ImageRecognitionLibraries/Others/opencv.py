import csv

import os

# Import OpenCV module
import cv2
# Import numpy to convert python lists to numpy arrays as
# It is needed by OpenCV face recognizers
import numpy as np


# import functions
from functions import prepare_training_data, predict

# SUBJECTS = ["", "Jonathan Callewaert", "Els Wielfaert", "Michael"]
TYPES = 8

print cv2.__version__

print "Preparing data..."
DETECTED_FACES, LABELS, DETECTED_FACES_CROPPED, FACES_BY_LABEL = prepare_training_data(
    "Type1")
print "Data prepared"
print FACES_BY_LABEL

# print total faces and LABELS
print("Total DETECTED_FACES: ", len(DETECTED_FACES))
print("Total LABELS: ", len(LABELS))

# create our LBPH face recognizer
face_recognizer_LBP = cv2.face.LBPHFaceRecognizer_create()
face_recognizer_eigen_face = cv2.face.EigenFaceRecognizer_create()

# train our face recognizer of our training faces
face_recognizer_LBP.train(DETECTED_FACES, np.array(LABELS))
face_recognizer_eigen_face.train(DETECTED_FACES_CROPPED, np.array(LABELS))

print("Predicting images...")

# load test images3
test_imgs = {}
for counter in range(1, TYPES):
    print 'Iterate type ' + str(counter)
    test_imgs[counter] = {}

    # preparing csv's
    LBPpath = './OPENCV_LBP_RESULTS/Type' + str(counter) + '.csv'
    EIGENpath = './OPENCV_EIGEN_RESULTS/Typ' + str(counter) + '.csv'
    # os.remove(LBPpath)
    # os.remove(EIGENpath)
    csvFileLBP = csv.writer(
        open(LBPpath, 'wb+'))
    csvFileLBP.writerow(['id', 'confidence', 'reconized',
                         'detectedImage1', 'detectedImage2', 'responsetime'])
    csvFileEIGEN = csv.writer(
        open(EIGENpath, 'wb+'))
    csvFileEIGEN.writerow(['id', 'confidence', 'reconized',
                           'detectedImage1', 'detectedImage2', 'responsetime'])
    for face_label in set(LABELS):
        print 'Going to predect face ' + str(face_label)
        readedFace = cv2.imread(
            "Type" + str(counter) + "/" + str(face_label) + "_.jpg")
        if readedFace is not None:
            predictResult = predict(
                readedFace, face_recognizer_LBP, face_recognizer_eigen_face)
            field = {face_label: [predictResult]}
            test_imgs[counter].update(field)

            # write rows to csv's
            lbp_result = predictResult['LBP']
            eigen_result = predictResult['eigen']
            detected1 = 1 if FACES_BY_LABEL[face_label] == 'D' else 0
            detected2 = 0 if lbp_result[0] == -1 else 1

            csvFileLBP.writerow([
                face_label, lbp_result[1],
                1 if lbp_result[0] == face_label else 0,
                detected1,
                detected2, lbp_result[2]])
            csvFileEIGEN.writerow([
                face_label, eigen_result[1],
                1 if eigen_result[0] == face_label else 0,
                detected1, detected2, lbp_result[2]])

print test_imgs


exit()
