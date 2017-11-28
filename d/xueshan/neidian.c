inherit ROOM;

void create()
{
        set("short", "内殿");
        set("long", @LONG
这里是雪山寺的内殿，也是掌门人见客的地方。雪山寺的
掌门人、贵为蒙古国师的金轮法王是西域一代高僧，也是西域
不世出的武林宗师。他驻锡本寺后，雪山寺方声名远播。
LONG);
        set("exits", ([
                "east"  : __DIR__"zoulang3",
                "west"  : __DIR__"zoulang4",
                "north" : __DIR__"houdian",
        ]));

        set("objects", ([
                CLASS_D("xueshan") + "/fawang" : 1
        ]));

        setup();
        replace_program(ROOM);
}
