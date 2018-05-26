# Import os module for reading training data directories and paths
import os
# Import OpenCV module
import cv2
# Import numpy to convert python lists to numpy arrays as
# It is needed by OpenCV face recognizers
import time

# SUBJECTS = ["", "Jonathan Callewaert", "Els Wielfaert", "Michael"]
TYPES = 8

print cv2.__version__


def detect_face(img):
    begin_time = int(round(time.time() * 1000))

    # convert the test image to gray image as opencv face detector expects gray images
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # load OpenCV face detector
    face_cascade = cv2.CascadeClassifier(
        'opencv-files/haarcascade_frontalface_alt2.xml')

    # let's detect multiscale (some images may be closer to camera than others) images
    # result is a list of facestest_img
    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.2, minNeighbors=5)
    print 'detect_face:: faces: ' + str(faces)

    # if no faces are detected then return original img
    if (len(faces) < 1):
        return None, None, None, None

    # under the assumption that there will be only one face,
    # extract the face area
    (x, y, w, h) = faces[0]

    # crop the image (for eigenfaces)
    # https://gist.github.com/tilfin/98bbba47fdc4ac10c4069cce5fabd834
    r = max(w, h) / 2
    centerx = x + w / 2
    centery = y + h / 2
    nx = int(centerx - r)
    ny = int(centery - r)
    nr = int(r * 2)
    faceimg = img[ny:ny+nr, nx:nx+nr]
    cropped_img = cv2.resize(faceimg, (150, 150))
    gray_cropped_img = cv2.cvtColor(cropped_img, cv2.COLOR_BGR2GRAY)

    # return only the face part of the image
    return gray[y:y+w, x:x+h], faces[0], gray_cropped_img, int(round(time.time() * 1000)) - begin_time

# this function will read all persons' training images, detect face from each image
# and will return two lists of exactly same size, one list
# of faces and another list of labels for each face


def prepare_training_data(data_folder_path):

    # ------STEP-1--------
    # list to hold all subject faces
    faces = []
    # list to hold labels for all SUBJECTS
    labels = []
    # list to hold all the cropped faces
    faces_cropped = []

    faces_by_label_obj = {}

    # let's go through each directory and read images within it
    print 'prepare_training_data:: start iterating images'
    for image in os.listdir(data_folder_path):
        print 'prepare_training_data:: image: ' + image
        # ------STEP-2--------
        # extract label number of subject from dir_name
        # format of dir name = slabel
        # , so removing letter 's' from dir_name will give us label
        label = int(image.split('_')[0])

        print 'prepare_training_data:: label: ' + str(label)
        # ------STEP-3--------
        # go through each image name, read image,
        # detect face and add face to list of faces

        # build image path
        # sample image path = training-data/s1/1.pgm
        image_path = data_folder_path + "/" + image

        # read image
        image = cv2.imread(image_path)

        # detect face
        face, rect, face_cropped, detect_time = detect_face(image)

        # ------STEP-4--------
        # for the purpose of this tutorial
        # we will ignore faces that are not detected
        if face is not None:
            # add face to list of faces
            faces.append(face)
            # add label for this face
            labels.append(label)
            # add cropped face to cropped face list
            faces_cropped.append(face_cropped)

            faces_by_label_obj[label] = 'D'
        elif label not in faces_by_label_obj:
            faces_by_label_obj[label] = 'ND'

    return faces, labels, faces_cropped, faces_by_label_obj

# this function recognizes the person in image passed
# and draws a rectangle around detected face with name of the
# subject


def predict(test_img, face_recognizer_LBP, face_recognizer_eigen_face):
    result = {
        'LBP': (-1, -1, 0),
        'eigen': (-1, -1, 0),
    }
    # make a copy of the image as we don't want to chang original image
    img = test_img.copy()
    # detect face from the image
    face, rect, face_cropped, face_detect_time = detect_face(img)

    if face is not None:
        begin_time = int(round(time.time() * 1000))
        # predict the image using our face recognifaces_by_label_objzer
        result['LBP'] = face_recognizer_LBP.predict(
            face) + ((int(round(time.time() * 1000)) - begin_time) + face_detect_time, )
        begin_time = int(round(time.time() * 1000))
        result['eigen'] = face_recognizer_eigen_face.predict(
            face_cropped) + ((int(round(time.time() * 1000)) - begin_time) + face_detect_time, )

    return result
