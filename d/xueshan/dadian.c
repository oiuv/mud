inherit ROOM;

void create()
{
        set("short", "大殿");
        set("long", @LONG
这里是大轮寺的大殿，中央供奉着佛祖塑像。僧人们在念
着经文，所以这里的香火很是旺盛。远来的香客们在这里虔诚
地膜拜。大殿两侧都是侧殿。
LONG);
        set("exits", ([
                "east"  : __DIR__"cedian1",
                "west"  : __DIR__"cedian2",
                "south" : __DIR__"guangchang",
        ]));
        set("objects", ([
                CLASS_D("xueshan") + "/lazhang" : 1,
                __DIR__"npc/xiang-ke" : 2,
        ]));
        set("valid_startroom", 1);
        setup();
        replace_program(ROOM);

        "/clone/board/xueshan_b"->foo();
}
