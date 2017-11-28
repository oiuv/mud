// /guanwai/houting.c

inherit ROOM;

void create()
{
        set("short", "后厅");
        set("long", @long
这里是庄内人用饭休息的地方，四角各生着一盆大炭火，一张八仙桌居
中，周围打扫得甚是干净。管家正在和下人们吩咐着什么。
long );
        set("exits", ([
                "south"    : __DIR__"houyuan",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "guanwai");
        setup();
        replace_program(ROOM);
}
