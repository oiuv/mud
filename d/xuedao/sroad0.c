inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
山路越走越窄，能隐隐望见前方又分出了几条叉路。这里
是靠近川西的崇山峻岭，怪石嶙峋。再往东就是川西边缘。往
西有一座雪山高耸入云。
LONG);
        set("exits", ([
                "south" : __DIR__"sroad3",
                "north" : __DIR__"nroad0",
        ]));
        set("outdoors", "xuedao");
        setup();
        replace_program(ROOM);
}

