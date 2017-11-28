inherit ROOM;

void create()
{
        set("short", "洞内");
        set("long", @LONG
这里是山贼的老窝的所在。旁边有一侧洞，里面隐隐传来
女子的哭声。一个粗壮的山贼守卫在这里。
LONG);
        set("exits", ([
                "west"  : __DIR__"cedong",
                "south" : __DIR__"dongkou",
        ]));

        set("objects", ([
                __DIR__"npc/shanzei3" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
