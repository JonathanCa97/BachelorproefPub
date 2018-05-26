ov1.calculateSuccessRate <- function(vector) {
  countOnes <- length(which(vector == 1))
  return(countOnes/length(vector))
}
ov1.calculateFalseNotDetectRate <- function(dataset) {
  subDataset = dataset[dataset$recognized == 0,]
  countZeros = length(which(subDataset$detectedUrl2 == 0))
  return(countZeros/length(subDataset$recognized))
}
ov1.binConf <- function(vector) {
  p <- (length(which(vector == 1)))/(length(vector))
  return (p + c(-qnorm(0.975), qnorm(0.975), 0)*sqrt((p * (1-p))/length(vector)))
}

ov1.makeStackedBarChart <- function(dataset) {
  countOnes <- length(which(dataset$recognized == 1))
  countZeros = length(which(dataset$recognized == 0 & !is.na(dataset$confidence)))
  occur <- matric(c(countOnes))
}
ov1.countAccuracy <- function(dataset) {
  countOnes <- length(which(dataset$recognized == 1))
  return(countOnes)
}
ov1.countFalseSuccesRate <- function(dataset) {
  countZeros = length(which(dataset$recognized == 0 & !is.na(dataset$confidence)))
  return (countZeros)
}
ov1.countOng <- function(dataset) {
  count = length(which(dataset$recognized == 0 & is.na(dataset$confidence) & dataset$detectedImage2 == 0))
}

ov1.countResults <- function(dataset) {
  countOnes = length(which(dataset$recognized == 1))
  countFSR = length(which(dataset$recognized == 0 & !is.na(dataset$confidence)))
  countTFRMONG = length(which(dataset$recognized == 0 & is.na(dataset$confidence) & dataset$detectedImage2 == 1))
  countONG = length(which(dataset$recognized == 0 & is.na(dataset$confidence) & dataset$detectedImage2 == 0))
  total = length(dataset$recognized)
  countSum <- sum(c(countOnes,countFSR,countTFRMONG,countONG))
  return(c(countOnes,countFSR,countTFRMONG,countONG,total,countSum))
}

ov1.countResultsFacePP <- function(dataset) {
  countOnes = length(which(dataset$recognized == 1))
  countFSR = length(which(dataset$recognized == 0 & dataset$confidence >  73,975 ))
  countTFRMONG = length(which(dataset$recognized == 0 & dataset$confidence <= 73,975 & dataset$detectedUrl2 == 1))
  countONG = length(which(dataset$recognized == 0 & dataset$confidence <= 73,975 & dataset$detectedUrl2 == 0))
  total = length(dataset$recognized)
  countSum <- sum(c(countOnes,countFSR,countTFRMONG,countONG))
  return(c(countOnes,countFSR,countTFRMONG,countONG,total,countSum))
}

ov2.countResultsCombo <- function(dataset) {
  countOnes = length(which(dataset$filtered == 1))
  countFSR = length(which(dataset$falserecognized == 1))
  countTFRMONG = length(which(dataset$filtered == 0 & is.na(dataset$filteredDistances) & dataset$detectedImage2 == 1))
  countONG = length(which(dataset$filtered == 0 & is.na(dataset$filteredDistances) & dataset$detectedImage2 == 0))
  total = length(dataset$filtered)
  countSum <- sum(c(countOnes,countFSR,countTFRMONG,countONG))
  return(c(countOnes,countFSR,countTFRMONG,countONG,total,countSum))
}

ov2.calculateFalseRate <- function(dataset) {
  print('test')
  subDataset = dataset[dataset$recognized == 0 & !is.na(dataset$confidence),]
  print(subDataset)
  countZeros = length(which(subDataset$detectedImage2 == 0))
  # return(countZeros/length(subDataset$recognized))
}

ov1.meanResponseTimeWhenUrl2NotDetected <- function(dt1, dt2, dt3, dt4, dt5, dt6, dt7) {
  mdt1 <- mean(dt1$responsetime[dt1$detectedImage2!=0])
  print(mdt1)
  mdt2 <- mean(dt2$responsetime[dt2$detectedImage2!=0])
  print(mdt2)
  mdt3 <- mean(dt3$responsetime[dt3$detectedImage2!=0])
  print(mdt3)
  mdt4 <- mean(dt4$responsetime[dt4$detectedImage2!=0])
  print(mdt4)
  mdt5 <- mean(dt5$responsetime[dt5$detectedImage2!=0])
  print(mdt5)
  mdt6 <- mean(dt6$responsetime[dt6$detectedImage2!=0])
  print(mdt6)
  mdt7 <- mean(dt7$responsetime[dt7$detectedImage2!=0])
  print(mdt7)
  mn <- mean(c(mdt1, mdt2, mdt3, mdt4, mdt5, mdt6, mdt7))
  cat("mean",mn)
  return (mn)
}

ongPercentage <- function(dataset) {
  ong <- ov1.countOng(dataset)
  total <- length(dataset$recognized)
  return(ong/total)
}

ov1.tmp <- function() {
  
  #APIS
  #read csv's
  
  
  
  
  #stacked bar chat recognized
  library(ggplot2)
  face <- c(mean(FACEPP_ATTRIBUTES2_RESULTS$recognized), mean(FACEPP_ATTRIBUTES_RESULTS$recognized), mean(FACEPP_DARKER_RESULTS$recognized), mean(FACEPP_DISTANCE_RESULTS$recognized), mean(FACEPP_NORMAL_RESULTS$recognized), mean(FACEPP_SIDE_RESULTS$recognized), mean(FACEPP_TIME_RESULTS$recognized))
  kairos <- c(mean(KAIROS_ATTRIBUTES2_RESULTS$recognized), mean(KAIROS_ATTRIBUTES_RESULTS$recognized), mean(KAIROS_DARKER_RESULTS$recognized), mean(KAIROS_DISTANCE_RESULTS$recognized), mean(KAIROS_NORMAL_RESULTS$recognized), mean(KAIROS_SIDE_RESULTS$recognized), mean(KAIROS_TIME_RESULTS$recognized))
  microsoft <- c(mean(MICROSOFT_ATTRIBUTES2_RESULTS$recognized), mean(MICROSOFT_ATTRIBUTES_RESULTS$recognized), mean(MICROSOFT_DARKER_RESULTS$recognized), mean(MICROSOFT_DISTANCE_RESULTS$recognized), mean(MICROSOFT_NORMAL_RESULTS$recognized), mean(MICROSOFT_SIDE_RESULTS$recognized), mean(MICROSOFT_TIME_RESULTS$recognized))
  SkyBiometry <- c(mean(SKYBIOMETRY_ATTRIBUTES2_RESULTS$recognized), mean(SKYBIOMETRY_ATTRIBUTES_RESULTS$recognized), mean(SKYBIOMETRY_DARKER_RESULTS$recognized), mean(SKYBIOMETRY_DISTANCE_RESULTS$recognized), mean(SKYBIOMETRY_NORMAL_RESULTS$recognized), mean(SKYBIOMETRY_SIDE_RESULTS$recognized), mean(SKYBIOMETRY_TIME_RESULTS$recognized))
  microsoftTrained <- c(mean(MICROSOFTTRAINED_ATTRIBUTES2_RESULTS$recognized), mean(MICROSOFTTRAINED_ATTRIBUTES_RESULTS$recognized), mean(MICROSOFTTRAINED_DARKER_RESULTS$recognized), mean(MICROSOFTTRAINED_DISTANCE_RESULTS$recognized), mean(MICROSOFTTRAINED_NORMAL_RESULTS$recognized), mean(MICROSOFTTRAINED_SIDE_RESULTS$recognized), mean(MICROSOFTTRAINED_TIME_RESULTS$recognized))
  
  #barplot gemiddMelde accuraatheid
  data <- c(mean(face), mean(kairos), mean(microsoft), mean(microsoftTrained), mean(SkyBiometry))
  bplt <- barplot(data * 100, main = 'Gemiddelde accuraatheid per API', xlab = "API's", ylab = "Gemiddelde accuraatheid (in %)", names.arg = c("Face++","Kairos","Microsoft","Microsoft getraind", "SkyBiometry"), ylim = c(0,100))
  text(x=bplt, y=round(data*100,2), label=round(data*100,2), pos=1)
  
  #boxplot
  dframe <- data.frame("Face++"=c(mean(FACEPP_ATTRIBUTES2_RESULTS$recognized), mean(FACEPP_ATTRIBUTES_RESULTS$recognized), mean(FACEPP_DARKER_RESULTS$recognized), mean(FACEPP_DISTANCE_RESULTS$recognized), mean(FACEPP_NORMAL_RESULTS$recognized), mean(FACEPP_SIDE_RESULTS$recognized), mean(FACEPP_TIME_RESULTS$recognized)), 'Kairos'=c(mean(KAIROS_ATTRIBUTES2_RESULTS$recognized), mean(KAIROS_ATTRIBUTES_RESULTS$recognized), mean(KAIROS_DARKER_RESULTS$recognized), mean(KAIROS_DISTANCE_RESULTS$recognized), mean(KAIROS_NORMAL_RESULTS$recognized), mean(KAIROS_SIDE_RESULTS$recognized), mean(KAIROS_TIME_RESULTS$recognized)), Microsoft=c(mean(MICROSOFT_ATTRIBUTES2_RESULTS$recognized), mean(MICROSOFT_ATTRIBUTES_RESULTS$recognized), mean(MICROSOFT_DARKER_RESULTS$recognized), mean(MICROSOFT_DISTANCE_RESULTS$recognized), mean(MICROSOFT_NORMAL_RESULTS$recognized), mean(MICROSOFT_SIDE_RESULTS$recognized), mean(MICROSOFT_TIME_RESULTS$recognized)),"Microsoft getraind"=c(mean(MICROSOFTTRAINED_ATTRIBUTES2_RESULTS$recognized), mean(MICROSOFTTRAINED_ATTRIBUTES_RESULTS$recognized), mean(MICROSOFTTRAINED_DARKER_RESULTS$recognized), mean(MICROSOFTTRAINED_DISTANCE_RESULTS$recognized), mean(MICROSOFTTRAINED_NORMAL_RESULTS$recognized), mean(MICROSOFTTRAINED_SIDE_RESULTS$recognized), mean(MICROSOFTTRAINED_TIME_RESULTS$recognized)),"SkyBiometry"=c(mean(SKYBIOMETRY_ATTRIBUTES2_RESULTS$recognized), mean(SKYBIOMETRY_ATTRIBUTES_RESULTS$recognized), mean(SKYBIOMETRY_DARKER_RESULTS$recognized), mean(SKYBIOMETRY_DISTANCE_RESULTS$recognized), mean(SKYBIOMETRY_NORMAL_RESULTS$recognized), mean(SKYBIOMETRY_SIDE_RESULTS$recognized), mean(SKYBIOMETRY_TIME_RESULTS$recognized)))
  boxplot(x=(dframe) * 100, xlab="API's", ylab="gemiddelde accuraatheid (in %)", main="Spreiding gemiddelde accuraatheid API's", names=c('Face++', 'Kairos', 'Microsoft', 'Microsoft getraind', 'SkyBiometry'), ylim=c(0,100))
  
  #barplot accuraatheid apis per type
  data <- structure(list(Face=c(100L,95.12L,100L,97.30L,94.44L,100L,97.56L), Kairos=c(91.67L,53.67L,71.80L,81.08L,63.89L,77.78L,73.17L), Microsoft=c(97.22L,65.85L,84.61L,78.39L,88.89L,77.78L,82.93), MicrosoftG=c(97.22L,68.29L,82.05L,81.08L,91.67L,77.78L,85.37), SkyBiometry=c(100L,65.85L,51.28L,81.08L,94.44L,69.45L,90.24L)), .Names=c('Face++','Kairos', 'Microsoft', 'Microsoft getraind', 'SkyBiometry'), class="data.frame", row.names=c(NA, -7L))
  barplot(as.matrix(data), main="Gemiddelde accuraatheid per type", ylab = "Accuraatheid (in %)", xlab="API\'s", cex.lab = 1.5, cex.main = 1.4, beside=TRUE, col=colours)
  
  
  #t test Face++ en Kairos
  kairos <- c(91.67,53.67,71.80,81.08,63.89,77.78,73.17)
  facePP <- c(100,95.12,100,97.30,94.44,100,97.56)
  t.test(facePP, kairos, alternative = 'greater', paired = TRUE)
  
  #t test Face++ en microsoft getraind. 
  microsftTrained <- c(97.22,68.29,82.05,81.08,91.67,77.78,85.37)
  t.test(facePP, microsftTrained, alternative = 'greater', paired = TRUE)
  
  #t test Microsoft en Microsoft getraind
  
  #barplot per type
  #type 1
  data <- c(100.00,91.67,97.22,97.22,100.00)
  text(x=bplt, y=data, label=data, pos=1)
  bplt <- barplot(data, main = 'Gemiddelde slaagpercentages type 2', xlab = "API's", ylab = "Gemiddeld slaagpercentage (in %)", names.arg = c("Face++","Kairos","Microsoft","Microsoft getraind", "SkyBiometry"), ylim = c(0,100))
 # data <- structure(list(Face=c(100.00,95.12,100.00,97.30,64.44,100.00,97.56), Kairos=c(91.67,53.67,71.80,81.08,63.89,77.78,73.17), Microsoft = c(97.22,65.85,84.61,78.39,88.89,77.78,82.93), Microsoftgetraind=c(97.22,68.29,82.05,81.08,91.67,77.78,85.37), SkyBiometry=c(100,65.85,51.28,81.08,94.44,67.57,90.24)), .Names=c('Face++','Kairos','Microsoft','Microsoft getraind','SkyBiometry'), class='data.frame', row.names = c(NA, -7L))
  
  #type 2
  data <- c(100.00,91.67,97.22,97.22,100.00)
  text(x=bplt, y=data, label=data, pos=1)
  bplt <- barplot(data, main = 'Gemiddelde slaagpercentages type 2', xlab = "API's", ylab = "Gemiddeld slaagpercentage (in %)", names.arg = c("Face++","Kairos","Microsoft","Microsoft getraind", "SkyBiometry"), ylim = c(0,100))
  #type 3
  data <- c(95.12,53.67,65.85,68.29,65.85)
  bplt <- barplot(data, main = 'Gemiddelde slaagpercentages type 3', xlab = "API's", ylab = "Gemiddeld slaagpercentage (in %)", names.arg = c("Face++","Kairos","Microsoft","Microsoft getraind", "SkyBiometry"), ylim = c(0,100))
  text(x=bplt, y=data, label=data, pos=1)
  #type 4
  data <- c(100.00,71.80,84.61,82.05,51.28)
  bplt <- barplot(data, main = 'Gemiddelde slaagpercentages type 4', xlab = "API's", ylab = "Gemiddeld slaagpercentage (in %)", names.arg = c("Face++","Kairos","Microsoft","Microsoft getraind", "SkyBiometry"), ylim = c(0,100))
  text(x=bplt, y=data, label=data, pos=1)
  #type 5
  data <- c(97.30,81.08,78.39,81.08,81.08)
  bplt <- barplot(data, main = 'Gemiddelde slaagpercentages type 5', xlab = "API's", ylab = "Gemiddeld slaagpercentage (in %)", names.arg = c("Face++","Kairos","Microsoft","Microsoft getraind", "SkyBiometry"), ylim = c(0,100))
  text(x=bplt, y=data, label=data, pos=1)
   #type 6
  data <- c(94.44,63.89,88.89,91.67,94.44)
  bplt <- barplot(data, main = 'Gemiddelde slaagpercentages type 6', xlab = "API's", ylab = "Gemiddeld slaagpercentage (in %)", names.arg = c("Face++","Kairos","Microsoft","Microsoft getraind", "SkyBiometry"), ylim = c(0,100))
  text(x=bplt, y=data, label=data, pos=1)
  #type 7
  data <- c(100.00,77.78,77.78,77.78,67.57)
  bplt <- barplot(data, main = 'Gemiddelde slaagpercentages type 7', xlab = "API's", ylab = "Gemiddeld slaagpercentage (in %)", names.arg = c("Face++","Kairos","Microsoft","Microsoft getraind", "SkyBiometry"), ylim = c(0,100))
  text(x=bplt, y=data, label=data, pos=1)
   #type 8
  data <- c(97.56,73.17,82.93,85.37,90.24)
  bplt <- barplot(data, main = 'Gemiddelde slaagpercentages type 8', xlab = "API's", ylab = "Gemiddeld slaagpercentage (in %)", names.arg = c("Face++","Kairos","Microsoft","Microsoft getraind", "SkyBiometry"), ylim = c(0,100))
  text(x=bplt, y=data, label=data, pos=1)
  
  #algemene vergelijking
  #responsetime #skybio appart getest wegen n responsetime
  FS <- ov1.meanResponseTimeWhenUrl2NotDetected(FACEPP_ATTRIBUTES2_RESULTS, FACEPP_ATTRIBUTES_RESULTS, FACEPP_DARKER_RESULTS, FACEPP_DISTANCE_RESULTS, FACEPP_NORMAL_RESULTS, FACEPP_SIDE_RESULTS, FACEPP_TIME_RESULTS)
  MST <- ov1.meanResponseTimeWhenUrl2NotDetected(MICROSOFTTRAINED_ATTRIBUTES2_RESULTS, MICROSOFTTRAINED_ATTRIBUTES_RESULTS, MICROSOFTTRAINED_DARKER_RESULTS, MICROSOFTTRAINED_DISTANCE_RESULTS, MICROSOFTTRAINED_NORMAL_RESULTS, MICROSOFTTRAINED_SIDE_RESULTS, MICROSOFTTRAINED_TIME_RESULTS)
  KS <- ov1.meanResponseTimeWhenUrl2NotDetected(KAIROS_ATTRIBUTES2_RESULTS, KAIROS_ATTRIBUTES_RESULTS, KAIROS_DARKER_RESULTS, KAIROS_DISTANCE_RESULTS, KAIROS_NORMAL_RESULTS, KAIROS_SIDE_RESULTS, KAIROS_TIME_RESULTS)
  MS <- ov1.meanResponseTimeWhenUrl2NotDetected(MICROSOFT_ATTRIBUTES2_RESULTS, MICROSOFT_ATTRIBUTES_RESULTS, MICROSOFT_DARKER_RESULTS, MICROSOFT_DISTANCE_RESULTS, MICROSOFT_NORMAL_RESULTS, MICROSOFT_SIDE_RESULTS, MICROSOFT_TIME_RESULTS)
  SS <- ov1.meanResponseTimeWhenUrl2NotDetected(SKYBIOMETRY_ATTRIBUTES2_RESULTS, SKYBIOMETRY_ATTRIBUTES_RESULTS, SKYBIOMETRY_DARKER_RESULTS, SKYBIOMETRY_DISTANCE_RESULTS, SKYBIOMETRY_NORMAL_RESULTS, SKYBIOMETRY_SIDE_RESULTS, SKYBIOMETRY_TIME_RESULTS)

  data <- c(FS, KS, MS, MST, SS)
  bplt <- barplot(data, main = 'Gemiddelde algemene responsetime', xlab = "API's", ylab = "Gemiddeld responsetime (in mms)", names.arg = c("Face++","Kairos","Microsoft","Microsoft getraind", "SkyBiometry"))
  
  #foutratio
  data <- c(28.57,0.35,0.79,0.40,3.99)
  bplt <- barplot(data, main = 'Gemiddelde foutratio\'s', xlab = "API's", ylab = "Gemiddeld foutratio (in %)", names.arg = c("Face++","Kairos","Microsoft","Microsoft getraind", "SkyBiometry"), ylim = c(0,100))
  text(x=bplt, y=data, label=data, pos=3)
  
  #LIBRARIES
  #facerecognition
  ibrary(readr)
  Type2 <- read_csv("Project_ImageRecognitionLibraries/FACERECOGNITION_RESULTS/Type2.csv")
  Type3 <- read_csv("Project_ImageRecognitionLibraries/FACERECOGNITION_RESULTS/Type3.csv")
  Type4 <- read_csv("Project_ImageRecognitionLibraries/FACERECOGNITION_RESULTS/Type4.csv")
  Type5 <- read_csv("Project_ImageRecognitionLibraries/FACERECOGNITION_RESULTS/Type5.csv")
  Type6 <- read_csv("Project_ImageRecognitionLibraries/FACERECOGNITION_RESULTS/Type6.csv")
  Type7 <- read_csv("Project_ImageRecognitionLibraries/FACERECOGNITION_RESULTS/Type7.csv")
  Type8 <- read_csv("Project_ImageRecognitionLibraries/FACERECOGNITION_RESULTS/Type8.csv")
  
  mean(Type2$recognized)
  mean(Type3$recognized)
  mean(Type4$recognized)
  mean(Type5$recognized)
  mean(Type6$recognized)
  mean(Type7$recognized)
  mean(Type8$recognized)
  
  ov2.calculateFalseNotDetectRate(Type2)
  ov2.calculateFalseNotDetectRate(Type3)
  ov2.calculateFalseNotDetectRate(Type4)
  ov2.calculateFalseNotDetectRate(Type5)
  ov2.calculateFalseNotDetectRate(Type6)
  ov2.calculateFalseNotDetectRate(Type7)
  ov2.calculateFalseNotDetectRate(Type8)
  
  #stacked barchart
  ov1.countResults(Type2)
  ov1.countResults(Type3)
  ov1.countResults(Type4)
  ov1.countResults(Type5)
  ov1.countResults(Type6)
  ov1.countResults(Type7)
  ov1.countResults(Type8)
  
  ##results stacked barchar
  mean(c(mean(Type2$recognized),mean(Type3$recognized),mean(Type4$recognized),mean(Type5$recognized),mean(Type6$recognized),mean(Type7$recognized),mean(Type8$recognized)))
  sd(c(mean(Type2$recognized),mean(Type3$recognized),mean(Type4$recognized),mean(Type5$recognized),mean(Type6$recognized),mean(Type7$recognized),mean(Type8$recognized)))
  
  #stacked barchart
  ov2.countResultsCombo(Type2)
  ov2.countResultsCombo(Type3)
  ov2.countResultsCombo(Type4)
  ov2.countResultsCombo(Type5)
  ov2.countResultsCombo(Type6)
  ov2.countResultsCombo(Type7)
  ov2.countResultsCombo(Type8)
  
  ##results stacked barchar
  mean(c(mean(Type2$filtered),mean(Type3$filtered),mean(Type4$filtered),mean(Type5$filtered),mean(Type6$filtered),mean(Type7$filtered),mean(Type8$filtered)))
  sd(c(mean(Type2$filtered),mean(Type3$filtered),mean(Type4$filtered),mean(Type5$filtered),mean(Type6$filtered),mean(Type7$filtered),mean(Type8$filtered)))
  
  #mean accuracy per library
  data <- c(84.12, 60.56)
  bplt <- barplot(data, main = 'Gemiddelde accuraatheid per library', xlab = "Libraries", ylab = "Gemiddelde accuraatheid (in %)", names.arg = c("Ageitgey facerecognition","Keras + Dlib + OpenCV"), ylim = c(0,100))
  text(x=bplt, y=data, label=data, pos=1)
  
  #mean fr 
  data <- c(20.01, 36.14)
  bplt <- barplot(data, main = 'Gemiddelde foutratio per library', xlab = "Libraries", ylab = "Gemiddelde foutraio (in %)", names.arg = c("Ageitgey facerecognition","Keras + Dlib + OpenCV"), ylim = c(0,100))
  text(x=bplt, y=data, label=data, pos=1)
  
  #mean resp
  resp2 <- ov1.meanResponseTimeWhenUrl2NotDetected(Type2,Type3,Type4,Type5,Type6,Type7,Type8)
  resp1 <- ov1.meanResponseTimeWhenUrl2NotDetected(Type2,Type3,Type4,Type5,Type6,Type7,Type8)
  data <- c(resp1, resp2)
  bplt <- barplot(data, main = 'Gemiddelde responsetime per library', xlab = "Libraries", ylab = "Gemiddelde responsetime (in mms)", names.arg = c("Ageitgey facerecognition","Keras + Dlib + OpenCV"))
  text(x=bplt, y=data, label=data, pos=1)
  
}
