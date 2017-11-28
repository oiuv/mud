inherit ROOM;

void create()
{
        set("short", "黄土路");
        set("long", @LONG
你走在一条尘土飞扬的黄土路上，两旁尽是阴森森的树林。
这里是湖北境界，据说经常有土匪出没，不可久留。南边一条
小道，通向密林深处。
LONG);
        set("outdoors", "wudang");
        set("exits", ([
                "north"    : __DIR__"wdroad9",
                "southup"  : __DIR__"tufeiwo1",
                "west"     : __DIR__"slxl1",
        ]));
        set("objects", ([
                __DIR__"npc/xiao_louluo":1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
