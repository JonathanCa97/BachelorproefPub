# Run the following commands in the OpenFace dir::
# ./util/align-dlib.py ../OPRaw/ align outerEyesAndNose classify-test/aligned --size 96
# ./batch-represent/main.lua -outDir classify-test/features  -data classify-test/aligned
# ./demos/classifier.py train ./classify-test/features
# ./demos/classifier.py infer ./classify-test/features/classifier.pkl ../Type2/*
