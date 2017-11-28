inherit ROOM;

void create()
{
        set("short", "收购店");
        set("long", @LONG
这是一个小收购店，房屋内铺着羊毛地毯。店老板为一波
斯人，专门收购当地物产。在一张大羊皮纸上，写着需收购的
各类物产表。
LONG);
        set("exits", ([
            	"east" : __DIR__"huijiang3",
        ]));
        set("objects", ([
                __DIR__"npc/dealer": 1
	]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
