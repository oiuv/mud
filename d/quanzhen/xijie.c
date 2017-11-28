inherit ROOM;

void create()
{
        set("short", "西街");
        set("long", @LONG
武功镇的西面是贫苦百姓的聚居区，西街比起其他几条街
道来也显得破朽杂乱得多。街南面是一座年久失修的小庙，已
经摇摇欲坠了。北面是一户低矮的茅屋，西面是武功镇的西门。
从这里转而往东，就走到武功镇的中心了。
LONG);
        set("outdoors", "wugong");
        set("exits", ([
                "east" : __DIR__"zhongxin",
                "north" : __DIR__"minju2",
                "south" : __DIR__"xiaomiao",
                "west" : __DIR__"ximen",
        ]));
        set("objects", ([
                __DIR__"npc/punk" : 1,
                "/clone/npc/walker" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
