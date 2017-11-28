inherit ROOM;

void create()
{
        set("short", "林间道");
        set("long", @LONG
这里是一条林间小道，在树丛中蜿蜒。西北方连着一条黄
土路，南面的道路要宽一些。
LONG );
        set("outdoors", "hengyang");

        set("exits", ([
                "northwest" :"/d/wudang/wdroad9",
                "south"     : __DIR__"hsroad7",
        ]));

        setup();
        replace_program(ROOM);
}
