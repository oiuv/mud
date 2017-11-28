inherit ROOM;

void create()
{
    	set("short", "平定州");
    	set("long", @LONG
平定州在河北省境内，平定州州府不大，但由于是地处要
冲，十分重要。往来京城的客商穿梭频繁。但大街上日月教徒
横冲直撞出手抓人，虽近在京畿，却丝毫没将官府放在眼里。
LONG);

    	set("exits", ([
        	"east" : __DIR__"road3",
        	"west" : __DIR__"road2",
    	]));
        set("objects", ([
                "/d/beijing/npc/girl2" : 1,
                "/d/beijing/npc/kid1" : 1,
                CLASS_D("riyue") + "/qin" : 1,
                __DIR__"npc/dizi7" : 4,
        ]));
    	set("outdoors", "heimuya");
    	set("no_clean_up", 0);
    	setup();
    	replace_program(ROOM);
}
