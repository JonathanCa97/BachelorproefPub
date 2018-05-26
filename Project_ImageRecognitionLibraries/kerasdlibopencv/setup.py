# http://krasserm.github.io/2018/02/07/deep-face-recognition/
import numpy as np
import os.path
import cv2
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import warnings
import csv
import time
from align import AlignDlib
from sklearn.metrics import f1_score, accuracy_score
from sklearn.preprocessing import LabelEncoder
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import LinearSVC
from model import create_model
from sklearn.manifold import TSNE

TYPES = 9

# Loading a predifined model
nn4_small2_pretrained = create_model()
nn4_small2_pretrained.load_weights('weights/nn4.small2.v1.h5')

# class to save image objects


class IdentityMetadata():
    def __init__(self, base, name, file):
        # dataset base directory
        self.base = base
        # identity name
        self.name = name
        # image file name
        self.file = file

    def __repr__(self):
        return self.image_path()

    def image_path(self):
        return os.path.join(self.base, self.name, self.file)

# loadig meta data


def load_metadata(path):
    metadata = []
    labels = set([])
    for i in os.listdir(path):
        label = i.split('-')[1]
        labels.add(label)
        if int(label) <= 41:
            for f in os.listdir(os.path.join(path, i)):
                metadata.append(IdentityMetadata(path, i, f))
    return np.array(metadata), labels

# calculate distance between 2 pictures


def distance(emb1, emb2):
    return np.sum(np.square(emb1 - emb2))

# loading image from path


def load_image(path):
    img = cv2.imread(path, 1)
    # OpenCV loads images with color channels
    # in BGR order. So we need to reverse them
    return img[..., ::-1]

# align image


def align_image(img):
    return alignment.align(96, img, alignment.getLargestFaceBoundingBox(img),
                           landmarkIndices=AlignDlib.OUTER_EYES_AND_NOSE)


# STEP 1:: Loading all images
metadata, meta_labels = load_metadata('images')

print('STEP 1:: metadata: ' + str(metadata))
print('STEP 1:: meta_labels: ' + str(meta_labels))
print('STEP 1:: metadata shape: ' + str(metadata.shape[0]))

# STEP 2:: Align and detect all images
# Initialize the OpenFace face alignment utility
alignment = AlignDlib('models/landmarks.dat')

# embedding images (128 measurements)
embedded = np.zeros((metadata.shape[0], 128))
print('STEP 2:: embedded: ' + str(embedded))
detected_labels = set([])
for i, m in enumerate(metadata):
    label = m.name.split('-')[1]
    if(int(label) <= 41):
        print('STEP 2:: going to embed image: ' + str(label))
        img = load_image(m.image_path())
        img = align_image(img)
        if img is not None:
            print('STEP 2:: image detected: ' + str(label))
            # scale RGB values to interval [0,1]
            img = (img / 255.).astype(np.float32)
            # obtain embedding vector for image
            embedded[i] = nn4_small2_pretrained.predict(
                np.expand_dims(img, axis=0))[0]
            detected_labels.add(label)


print('STEP 2:: embedded result: ' + str(embedded))

distances = []  # squared L2 distance between pairs
identical = []  # 1 if same identity, 0 otherwise

num = len(metadata)
print('doing distances')
for i in range(num - 1):
    for j in range(1, num):
        distances.append(distance(embedded[i], embedded[j]))
        identical.append(1 if metadata[i].name == metadata[j].name else 0)

distances = np.array(distances)
identical = np.array(identical)
print('tresholds')
thresholds = np.arange(0.3, 1.0, 0.01)
print('tresholds' + str(thresholds))
f1_scores = [f1_score(identical, distances < t) for t in thresholds]
print(len(f1_scores))
print(len(thresholds))
print(len(identical))
print('f1_scores ' + str(f1_scores))
opt_idx = np.argmax(f1_scores)
print('opt_idx' + str(opt_idx))
# Threshold at maximal F1 score
opt_tau = thresholds[opt_idx]
opt_acc = accuracy_score(identical, distances < opt_tau)
print('accurary at treshold ' + str(opt_tau) + ' is ' + str(opt_acc))

# STEP 3: training
print('STEP 3:: training')
targets = np.array([m.name for m in metadata])
print('STEP 3:: targets: ', targets)

encoder = LabelEncoder()
encoder.fit(targets)

# Numerical encoding of identities
y = encoder.transform(targets)

train_idx = np.arange(metadata.shape[0])
print('STEP 3:: train_idx: ' + str(train_idx))

X_train = embedded[train_idx]
print('STEP 3:: X_train: ' + str(X_train))

y_train = y[train_idx]
print('STEP 3:: y_train: ' + str(y_train))
knn = KNeighborsClassifier(n_neighbors=1, metric='euclidean')
knn.fit(X_train, y_train)

# Step 4:: predict
# Predict all images
for image_type in range(2, TYPES):
    print('Step 4:: checking type ' + str(image_type))
    image_type_path = '../Type' + str(image_type) + '/'
    csv_path = '../KERASDLIBOPENCV_RESULTS/Type' + str(image_type) + '.csv'
    csv_file = csv.writer(open(csv_path, 'wb+'))
    csv_file.writerow(['id', 'confidence', 'recgonized',
                       'detectedImage1', 'detectedImage2', 'responsetime', 'falseRecognized'])
    for image_file in os.listdir(image_type_path):
        label = int(image_file.split('_')[0])
        if label <= 41:
            if(str(label) in detected_labels):
                print('Step 4:: trying to predict ' + str(label))
                recognized = 0
                confidence = None
                detectedImage1 = 1
                detectedImage2 = 0
                responsetime = 0
                image = load_image(image_type_path + image_file)

                begin_time = int(round(time.time() * 1000))
                image = align_image(image)
                if image is not None:
                    detectedImage2 = 1
                    image = (image / 255.).astype(np.float32)
                    image = nn4_small2_pretrained.predict(
                        np.expand_dims(image, axis=0))[0]
                    print('Step 4:: image encode ' + str(image))
                    neighb = knn.kneighbors([image], 1)
                    print('Step 4:: neighbors ' +
                          str(neighb))
                    distance = neighb[0][0][0]
                    # prediction = knn.predict([image])
                    # print('Step 4:: prediction: ' + str(prediction))
                    end_time = int(round(time.time() * 1000))
                    responsetime = end_time - begin_time
                    # identity = encoder.inverse_transform(prediction)[0]
                    # and distance < opt_tau else 0
                    recognized = 1 if targets[neighb[1][0][0]].split(
                        '-')[1] == str(label) else 0
                    # print('Step 4:: predicted: ' + str(identity))
                    # print('Step 4:: recognized: ' + str(recognized))
                    csv_file.writerow(
                        [label, distance, recognized, detectedImage1, detectedImage2, responsetime, 1 if recognized == 0 and distance < opt_acc else 0])
                else:
                    print('Step 4:: second image was not detected')
                    csv_file.writerow(
                        [label, 0, recognized, detectedImage1, detectedImage2, responsetime, 0])

            else:
                print('Step 4:: first image was not detected')
                csv_file.writerow([label, 0, 0, 0, 0, 0, 0])
