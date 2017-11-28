inherit ROOM;

void create()
{
        set("short", "树林");
        set("long", @LONG
这里山青水碧，景色极尽清幽，只是四下寂无声息，隐隐
透著凶险，偶尔却可隐约听见溪流飞瀑之声回荡于山谷。 
LONG);
        set("outdoors", "jueqing");
        set("exits", ([
               "northup"   : __DIR__"shuitang",
               "southdown" : __DIR__"shanjiao",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
