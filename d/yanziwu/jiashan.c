//ROOM: /d/yanziwu/jiashan.c

inherit ROOM;

void create()
{
        set("short", "假山");
        set("long",@LONG
怪石堆叠，巨石参差，你有些头晕目眩，那么多山洞你不
知该钻哪一个。个个山洞都昏暗曲折，实在不知通向什么地方。
LONG );
        set("outdoors", "yanziwu");
        set("exits", ([
            "west" : __DIR__"zuijing",
            "east" : __DIR__"shuiyun",
            "north": __DIR__"huayuan",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
