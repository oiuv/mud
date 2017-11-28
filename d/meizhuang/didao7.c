// didao7.c
inherit ROOM;

void create()
{
        set("short", "梅庄密道");
        set("long", @LONG
这是一条昏暗潮湿的地道，地道很长，两边点着两根不太明亮的
火把，地道两旁的墙壁上画着很多不知道出自何人之手的壁画，而且
画得相当难看。北面有一扇铁门，但是走进了才发现原来是虚掩的，
并没有上锁。
LONG
        );
        set("exits", ([ /* sizeof() == 4 */
            "west" : __DIR__"didao6",
            "north" : __DIR__"laofang",
        ]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
