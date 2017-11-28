inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这里是靠近川西的崇山峻岭，怪石嶙峋。再往东去就是川
西边缘了。往西有一座雪山高耸入云。路边上有个雪坑。
LONG);
        set("exits", ([
                "east"      : __DIR__"sroad2",
                "southdown" : __DIR__"hollow",
                "north"     : __DIR__"sroad0",
                "westup"    : __DIR__"sroad4",
        ]));
        set("outdoors", "xuedao");
        setup();
}

