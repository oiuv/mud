inherit ROOM;

void create()
{
        set("short", "提督府");
        set("long", @LONG
这里便是提督大人办公事的地方。正前方大红楠木案桌后
正经端坐着的，就是成都提督吴天德。两边站立纹风不动的是
他的亲兵侍从，看上去都十分彪悍。
LONG);
        set("exits", ([
            	"south" : __DIR__"tidugate",
        ]));
        set("objects", ([
             	__DIR__"npc/wutiande" : 1,
             	__DIR__"npc/shicong"  : 2,
             	__DIR__"npc/qinbing" : 4,
        ]));
        setup();
        replace_program(ROOM);
}
