inherit ROOM;

void create()
{
        set("short", "鹿鸣峰");
        set("long", @LONG
龙门峰西侧是鹿鸣峰。鹿鸣峰又称芝盘峰，因峰上有一草
甸子，形圆如盖，有热气从地下冒出，每到严冬，其它峰均积
雪甚厚，唯鹿鸣峰依然植物茂盛，且盛产芝草，鹿多居之。常
有鹤、雀、雕、燕飞落其上，有鹿鸣翠谷，雕飞芝盖之称。
LONG );
        set("exits", ([
                "south"   : __DIR__"baiyun",
                "east"    : __DIR__"longmen",
                "northdown" : __DIR__"famu",
        ]));
        set("objects", ([
                "/clone/quarry/lu" : 2,
                "/clone/quarry/diao" : 1,
        ]));
        set("outdoors", "guanwai");
        setup();
        replace_program(ROOM);
}
