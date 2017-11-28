inherit ROOM;

void create()
{
        set("short", "大道");
        set("long", @LONG
你走在一条青石大道上，尘土飞扬。西面可以通往军事重
镇兰州。东面是一座大城池，看城墙上旗帜飘扬，好象就是长
安了。西面望去一片黄土和荒野。
LONG );
        set("exits", ([
            "east"  : "/d/changan/xi-chengmen",
            "west"  : __DIR__"xxroad2",
        ]));
        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}

