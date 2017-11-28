// canglong.c

inherit ROOM;

void create()
{
        set("short", "苍龙岭");
        set("long", @LONG
华山五峰中最惊险的是北峰，北峰之上最陡峭的则是苍龙岭。此岭高
约百米，宽仅一米，而登山之路则在其山脊之上，两侧脊坡光滑挺拔，其
下悬崖深邃，云涛隐伏，岭体蜿蜒逶迤，体青背黑，如苍龙腾空，故有是
名。岭侧有一石碑(shibei)。
    从这里往东是下山的路，再往南是上其它四峰的路，西面是华山极险
处之一，叫做“舍身崖”。
LONG );
        set("exits", ([ /* sizeof() == 3 */
            "eastdown"  : __DIR__"shangtianti",
            "northup"   : __DIR__"yuntai",
            "westup"    : __DIR__"sheshen",
        ]));
        set("item_desc", ([
		"shibei" :
"石碑刻着几个大字：「韩退之投书处」，据说当年韩愈爬上此岭之后，再\n"
"也不敢下来，自以为要死在山上，就在山上写信投下来，和家人诀别。后\n"
"来还是华阴县的县官派人上山拿绳子把他捆着吊下来的。\n"
])  ) ;
        set("objects", ([
            __DIR__"npc/liang-fa" : 1,
        ]));
//        set("no_clean_up", 0);
        set("outdoors", "huashan");

        setup();
        replace_program(ROOM);
}
 
