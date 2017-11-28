// Room: /t/wanjiegu/xiaoting.c

inherit ROOM;

void create()
{
        set("short", "小厅");
        set("long", @LONG
这是一间小厅，桌上点着一对巨烛。东壁四幅屏条，绘的是梅
兰竹菊，西壁上的四幅是春夏秋冬。可是全挂错了方位，看来这里
的主人并不懂得书画。
LONG
        );
        set("exits", ([ /* sizeof() == 2 */
            "south" : __DIR__"grassland",
            "north" : __DIR__"hall",
        ]));
        set("objects", ([
            __DIR__"npc/gan" : 1,
        ]));
//        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
