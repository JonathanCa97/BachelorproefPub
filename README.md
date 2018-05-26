# Bachelorproef

[De bachelorproef](https://www.overleaf.com/read/zzkkkxkfftgj) wordt geschreven met behulp van Overleaf.

De kladversie wordt geschreven in volgende google documents: https://docs.google.com/document/d/1wzmfq5UJduSJDZ9yT8qA_gZ5-z_VQCj5rWz_lLTsIs4/edit?usp=sharing

De folders met de naam 'Others' zijn tijdelijk en niet belangrijk.

## Onderzoeksvraag 1 - Experimenten API's

De code hiervan vindt u in het mapje 'Project_ImageRecognitionAPIS'.
Iedere API bevat een apart .js file. De code om alles in Cloudinary te plaatsen is te vinden in cloud.js.
De code in verband met de MongoDB is te vinden in monoogse.js

### MongoDB opzetten

Omdat de experimenten met MonoDB werken, dient ook een MongoDB opgezet te worden. Dit kan makkelijk gedaan worden opgezet worden aan de hand van [Docker](https://docs.docker.com/samples/library/mongo/): https://docs.docker.com/samples/library/mongo/ . Deze moet draaien op poort 27017 op een databse genaamd 'imageRecognitionApis'.

### Packages installeren

Omdat dit project een NodeJS project is, dienen enkele packages geïnstalleerd te zijn. Ga naar de folder waar index.js sta en voer het commando `npm i` uit.

### ENV variabelen

Om de code te doen werken moeten er ook ENV variabelen opgezet worden. In de code kan u terugvinden welke dit zijn. Vaak zal u moeten accounts aanmaken zoals op cloudinary, Microsoft,...

### Uitvoeren experimenten

Om de testen zelf uit te voeren, dient index.js uitgevoerd te worden. In de code zelf kan u bepalen welke testen u wilt uitvoeren.

## Onderzoeksvraag 2 - Experimenten Libraries

De code hiervan vindt u in het mapje 'Project_ImageRecognitionLibraries'.
U kan de testen zelf uitvoeren indien u [Vagrant](https://www.vagrantup.com/) en [VirtualBox](https://www.virtualbox.org/wiki/Downloads) hebt
geïnstalleerd op uw pc.

### Vagrant opzetten en starten

Hiervoor moet u naar een map gaan die begint met de naam 'vagrant'. Iedere librarie heeft een aparte map. In deze map staat een 'Vagrantfile' in de map Project_ImageRecognition.
De allereerste keer dient u dit commando uit te voeren: `vagrant box add hashicorp/precise64`
Indien dit gedaan is, kan de virtuele machine opgestart worden met `vagrant up`.
Wanneer dit commando afgelopen is, kunt u in de machine gaan door het commando `vagrant ssh`.

### Opzetten experimenten

Om dan uiteindelijk de experimenten op te zetten, dient u eerst naar het mapje '/vagrant' te gaan (in de shell die werd opgestart door 'vagrant ssh'. U voert dus het commando `cd /vagrant` uit. Dan is de laatste stap om uiteindelijk het commando `source setup.sh` uit te voeren.

### Toevoegen afbeeldingen

Hierna zal een mapje 'Bachelorproef' verschijnen. Daarin zullen verschillende 'Type' folders verschijnen. In alle folders moeten er afbeeldingen zitten. Er zit een voorbeeld in van 1 persoon.

### Uitvoeren experimenten

Eens dit gedaan is, kunnen de experimenten uitgevoerd worden.
Voor de testen in de folder 'vagrantFacerecognition', dient u in het mapje 'Bachelorproef' te zitten, en het commando `python3 ./facerecognition.py` uit te voeren. Voor het mapje 'vagrantKerasdlibopencv' is dit `python ./setup.py`
