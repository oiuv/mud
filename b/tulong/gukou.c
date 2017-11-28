inherit ROOM;

void create()
{
        set("short", "山谷口");
        set("long", @LONG
进得谷口，只见一片青草地上摆着七八张方桌，除了东首
第一席外，每张桌旁都已坐了人。看来各门各派的掌门、帮主
都在里面了。
LONG);
        set("exits", ([
                "west":__DIR__"daobian",
                "east":__DIR__"huichang",
        ]));
        setup();
}
