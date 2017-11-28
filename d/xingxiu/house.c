inherit ROOM;

void create()
{
        set("short", "阿凡提家院");
        set("long", @LONG
这是一个阿凡提的庭院。门口大树的树荫投到院子里，让
人觉得很凉快。院子东面是客厅，西边就是小镇大街。
LONG);
        set("exits", ([ 
            	"west" : __DIR__"beijiang",
            	"east" : __DIR__"house1",
        ]));
        set("objects", ([
                __DIR__"npc/kid": 1,
        ]));
        set("outdoors", "xingxiu");
        setup();
}
