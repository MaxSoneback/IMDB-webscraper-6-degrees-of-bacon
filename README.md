En webscraper skrivet i Node.js som tar in namnet på 2 skådespelare och söker genom IMDB för att se hur många "degrees of separation" de är från varandra samt sparar både skådespelarnas och filmernas bildlänk. Exempel: Programmet tar in Julia Roberts och Ryan Reynolds. Julia Roberts har medverkat i "Gone in 60 Seconds" tillsammans med Michael Peña, som har medverkat i "Turbo" tillsammans med Ryan Reynolds. Programmet använder sig av en Breadth-First-Search-approach där en skådespelare först scannas på alla filmer, filmerna i sin tur scannas på alla skådespelare och så vidare.

Informationen hämtas från IMDB genom HTTP-requests med hjälp av Axios-paketet och responsen behandlas med jQuery-kommandon (detta görs möjligt av Cheerio).

TODO:
1. Koppla samman detta med någon typ av front-end för att visualisera sammankopplingen.

2. Just nu läses en nod av i taget. Detta funkar bra om två skådespelare varit med i samma film, är de dock fler än 2 filmer bort från varandra tar detta mycket lång tid.
  Lösning: Avlinjärisera processen. Flera noder kan scannas på grannar parallellt med varandra. Problem: IMDB lär ogilla att få 1000 http-requests i sekunden från samma IP-adress.
  
  Lösning 2: Ladda ner IMDB:s databaser från https://www.imdb.com/interfaces/ och hantera BFS-sökningen "in-house". När snabbaste vägen har hittats kan ID:t till filmerna/skådespelarna
  användas för att skicka några enstaka HTTP-requests för att hämta hem bilder och posters på/från skådespelare/filmer. Problem: Databaserna kräver större minne. De cirkulerar dock runt
  50-200MB per fil vilket inte är helt orimligt. Detta känns som den bästa approachen.
