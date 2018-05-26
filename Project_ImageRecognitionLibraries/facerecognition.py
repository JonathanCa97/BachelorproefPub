import os
import sys
import csv
import time
import face_recognition

TYPE_FOLDER = './Type'
TYPE1_FOLDER = TYPE_FOLDER + '1'
TYPES = 9
RESULTS_PATH = './FACERECOGNITION_RESULTS/Type'

faces_encodings = {}
faces_encodings_indexes = {}
face_encodings_list = []
detected_faces = []


# Load faces and encode them
counter = 0
for filename in os.listdir(TYPE1_FOLDER):
    image_id = filename.split('_')[0]
    # if int(image_id) < 10:
    image_loaded = face_recognition.load_image_file(
        TYPE1_FOLDER + '/' + filename)
    print('encoding ' + str(filename))
    image_encoded_help = face_recognition.face_encodings(image_loaded)
    image_encoded = image_encoded_help[0] if image_encoded_help else None
    if image_id in faces_encodings:
        faces_encodings[image_id] = faces_encodings[image_id] + \
            [image_encoded]
    else:
        faces_encodings[image_id] = [image_encoded]
    if image_encoded is not None:
        print('detected image ' + str(filename))
        face_encodings_list.append(image_encoded)
        faces_encodings_indexes[counter] = image_id
        detected_faces.append(image_id)
        counter += 1
print(faces_encodings_indexes)

# Recognize faces
for counter in range(2, TYPES):
    # Preparing csv's
    csv_path = RESULTS_PATH + str(counter) + '.csv'
    csv_file = csv.writer(open(csv_path, 'w'))
    csv_file.writerow(['id', 'confidence', 'recognized',
                       'detectedImage1', 'detectedImage2', 'responsetime'])

    print('testing type ' + str(counter))
    folder = TYPE_FOLDER + str(counter)
    for filename in os.listdir(folder):
        # Declare variables for excel
        image_id = filename.split('_')[0]
        recognized = 0
        confidence = None
        detectedImage1 = 1 if detected_faces.count(image_id) > 0 else 0
        detectedImage2 = 0
        responsetime = 0

        # if int(image_id) < 2:
        print('trying to recognize ' + str(filename))
        unknown_image = face_recognition.load_image_file(
            folder + '/' + filename)
        begin_time = int(round(time.time() * 1000))
        face_locations_unknown = face_recognition.face_locations(
            unknown_image)
        unknown_image_encoding_help = face_recognition.face_encodings(
            unknown_image, face_locations_unknown)
        unknown_image_encoding = unknown_image_encoding_help[
            0] if unknown_image_encoding_help else None
        detectedImage2 = 1 if unknown_image_encoding is not None else 0
        print('detected face: ' + str(detectedImage2))
        if detectedImage2 == 1 and detectedImage1 == 1:
            matches = face_recognition.compare_faces(
                face_encodings_list, unknown_image_encoding)
            distances = face_recognition.face_distance(
                face_encodings_list, unknown_image_encoding)
            print('encoding time ' +
                  str(int(round(time.time() * 1000)) - begin_time))
            if True in matches:
                index = 0
                best_index = -1
                best_distance = 1
                for value in matches:
                    distance = distances[index]
                    if value and distance < best_distance:
                        best_distance = distance
                        best_index = index
                    index += 1
                end_time = int(round(time.time() * 1000))
                responsetime = end_time - begin_time
                confidence = best_distance
                recognized = 1 if best_index != - \
                    1 and image_id == faces_encodings_indexes[best_index] else 0
        print('recognized face: ', recognized)

        # Write rows to csv
        csv_file.writerow([image_id, confidence, recognized,
                           detectedImage1, detectedImage2, responsetime])
exit()
