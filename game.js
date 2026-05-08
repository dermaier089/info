public class Tierspiel extends Ereignisbehandlung { 

  

   int BREITE = 800; 

   int HOEHE = 500; 

   int BODEN_Y = 360; 

   int TIER_X = 120; 

  

   int TIERWECHSEL_MIN_TAKTE = 125; 

   int TIERWECHSEL_MAX_TAKTE = 375; 

   int SPAWN_MIN_TAKTE = 55; 

   int SPAWN_MAX_TAKTE = 110; 

   int NAHRUNG_GESCHWINDIGKEIT = 5; 

  

   // ===== FARBEN — hier zentral anpassen ===== 

   String FARBE_HIMMEL = "cyan"; 

   String FARBE_BODEN = "gruen"; 

   String FARBE_TEXT = "schwarz"; 

  

   String FARBE_KATZE = "rot"; 

   String FARBE_TIGER = "magenta"; 

   String FARBE_HUHN = "cyan"; 

  

   private ArrayList<Tier> alleTiere; 

   private ArrayList<Nahrung> nahrungAufFeld; 

   private String[] alleItems = { 

      "Fisch", "Maus", "Milch", 

      "Hase", "Reh", "Wildschwein", 

      "Korn", "Wurm", "Beere", 

      "Stein", "Schuh", "Auto" 

   }; 

  

   private Tier aktuellesTier; 

   private int leben; 

   private int punkte; 

   private boolean gameOver; 

  

   private boolean springt; 

   private int sprungOffsetY; 

   private int sprungVel; 

  

   private int taktZaehler; 

   private int letzterTierwechselTakt; 

   private int naechsterTierwechselTakte; 

   private int letzterSpawnTakt; 

   private int naechsterSpawnTakte; 

  

   private Rechteck himmel; 

   private Rechteck boden; 

   private GText statusText; 

   private GText futterText; 

   private GText hilfeText; 

   private GText gameOverText; 

   private GText gameOverScore; 

  

   public Tierspiel() { 

      alleTiere = new ArrayList<Tier>(); 

      nahrungAufFeld = new ArrayList<Nahrung>(); 

      leben = 3; 

      punkte = 0; 

      gameOver = false; 

      springt = false; 

      sprungOffsetY = 0; 

      sprungVel = 0; 

      taktZaehler = 0; 

      letzterTierwechselTakt = 0; 

      letzterSpawnTakt = 0; 

  

      himmel = new Rechteck(); 

      himmel.PositionSetzen(0, 0); 

      himmel.GrößeSetzen(BREITE, BODEN_Y + 40); 

      himmel.FarbeSetzen(FARBE_HIMMEL); 

      himmel.GanzNachHintenBringen(); 

  

      boden = new Rechteck(); 

      boden.PositionSetzen(0, BODEN_Y + 40); 

      boden.GrößeSetzen(BREITE, HOEHE - BODEN_Y - 40); 

      boden.FarbeSetzen(FARBE_BODEN); 

  

      Tier katze = new Tier("Katze", FARBE_KATZE, false, false); 

      katze.kannEssen.add("Fisch"); 

      katze.kannEssen.add("Maus"); 

      katze.kannEssen.add("Milch"); 

      alleTiere.add(katze); 

  

      Tier tiger = new Tier("Tiger", FARBE_TIGER, true, false); 

      tiger.kannEssen.add("Hase"); 

      tiger.kannEssen.add("Reh"); 

      tiger.kannEssen.add("Wildschwein"); 

      alleTiere.add(tiger); 

  

      Tier huhn = new Tier("Huhn", FARBE_HUHN, false, true); 

      huhn.kannEssen.add("Korn"); 

      huhn.kannEssen.add("Wurm"); 

      huhn.kannEssen.add("Beere"); 

      alleTiere.add(huhn); 

  

      for (Tier t : alleTiere) { 

         t.zeichne(); 

         t.positionSetzen(TIER_X, BODEN_Y); 

         t.verstecken(); 

      } 

      aktuellesTier = alleTiere.get(beliebig(alleTiere.size())); 

      aktuellesTier.zeigen(); 

  

      statusText = new GText(); 

      statusText.PositionSetzen(10, 25); 

      statusText.TextGrößeSetzen(18); 

      statusText.FarbeSetzen(FARBE_TEXT); 

  

      futterText = new GText(); 

      futterText.PositionSetzen(10, 50); 

      futterText.TextGrößeSetzen(14); 

      futterText.FarbeSetzen(FARBE_TEXT); 

  

      hilfeText = new GText(); 

      hilfeText.PositionSetzen(10, 70); 

      hilfeText.TextGrößeSetzen(12); 

      hilfeText.FarbeSetzen(FARBE_TEXT); 

      hilfeText.TextSetzen("Leertaste = springen | R = Neustart"); 

  

      statusAktualisieren(); 

  

      naechsterTierwechselTakte = beliebigImBereich(TIERWECHSEL_MIN_TAKTE, TIERWECHSEL_MAX_TAKTE); 

      naechsterSpawnTakte = beliebigImBereich(SPAWN_MIN_TAKTE, SPAWN_MAX_TAKTE); 

  

      TaktdauerSetzen(40); 

      Starten(); 

   } 

  

   private int beliebig(int max) { 

      return (int)(max * Math.random()); 

   } 

  

   private int beliebigImBereich(int min, int max) { 

      return min + beliebig(max - min + 1); 

   } 

  

   public void TaktImpulsAusführen() { 

      if (gameOver) { 

         return; 

      } 

      taktZaehler = taktZaehler + 1; 

  

      if (taktZaehler - letzterTierwechselTakt >= naechsterTierwechselTakte) { 

         Tier neu = aktuellesTier; 

         while (neu == aktuellesTier && alleTiere.size() > 1) { 

            neu = alleTiere.get(beliebig(alleTiere.size())); 

         } 

         aktuellesTier.verstecken(); 

         aktuellesTier = neu; 

         aktuellesTier.zeigen(); 

         aktuellesTier.positionSetzen(TIER_X, BODEN_Y + sprungOffsetY); 

         letzterTierwechselTakt = taktZaehler; 

         naechsterTierwechselTakte = beliebigImBereich(TIERWECHSEL_MIN_TAKTE, TIERWECHSEL_MAX_TAKTE); 

         statusAktualisieren(); 

      } 

  

      if (taktZaehler - letzterSpawnTakt >= naechsterSpawnTakte) { 

         String itemArt = alleItems[beliebig(alleItems.length)]; 

         Nahrung n = new Nahrung(itemArt, BREITE, BODEN_Y + 20); 

         n.zeichne(); 

         nahrungAufFeld.add(n); 

         letzterSpawnTakt = taktZaehler; 

         naechsterSpawnTakte = beliebigImBereich(SPAWN_MIN_TAKTE, SPAWN_MAX_TAKTE); 

      } 

  

      for (Nahrung n : nahrungAufFeld) { 

         n.x = n.x - NAHRUNG_GESCHWINDIGKEIT; 

         n.positionSetzen(n.x, n.y); 

      } 

  

      if (springt) { 

         sprungOffsetY = sprungOffsetY + sprungVel; 

         sprungVel = sprungVel + 1; 

         if (sprungOffsetY >= 0) { 

            sprungOffsetY = 0; 

            sprungVel = 0; 

            springt = false; 

         } 

         aktuellesTier.positionSetzen(TIER_X, BODEN_Y + sprungOffsetY); 

      } 

  

      ArrayList<Nahrung> entfernen = new ArrayList<Nahrung>(); 

      boolean tierUnten = sprungOffsetY > -20; 

      for (Nahrung n : nahrungAufFeld) { 

         boolean ueberlapptX = n.x + 30 >= TIER_X && n.x <= TIER_X + 60; 

         if (ueberlapptX && tierUnten && !n.bearbeitet) { 

            n.bearbeitet = true; 

            if (aktuellesTier.kannEssen.contains(n.art)) { 

               punkte = punkte + 10; 

            } else { 

               leben = leben - 1; 

            } 

            entfernen.add(n); 

         } else if (n.x + 40 < 0 && !n.bearbeitet) { 

            n.bearbeitet = true; 

            if (!aktuellesTier.kannEssen.contains(n.art)) { 

               punkte = punkte + 5; 

            } 

            entfernen.add(n); 

         } 

      } 

      for (Nahrung n : entfernen) { 

         n.entfernen(); 

         nahrungAufFeld.remove(n); 

      } 

      if (entfernen.size() > 0) { 

         statusAktualisieren(); 

      } 

  

      if (leben <= 0 && !gameOver) { 

         gameOver = true; 

         zeigeGameOver(); 

      } 

   } 

  

   private void statusAktualisieren() { 

      statusText.TextSetzen("Tier: " + aktuellesTier.art + "   Leben: " + leben + "   Punkte: " + punkte); 

      String s = "Frisst: "; 

      for (int i = 0; i < aktuellesTier.kannEssen.size(); i++) { 

         if (i > 0) { 

            s = s + ", "; 

         } 

         s = s + aktuellesTier.kannEssen.get(i); 

      } 

      futterText.TextSetzen(s); 

   } 

  

   private void zeigeGameOver() { 

      gameOverText = new GText(); 

      gameOverText.PositionSetzen(BREITE / 2 - 100, HOEHE / 2 - 20); 

      gameOverText.TextGrößeSetzen(40); 

      gameOverText.FarbeSetzen(FARBE_KATZE); 

      gameOverText.TextSetzen("GAME OVER"); 

  

      gameOverScore = new GText(); 

      gameOverScore.PositionSetzen(BREITE / 2 - 120, HOEHE / 2 + 25); 

      gameOverScore.TextGrößeSetzen(18); 

      gameOverScore.FarbeSetzen(FARBE_TEXT); 

      gameOverScore.TextSetzen("Punkte: " + punkte + "   (R = neu starten)"); 

   } 

  

   private void neustart() { 

      for (Nahrung n : nahrungAufFeld) { 

         n.entfernen(); 

      } 

      nahrungAufFeld.clear(); 

      if (gameOverText != null) { 

         gameOverText.Entfernen(); 

         gameOverText = null; 

      } 

      if (gameOverScore != null) { 

         gameOverScore.Entfernen(); 

         gameOverScore = null; 

      } 

      leben = 3; 

      punkte = 0; 

      gameOver = false; 

      springt = false; 

      sprungOffsetY = 0; 

      sprungVel = 0; 

      aktuellesTier.positionSetzen(TIER_X, BODEN_Y); 

      statusAktualisieren(); 

   } 

  

   public void TasteGedrückt(char taste) { 

      if (taste == ' ' && !springt && !gameOver) { 

         springen(); 

      } 

      if ((taste == 'r' || taste == 'R') && gameOver) { 

         neustart(); 

      } 

   } 

  

   public void SonderTasteGedrückt(int taste) { 

      if (taste == 32 && !springt && !gameOver) { 

         springen(); 

      } 

   } 

  

   private void springen() { 

      springt = true; 

      sprungVel = -22; 

      sprungOffsetY = -1; 

   } 

  

   public static void main(String[] args) { 

      new Tierspiel(); 

   } 

} 

  

// ===== Tier (eigene Klasse, nicht verschachtelt) ===== 

class Tier { 

   String art; 

   String hauptfarbe; 

   String augenfarbe = "schwarz"; 

   String streifenfarbe = "schwarz"; 

   String schnabelfarbe = "rot"; 

   String kammfarbe = "rot"; 

   boolean hatStreifen; 

   boolean istHuhn; 

   ArrayList<String> kannEssen; 

  

   Rechteck koerper; 

   Kreis kopf; 

   Kreis auge; 

   Dreieck ohrLinks; 

   Dreieck ohrRechts; 

   Rechteck streifen1; 

   Rechteck streifen2; 

   Rechteck streifen3; 

   Dreieck schnabel; 

   Dreieck kamm; 

  

   Tier(String pArt, String pFarbe, boolean pStreifen, boolean pHuhn) { 

      art = pArt; 

      hauptfarbe = pFarbe; 

      hatStreifen = pStreifen; 

      istHuhn = pHuhn; 

      kannEssen = new ArrayList<String>(); 

   } 

  

   void zeichne() { 

      koerper = new Rechteck(); 

      koerper.GrößeSetzen(60, 40); 

      koerper.FarbeSetzen(hauptfarbe); 

  

      kopf = new Kreis(); 

      kopf.RadiusSetzen(18); 

      kopf.FarbeSetzen(hauptfarbe); 

  

      auge = new Kreis(); 

      auge.RadiusSetzen(3); 

      auge.FarbeSetzen(augenfarbe); 

  

      if (!istHuhn) { 

         ohrLinks = new Dreieck(); 

         ohrLinks.GrößeSetzen(10, 12); 

         ohrLinks.FarbeSetzen(hauptfarbe); 

         ohrRechts = new Dreieck(); 

         ohrRechts.GrößeSetzen(10, 12); 

         ohrRechts.FarbeSetzen(hauptfarbe); 

      } 

      if (hatStreifen) { 

         streifen1 = new Rechteck(); 

         streifen1.GrößeSetzen(4, 30); 

         streifen1.FarbeSetzen(streifenfarbe); 

         streifen2 = new Rechteck(); 

         streifen2.GrößeSetzen(4, 30); 

         streifen2.FarbeSetzen(streifenfarbe); 

         streifen3 = new Rechteck(); 

         streifen3.GrößeSetzen(4, 30); 

         streifen3.FarbeSetzen(streifenfarbe); 

      } 

      if (istHuhn) { 

         schnabel = new Dreieck(); 

         schnabel.GrößeSetzen(10, 8); 

         schnabel.FarbeSetzen(schnabelfarbe); 

         kamm = new Dreieck(); 

         kamm.GrößeSetzen(8, 10); 

         kamm.FarbeSetzen(kammfarbe); 

      } 

   } 

  

   void positionSetzen(int x, int y) { 

      koerper.PositionSetzen(x, y); 

      kopf.PositionSetzen(x + 60, y); 

      auge.PositionSetzen(x + 65, y - 5); 

      if (!istHuhn) { 

         ohrLinks.PositionSetzen(x + 48, y - 18); 

         ohrRechts.PositionSetzen(x + 65, y - 18); 

      } 

      if (hatStreifen) { 

         streifen1.PositionSetzen(x + 8, y + 5); 

         streifen2.PositionSetzen(x + 24, y + 5); 

         streifen3.PositionSetzen(x + 40, y + 5); 

      } 

      if (istHuhn) { 

         schnabel.PositionSetzen(x + 75, y - 5); 

         kamm.PositionSetzen(x + 60, y - 25); 

      } 

   } 

  

   void zeigen() { setSichtbar(true); } 

   void verstecken() { setSichtbar(false); } 

  

   void setSichtbar(boolean s) { 

      koerper.SichtbarkeitSetzen(s); 

      kopf.SichtbarkeitSetzen(s); 

      auge.SichtbarkeitSetzen(s); 

      if (ohrLinks != null) ohrLinks.SichtbarkeitSetzen(s); 

      if (ohrRechts != null) ohrRechts.SichtbarkeitSetzen(s); 

      if (streifen1 != null) { 

         streifen1.SichtbarkeitSetzen(s); 

         streifen2.SichtbarkeitSetzen(s); 

         streifen3.SichtbarkeitSetzen(s); 

      } 

      if (schnabel != null) schnabel.SichtbarkeitSetzen(s); 

      if (kamm != null) kamm.SichtbarkeitSetzen(s); 

   } 

} 

  

// ===== Nahrung (eigene Klasse, nicht verschachtelt) ===== 

class Nahrung { 

   String art; 

   int x; 

   int y; 

   boolean bearbeitet; 

  

   Rechteck teil1; 

   Rechteck teil2; 

   Kreis kreis1; 

   Kreis kreis2; 

   Dreieck dreieck1; 

   GText label; 

  

   Nahrung(String pArt, int pX, int pY) { 

      art = pArt; 

      x = pX; 

      y = pY; 

      bearbeitet = false; 

   } 

  

   void zeichne() { 

      label = new GText(); 

      label.TextGrößeSetzen(10); 

      label.FarbeSetzen("schwarz"); 

      label.TextSetzen(art); 

  

      if (art.equals("Fisch")) { 

         kreis1 = new Kreis(); kreis1.RadiusSetzen(10); kreis1.FarbeSetzen("blau"); 

         dreieck1 = new Dreieck(); dreieck1.GrößeSetzen(10, 10); dreieck1.FarbeSetzen("blau"); 

      } else if (art.equals("Maus")) { 

         kreis1 = new Kreis(); kreis1.RadiusSetzen(8); kreis1.FarbeSetzen("schwarz"); 

         kreis2 = new Kreis(); kreis2.RadiusSetzen(5); kreis2.FarbeSetzen("schwarz"); 

      } else if (art.equals("Milch")) { 

         teil1 = new Rechteck(); teil1.GrößeSetzen(20, 28); teil1.FarbeSetzen("cyan"); 

      } else if (art.equals("Hase")) { 

         kreis1 = new Kreis(); kreis1.RadiusSetzen(10); kreis1.FarbeSetzen("cyan"); 

         teil1 = new Rechteck(); teil1.GrößeSetzen(3, 12); teil1.FarbeSetzen("cyan"); 

         teil2 = new Rechteck(); teil2.GrößeSetzen(3, 12); teil2.FarbeSetzen("cyan"); 

      } else if (art.equals("Reh")) { 

         teil1 = new Rechteck(); teil1.GrößeSetzen(28, 18); teil1.FarbeSetzen("rot"); 

         kreis1 = new Kreis(); kreis1.RadiusSetzen(7); kreis1.FarbeSetzen("rot"); 

      } else if (art.equals("Wildschwein")) { 

         teil1 = new Rechteck(); teil1.GrößeSetzen(32, 18); teil1.FarbeSetzen("schwarz"); 

         kreis1 = new Kreis(); kreis1.RadiusSetzen(6); kreis1.FarbeSetzen("schwarz"); 

      } else if (art.equals("Korn")) { 

         kreis1 = new Kreis(); kreis1.RadiusSetzen(4); kreis1.FarbeSetzen("gruen"); 

         kreis2 = new Kreis(); kreis2.RadiusSetzen(4); kreis2.FarbeSetzen("gruen"); 

      } else if (art.equals("Wurm")) { 

         teil1 = new Rechteck(); teil1.GrößeSetzen(28, 6); teil1.FarbeSetzen("magenta"); 

      } else if (art.equals("Beere")) { 

         kreis1 = new Kreis(); kreis1.RadiusSetzen(6); kreis1.FarbeSetzen("rot"); 

      } else if (art.equals("Stein")) { 

         kreis1 = new Kreis(); kreis1.RadiusSetzen(12); kreis1.FarbeSetzen("schwarz"); 

      } else if (art.equals("Schuh")) { 

         teil1 = new Rechteck(); teil1.GrößeSetzen(28, 8); teil1.FarbeSetzen("rot"); 

         teil2 = new Rechteck(); teil2.GrößeSetzen(12, 12); teil2.FarbeSetzen("rot"); 

      } else if (art.equals("Auto")) { 

         teil1 = new Rechteck(); teil1.GrößeSetzen(32, 12); teil1.FarbeSetzen("rot"); 

         teil2 = new Rechteck(); teil2.GrößeSetzen(22, 10); teil2.FarbeSetzen("rot"); 

         kreis1 = new Kreis(); kreis1.RadiusSetzen(4); kreis1.FarbeSetzen("schwarz"); 

         kreis2 = new Kreis(); kreis2.RadiusSetzen(4); kreis2.FarbeSetzen("schwarz"); 

      } 

      positionSetzen(x, y); 

   } 

  

   void positionSetzen(int newX, int newY) { 

      x = newX; 

      y = newY; 

      label.PositionSetzen(newX, newY + 50); 

  

      if (art.equals("Fisch")) { 

         kreis1.PositionSetzen(newX + 10, newY + 10); 

         dreieck1.PositionSetzen(newX + 25, newY + 5); 

      } else if (art.equals("Maus")) { 

         kreis1.PositionSetzen(newX + 12, newY + 12); 

         kreis2.PositionSetzen(newX + 22, newY + 6); 

      } else if (art.equals("Milch")) { 

         teil1.PositionSetzen(newX + 5, newY); 

      } else if (art.equals("Hase")) { 

         kreis1.PositionSetzen(newX + 14, newY + 14); 

         teil1.PositionSetzen(newX + 8, newY); 

         teil2.PositionSetzen(newX + 16, newY); 

      } else if (art.equals("Reh")) { 

         teil1.PositionSetzen(newX, newY + 5); 

         kreis1.PositionSetzen(newX + 28, newY + 5); 

      } else if (art.equals("Wildschwein")) { 

         teil1.PositionSetzen(newX, newY + 5); 

         kreis1.PositionSetzen(newX + 28, newY + 8); 

      } else if (art.equals("Korn")) { 

         kreis1.PositionSetzen(newX + 8, newY + 18); 

         kreis2.PositionSetzen(newX + 18, newY + 18); 

      } else if (art.equals("Wurm")) { 

         teil1.PositionSetzen(newX, newY + 18); 

      } else if (art.equals("Beere")) { 

         kreis1.PositionSetzen(newX + 12, newY + 18); 

      } else if (art.equals("Stein")) { 

         kreis1.PositionSetzen(newX + 12, newY + 12); 

      } else if (art.equals("Schuh")) { 

         teil1.PositionSetzen(newX, newY + 18); 

         teil2.PositionSetzen(newX + 14, newY + 8); 

      } else if (art.equals("Auto")) { 

         teil1.PositionSetzen(newX, newY + 8); 

         teil2.PositionSetzen(newX + 5, newY); 

         kreis1.PositionSetzen(newX + 4, newY + 22); 

         kreis2.PositionSetzen(newX + 22, newY + 22); 

      } 

   } 

  

   void entfernen() { 

      if (teil1 != null) teil1.Entfernen(); 

      if (teil2 != null) teil2.Entfernen(); 

      if (kreis1 != null) kreis1.Entfernen(); 

      if (kreis2 != null) kreis2.Entfernen(); 

      if (dreieck1 != null) dreieck1.Entfernen(); 

      if (label != null) label.Entfernen(); 

   } 

} 

 
