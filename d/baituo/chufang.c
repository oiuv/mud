inherit ROOM;

void create()
{
        set("short", "厨房");
        set("long", @LONG
这是一间宽敞的厨房，厨师们在展示各自的烹饪绝活。整
个房间弥漫着令人垂涎欲滴的菜香及烘饼香。
LONG);
        set("exits", ([
                "west" : __DIR__"huayuan",
                "east" : __DIR__"chaifang",
        ]));
        set("objects", ([
                __DIR__"npc/feifei"   : 1,
                __DIR__"obj/doujiang" : 5 + random(3),
                __DIR__"obj/cake"     : 5 + random(3),
        ]));
        set("resource/water", 1);
        setup();
        replace_program(ROOM);
}
