inherit ROOM;

void create()
{
        set("short", "祭坛");
        set("long", @LONG
这里是雪山寺的祭坛，中间一个高台，青石砌就。周围摆
满了木柴和酥油，旁边一个盛水的颅钵搁着摆着只法铃。一些
痛苦和可怜的亡灵可以在这里获得超度。
LONG);
        set("outdoors", "xueshan");
        set("no_fight","1");
        set("exits", ([
                "north" : __DIR__"chang",
        ]));
        set("objects", ([
                __DIR__"npc/x_lama": 2,
        ]));
        setup();
        replace_program(ROOM);
}
