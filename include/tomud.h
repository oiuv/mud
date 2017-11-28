#define TMI(x) (""+x+"")
#define TMA ""
#define TMB ""
#define INFO TMI
#define HEND sprintf("%c",18)

#define ALERT(x) TMI("alert "+x)
#define L_ITEM(x) RANK_D->new_short(x)
#define L_ICON(x) TMI("licon "+x)
#define CLEAN0  TMI("lbclear0")
#define ADD0(x) TMI("lbadd0 "+L_ITEM(x)+";")
#define REM0(x) TMI("lbrem0 "+L_ITEM(x)+";")
#define CLEAN1  TMI("lbclear1")
#define ADD1(x) TMI("lbadd1 "+L_ITEM(x)+";")
#define REM1(x) TMI("lbrem1 "+L_ITEM(x)+";")
#define CLEAN2  TMI("lbclear2")
#define ADD2(x) TMI("lbadd2 "+L_ITEM(x)+";")
#define REM2(x) TMI("lbrem2 "+L_ITEM(x)+";")

