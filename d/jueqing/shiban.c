inherit ROOM;

void create()
{
        set("short", "青石板路");
        set("long", @LONG
四周树木丛生，花香宜人，偶闻飞鸟齐鸣，石板蜿蜒曲折，
遥见不远处山阴遮盖下有座极大石屋。
LONG);
        set("outdoors", "jueqing");
        set("exits", ([
               "north"   : __DIR__"shanzhuang",
               "south"   : __DIR__"zhulin1",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
