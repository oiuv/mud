inherit ROOM;

void create()
{
        set("short", "九老洞");
        set("long", @LONG
这就是峨嵋第一大洞，洞内深窈无比，神秘难测。你一走
进来，便发觉洞中叉叉洞多如迷宫，怪异莫测，似乎黝黑无底。
洞里隐隐传来鸡犬鼓乐之声，令人惊异间，忽有蝙蝠群涌而至
扑熄火炬。还是快快离开吧。
LONG);
        set("objects", ([
                "/clone/quarry/fu" : 3,
        ]));
        set("exits", ([
                "south" : __DIR__"jiulaodong",
        ]));

        setup();
        replace_program(ROOM);
}
