//chufang.c
inherit ROOM;
void create()
{
        set("short","厨房");
        set("long",@LONG
这是间宽敞的厨房，厨师们在展示各自的烹饪绝活。整个
房间弥漫着令人垂涎欲滴的菜香。
LONG );
        set("exits",([
            "north" : __DIR__"xiaoting",
        ]));
        set("objects",([
             __DIR__"npc/nanpu" : 1,
        ]));
	set("resource/water", 1);
        setup();
        replace_program(ROOM);
}
