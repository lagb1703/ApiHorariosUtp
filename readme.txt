antes de ejecutar cualquier comando del pakage.json debes ejecutar este comando:

$env:NODE_EXTRA_CA_CERTS = '.\\certificados\\intermediate.pem'

y luego ejecutar npm.

o puede instalar cross-env con:

npm i --save-dev cross-env

y ejecutar:

cross{comando}

las mayoria de mis funciones son asyncronicas, asi que sera necesario que utilises o .then o await