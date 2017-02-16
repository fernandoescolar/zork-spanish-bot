# Zork (en Español)
El juego Zork en Español en formato Bot usando Framework de Microsoft.

El código fuente está basado en un interprete de Z-Machine escrito en C# originariamente por Makoto Matsumoto y Takuji Nishimura. Portado por Thilo Planz a TypeScript y modificado por Fernando Escolar compilandolo en javascript y añadiendo funcionalidades de la api GLK (necesarias para ejecutar el juego Zork traducido).

El juego que utiliza es una versión de Zork traducida a partir de la versión Inform 7 de La Caverna (Zork). Para más información acerca de Inform 7 puedes visitar http://inform-fiction.org. Y para más información sobre la traducción puedes contactar con su autor Mauricio Díaz (mdiazg77[at]hotmail.com).

El resto del sistema está programado usando nodejs y el bot framework de Microsoft. 

Actualmente se encuentra hospedado en azure y usa una cuenta de Azure Storage para almacenar las partidas guardadas.

## Problemas conocidos
Existen varios problemas conocidos para los que no hemos encontrado solución:
- Nada más empezar el juego, si vas al norte o al sur, el bot tarda varios minutos en responder. Esto es debido a que el emulador que se usa tarda en procesar todo lo necesario.

## Disclaimer
Esto es una prueba de concepto que no está demasiado trabajada. Lo justo para funcionar. No esperes grandes novedades en el futuro.




