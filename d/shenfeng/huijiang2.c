inherit ROOM;

void create()
{
        set("short", "帕米尔草原");
        set("long", @LONG
这里已是南疆。独特的地势和气候，竟形成南疆难得一见
的小片草原。因天山挡住了北方寒风，这儿物产丰富，聚居了
不少哈萨克族人。波斯商人也常来此地贩卖土产。
LONG);
        set("outdoors", "shenfeng");

        set("exits", ([
            	"northup" : __DIR__"huijiang1",
            	"southdown" : __DIR__"huijiang3",
        ]));
        set("objects", ([
                __DIR__"npc/hasake"  : 1,
                "/clone/quarry/yang" : 3,
        ]));
        set("quarrys", ([
                "yang"  : 100000,
                "gou"   : 100000,
                "lang"  : 80000,
                "lang2" : 50000,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
