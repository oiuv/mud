// dongmen.c 洞门

inherit ROOM;

void create()
{
        set("short", "洞门");
        set("long", @LONG
你的面前突然一亮，眼前赫然出现一道玉石砌成的洞门，门额上
雕有三个大字迎宾馆，两旁石粱雕龙刻凤，不知凝聚着多少名工巧匠
的心血！更体现出主人的富有和奢侈。
LONG );
        set("exits", ([
                "enter" : __DIR__"yingbin",
                "west" : __DIR__"shidong1",
        ]));

        set("objects", ([
                __DIR__"npc/dizi1" : 1]));
        setup();

        replace_program(ROOM);
}
